import asyncio
import websockets
import json
import logging
import time
import signal
import sys
from datetime import datetime, timedelta
from drone_connection import DroneConnection

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

class WebSocketServer:
    def __init__(self, host='localhost', port=8765, drone_connection=None):
        self.host = host
        self.port = port
        self.drone_connection = drone_connection or DroneConnection()
        self.clients = set()
        self.lock = asyncio.Lock()
        
        # Health monitoring
        self.start_time = time.time()
        self.message_count = 0
        self.error_count = 0
        self.last_telemetry_update = None
        self.health_status = "starting"
        
        # Graceful shutdown
        self.server = None
        self.broadcast_task = None
        self.shutdown_event = asyncio.Event()
        self.is_shutting_down = False

    async def handler(self, websocket):
        # Add client safely
        async with self.lock:
            self.clients.add(websocket)
        logging.info(f"🔌 Client connected: {websocket.remote_address} (Total clients: {len(self.clients)})")

        try:
            async for message in websocket:
                await self.process_message(websocket, message)
        except websockets.exceptions.ConnectionClosed:
            logging.info(f"🔌 Client disconnected: {websocket.remote_address}")
        except Exception as e:
            logging.error(f"❌ Error in handler: {e}")
        finally:
            async with self.lock:
                self.clients.discard(websocket)
            logging.info(f"🔌 Client removed: {websocket.remote_address} (Total clients: {len(self.clients)})")

    def get_health_status(self):
        """Get comprehensive health status"""
        current_time = time.time()
        uptime = current_time - self.start_time
        
        # Determine overall health
        is_healthy = True
        issues = []
        
        # Check drone connection
        if not self.drone_connection.is_connected:
            is_healthy = False
            issues.append("drone_disconnected")
        
        # Check telemetry freshness (should be updated within last 5 seconds)
        if self.last_telemetry_update:
            telemetry_age = current_time - self.last_telemetry_update
            if telemetry_age > 5:
                is_healthy = False
                issues.append(f"stale_telemetry_{telemetry_age:.1f}s")
        
        # Check error rate (more than 10% errors is unhealthy)
        error_rate = (self.error_count / max(self.message_count, 1)) * 100
        if error_rate > 10:
            is_healthy = False
            issues.append(f"high_error_rate_{error_rate:.1f}%")
        
        # Check circuit breaker status
        circuit_breaker_status = self.drone_connection.get_circuit_breaker_status()
        for breaker_name, breaker_state in circuit_breaker_status.items():
            if breaker_state["state"] == "OPEN":
                is_healthy = False
                issues.append(f"circuit_breaker_{breaker_name}_open")
        
        status = "healthy" if is_healthy else "unhealthy"
        
        # Debug logging for connection status
        drone_connected = self.drone_connection.is_connected
        vehicle_exists = self.drone_connection.vehicle is not None
        logging.debug(f"🏥 Health Check - drone_connected={drone_connected}, vehicle_exists={vehicle_exists}, status={status}")
        
        return {
            "status": status,
            "uptime_seconds": uptime,
            "connected_clients": len(self.clients),
            "drone_connected": drone_connected,
            "vehicle_exists": vehicle_exists,  # Add this for debugging
            "messages_processed": self.message_count,
            "error_count": self.error_count,
            "error_rate_percent": error_rate,
            "last_telemetry_update": self.last_telemetry_update,
            "circuit_breakers": circuit_breaker_status,
            "issues": issues,
            "timestamp": current_time
        }

    def is_telemetry_valid(self, telemetry):
        
        if not telemetry:
            return False
        
        # Check required fields
        required_fields = ["timestamp", "position", "state", "heartbeat"]
        for field in required_fields:
            if field not in telemetry:
                return False
        
        # Check timestamp freshness (within last 10 seconds)
        if "timestamp" in telemetry:
            age = time.time() - telemetry["timestamp"]
            if age > 10:
                return False
        
        # Check if critical values are not None/null
        if telemetry.get("heartbeat", {}).get("last_heartbeat") is None:
            return False
            
        return True

    async def process_message(self, websocket, message):
        try:
            self.message_count += 1
            data = json.loads(message)
            action = data.get("action")

            if action == "connect":
                conn_str = data.get("connection_string")
                baud = data.get("baud", 57600)
                # Run blocking connect in a thread
                success = await asyncio.to_thread(self.drone_connection.connect_with_retry, conn_str, baud)
                response = {"status": "connected" if success else "failed"}
                await websocket.send(json.dumps(response))

            elif action == "disconnect":
                await asyncio.to_thread(self.drone_connection.disconnect)
                response = {"status": "disconnected"}
                await websocket.send(json.dumps(response))

            elif action == "get_telemetry":
                telemetry = await asyncio.to_thread(self.drone_connection.get_snapshot)
                if self.is_telemetry_valid(telemetry):
                    self.last_telemetry_update = time.time()
                await websocket.send(json.dumps(telemetry))
                
            elif action == "health_check":
                health = self.get_health_status()
                await websocket.send(json.dumps(health))

            else:
                await websocket.send(json.dumps({"error": "Unknown action"}))

        except json.JSONDecodeError:
            self.error_count += 1
            await websocket.send(json.dumps({"error": "Invalid JSON"}))
        except Exception as e:
            self.error_count += 1
            logging.error(f"Message processing error: {e}")
            await websocket.send(json.dumps({"error": "Internal server error"}))
        except Exception as e:
            logging.error(f"Error processing message: {e}")
            await websocket.send(json.dumps({"error": "Server error"}))

    async def broadcast_telemetry(self):
        """Enhanced telemetry broadcast with health monitoring and shutdown support"""
        logging.info("🚀 ===== TELEMETRY BROADCAST LOOP STARTED =====")
        last_health_log = 0
        health_log_interval = 30  # Log health every 30 seconds
        
        try:
            while not self.shutdown_event.is_set():
                try:
                    current_time = time.time()
                    
                    # Periodic health logging
                    if current_time - last_health_log > health_log_interval:
                        health = self.get_health_status()
                        logging.info(f"🏥 ===== SYSTEM HEALTH STATUS =====")
                        logging.info(f"🏥 Status: {health['status']} - "
                                   f"Clients: {health['connected_clients']}, "
                                   f"Drone: {'✅ CONNECTED' if health['drone_connected'] else '❌ DISCONNECTED'}")
                        logging.info(f"🏥 Messages processed: {health['messages_processed']}, Errors: {health['error_count']}")
                        if health['last_telemetry_update']:
                            age = current_time - health['last_telemetry_update']
                            logging.info(f"🏥 Last telemetry: {age:.1f}s ago")
                        else:
                            logging.info(f"🏥 Last telemetry: NEVER")
                        logging.info(f"🏥 ===============================")
                        last_health_log = current_time
                    
                    if self.clients:
                        # Get telemetry data (real or mock)
                        drone_connected = self.drone_connection.is_connected
                        vehicle_exists = self.drone_connection.vehicle is not None
                        
                        logging.debug(f"📡 ⚡ TELEMETRY CHECK - drone_connected={drone_connected}, vehicle_exists={vehicle_exists}, clients={len(self.clients)}")
                        logging.debug(f"📡 ⚡ DroneConnection state: is_connected={self.drone_connection.is_connected}, vehicle type={type(self.drone_connection.vehicle)}")
                        
                        if drone_connected:
                            logging.info(f"📡 ⚡ ENTERING TELEMETRY BLOCK - About to get snapshot from drone")
                            logging.info("📊 Getting real telemetry from drone...")
                            
                            # Check if DroneConnection is actually connected before calling get_snapshot
                            if not self.drone_connection.is_connected:
                                logging.error("📊 ❌ DroneConnection says it's not connected - attempting reconnection...")
                                await self.attempt_drone_connection()
                                if not self.drone_connection.is_connected:
                                    logging.error("📊 ❌ Reconnection failed - skipping telemetry")
                                    continue
                            
                            # Check if vehicle object exists
                            if not self.drone_connection.vehicle:
                                logging.error("📊 ❌ Vehicle object is None - skipping telemetry")
                                continue
                                
                            try:
                                # Add timeout to prevent hanging
                                logging.info("📊 🔄 About to call get_snapshot() with asyncio.to_thread...")
                                telemetry = await asyncio.wait_for(
                                    asyncio.to_thread(self.drone_connection.get_snapshot),
                                    timeout=5.0  # 5 second timeout
                                )
                                logging.info(f"📊 ✅ Got telemetry response: type={type(telemetry)}, is_none={telemetry is None}")
                                if telemetry:
                                    logging.info(f"📊 ✅ Telemetry keys: {list(telemetry.keys()) if isinstance(telemetry, dict) else 'Not a dict'}")
                            except asyncio.TimeoutError:
                                logging.error("📊 ❌ TIMEOUT: get_snapshot() took longer than 5 seconds!")
                                logging.error("📊 🔍 DEBUG: This suggests get_snapshot() is hanging inside DroneKit vehicle access")
                                telemetry = None
                            except Exception as e:
                                logging.error(f"📊 ❌ EXCEPTION in get_snapshot(): {e}")
                                telemetry = None
                            
                            # Debug logging for telemetry data
                            if telemetry:
                                logging.info(f"📊 ===== DRONE TELEMETRY SNAPSHOT =====")
                                logging.info(f"📊 Timestamp: {telemetry.get('timestamp')}")
                                logging.info(f"📊 Connection Status: {telemetry.get('connection_status')}")
                                
                                # Position data
                                if 'position' in telemetry:
                                    pos = telemetry['position']
                                    logging.info(f"📍 Position - Lat: {pos.get('latitude'):.6f}, Lon: {pos.get('longitude'):.6f}, Alt: {pos.get('altitude'):.1f}m")
                                
                                # Vehicle state
                                if 'state' in telemetry:
                                    state = telemetry['state']
                                    logging.info(f"🚁 State - Armed: {state.get('armed')}, Mode: {state.get('mode')}, Status: {state.get('system_status')}")
                                
                                # Battery info
                                if 'battery' in telemetry:
                                    bat = telemetry['battery']
                                    logging.info(f"🔋 Battery - Level: {bat.get('level')}%, Voltage: {bat.get('voltage'):.1f}V, Current: {bat.get('current'):.1f}A")
                                
                                # Navigation data
                                if 'navigation' in telemetry:
                                    nav = telemetry['navigation']
                                    logging.info(f"🧭 Navigation - Sats: {nav.get('satellites_visible')}, Fix: {nav.get('fix_type')}, Speed: {nav.get('groundspeed'):.1f}m/s")
                                
                                # Attitude
                                if 'attitude' in telemetry:
                                    att = telemetry['attitude']
                                    logging.info(f"📐 Attitude - Roll: {att.get('roll'):.1f}°, Pitch: {att.get('pitch'):.1f}°, Yaw: {att.get('yaw'):.1f}°")
                                
                                # Heartbeat
                                if 'heartbeat' in telemetry:
                                    hb = telemetry['heartbeat']
                                    logging.info(f"Heartbeat - Last: {hb.get('last_heartbeat')}, Armed: {hb.get('armed')}")
                                
                                logging.info(f"📊 Available data keys: {list(telemetry.keys())}")
                                logging.info(f"📊 =====================================")
                            else:
                                logging.warning("📊 No telemetry data received from drone!")
                        else:
                            logging.debug(f"📡 ⚠️ SKIPPING TELEMETRY - drone_connected={drone_connected}, is_connected={self.drone_connection.is_connected}")
                            logging.debug(f"📡 ⚠️ Vehicle object: {self.drone_connection.vehicle}")
                            
                            # Attempt reconnection more frequently when clients are waiting for data
                            if int(current_time) % 10 == 0:  # Try every 10 seconds instead of 30
                                logging.info("🔄 Attempting drone reconnection (clients waiting for data)...")
                                success = await self.attempt_drone_connection()
                                if success:
                                    logging.info("✅ Drone reconnected successfully!")
                                    continue  # Skip sleep and try getting telemetry immediately
                            
                            # Send mock telemetry data when drone is not connected
                            # telemetry = self._get_mock_telemetry()
                            await asyncio.sleep(2)  # Sleep when drone disconnected to prevent spam
                            continue
                        
                        if self.is_telemetry_valid(telemetry):
                            self.last_telemetry_update = current_time
                            message = json.dumps(telemetry)
                            
                            logging.info(f"📡 ✅ BROADCASTING telemetry to {len(self.clients)} clients")
                            logging.info(f"📡 Data size: {len(message)} bytes")
                            
                            async with self.lock:
                                clients_to_remove = set()
                                
                                for client in self.clients:
                                    try:
                                        await client.send(message)
                                        logging.info(f"📡 ✅ Sent telemetry to client {client.remote_address}")
                                    except websockets.exceptions.ConnectionClosed:
                                        clients_to_remove.add(client)
                                        logging.warning(f"📡 ❌ Client {client.remote_address} disconnected")
                                    except Exception as e:
                                        logging.error(f"📡 ❌ Error sending telemetry to client: {e}")
                                        clients_to_remove.add(client)
                                
                                # Remove disconnected clients
                                self.clients -= clients_to_remove
                                if clients_to_remove:
                                    logging.info(f"📡 Removed {len(clients_to_remove)} disconnected clients")
                        else:
                            logging.warning(f"❌ Invalid telemetry data, skipping broadcast. Data: {telemetry}")
                            
                            # Try to fix telemetry validation issues
                            if telemetry:
                                logging.warning(f"❌ Telemetry validation failed. Keys: {list(telemetry.keys())}")
                                for required in ["timestamp", "position", "state", "heartbeat"]:
                                    if required not in telemetry:
                                        logging.warning(f"❌ Missing required field: {required}")
                                if "timestamp" in telemetry:
                                    age = time.time() - telemetry["timestamp"]
                                    logging.warning(f"❌ Telemetry age: {age:.2f} seconds")
                                if "heartbeat" in telemetry and telemetry["heartbeat"].get("last_heartbeat") is None:
                                    logging.warning(f"❌ Invalid heartbeat: {telemetry['heartbeat']}")
                    else:
                        logging.info(f"⏸️ No clients connected ({len(self.clients)}) - skipping telemetry broadcast")
                        await asyncio.sleep(5)  # Sleep longer when no clients
                        continue
                    
                    await asyncio.sleep(1)
                    
                except Exception as e:
                    if not self.shutdown_event.is_set():
                        logging.error(f"Broadcast error: {e}")
                        await asyncio.sleep(5)  # Back off on error
                        
        except asyncio.CancelledError:
            logging.info("Broadcast task cancelled")
            raise
        finally:
            logging.info("Broadcast telemetry stopped")

    async def graceful_shutdown(self, timeout=10):
        """Perform graceful shutdown of the server"""
        if self.is_shutting_down:
            return
            
        self.is_shutting_down = True
        logging.info("Starting graceful shutdown...")
        
        try:
            # Set shutdown event to stop broadcast loop
            self.shutdown_event.set()
            
            # Cancel broadcast task
            if self.broadcast_task and not self.broadcast_task.done():
                self.broadcast_task.cancel()
                try:
                    await asyncio.wait_for(self.broadcast_task, timeout=5)
                except (asyncio.TimeoutError, asyncio.CancelledError):
                    logging.warning("Broadcast task didn't stop gracefully")
            
            # Notify all clients about shutdown
            if self.clients:
                shutdown_message = json.dumps({
                    "type": "server_shutdown",
                    "message": "Server is shutting down"
                })
                
                async with self.lock:
                    disconnect_tasks = []
                    for client in self.clients.copy():
                        try:
                            await client.send(shutdown_message)
                            disconnect_tasks.append(client.close())
                        except Exception as e:
                            logging.warning(f"Error notifying client of shutdown: {e}")
                    
                    # Wait for client disconnections
                    if disconnect_tasks:
                        try:
                            await asyncio.wait_for(
                                asyncio.gather(*disconnect_tasks, return_exceptions=True),
                                timeout=3
                            )
                        except asyncio.TimeoutError:
                            logging.warning("Some clients didn't disconnect gracefully")
                    
                    self.clients.clear()
            
            # Close WebSocket server
            if self.server:
                self.server.close()
                try:
                    await asyncio.wait_for(self.server.wait_closed(), timeout=5)
                except asyncio.TimeoutError:
                    logging.warning("Server didn't close gracefully")
            
            # Disconnect drone
            await asyncio.to_thread(self.drone_connection.disconnect)
            
            logging.info("Graceful shutdown completed")
            
        except Exception as e:
            logging.error(f"Error during graceful shutdown: {e}")

    def setup_signal_handlers(self):
        """Setup signal handlers for graceful shutdown"""
        def signal_handler(signum, frame):
            logging.info(f"Received signal {signum}")
            # Set shutdown event to trigger graceful shutdown
            if not self.shutdown_event.is_set():
                self.shutdown_event.set()
                # Also stop the event loop to ensure immediate response
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    loop.call_soon_threadsafe(lambda: None)
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        if hasattr(signal, 'SIGQUIT'):
            signal.signal(signal.SIGQUIT, signal_handler)

    async def start_server(self):
        """Enhanced server start with graceful shutdown support"""
        try:
            self.setup_signal_handlers()
            
            # Try to connect to drone before starting server
            logging.info("🔌 Attempting to connect to drone...")
            await self.attempt_drone_connection()
            
            # Configure WebSocket server with proper ping/pong settings
            self.server = await websockets.serve(
                self.handler, 
                self.host, 
                self.port,
                ping_interval=20,  # Send ping every 20 seconds
                ping_timeout=10,   # Wait 10 seconds for pong response
                close_timeout=10   # Wait 10 seconds for close handshake
            )
            logging.info(f"WebSocket server started at ws://{self.host}:{self.port}")
            logging.info(f"WebSocket config: ping_interval=20s, ping_timeout=10s, close_timeout=10s")
            self.health_status = "healthy"

            # Start background telemetry broadcast
            self.broadcast_task = asyncio.create_task(self.broadcast_telemetry())

            # Wait for shutdown signal with timeout to make it more responsive
            try:
                while not self.shutdown_event.is_set():
                    try:
                        await asyncio.wait_for(self.shutdown_event.wait(), timeout=1.0)
                        break  # Shutdown event was set
                    except asyncio.TimeoutError:
                        # Check every second for shutdown
                        continue
                        
                logging.info("📤 Shutdown signal received, starting graceful shutdown...")
                
            except KeyboardInterrupt:
                logging.info("⌨️ Keyboard interrupt received")
                self.shutdown_event.set()
            
        except Exception as e:
            logging.error(f"Server error: {e}")
        finally:
            await self.graceful_shutdown()

    async def attempt_drone_connection(self):
        """Attempt to connect to drone using common connection options"""
        connection_options = [
            # ('udp:127.0.0.1:14550', None),  # SITL UDP
            # ('tcp:127.0.0.1:5760', None),   # SITL TCP
            ('/dev/ttyACM0', 115200),       # Physical device
            # ('/dev/ttyUSB0', 57600),        # Alternative physical device
            # ('/dev/ttyAMA0', 57600),        # Raspberry Pi serial
        ]
        
        for connection_string, baud in connection_options:
            try:
                logging.info(f"🔌 Trying connection: {connection_string}")
                # Run the blocking connect call in a thread to avoid blocking the event loop
                success = await asyncio.to_thread(
                    self.drone_connection.connect_with_retry, 
                    connection_string, 
                    baud
                )
                if success:
                    logging.info(f"✅ Successfully connected to drone at {connection_string}")
                    return True
                else:
                    logging.warning(f"❌ Failed to connect to {connection_string}")
            except Exception as e:
                logging.error(f"❌ Connection error for {connection_string}: {e}")
        
        logging.warning("⚠️ No drone connection established. Server will run with mock/no data.")
        return False


if __name__ == "__main__":
    async def main():
        ws_server = WebSocketServer()
        try:
            await ws_server.start_server()
        except KeyboardInterrupt:
            logging.info("⌨️ Server manually stopped by user")
            ws_server.shutdown_event.set()
        except Exception as e:
            logging.error(f"💥 Fatal error: {e}")
        finally:
            if not ws_server.is_shutting_down:
                await ws_server.graceful_shutdown()

    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logging.info("⌨️ Application terminated by user")
    except Exception as e:
        logging.error(f"💥 Application error: {e}")
    finally:
        logging.info("🏁 Application shutdown complete")


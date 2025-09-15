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
        logging.info(f"Client connected: {websocket.remote_address}")

        try:
            async for message in websocket:
                await self.process_message(websocket, message)
        except websockets.exceptions.ConnectionClosed:
            logging.info(f"Client disconnected: {websocket.remote_address}")
        except Exception as e:
            logging.error(f"Error in handler: {e}")
        finally:
            async with self.lock:
                self.clients.discard(websocket)

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
        
        return {
            "status": status,
            "uptime_seconds": uptime,
            "connected_clients": len(self.clients),
            "drone_connected": self.drone_connection.is_connected,
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

    def _get_mock_telemetry(self):
        """Generate mock telemetry data for testing when no drone is connected"""
        import random
        import math
        
        # Simulate a drone flying in a circle
        t = time.time() / 10.0  # Slow down the simulation
        
        return {
            "timestamp": time.time(),
            "position": {
                "latitude": 37.7749 + 0.001 * math.cos(t),  # San Francisco area
                "longitude": -122.4194 + 0.001 * math.sin(t),
                "altitude": 100.0 + 10.0 * math.sin(t * 2)
            },
            "velocity": {"vx": 2.0, "vy": 1.0, "vz": 0.1},
            "attitude": {
                "roll": 5.0 * math.sin(t),
                "pitch": 3.0 * math.cos(t),
                "yaw": t * 10.0 % 360
            },
            "state": {"armed": True, "mode": "AUTO", "system_status": "ACTIVE"},
            "battery": {"voltage": 12.6, "current": 15.3, "level": 85},
            "control": {"armed": True, "mode": "AUTO", "system_status": "ACTIVE", "channels": {}},
            "heartbeat": {"last_heartbeat": time.time(), "armed": True},
            "navigation": {
                "fix_type": 3,
                "satellites_visible": 12,
                "heading": (t * 10.0) % 360,
                "groundspeed": 5.0,
                "airspeed": 5.2,
                "ekf_ok": True,
                "is_armable": True
            },
            "valid_modes": {"modes": ["STABILIZE", "AUTO", "GUIDED", "LOITER", "RTL", "LAND"]},
            "connection_status": "MOCK_DATA"
        }

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
        last_health_log = 0
        health_log_interval = 30  # Log health every 30 seconds
        
        try:
            while not self.shutdown_event.is_set():
                try:
                    current_time = time.time()
                    
                    # Periodic health logging
                    if current_time - last_health_log > health_log_interval:
                        health = self.get_health_status()
                        logging.info(f"Health Status: {health['status']} - "
                                   f"Clients: {health['connected_clients']}, "
                                   f"Drone: {'connected' if health['drone_connected'] else 'disconnected'}, "
                                   f"Errors: {health['error_count']}")
                        last_health_log = current_time
                    
                    if self.clients:
                        # Get telemetry data (real or mock)
                        if self.drone_connection.is_connected:
                            telemetry = await asyncio.to_thread(self.drone_connection.get_snapshot)
                        else:
                            # Send mock telemetry data when drone is not connected
                            telemetry = self._get_mock_telemetry()
                        
                        if self.is_telemetry_valid(telemetry):
                            self.last_telemetry_update = current_time
                            message = json.dumps(telemetry)
                            
                            async with self.lock:
                                clients_to_remove = set()
                                
                                for client in self.clients:
                                    try:
                                        await client.send(message)
                                    except websockets.exceptions.ConnectionClosed:
                                        clients_to_remove.add(client)
                                    except Exception as e:
                                        logging.error(f"Error sending telemetry to client: {e}")
                                        clients_to_remove.add(client)
                                
                                # Remove disconnected clients
                                self.clients -= clients_to_remove
                        else:
                            logging.warning("Invalid telemetry data, skipping broadcast")
                    
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
            # Create a task to handle graceful shutdown
            if hasattr(self, '_shutdown_task') and not self._shutdown_task.done():
                return
            
            loop = asyncio.get_event_loop()
            self._shutdown_task = loop.create_task(self.graceful_shutdown())
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        if hasattr(signal, 'SIGQUIT'):
            signal.signal(signal.SIGQUIT, signal_handler)

    async def start_server(self):
        """Enhanced server start with graceful shutdown support"""
        try:
            self.setup_signal_handlers()
            
            self.server = await websockets.serve(self.handler, self.host, self.port)
            logging.info(f"WebSocket server started at ws://{self.host}:{self.port}")
            self.health_status = "healthy"

            # Start background telemetry broadcast
            self.broadcast_task = asyncio.create_task(self.broadcast_telemetry())

            # Wait for shutdown signal or server close
            try:
                await asyncio.gather(
                    self.server.wait_closed(),
                    self.shutdown_event.wait(),
                    return_exceptions=True
                )
            except KeyboardInterrupt:
                logging.info("Keyboard interrupt received")
            
        except Exception as e:
            logging.error(f"Server error: {e}")
        finally:
            await self.graceful_shutdown()


if __name__ == "__main__":
    async def main():
        ws_server = WebSocketServer()
        try:
            await ws_server.start_server()
        except KeyboardInterrupt:
            logging.info("Server manually stopped")
        except Exception as e:
            logging.error(f"Fatal error: {e}")
        finally:
            if not ws_server.is_shutting_down:
                await ws_server.graceful_shutdown()

    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logging.info("Application terminated by user")
    except Exception as e:
        logging.error(f"Application error: {e}")
    finally:
        logging.info("Application shutdown complete")


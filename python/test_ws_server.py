#!/usr/bin/env python3
"""
Quick test to check WebSocket server's DroneConnection directly
"""

import asyncio
import time
from ws_server import WebSocketServer

async def test_ws_server_drone_connection():
    """Test the WebSocket server's drone connection directly"""
    print("🔧 Testing WebSocket server's DroneConnection...")
    
    ws_server = WebSocketServer()
    
    print("🔌 Attempting drone connection...")
    await ws_server.attempt_drone_connection()
    
    print(f"🔌 Connection status: {ws_server.drone_connection.is_connected}")
    print(f"🚁 Vehicle: {type(ws_server.drone_connection.vehicle)}")
    
    if ws_server.drone_connection.is_connected:
        print("✅ Drone connected! Testing get_snapshot()...")
        
        for i in range(3):
            print(f"\n--- Test {i+1} ---")
            start_time = time.time()
            
            try:
                # Test without asyncio.to_thread first
                print("📊 Calling get_snapshot() directly...")
                snapshot = ws_server.drone_connection.get_snapshot()
                end_time = time.time()
                duration = end_time - start_time
                
                if snapshot:
                    print(f"✅ Direct call successful in {duration:.2f}s")
                    print(f"📊 Keys: {list(snapshot.keys())}")
                else:
                    print(f"❌ Direct call returned None in {duration:.2f}s")
                    
            except Exception as e:
                end_time = time.time()
                duration = end_time - start_time
                print(f"❌ Direct call failed in {duration:.2f}s: {e}")
            
            # Now test with asyncio.to_thread (like WebSocket server does)
            print("📊 Calling get_snapshot() with asyncio.to_thread...")
            start_time = time.time()
            
            try:
                snapshot = await asyncio.wait_for(
                    asyncio.to_thread(ws_server.drone_connection.get_snapshot),
                    timeout=5.0
                )
                end_time = time.time()
                duration = end_time - start_time
                
                if snapshot:
                    print(f"✅ Asyncio call successful in {duration:.2f}s")
                    print(f"📊 Keys: {list(snapshot.keys())}")
                else:
                    print(f"❌ Asyncio call returned None in {duration:.2f}s")
                    
            except asyncio.TimeoutError:
                end_time = time.time()
                duration = end_time - start_time
                print(f"❌ Asyncio call TIMEOUT in {duration:.2f}s")
            except Exception as e:
                end_time = time.time()
                duration = end_time - start_time
                print(f"❌ Asyncio call failed in {duration:.2f}s: {e}")
            
            await asyncio.sleep(1)
    
    else:
        print("❌ Failed to connect to drone")
    
    # Cleanup
    await asyncio.to_thread(ws_server.drone_connection.disconnect)

if __name__ == "__main__":
    asyncio.run(test_ws_server_drone_connection())
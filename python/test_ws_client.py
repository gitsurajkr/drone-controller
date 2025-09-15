#!/usr/bin/env python3
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8765"
    try:
        print(f"Connecting to {uri}...")
        async with websockets.connect(uri) as websocket:
            print("Connected! Waiting for messages...")
            
            # Listen for 10 messages
            for i in range(10):
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    data = json.loads(message)
                    print(f"Message {i+1}:")
                    print(f"  Timestamp: {data.get('timestamp', 'N/A')}")
                    print(f"  Connection Status: {data.get('connection_status', 'N/A')}")
                    print(f"  Position: {data.get('position', 'N/A')}")
                    print(f"  State: {data.get('state', 'N/A')}")
                    print("---")
                except asyncio.TimeoutError:
                    print("Timeout waiting for message")
                except json.JSONDecodeError as e:
                    print(f"Failed to decode JSON: {e}")
                    print(f"Raw message: {message}")
                    
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    print("WebSocket Test Client")
    print("Testing connection to Python WebSocket server...")
    asyncio.run(test_websocket())
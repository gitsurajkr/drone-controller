import time
import logging
from drone_connection import DroneConnection

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def test_basic_drone_connection():
    print("🔌 Testing basic drone connection...")
    
    drone = DroneConnection()
    
    # Try to connect
    if drone.connect_with_retry("/dev/ttyACM0", 57600):
        print("✅ Drone connected successfully!")
        print(f"🔌 Connection status: is_connected={drone.is_connected}")
        print(f"🚁 Vehicle object: {type(drone.vehicle)}")
        
        # Test direct DroneKit access
        print("\n📡 Testing direct DroneKit vehicle access...")
        
        try:
            print(f"🔋 Armed: {drone.vehicle.armed}")
            print(f"🛸 Mode: {drone.vehicle.mode.name}")
            print(f"📊 System Status: {drone.vehicle.system_status.state}")
            print(f"💓 Last Heartbeat: {drone.vehicle.last_heartbeat}")
        except Exception as e:
            print(f"❌ Error accessing vehicle directly: {e}")
        
        # Test individual telemetry methods
        print("\n🧪 Testing individual telemetry methods...")
        
        if drone.telemetry:
            print("📊 Testing position...")
            try:
                pos = drone.telemetry.position()
                print(f"📍 Position: {pos}")
            except Exception as e:
                print(f"❌ Position error: {e}")
            
            print("📊 Testing velocity...")
            try:
                vel = drone.telemetry.velocity()
                print(f"🏃 Velocity: {vel}")
            except Exception as e:
                print(f"❌ Velocity error: {e}")
            
            print("📊 Testing attitude...")
            try:
                att = drone.telemetry.attitude()
                print(f"📐 Attitude: {att}")
            except Exception as e:
                print(f"❌ Attitude error: {e}")
            
            print("📊 Testing state...")
            try:
                state = drone.telemetry.state()
                print(f"🚁 State: {state}")
            except Exception as e:
                print(f"❌ State error: {e}")
            
            print("📊 Testing battery...")
            try:
                battery = drone.telemetry.battery_power()
                print(f"🔋 Battery: {battery}")
            except Exception as e:
                print(f"❌ Battery error: {e}")
        
        # Test full snapshot with timeout logging
        print("\n🚀 Testing full telemetry snapshot...")
        
        for i in range(3):
            print(f"\n--- Snapshot Attempt {i+1} ---")
            start_time = time.time()
            
            try:
                snapshot = drone.get_snapshot()
                end_time = time.time()
                duration = end_time - start_time
                
                if snapshot:
                    print(f"✅ Snapshot successful in {duration:.2f}s")
                    print(f"📊 Keys: {list(snapshot.keys())}")
                    print(f"📊 Sample data:")
                    for key, value in list(snapshot.items())[:3]:  # Show first 3 items
                        print(f"   {key}: {value}")
                else:
                    print(f"❌ Snapshot returned None in {duration:.2f}s")
                    
            except Exception as e:
                end_time = time.time()
                duration = end_time - start_time
                print(f"❌ Snapshot failed in {duration:.2f}s: {e}")
            
            time.sleep(1)
        
        drone.disconnect()
        
    else:
        print("❌ Failed to connect to drone")

if __name__ == "__main__":
    test_basic_drone_connection()
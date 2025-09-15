#!/usr/bin/env python3
"""
Quick test to check ekf_ok value directly from drone
"""

import time
from drone_connection import DroneConnection

def test_ekf_directly():
    """Test ekf_ok directly from the drone"""
    print("🔧 Testing ekf_ok directly from drone...")
    
    drone = DroneConnection()
    
    try:
        if drone.connect("/dev/ttyACM0", 57600):
            print("✅ Connected to drone")
            
            # Test ekf_ok directly
            for i in range(10):
                try:
                    print(f"\n--- Test {i+1} ---")
                    
                    # Check if ekf_ok attribute exists
                    if hasattr(drone.vehicle, 'ekf_ok'):
                        ekf_value = drone.vehicle.ekf_ok
                        print(f"🔍 Direct ekf_ok: {ekf_value} (type: {type(ekf_value)})")
                    else:
                        print("❌ ekf_ok attribute not found")
                    
                    # Check GPS status (major factor for EKF)
                    if hasattr(drone.vehicle, 'gps_0'):
                        gps = drone.vehicle.gps_0
                        print(f"🛰️ GPS fix_type: {gps.fix_type}, satellites: {gps.satellites_visible}")
                    
                    # Check location
                    if hasattr(drone.vehicle, 'location'):
                        loc = drone.vehicle.location.global_frame
                        print(f"📍 Location: lat={loc.lat}, lon={loc.lon}, alt={loc.alt}")
                    
                    # Also check EKF status from other sources
                    if hasattr(drone.vehicle, 'ekf_status'):
                        ekf_status = drone.vehicle.ekf_status
                        print(f"🔍 EKF status: {ekf_status}")
                    
                    # Check system status
                    if hasattr(drone.vehicle, 'system_status'):
                        sys_status = drone.vehicle.system_status
                        print(f"🔍 System status: {sys_status}")
                    
                    # Check is_armable (related to EKF)
                    if hasattr(drone.vehicle, 'is_armable'):
                        is_armable = drone.vehicle.is_armable
                        print(f"🔍 Is armable: {is_armable}")
                        
                    # Check home location
                    if hasattr(drone.vehicle, 'home_location'):
                        home = drone.vehicle.home_location
                        print(f"🏠 Home location: {home}")
                        
                    # Check if armed
                    if hasattr(drone.vehicle, 'armed'):
                        armed = drone.vehicle.armed
                        print(f"🔫 Armed: {armed}")
                        
                    # Check mode
                    if hasattr(drone.vehicle, 'mode'):
                        mode = drone.vehicle.mode
                        print(f"🎯 Mode: {mode}")
                        
                    # Check attitude
                    if hasattr(drone.vehicle, 'attitude'):
                        att = drone.vehicle.attitude
                        print(f"📐 Attitude: roll={att.roll:.3f}, pitch={att.pitch:.3f}, yaw={att.yaw:.3f}")
                        
                    # Check if groundspeed is reasonable
                    if hasattr(drone.vehicle, 'groundspeed'):
                        speed = drone.vehicle.groundspeed
                        print(f"🚀 Groundspeed: {speed} m/s")
                        
                    time.sleep(1)
                    
                except Exception as e:
                    print(f"❌ Error accessing ekf_ok: {e}")
        else:
            print("❌ Failed to connect to drone")
            
    finally:
        drone.disconnect()

if __name__ == "__main__":
    test_ekf_directly()
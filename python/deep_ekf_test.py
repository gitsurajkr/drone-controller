#!/usr/bin/env python3
"""
Deep dive into EKF status - check all possible EKF-related attributes
"""

import time
from drone_connection import DroneConnection

def deep_ekf_analysis():
    """Analyze all EKF-related attributes"""
    print("🔧 Deep EKF analysis...")
    
    drone = DroneConnection()
    
    try:
        if drone.connect("/dev/ttyACM0", 57600):
            print("✅ Connected to drone")
            
            # Wait a moment for connection to stabilize
            time.sleep(3)
            
            print("\n=== COMPREHENSIVE EKF ANALYSIS ===")
            
            # Get all vehicle attributes
            vehicle_attrs = dir(drone.vehicle)
            ekf_related = [attr for attr in vehicle_attrs if 'ekf' in attr.lower()]
            
            print(f"🔍 EKF-related attributes found: {ekf_related}")
            
            for attr in ekf_related:
                try:
                    value = getattr(drone.vehicle, attr)
                    print(f"  📊 {attr}: {value} (type: {type(value)})")
                except Exception as e:
                    print(f"  ❌ {attr}: Error - {e}")
            
            # Check specific EKF statuses
            print("\n=== SPECIFIC EKF CHECKS ===")
            
            # Check if there's an EKF status message
            try:
                # Try to access EKF status via MAVLink
                vehicle = drone.vehicle
                
                # Look for EKF-related MAVLink messages
                print("🔍 Checking MAVLink EKF messages...")
                
                # Check if we can access the raw MAVLink connection
                if hasattr(vehicle, '_master'):
                    master = vehicle._master
                    print(f"📡 MAVLink master: {master}")
                    
                    # Try to get recent messages
                    print("📨 Recent MAVLink messages:")
                    # This might show EKF-related messages
                    
            except Exception as e:
                print(f"❌ MAVLink check error: {e}")
            
            # Check vehicle parameters related to EKF
            print("\n=== EKF PARAMETERS ===")
            try:
                params = drone.vehicle.parameters
                ekf_params = {}
                
                # Look for EKF parameters
                for param_name in params.keys():
                    if 'EKF' in param_name or 'ekf' in param_name.lower():
                        ekf_params[param_name] = params[param_name]
                
                print(f"🔧 EKF parameters found: {len(ekf_params)}")
                for name, value in list(ekf_params.items())[:10]:  # Show first 10
                    print(f"  📋 {name}: {value}")
                    
                if len(ekf_params) > 10:
                    print(f"  ... and {len(ekf_params) - 10} more EKF parameters")
                    
            except Exception as e:
                print(f"❌ Parameter check error: {e}")
            
            # Check GPS status in detail
            print("\n=== GPS DETAILED STATUS ===")
            try:
                gps = drone.vehicle.gps_0
                print(f"🛰️ GPS fix_type: {gps.fix_type}")
                print(f"🛰️ GPS satellites_visible: {gps.satellites_visible}")
                print(f"🛰️ GPS eph: {gps.eph}")
                print(f"🛰️ GPS epv: {gps.epv}")
                
                # GPS fix types:
                # 0: NO_GPS
                # 1: NO_FIX  
                # 2: 2D_FIX
                # 3: 3D_FIX
                # 4: DGPS
                # 5: RTK_FLOAT
                # 6: RTK_FIXED
                
                fix_types = {
                    0: "NO_GPS",
                    1: "NO_FIX", 
                    2: "2D_FIX",
                    3: "3D_FIX",
                    4: "DGPS",
                    5: "RTK_FLOAT",
                    6: "RTK_FIXED"
                }
                
                print(f"🛰️ GPS fix meaning: {fix_types.get(gps.fix_type, 'UNKNOWN')}")
                
            except Exception as e:
                print(f"❌ GPS detailed check error: {e}")
                
        else:
            print("❌ Failed to connect to drone")
            
    finally:
        drone.disconnect()

if __name__ == "__main__":
    deep_ekf_analysis()
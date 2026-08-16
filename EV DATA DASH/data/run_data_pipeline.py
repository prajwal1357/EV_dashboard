import os
import csv
from datetime import datetime, timedelta

def run_data_pipeline():
    print("=" * 70)
    print(" STEP 0: EV FLEET DATASET STANDALONE PROCESSING PIPELINE")
    print("=" * 70)
    
    input_csv = os.path.join('data', 'ev_fleet_charging_data.csv')
    output_csv = os.path.join('data', 'cleaned_ev_fleet_charging_data.csv')
    
    if not os.path.exists(input_csv):
        print(f"[ERROR] Input dataset missing at {input_csv}")
        return
        
    print(f"Reading input dataset: {input_csv}...")
    with open(input_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        records = list(reader)
        
    print(f"Total raw records loaded: {len(records)}")
    
    processed = []
    dropped_count = 0
    
    for r in records:
        try:
            soh = float(r.get('Battery_State_of_Health', 90.0))
            energy = float(r.get('Energy_Consumed', 20.0))
            dist = float(r.get('Distance_Travelled', 100.0))
            cost = float(r.get('Charging_Cost', 250.0))
            
            if soh < 50.0 or energy <= 0:
                dropped_count += 1
                continue
                
            eff = round((energy / max(dist, 1.0)) * 100, 2)
            deg_status = 'Healthy' if soh >= 90 else ('Moderate' if soh >= 80 else 'Critical')
            
            processed.append({
                'Vehicle_ID': r.get('Vehicle_ID'),
                'Vehicle_Model': r.get('Vehicle_Model'),
                'Manufacturer': r.get('Manufacturer', 'Tata'),
                'Manufacturing_Year': r.get('Manufacturing_Year', '2023'),
                'Battery_Capacity': r.get('Battery_Capacity', '40'),
                'Battery_State_of_Health': soh,
                'Degradation_Status': deg_status,
                'Charging_Start_Time': r.get('Charging_Start_Time'),
                'Charging_End_Time': r.get('Charging_End_Time'),
                'Charging_Duration': r.get('Charging_Duration'),
                'Charging_Station': r.get('Charging_Station'),
                'Charging_Type': r.get('Charging_Type'),
                'Temperature': r.get('Temperature', '30'),
                'Energy_Consumed': energy,
                'Distance_Travelled': dist,
                'Efficiency_kWh_100km': eff,
                'Charging_Cost': cost,
                'Fleet_ID': r.get('Fleet_ID'),
                'Location': r.get('Location'),
                'Charging_Status': r.get('Charging_Status', 'Completed'),
                'Maintenance_Status': r.get('Maintenance_Status', 'Good')
            })
        except Exception:
            dropped_count += 1
            
    print(f"Cleaned records: {len(processed)} | Dropped invalid: {dropped_count}")
    
    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=list(processed[0].keys()))
        writer.writeheader()
        writer.writerows(processed)
        
    print(f"[SUCCESS] Cleaned dataset exported cleanly to: {output_csv}")
    print("=" * 70)

if __name__ == '__main__':
    run_data_pipeline()

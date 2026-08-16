import os
import csv
import random
from datetime import datetime, timedelta

def generate_ev_dataset(num_records=1000, seed=42):
    random.seed(seed)
    
    manufacturers_models = {
        'Tesla': ['Model Y', 'Model 3', 'Semi', 'Cybertruck'],
        'Rivian': ['R1T', 'EDV 700', 'R1S'],
        'Volvo': ['FH Electric', 'FM Electric', 'EX90'],
        'BYD': ['e6', 'ETP3', 'T5'],
        'Ford': ['E-Transit', 'F-150 Lightning']
    }
    
    fleets = ['Fleet-ALPHA', 'Fleet-BETA', 'Fleet-GAMMA', 'Fleet-DELTA', 'Fleet-OMEGA']
    locations = ['Seattle Hub', 'San Francisco Fleet Depot', 'Los Angeles Port', 'Chicago Central', 'Austin Logistic Park']
    charging_stations = [f'Station-{i:02d}' for i in range(1, 16)]
    charging_types = ['Level 2 AC', 'DC Fast Charge', 'Ultra Fast DC (350kW)']
    charging_statuses = ['Completed', 'Completed', 'Completed', 'Interrupted', 'In Progress']
    
    fieldnames = [
        'Vehicle_ID', 'Vehicle_Model', 'Manufacturer', 'Manufacturing_Year',
        'Battery_Capacity', 'Battery_State_of_Health', 'Charging_Start_Time',
        'Charging_End_Time', 'Charging_Duration', 'Charging_Station',
        'Charging_Type', 'Temperature', 'Energy_Consumed', 'Distance_Travelled',
        'Charging_Cost', 'Fleet_ID', 'Location', 'Charging_Status', 'Maintenance_Status'
    ]
    
    records = []
    base_time = datetime(2026, 1, 1, 6, 0, 0)
    
    for i in range(1, num_records + 1):
        vehicle_num = (i % 150) + 1
        vehicle_id = f"EV-F{vehicle_num:03d}"
        
        mfr = random.choice(list(manufacturers_models.keys()))
        model = random.choice(manufacturers_models[mfr])
        mfg_year = random.choice([2021, 2022, 2023, 2024, 2025])
        
        fleet_id = random.choice(fleets)
        location = random.choice(locations)
        station = random.choice(charging_stations)
        chg_type = random.choice(charging_types)
        
        if 'Semi' in model or 'FH' in model or 'EDV' in model:
            battery_cap = random.choice([250.0, 300.0, 540.0])
        else:
            battery_cap = random.choice([75.0, 82.0, 100.0, 131.0])
            
        age_years = 2026 - mfg_year
        base_soh = 100.0 - (age_years * random.uniform(2.0, 4.5)) - random.uniform(0, 5)
        soh = round(max(65.0, min(100.0, base_soh)), 2)
        
        start_offset_minutes = random.randint(0, 30000)
        start_time = base_time + timedelta(minutes=start_offset_minutes)
        
        if chg_type == 'Ultra Fast DC (350kW)':
            duration_mins = random.randint(25, 50)
            power_kw = 150
        elif chg_type == 'DC Fast Charge':
            duration_mins = random.randint(45, 90)
            power_kw = 75
        else:
            duration_mins = random.randint(180, 420)
            power_kw = 11
            
        end_time = start_time + timedelta(minutes=duration_mins)
        duration_hrs = round(duration_mins / 60.0, 2)
        
        energy_consumed = round(min(battery_cap * random.uniform(0.4, 0.95), power_kw * duration_hrs), 2)
        distance_travelled = round(energy_consumed * random.uniform(3.2, 4.8), 2)
        
        temperature_c = round(random.gauss(24, 6), 1)
        cost_per_kwh = random.choice([0.14, 0.18, 0.25, 0.32])
        charging_cost = round(energy_consumed * cost_per_kwh, 2)
        
        chg_status = random.choice(charging_statuses)
        
        if soh < 75.0:
            maint_status = random.choice(['Needs Immediate Inspection', 'Scheduled'])
        elif soh < 85.0:
            maint_status = random.choice(['Scheduled', 'Good'])
        else:
            maint_status = 'Good'
            
        temp_val = "" if i in [12, 13, 14] else temperature_c
        dist_val = "" if i in [45, 46] else distance_travelled
            
        records.append({
            'Vehicle_ID': vehicle_id,
            'Vehicle_Model': model,
            'Manufacturer': mfr,
            'Manufacturing_Year': mfg_year,
            'Battery_Capacity': battery_cap,
            'Battery_State_of_Health': soh,
            'Charging_Start_Time': start_time.strftime('%Y-%m-%d %H:%M:%S'),
            'Charging_End_Time': end_time.strftime('%Y-%m-%d %H:%M:%S'),
            'Charging_Duration': duration_hrs,
            'Charging_Station': station,
            'Charging_Type': chg_type,
            'Temperature': temp_val,
            'Energy_Consumed': energy_consumed,
            'Distance_Travelled': dist_val,
            'Charging_Cost': charging_cost,
            'Fleet_ID': fleet_id,
            'Location': location,
            'Charging_Status': chg_status,
            'Maintenance_Status': maint_status
        })
        
    os.makedirs('data', exist_ok=True)
    csv_path = os.path.join('data', 'ev_fleet_charging_data.csv')
    
    with open(csv_path, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)
        
    print(f"Successfully generated dataset with {len(records)} records at {csv_path}")

if __name__ == '__main__':
    generate_ev_dataset()

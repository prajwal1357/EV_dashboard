import csv
import os
from datetime import datetime, timedelta

def excel_date_to_datetime(excel_date_str, excel_time_str):
    try:
        excel_date = float(excel_date_str)
        excel_time = float(excel_time_str) if excel_time_str else 0.0
        
        # Excel base date is 1899-12-30
        base_date = datetime(1899, 12, 30)
        dt = base_date + timedelta(days=excel_date)
        seconds = int(excel_time * 86400)
        dt = dt + timedelta(seconds=seconds)
        return dt
    except Exception:
        return datetime(2026, 1, 1, 10, 0, 0)

def clean_dataset():
    raw_path = os.path.join('data', 'ev_fleet_charging_data.csv')
    cleaned_path = os.path.join('data', 'ev_fleet_charging_data.csv')
    
    with open(raw_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        
    print(f"Loaded {len(rows)} raw user records.")
    
    cleaned_rows = []
    for r in rows:
        dt_start = excel_date_to_datetime(r.get('Charging_Date', '46030'), r.get('Charging_Time', '0.5'))
        duration_min = float(r.get('Charging_Duration_Min', '60')) if r.get('Charging_Duration_Min') else 60.0
        duration_hrs = round(duration_min / 60.0, 2)
        dt_end = dt_start + timedelta(minutes=duration_min)
        
        soh = float(r.get('SOH', '90.0')) if r.get('SOH') else 90.0
        if soh < 78.0:
            maint_status = 'Needs Immediate Inspection'
        elif soh < 88.0:
            maint_status = 'Scheduled'
        else:
            maint_status = 'Good'
            
        energy_kwh = float(r.get('Energy_Consumed_kWh', '20.0')) if r.get('Energy_Consumed_kWh') else 20.0
        dist_km = float(r.get('Distance_Travelled_km', '100.0')) if r.get('Distance_Travelled_km') else 100.0
        eff = round((energy_kwh / max(dist_km, 1.0)) * 100, 2)
        
        cleaned_rows.append({
            'Vehicle_ID': r.get('Vehicle_ID', ''),
            'Vehicle_Model': r.get('Vehicle_Model', ''),
            'Manufacturer': r.get('Vehicle_Model', '').split()[0] if r.get('Vehicle_Model') else 'Tata',
            'Manufacturing_Year': 2023,
            'Battery_Capacity': r.get('Battery_Capacity_kWh', '40'),
            'Battery_State_of_Health': soh,
            'Charging_Start_Time': dt_start.strftime('%Y-%m-%d %H:%M:%S'),
            'Charging_End_Time': dt_end.strftime('%Y-%m-%d %H:%M:%S'),
            'Charging_Duration': duration_hrs,
            'Charging_Station': r.get('Charging_Station', ''),
            'Charging_Type': r.get('Charging_Type', 'Normal'),
            'Temperature': r.get('Battery_Temperature', '30'),
            'Energy_Consumed': energy_kwh,
            'Distance_Travelled': dist_km,
            'Charging_Cost': r.get('Charging_Cost', '0'),
            'Fleet_ID': r.get('Fleet_Name', 'Premium Fleet'),
            'Location': r.get('City', 'Bengaluru'),
            'Charging_Status': 'Completed',
            'Maintenance_Status': maint_status,
            'Driver_ID': r.get('Driver_ID', ''),
            'Weather': r.get('Weather', 'Sunny')
        })
        
    fieldnames = list(cleaned_rows[0].keys())
    with open(cleaned_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(cleaned_rows)
        
    print(f"Successfully cleaned and standardized {len(cleaned_rows)} records in {cleaned_path}")

if __name__ == '__main__':
    clean_dataset()

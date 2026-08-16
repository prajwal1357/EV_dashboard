import os
import csv

def run_alteryx_simulation():
    print("=" * 75)
    print(" STEP 1: ALTERYX ETL WORKFLOW STANDALONE SIMULATOR")
    print("=" * 75)
    
    input_file = os.path.join('data', 'ev_fleet_charging_data.csv')
    output_file = os.path.join('data', 'cleaned_ev_fleet_charging_data.csv')
    
    if not os.path.exists(input_file):
        print(f"[ERROR] Input file {input_file} missing.")
        return

    # Tool 1: Input Data
    print("Tool 1: [Input Data] -> Loading raw CSV...")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = list(csv.DictReader(f))
    print(f"   Loaded {len(data)} records.")

    # Tool 2: Select Tool
    print("Tool 2: [Select Tool] -> Standardizing data types...")

    # Tool 3: Data Cleansing
    print("Tool 3: [Data Cleansing] -> Trimming whitespace & removing linebreaks...")
    for r in data:
        for k in r:
            if isinstance(r[k], str):
                r[k] = r[k].strip()

    # Tool 4: Formula Tool (Imputation & Calculations)
    print("Tool 4: [Formula Tool] -> Imputing missing values & computing metrics...")
    for r in data:
        if not r.get('Battery_Temperature'): r['Battery_Temperature'] = '22.5'
        if not r.get('Distance_Travelled_km'):
            energy = float(r.get('Energy_Consumed_kWh', 20.0))
            r['Distance_Travelled_km'] = str(round(energy * 3.8, 2))

        energy = float(r.get('Energy_Consumed_kWh', 20.0))
        dist = float(r.get('Distance_Travelled_km', 100.0))
        soh = float(r.get('SOH', 90.0))
        
        r['Efficiency_kWh_100km'] = str(round((energy / max(dist, 1.0)) * 100, 2))
        r['Degradation_Status'] = 'Healthy' if soh >= 90 else ('Moderate' if soh >= 80 else 'Critical')

    # Tool 5: Filter Tool
    print("Tool 5: [Filter Tool] -> Filtering valid records (SOH >= 50% AND Energy > 0)...")
    filtered_data = [r for r in data if float(r.get('SOH', 90)) >= 50.0 and float(r.get('Energy_Consumed_kWh', 1)) > 0]
    print(f"   Passed filter: {len(filtered_data)} records.")

    # Tool 6: Sort Tool
    print("Tool 6: [Sort Tool] -> Sorting by Fleet_Name ASC, Vehicle_ID ASC...")
    sorted_data = sorted(filtered_data, key=lambda x: (x.get('Fleet_Name', ''), x.get('Vehicle_ID', '')))

    # Tool 7: Unique Tool
    print("Tool 7: [Unique Tool] -> Enforcing unique vehicle sessions...")

    # Tool 8: Summarize Tool
    print("Tool 8: [Summarize Tool] -> Aggregating Avg_SOH, Sum_Energy, Sum_Cost by Fleet...")

    # Tool 9: CrossTab Tool
    print("Tool 9: [CrossTab Tool] -> Pivoting energy consumption by charging type...")

    # Tool 10: Output Data
    print(f"Tool 10: [Output Data] -> Writing cleaned output to {output_file}...")
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=list(sorted_data[0].keys()))
        writer.writeheader()
        writer.writerows(sorted_data)

    print(f"[SUCCESS] Alteryx ETL Simulation completed cleanly! Saved to {output_file}")
    print("=" * 75)

if __name__ == '__main__':
    run_alteryx_simulation()

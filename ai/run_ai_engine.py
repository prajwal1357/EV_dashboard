import os
import sys

# Add root directory to module search path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai.expert_ml_engine import EVFleetExpertMLEngine

def run_ai_engine():
    print("=" * 75)
    print(" STEP 5: AI & MACHINE LEARNING ANALYTICS ENGINE STANDALONE TEST")
    print("=" * 75)
    
    engine = EVFleetExpertMLEngine()
    
    # 1. Executive Summary
    print("\n--- 1. EXECUTIVE DIAGNOSTIC AI SUMMARY ---")
    summary = engine.generate_executive_ai_summary()
    print(f"Total Telemetry Sessions Analyzed : {summary.get('total_sessions')}")
    print(f"Global Average Battery SOH        : {summary.get('avg_soh')}%")
    print(f"Critical Battery Vehicles Count   : {summary.get('critical_vehicles_count')}")
    print(f"Optimal Health Percentage         : {summary.get('optimal_health_percent')}%")
    
    print("\n--- RECOMMENDED AI ACTIONS ---")
    for idx, act in enumerate(summary.get('recommended_actions', []), 1):
        print(f"  {idx}. {act}")

    # 2. Battery Degradation Forecast for EV0009
    print("\n--- 2. 12-MONTH SOH DEGRADATION FORECAST (Target: EV0009) ---")
    forecast = engine.predict_soh_degradation("EV0009")
    for f in forecast[:6]:
        print(f"  Month: {f['month']} | Predicted SOH: {f['predicted_soh']}% | Health Status: {f['status']}")

    # 3. Anomaly Detection Scan
    print("\n--- 3. TELEMETRY ANOMALY DETECTION SCAN ---")
    anomalies = engine.detect_anomalies()
    print(f"Total Anomalies Flagged: {len(anomalies)}")
    for a in anomalies[:3]:
        print(f"  [{a['severity']}] Vehicle {a['vehicle_id']} -> {a['type']}: {a['detail']}")

    print("\n[SUCCESS] AI Engine Execution Complete!")
    print("=" * 75)

if __name__ == '__main__':
    run_ai_engine()

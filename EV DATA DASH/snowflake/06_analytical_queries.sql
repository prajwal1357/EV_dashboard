-- ============================================================================
-- SNOWFLAKE STEP 6: ENTERPRISE ANALYTICAL SQL QUERIES & DATA MARTS
-- ============================================================================

USE DATABASE EV_FLEET_DB;
USE SCHEMA MART;

-- ----------------------------------------------------------------------------
-- VIEW 1: Fleet Executive Summary Mart
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW MART.VW_FLEET_EXECUTIVE_SUMMARY AS
SELECT 
    v.Fleet_ID,
    COUNT(DISTINCT v.Vehicle_SK) AS Total_Vehicles,
    ROUND(AVG(f.Battery_SOH), 2) AS Average_SOH_Percentage,
    COUNT(CASE WHEN f.Battery_SOH >= 90 THEN 1 END) AS Healthy_Batteries_Count,
    COUNT(CASE WHEN f.Battery_SOH BETWEEN 80 AND 89.99 THEN 1 END) AS Moderate_Batteries_Count,
    COUNT(CASE WHEN f.Battery_SOH < 80 THEN 1 END) AS Critical_Batteries_Count,
    ROUND(SUM(f.Energy_Consumed_kWh), 2) AS Total_Energy_Consumed_kWh,
    ROUND(SUM(f.Charging_Cost_USD), 2) AS Total_Charging_Cost_USD,
    ROUND(AVG(f.Efficiency_kWh_100km), 2) AS Avg_Fleet_Efficiency_kWh_100km
FROM CORE.FACT_CHARGING_SESSIONS f
JOIN CORE.DIM_VEHICLE v ON f.Vehicle_SK = v.Vehicle_SK
GROUP BY v.Fleet_ID;

-- ----------------------------------------------------------------------------
-- VIEW 2: Top Charging Stations & Utilization Analysis
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW MART.VW_TOP_CHARGING_STATIONS AS
SELECT 
    s.Station_ID,
    s.Location,
    COUNT(f.Session_SK) AS Total_Charging_Sessions,
    ROUND(SUM(f.Energy_Consumed_kWh), 2) AS Total_Energy_Delivered_kWh,
    ROUND(SUM(f.Charging_Cost_USD), 2) AS Total_Revenue_Generated_USD,
    ROUND(AVG(f.Charging_Duration_Hours), 2) AS Avg_Session_Duration_Hours,
    DENSE_RANK() OVER (ORDER BY SUM(f.Energy_Consumed_kWh) DESC) AS Station_Rank
FROM CORE.FACT_CHARGING_SESSIONS f
JOIN CORE.DIM_CHARGING_STATION s ON f.Station_SK = s.Station_SK
GROUP BY s.Station_ID, s.Location;

-- ----------------------------------------------------------------------------
-- VIEW 3: Daily Charging Cost & Energy Trends
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW MART.VW_DAILY_CHARGING_TRENDS AS
SELECT 
    DATE(f.Charging_Start_Time) AS Charging_Date,
    f.Charging_Type,
    COUNT(f.Session_SK) AS Daily_Sessions,
    ROUND(SUM(f.Energy_Consumed_kWh), 2) AS Daily_Energy_kWh,
    ROUND(SUM(f.Charging_Cost_USD), 2) AS Daily_Cost_USD,
    ROUND(AVG(f.Charging_Cost_USD / NULLIF(f.Energy_Consumed_kWh, 0)), 3) AS Avg_Cost_Per_kWh
FROM CORE.FACT_CHARGING_SESSIONS f
GROUP BY DATE(f.Charging_Start_Time), f.Charging_Type;

-- ----------------------------------------------------------------------------
-- VIEW 4: Vehicle Performance & Degradation Risk Ranking
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW MART.VW_VEHICLE_BATTERY_DEGRADATION AS
SELECT 
    v.Vehicle_ID,
    v.Manufacturer,
    v.Vehicle_Model,
    v.Manufacturing_Year,
    v.Fleet_ID,
    v.Home_Location,
    ROUND(AVG(f.Battery_SOH), 2) AS Current_SOH,
    (100.0 - ROUND(AVG(f.Battery_SOH), 2)) AS Cumulative_Degradation_Percent,
    COUNT(f.Session_SK) AS Lifetime_Charging_Cycles,
    ROUND(SUM(f.Distance_Travelled_km), 2) AS Total_Distance_km,
    CASE 
        WHEN AVG(f.Battery_SOH) < 75.0 THEN 'HIGH RISK - Immediate Battery Replacement Recommended'
        WHEN AVG(f.Battery_SOH) < 85.0 THEN 'MEDIUM RISK - Schedule Preventive Maintenance'
        ELSE 'LOW RISK - Optimal Health'
    END AS Maintenance_Risk_Level
FROM CORE.DIM_VEHICLE v
JOIN CORE.FACT_CHARGING_SESSIONS f ON v.Vehicle_SK = f.Vehicle_SK
GROUP BY v.Vehicle_ID, v.Manufacturer, v.Vehicle_Model, v.Manufacturing_Year, v.Fleet_ID, v.Home_Location;

-- ----------------------------------------------------------------------------
-- QUERY EXAMPLES FOR BUSINESS QUESTIONS
-- ----------------------------------------------------------------------------

-- 1. Average Battery Health across all fleets
SELECT ROUND(AVG(Battery_SOH), 2) AS Global_Average_SOH FROM CORE.FACT_CHARGING_SESSIONS;

-- 2. Top 5 Charging Stations by Energy Delivered
SELECT * FROM MART.VW_TOP_CHARGING_STATIONS LIMIT 5;

-- 3. Monthly Charging Cost Summary
SELECT 
    TO_CHAR(Charging_Start_Time, 'YYYY-MM') AS Charging_Month,
    ROUND(SUM(Charging_Cost_USD), 2) AS Monthly_Cost_USD,
    ROUND(SUM(Energy_Consumed_kWh), 2) AS Monthly_Energy_kWh
FROM CORE.FACT_CHARGING_SESSIONS
GROUP BY TO_CHAR(Charging_Start_Time, 'YYYY-MM')
ORDER BY Charging_Month DESC;

-- 4. Charging Duration Breakdown by Charging Type
SELECT 
    Charging_Type,
    COUNT(*) AS Session_Count,
    ROUND(MIN(Charging_Duration_Hours), 2) AS Min_Duration_Hrs,
    ROUND(AVG(Charging_Duration_Hours), 2) AS Avg_Duration_Hrs,
    ROUND(MAX(Charging_Duration_Hours), 2) AS Max_Duration_Hrs
FROM CORE.FACT_CHARGING_SESSIONS
GROUP BY Charging_Type;

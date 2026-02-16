using System;
using System.Collections.Generic;

namespace SolarAnalysis.Models
{
    /// <summary>
    /// Data Contract for Custom Analysis API Response
    /// </summary>
    public class CustomAnalysisDataContract
    {
        // Metadata
        public string ReportType { get; set; } = string.Empty;
        public string Metric { get; set; } = string.Empty;
        public int Layers { get; set; }
        public string Timestamp { get; set; } = string.Empty;
        public string PlantId { get; set; } = string.Empty;
        
        // Analysis Configuration
        public AnalysisConfig AnalysisConfig { get; set; } = new();
        
        // Data Points Array
        public List<CustomAnalysisDataPoint> DataPoints { get; set; } = new();
        
        // Statistical Summary
        public Statistics Statistics { get; set; } = new();
        
        // Data Quality Metrics
        public DataQuality DataQuality { get; set; } = new();
        
        // Chart Configuration
        public ChartConfig ChartConfig { get; set; } = new();
    }

    /// <summary>
    /// Analysis Configuration
    /// </summary>
    public class AnalysisConfig
    {
        public string XParameter { get; set; } = string.Empty;
        public string YParameter { get; set; } = string.Empty;
        public string ChartType { get; set; } = string.Empty;
        public string TimeRange { get; set; } = string.Empty;
        public AggregationLevel AggregationLevel { get; set; }
    }

    /// <summary>
    /// Aggregation Level Enum
    /// </summary>
    public enum AggregationLevel
    {
        Hourly,
        Daily,
        Monthly
    }

    /// <summary>
    /// Custom Analysis Data Point
    /// </summary>
    public class CustomAnalysisDataPoint
    {
        // Primary identifiers
        public string Id { get; set; } = string.Empty;
        public string Timestamp { get; set; } = string.Empty;
        
        // Time-based fields
        public string Date { get; set; } = string.Empty;
        public string Hour { get; set; } = string.Empty;
        public string DayOfWeek { get; set; } = string.Empty;
        public string Month { get; set; } = string.Empty;
        public string Year { get; set; } = string.Empty;
        
        // Solar plant metrics
        public double PowerOutput { get; set; } // kW
        public double EnergyGenerated { get; set; } // kWh
        public double PerformanceRatio { get; set; } // %
        public double InverterTemp { get; set; } // °C
        public double StringVoltage { get; set; } // V
        public double Irradiance { get; set; } // W/m²
        public double SoilingIndex { get; set; } // %
        
        // Financial metrics
        public double EnergyRevenue { get; set; } // USD
        public double OmCost { get; set; } // USD
        
        // Operational metrics
        public double Downtime { get; set; } // Hours
        public int FaultCount { get; set; } // Count
        
        // Environmental conditions
        public double AmbientTemperature { get; set; } // °C
        public double Humidity { get; set; } // %
        public double WindSpeed { get; set; } // m/s
        public string WindDirection { get; set; } = string.Empty;
        
        // Equipment status
        public InverterStatus InverterStatus { get; set; }
        public StringStatus StringStatus { get; set; }
        
        // Calculated fields
        public double Efficiency { get; set; } // %
        public double Availability { get; set; } // %
        public double CapacityFactor { get; set; } // %
        
        // Metadata
        public DataQualityLevel DataQuality { get; set; }
        public bool IsEstimated { get; set; }
        public string? Notes { get; set; }
    }

    /// <summary>
    /// Inverter Status Enum
    /// </summary>
    public enum InverterStatus
    {
        Online,
        Offline,
        Fault,
        Maintenance
    }

    /// <summary>
    /// String Status Enum
    /// </summary>
    public enum StringStatus
    {
        Active,
        Inactive,
        Fault
    }

    /// <summary>
    /// Data Quality Level Enum
    /// </summary>
    public enum DataQualityLevel
    {
        High,
        Medium,
        Low
    }

    /// <summary>
    /// Statistical Summary
    /// </summary>
    public class Statistics
    {
        public int TotalRecords { get; set; }
        public double MinValue { get; set; }
        public double MaxValue { get; set; }
        public double AverageValue { get; set; }
        public double MedianValue { get; set; }
        public double StandardDeviation { get; set; }
        public double? Correlation { get; set; } // For scatter plots
    }

    /// <summary>
    /// Data Quality Metrics
    /// </summary>
    public class DataQuality
    {
        public double Completeness { get; set; } // Percentage of complete records
        public double Accuracy { get; set; } // Data accuracy score
        public string LastUpdated { get; set; } = string.Empty;
        public string DataSource { get; set; } = string.Empty;
    }

    /// <summary>
    /// Chart Configuration
    /// </summary>
    public class ChartConfig
    {
        public string XAxisLabel { get; set; } = string.Empty;
        public string YAxisLabel { get; set; } = string.Empty;
        public string XAxisUnit { get; set; } = string.Empty;
        public string YAxisUnit { get; set; } = string.Empty;
        public string ColorScheme { get; set; } = string.Empty;
        public bool ShowTrendLine { get; set; }
        public bool ShowDataLabels { get; set; }
    }

    /// <summary>
    /// Example data contract instance
    /// </summary>
    public static class ExampleCustomAnalysisContract
    {
        public static CustomAnalysisDataContract GetExample()
        {
            return new CustomAnalysisDataContract
            {
                ReportType = "Custom Comparative Analysis",
                Metric = "powerOutput-irradiance",
                Layers = 1,
                Timestamp = "2024-01-15T10:30:00Z",
                PlantId = "PLANT-001",
                
                AnalysisConfig = new AnalysisConfig
                {
                    XParameter = "irradiance",
                    YParameter = "powerOutput",
                    ChartType = "scatter",
                    TimeRange = "7d",
                    AggregationLevel = AggregationLevel.Hourly
                },
                
                DataPoints = new List<CustomAnalysisDataPoint>
                {
                    new CustomAnalysisDataPoint
                    {
                        Id = "DP-001",
                        Timestamp = "2024-01-15T08:00:00Z",
                        Date = "2024-01-15",
                        Hour = "08:00",
                        DayOfWeek = "Monday",
                        Month = "January",
                        Year = "2024",
                        PowerOutput = 1250.5,
                        EnergyGenerated = 125.05,
                        PerformanceRatio = 0.85,
                        InverterTemp = 45.2,
                        StringVoltage = 380.5,
                        Irradiance = 650.3,
                        SoilingIndex = 0.95,
                        EnergyRevenue = 12.50,
                        OmCost = 25.00,
                        Downtime = 0,
                        FaultCount = 0,
                        AmbientTemperature = 28.5,
                        Humidity = 65.2,
                        WindSpeed = 3.2,
                        WindDirection = "NE",
                        InverterStatus = InverterStatus.Online,
                        StringStatus = StringStatus.Active,
                        Efficiency = 0.92,
                        Availability = 1.0,
                        CapacityFactor = 0.75,
                        DataQuality = DataQualityLevel.High,
                        IsEstimated = false,
                        Notes = "Normal operation"
                    },
                    new CustomAnalysisDataPoint
                    {
                        Id = "DP-002",
                        Timestamp = "2024-01-15T09:00:00Z",
                        Date = "2024-01-15",
                        Hour = "09:00",
                        DayOfWeek = "Monday",
                        Month = "January",
                        Year = "2024",
                        PowerOutput = 1850.8,
                        EnergyGenerated = 185.08,
                        PerformanceRatio = 0.88,
                        InverterTemp = 48.7,
                        StringVoltage = 382.1,
                        Irradiance = 850.7,
                        SoilingIndex = 0.94,
                        EnergyRevenue = 18.51,
                        OmCost = 25.00,
                        Downtime = 0,
                        FaultCount = 0,
                        AmbientTemperature = 31.2,
                        Humidity = 62.8,
                        WindSpeed = 4.1,
                        WindDirection = "E",
                        InverterStatus = InverterStatus.Online,
                        StringStatus = StringStatus.Active,
                        Efficiency = 0.94,
                        Availability = 1.0,
                        CapacityFactor = 0.82,
                        DataQuality = DataQualityLevel.High,
                        IsEstimated = false,
                        Notes = "Peak performance"
                    },
                    new CustomAnalysisDataPoint
                    {
                        Id = "DP-003",
                        Timestamp = "2024-01-15T10:00:00Z",
                        Date = "2024-01-15",
                        Hour = "10:00",
                        DayOfWeek = "Monday",
                        Month = "January",
                        Year = "2024",
                        PowerOutput = 2100.3,
                        EnergyGenerated = 210.03,
                        PerformanceRatio = 0.91,
                        InverterTemp = 52.1,
                        StringVoltage = 384.2,
                        Irradiance = 950.5,
                        SoilingIndex = 0.93,
                        EnergyRevenue = 21.00,
                        OmCost = 25.00,
                        Downtime = 0,
                        FaultCount = 0,
                        AmbientTemperature = 33.8,
                        Humidity = 58.5,
                        WindSpeed = 5.2,
                        WindDirection = "SE",
                        InverterStatus = InverterStatus.Online,
                        StringStatus = StringStatus.Active,
                        Efficiency = 0.96,
                        Availability = 1.0,
                        CapacityFactor = 0.89,
                        DataQuality = DataQualityLevel.High,
                        IsEstimated = false,
                        Notes = "Optimal conditions"
                    }
                },
                
                Statistics = new Statistics
                {
                    TotalRecords = 168, // 7 days * 24 hours
                    MinValue = 0,
                    MaxValue = 2100.3,
                    AverageValue = 1456.7,
                    MedianValue = 1420.5,
                    StandardDeviation = 245.8,
                    Correlation = 0.89
                },
                
                DataQuality = new DataQuality
                {
                    Completeness = 98.5,
                    Accuracy = 97.2,
                    LastUpdated = "2024-01-15T10:30:00Z",
                    DataSource = "SCADA System v2.1"
                },
                
                ChartConfig = new ChartConfig
                {
                    XAxisLabel = "Irradiance",
                    YAxisLabel = "Power Output",
                    XAxisUnit = "W/m²",
                    YAxisUnit = "kW",
                    ColorScheme = "blue",
                    ShowTrendLine = true,
                    ShowDataLabels = false
                }
            };
        }
    }
}


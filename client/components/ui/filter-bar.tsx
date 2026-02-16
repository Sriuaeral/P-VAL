import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  searchPlaceholder?: string;
  showSearch?: boolean;
  filters: {
    key: string;
    label: string;
    placeholder: string;
    options: FilterOption[];
    className?: string;
  }[];
}

export interface FilterBarProps {
  config: FilterConfig;
  values: Record<string, string>;
  onValueChange: (key: string, value: string) => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  config,
  values,
  onValueChange,
  className = "",
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {config.showSearch !== false && (
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={config.searchPlaceholder || "Search..."}
            value={values.search || ""}
            onChange={(e) => onValueChange("search", e.target.value)}
            className="pl-10"
          />
        </div>
      )}
      
      {config.filters.map((filter) => (
        <Select
          key={filter.key}
          value={values[filter.key] || "all"}
          onValueChange={(value) => onValueChange(filter.key, value)}
        >
          <SelectTrigger className={filter.className || "w-40"}>
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {filter.label}</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
};

// Common filter configurations
export const ALERT_FILTER_CONFIG: FilterConfig = {
  searchPlaceholder: "Search alerts...",
  showSearch: true,
  filters: [
    {
      key: "severity",
      label: "Severities",
      placeholder: "Filter by severity",
      options: [
        { value: "critical", label: "Critical" },
        { value: "high", label: "High" },
        { value: "medium", label: "Medium" },
        { value: "low", label: "Low" },
      ],
    },
    {
      key: "status",
      label: "Status",
      placeholder: "Filter by status",
      options: [
        { value: "active", label: "Active" },
        { value: "acknowledged", label: "Acknowledged" },
        { value: "resolved", label: "Resolved" },
        { value: "created", label: "Created" },
      ],
    },
    {
      key: "component",
      label: "Components",
      placeholder: "Filter by component",
      options: [
        { value: "Inverter", label: "Inverter" },
        { value: "Tracker", label: "Tracker" },
        { value: "WeatherStation", label: "Weather Station" },
        { value: "DataLogger", label: "Data Logger" },
        { value: "CombinerBox", label: "Combiner Box" },
        { value: "Transformer", label: "Transformer" },
        { value: "Panel", label: "Panel" },
        { value: "StringMonitor", label: "String Monitor" },
        { value: "Other", label: "Other" },
      ],
    },
  ],
};

export const createGlobalAlertFilterConfig = (plants: string[], components: string[]): FilterConfig => ({
  searchPlaceholder: "Search alerts...",
  showSearch: true,
  filters: [
    {
      key: "plant",
      label: "Plants",
      placeholder: "Filter by plant",
      options: plants.map(plant => ({ value: plant, label: plant })),
    },
    {
      key: "component",
      label: "Components",
      placeholder: "Filter by component",
      options: components.map(component => ({ value: component, label: component })),
    },
    {
      key: "severity",
      label: "Severities",
      placeholder: "Filter by severity",
      options: [
        { value: "critical", label: "Critical" },
        { value: "high", label: "High" },
        { value: "medium", label: "Medium" },
        { value: "low", label: "Low" },
      ],
    },
    {
      key: "status",
      label: "Status",
      placeholder: "Filter by status",
      options: [
        { value: "active", label: "Active" },
        { value: "acknowledged", label: "Acknowledged" },
        { value: "resolved", label: "Resolved" },
      ],
    },
  ],
});

export default FilterBar;

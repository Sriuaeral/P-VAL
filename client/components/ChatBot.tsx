import { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Bot,
  User,
  Zap,
  AlertTriangle,
  TrendingUp,
  Clock,
  BarChart3,
  Settings,
  MapPin,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  data?: {
    kpis?: Array<{
      label: string;
      value: string;
      status?: "good" | "warning" | "critical";
    }>;
    table?: Array<{ [key: string]: string }>;
    actions?: string[];
  };
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

// Synthetic data for intelligent responses
const syntheticData = {
  plants: [
    {
      id: "site-a",
      name: "Solar Farm Alpha",
      status: "healthy",
      performance: 98.5,
      region: "North",
    },
    {
      id: "site-b",
      name: "Solar Farm Beta",
      status: "warning",
      performance: 89.2,
      region: "South",
    },
    {
      id: "site-c",
      name: "Solar Farm Gamma",
      status: "critical",
      performance: 76.3,
      region: "East",
    },
    {
      id: "site-d",
      name: "Solar Farm Delta",
      status: "healthy",
      performance: 96.8,
      region: "West",
    },
  ],
  components: [
    {
      name: "Inverter 3B",
      site: "site-b",
      status: "needs replacement",
      priority: "high",
    },
    {
      name: "String Combiner 12",
      site: "site-c",
      status: "needs replacement",
      priority: "critical",
    },
    {
      name: "Transformer T2",
      site: "site-a",
      status: "needs maintenance",
      priority: "medium",
    },
    {
      name: "DC Cable Section 4",
      site: "site-c",
      status: "needs replacement",
      priority: "high",
    },
    {
      name: "Monitoring Unit 8",
      site: "site-b",
      status: "needs replacement",
      priority: "medium",
    },
  ],
  alerts: [
    {
      site: "site-b",
      component: "Inverter 5",
      severity: "critical",
      message: "DC isolation fault",
    },
    {
      site: "site-c",
      component: "String 12",
      severity: "high",
      message: "Underperformance detected",
    },
    {
      site: "site-a",
      component: "Tracker 8",
      severity: "medium",
      message: "Calibration needed",
    },
  ],
  maintenance: {
    "site-b": [
      {
        task: "Inspect Inverter 3B connections",
        time: "30 min",
        safety: "Lockout/Tagout required",
      },
      {
        task: "Check string combiner temperatures",
        time: "20 min",
        safety: "PPE required",
      },
      {
        task: "Verify tracker alignment",
        time: "45 min",
        safety: "Fall protection",
      },
    ],
  },
  trends: {
    portfolioPerformance: "up 3.2%",
    mainEnergyLoss: "inverter inefficiencies",
    financialTrend: "revenue up 8.5%",
  },
};

// Intelligent response generator
const generateResponse = (query: string): ChatMessage => {
  const lowerQuery = query.toLowerCase();
  const timestamp = new Date();

  // Asset Health Queries
  if (lowerQuery.includes("health") && lowerQuery.includes("site a")) {
    return {
      id: `bot-${Date.now()}`,
      type: "bot",
      content:
        "Solar Farm Alpha is currently in **healthy** status with excellent performance metrics.",
      timestamp,
      data: {
        kpis: [
          { label: "Performance Ratio", value: "98.5%", status: "good" },
          { label: "Availability", value: "99.2%", status: "good" },
          { label: "Active Alerts", value: "1", status: "good" },
        ],
        actions: ["Monitor tracker calibration scheduled for next week"],
      },
    };
  }

  if (
    lowerQuery.includes("top") &&
    (lowerQuery.includes("replacement") || lowerQuery.includes("components"))
  ) {
    return {
      id: `bot-${Date.now()}`,
      type: "bot",
      content:
        "Here are the top 5 components requiring replacement based on current health assessments:",
      timestamp,
      data: {
        table: syntheticData.components.map((comp, idx) => ({
          Component: comp.name,
          Site:
            syntheticData.plants.find((p) => p.id === comp.site)?.name ||
            "Unknown",
          Priority: comp.priority.toUpperCase(),
          Status: comp.status,
        })),
        actions: [
          "Schedule maintenance teams for critical components",
          "Order replacement parts for high priority items",
        ],
      },
    };
  }

  if (
    lowerQuery.includes("underperforming") ||
    lowerQuery.includes("performance")
  ) {
    const underperforming = syntheticData.plants.filter(
      (p) => p.performance < 90,
    );
    return {
      id: `bot-${Date.now()}`,
      type: "bot",
      content: `Found ${underperforming.length} underperforming plants requiring attention:`,
      timestamp,
      data: {
        table: underperforming.map((plant) => ({
          Plant: plant.name,
          Performance: `${plant.performance}%`,
          Status: plant.status.toUpperCase(),
          Region: plant.region,
        })),
        actions: [
          "Dispatch maintenance teams to Beta and Gamma",
          "Investigate inverter issues at underperforming sites",
        ],
      },
    };
  }

  // Technician Support
  if (
    lowerQuery.includes("maintenance checklist") &&
    lowerQuery.includes("site b")
  ) {
    return {
      id: `bot-${Date.now()}`,
      type: "bot",
      content: "Today's maintenance checklist for **Solar Farm Beta**:",
      timestamp,
      data: {
        table: syntheticData.maintenance["site-b"].map((task, idx) => ({
          Task: task.task,
          "Time Estimate": task.time,
          "Safety Requirements": task.safety,
        })),
        actions: [
          "Total estimated time: 95 minutes",
          "Ensure all safety protocols are followed",
        ],
      },
    };
  }

  // Portfolio Insights
  if (lowerQuery.includes("region") && lowerQuery.includes("energy")) {
    return {
      id: `bot-${Date.now()}`,
      type: "bot",
      content: "Regional energy generation analysis for current month:",
      timestamp,
      data: {
        table: [
          {
            Region: "East",
            Generation: "2,840 MWh",
            Performance: "76.3%",
            Status: "CRITICAL",
          },
          {
            Region: "South",
            Generation: "3,120 MWh",
            Performance: "89.2%",
            Status: "WARNING",
          },
          {
            Region: "West",
            Generation: "4,680 MWh",
            Performance: "96.8%",
            Status: "GOOD",
          },
          {
            Region: "North",
            Generation: "4,890 MWh",
            Performance: "98.5%",
            Status: "EXCELLENT",
          },
        ],
        actions: [
          "Focus maintenance resources on East region",
          "Investigate string combiner issues in underperforming areas",
        ],
      },
    };
  }

  if (
    lowerQuery.includes("financial") &&
    lowerQuery.includes("underperformance")
  ) {
    return {
      id: `bot-${Date.now()}`,
      type: "bot",
      content: "Financial underperformance analysis by site:",
      timestamp,
      data: {
        kpis: [
          { label: "Revenue Loss", value: "$47,800", status: "critical" },
          { label: "Affected Sites", value: "2/4", status: "warning" },
          { label: "Avg Loss/Site", value: "$23,900", status: "warning" },
        ],
        table: [
          {
            Site: "Solar Farm Beta",
            "Revenue Loss": "$18,400",
            Cause: "Inverter inefficiency",
          },
          {
            Site: "Solar Farm Gamma",
            "Revenue Loss": "$29,400",
            Cause: "String combiner faults",
          },
        ],
        actions: [
          "Prioritize inverter repairs at Beta site",
          "Emergency string combiner replacement at Gamma",
        ],
      },
    };
  }

  if (
    lowerQuery.includes("active alerts") ||
    (lowerQuery.includes("portfolio") && lowerQuery.includes("alerts"))
  ) {
    return {
      id: `bot-${Date.now()}`,
      type: "bot",
      content: "Portfolio-wide active alerts summary:",
      timestamp,
      data: {
        kpis: [
          { label: "Critical Alerts", value: "1", status: "critical" },
          { label: "High Priority", value: "1", status: "warning" },
          { label: "Medium Priority", value: "1", status: "good" },
        ],
        table: syntheticData.alerts.map((alert) => ({
          Site:
            syntheticData.plants.find((p) => p.id === alert.site)?.name ||
            "Unknown",
          Component: alert.component,
          Severity: alert.severity.toUpperCase(),
          Issue: alert.message,
        })),
        actions: [
          "Address critical DC isolation fault immediately",
          "Schedule string inspection within 24 hours",
        ],
      },
    };
  }

  // Trend Analysis
  if (lowerQuery.includes("better") && lowerQuery.includes("month")) {
    return {
      id: `bot-${Date.now()}`,
      type: "bot",
      content: "Portfolio performance comparison vs. last month:",
      timestamp,
      data: {
        kpis: [
          { label: "Portfolio Performance", value: "+3.2%", status: "good" },
          { label: "Revenue Growth", value: "+8.5%", status: "good" },
          { label: "System Availability", value: "97.8%", status: "good" },
        ],
        actions: [
          "Continue current maintenance strategy",
          "Monitor East region improvements",
        ],
      },
    };
  }

  if (lowerQuery.includes("energy loss") && lowerQuery.includes("week")) {
    return {
      id: `bot-${Date.now()}`,
      type: "bot",
      content:
        "Main cause of energy loss this week: **Inverter inefficiencies** accounting for 68% of total losses.",
      timestamp,
      data: {
        table: [
          {
            Cause: "Inverter inefficiencies",
            Loss: "142 MWh",
            Percentage: "68%",
          },
          {
            Cause: "String combiner faults",
            Loss: "45 MWh",
            Percentage: "22%",
          },
          { Cause: "Tracker misalignment", Loss: "21 MWh", Percentage: "10%" },
        ],
        actions: [
          "Schedule inverter efficiency audit",
          "Implement preventive maintenance for combiners",
        ],
      },
    };
  }

  // General help
  if (lowerQuery.includes("help") || lowerQuery.includes("what can you do")) {
    return {
      id: `bot-${Date.now()}`,
      type: "bot",
      content: "I'm your AI Portfolio Assistant! I can help with:",
      timestamp,
      data: {
        table: [
          {
            Feature: "Asset Health",
            Example: "What's the health status of Site A?",
          },
          {
            Feature: "Maintenance",
            Example: "Give me today's checklist for Site B",
          },
          {
            Feature: "Portfolio Insights",
            Example: "Which regions are underperforming?",
          },
          {
            Feature: "Financial Analysis",
            Example: "Show me revenue loss by site",
          },
          {
            Feature: "Trend Analysis",
            Example: "Is my portfolio performing better?",
          },
        ],
        actions: [
          "Try asking about specific sites, components, or performance metrics!",
        ],
      },
    };
  }

  // Weather impact queries
  if (lowerQuery.includes("weather") || lowerQuery.includes("temperature")) {
    return {
      id: `bot-${Date.now()}`,
      type: "bot",
      content: "Weather impact analysis on portfolio performance:",
      timestamp,
      data: {
        table: [
          {
            Region: "North",
            "Avg Temp": "28°C",
            Impact: "+2.1%",
            Status: "OPTIMAL",
          },
          {
            Region: "South",
            "Avg Temp": "35°C",
            Impact: "-5.2%",
            Status: "HOT",
          },
          {
            Region: "East",
            "Avg Temp": "42°C",
            Impact: "-12.8%",
            Status: "CRITICAL",
          },
          {
            Region: "West",
            "Avg Temp": "31°C",
            Impact: "+0.8%",
            Status: "GOOD",
          },
        ],
        actions: [
          "Consider cooling solutions for East region",
          "Monitor efficiency drops during peak heat hours",
        ],
      },
    };
  }

  // Inverter specific queries
  if (lowerQuery.includes("inverter")) {
    return {
      id: `bot-${Date.now()}`,
      type: "bot",
      content: "Inverter fleet status across all sites:",
      timestamp,
      data: {
        kpis: [
          { label: "Total Inverters", value: "48", status: "good" },
          { label: "Online", value: "43", status: "good" },
          { label: "Faulted", value: "3", status: "warning" },
          { label: "Offline", value: "2", status: "critical" },
        ],
        table: [
          {
            Site: "Solar Farm Beta",
            Inverter: "INV-05",
            Issue: "DC isolation fault",
            Priority: "CRITICAL",
          },
          {
            Site: "Solar Farm Gamma",
            Inverter: "INV-12",
            Issue: "Efficiency below 85%",
            Priority: "HIGH",
          },
          {
            Site: "Solar Farm Alpha",
            Inverter: "INV-08",
            Issue: "Temperature warning",
            Priority: "MEDIUM",
          },
        ],
        actions: [
          "Dispatch technician to Beta site immediately",
          "Schedule efficiency check for Gamma site",
        ],
      },
    };
  }

  // Revenue and ROI queries
  if (lowerQuery.includes("revenue") || lowerQuery.includes("roi")) {
    return {
      id: `bot-${Date.now()}`,
      type: "bot",
      content: "Portfolio financial performance summary:",
      timestamp,
      data: {
        kpis: [
          { label: "Monthly Revenue", value: "$284,500", status: "good" },
          { label: "YTD Revenue", value: "$1.68M", status: "good" },
          { label: "Portfolio ROI", value: "12.8%", status: "good" },
          { label: "Revenue vs Target", value: "+8.5%", status: "good" },
        ],
        table: [
          {
            Site: "Solar Farm Alpha",
            "Monthly Revenue": "$89,200",
            ROI: "14.2%",
            Status: "EXCEEDING",
          },
          {
            Site: "Solar Farm Delta",
            "Monthly Revenue": "$78,400",
            ROI: "13.1%",
            Status: "ON TARGET",
          },
          {
            Site: "Solar Farm Beta",
            "Monthly Revenue": "$62,100",
            ROI: "10.8%",
            Status: "BELOW TARGET",
          },
          {
            Site: "Solar Farm Gamma",
            "Monthly Revenue": "$54,800",
            ROI: "9.2%",
            Status: "POOR",
          },
        ],
        actions: [
          "Investigate Beta and Gamma revenue shortfalls",
          "Optimize maintenance schedules for better ROI",
        ],
      },
    };
  }

  // Safety and compliance
  if (lowerQuery.includes("safety") || lowerQuery.includes("compliance")) {
    return {
      id: `bot-${Date.now()}`,
      type: "bot",
      content: "Safety and compliance status across portfolio:",
      timestamp,
      data: {
        kpis: [
          { label: "Safety Score", value: "98.5%", status: "good" },
          { label: "Compliance Rate", value: "96.2%", status: "good" },
          { label: "Open Safety Items", value: "3", status: "warning" },
          { label: "Days Since Incident", value: "342", status: "good" },
        ],
        table: [
          {
            Site: "Solar Farm Beta",
            Issue: "Missing safety signage",
            Priority: "MEDIUM",
            "Due Date": "2024-01-20",
          },
          {
            Site: "Solar Farm Gamma",
            Issue: "Grounding inspection overdue",
            Priority: "HIGH",
            "Due Date": "2024-01-18",
          },
          {
            Site: "Solar Farm Alpha",
            Issue: "Fire extinguisher replacement",
            Priority: "LOW",
            "Due Date": "2024-01-25",
          },
        ],
        actions: [
          "Schedule grounding inspection for Gamma immediately",
          "Update safety signage at Beta site",
        ],
      },
    };
  }

  // Predictive maintenance
  if (
    lowerQuery.includes("predict") ||
    lowerQuery.includes("forecast") ||
    lowerQuery.includes("future")
  ) {
    return {
      id: `bot-${Date.now()}`,
      type: "bot",
      content: "Predictive maintenance forecast for next 30 days:",
      timestamp,
      data: {
        table: [
          {
            Component: "String Combiner 8",
            Site: "Solar Farm Beta",
            "Predicted Failure": "Jan 22, 2024",
            Confidence: "87%",
          },
          {
            Component: "Tracker Motor 15",
            Site: "Solar Farm Gamma",
            "Predicted Failure": "Jan 28, 2024",
            Confidence: "92%",
          },
          {
            Component: "Inverter Fan 3",
            Site: "Solar Farm Alpha",
            "Predicted Failure": "Feb 05, 2024",
            Confidence: "76%",
          },
        ],
        actions: [
          "Order replacement parts for high-confidence predictions",
          "Schedule proactive maintenance for Jan 20-22",
        ],
      },
    };
  }

  // Default response
  return {
    id: `bot-${Date.now()}`,
    type: "bot",
    content:
      "I understand you're asking about solar asset management. Could you be more specific? For example, you can ask about site health, maintenance checklists, performance issues, or portfolio trends.",
    timestamp,
    data: {
      actions: [
        "Try: 'What's the health status of Site A?'",
        "Try: 'Show me underperforming plants'",
        "Try: 'Give me maintenance checklist for Site B'",
        "Try: 'Show me revenue by site'",
        "Try: 'What's the weather impact?'",
      ],
    },
  };
};

export default function ChatBot({ isOpen, onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "bot",
      content:
        "👋 Hi! I'm **RAL**, your AI Portfolio Assistant. I can help you with asset health, maintenance planning, performance analysis, and portfolio insights. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    {
      icon: AlertTriangle,
      label: "Asset Health",
      query: "What's the current health status of all sites?",
    },
    {
      icon: Settings,
      label: "Maintenance",
      query: "Show me components needing replacement",
    },
    {
      icon: BarChart3,
      label: "Performance",
      query: "Which plants are currently underperforming?",
    },
    {
      icon: DollarSign,
      label: "Financial",
      query: "Show me financial underperformance by site",
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (customQuery?: string) => {
    const query = customQuery || inputValue;
    if (!query.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(
      () => {
        const botResponse = generateResponse(query);
        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
      },
      1000 + Math.random() * 1000,
    );
  };

  const handleQuickAction = (query: string) => {
    handleSendMessage(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex">
      {/* Backdrop */}
      <div className="flex-1" onClick={onClose} />

      {/* Chat Panel */}
      <div className="w-96 bg-white shadow-2xl flex flex-col h-full border-l">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Ask RAL!</h3>
              <p className="text-xs opacity-90">AI Portfolio Assistant</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-primary-foreground hover:bg-white/20 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                message.type === "user" ? "justify-end" : "justify-start",
              )}
            >
              {message.type === "bot" && (
                <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[280px] rounded-lg p-3 text-sm",
                  message.type === "user"
                    ? "bg-primary text-primary-foreground ml-8"
                    : "bg-muted",
                )}
              >
                {/* Message Content */}
                <div className="prose prose-sm max-w-none">
                  {message.content
                    .split("**")
                    .map((part, index) =>
                      index % 2 === 0 ? (
                        part
                      ) : (
                        <strong key={index}>{part}</strong>
                      ),
                    )}
                </div>

                {/* Data Display */}
                {message.data && (
                  <div className="mt-3 space-y-3">
                    {/* KPIs */}
                    {message.data.kpis && (
                      <div className="grid grid-cols-1 gap-2">
                        {message.data.kpis.map((kpi, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-white/50 rounded text-xs"
                          >
                            <span className="font-medium">{kpi.label}</span>
                            <Badge
                              variant={
                                kpi.status === "good"
                                  ? "success"
                                  : kpi.status === "warning"
                                    ? "warning"
                                    : "destructive"
                              }
                              className="text-xs"
                            >
                              {kpi.value}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Table */}
                    {message.data.table && (
                      <div className="bg-white/50 rounded p-2">
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b">
                                {Object.keys(message.data.table[0]).map(
                                  (header) => (
                                    <th
                                      key={header}
                                      className="text-left p-1 font-medium"
                                    >
                                      {header}
                                    </th>
                                  ),
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {message.data.table
                                .slice(0, 5)
                                .map((row, index) => (
                                  <tr
                                    key={index}
                                    className="border-b last:border-0"
                                  >
                                    {Object.values(row).map(
                                      (value, cellIndex) => (
                                        <td key={cellIndex} className="p-1">
                                          {value}
                                        </td>
                                      ),
                                    )}
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {message.data.actions && (
                      <div className="space-y-1">
                        {message.data.actions.map((action, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 text-xs"
                          >
                            <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {action}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-xs text-muted-foreground mt-2">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {message.type === "user" && (
                <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg p-3 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground mb-3 text-center">
              Quick Actions:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.query)}
                  className="h-auto p-2 flex flex-col items-center gap-1 hover:bg-primary/5"
                  disabled={isTyping}
                >
                  <action.icon className="w-4 h-4 text-primary" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about asset health, maintenance, or performance..."
              className="flex-1 text-sm"
              disabled={isTyping}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping}
              size="sm"
              className="px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2 text-center">
            Ask about sites, components, performance, or maintenance
          </div>
        </div>
      </div>
    </div>
  );
}

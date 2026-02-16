import { ReactNode, useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Building2,
  AlertTriangle,
  Heart,
  PieChart,
  Leaf,
  Package,
  CreditCard,
  Truck,
  Users,
  Menu,
  Bot,
  MessageCircle,
  ClipboardCheck,
  Sparkles,
  Zap,
  ChevronRight,
  Settings,
  Bell,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ChatBot from "@/components/ChatBot";
import StatusBar from "@/components/ui/status-bar";
import { useStatusBar } from "@/hooks/use-status-bar";
import { LogoutButton } from "@/components/auth/LogoutButton";

interface LayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  { icon: Building2, label: "Plants", href: "/plants", badge: "" },
  { icon: AlertTriangle, label: "Global Alerts", href: "/alerts", badge: "", variant: "" },
  { icon: Heart, label: "Asset Health", href: "/asset-health", badge: "", variant: "" },
  { icon: PieChart, label: "Portfolio", href: "/portfolio" },
  { icon: ClipboardCheck, label: "Tests", href: "/tests" },
  { icon: Leaf, label: "ESG", href: "/esg", badge: "", variant: "" },
  { icon: Package, label: "Stock", href: "/stock" },
  { icon: CreditCard, label: "Payments", href: "/payments" },
  { icon: Truck, label: "Supply Chain", href: "/supply-chain" },
  { icon: Users, label: "Clients", href: "/clients" },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(() => {
    // Initialize from localStorage for persistence
    const saved = localStorage.getItem('sidebar-expanded');
    return saved ? JSON.parse(saved) : false;
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    // Initialize from localStorage for persistence
    const saved = localStorage.getItem('sidebar-pinned');
    return saved ? JSON.parse(saved) : false;
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { messages, removeMessage } = useStatusBar();
  const sidebarRef = useRef<HTMLElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // On mobile, always start collapsed
      if (mobile && isNavExpanded && !isPinned) {
        setIsNavExpanded(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isNavExpanded, isPinned]);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('sidebar-expanded', JSON.stringify(isNavExpanded));
  }, [isNavExpanded]);

  useEffect(() => {
    localStorage.setItem('sidebar-pinned', JSON.stringify(isPinned));
  }, [isPinned]);

  // Handle click outside to collapse menu when expanded (only if not pinned)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isNavExpanded && !isPinned && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsNavExpanded(false);
        setIsHovered(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNavExpanded, isPinned]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + B to toggle sidebar (like VS Code)
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        handleToggleClick();
      }
      
      // Escape to close sidebar if not pinned
      if (event.key === 'Escape' && isNavExpanded && !isPinned) {
        setIsNavExpanded(false);
        setIsHovered(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isNavExpanded, isPinned]);

  // Enhanced hover behavior with mobile considerations
  const handleMouseEnter = useCallback(() => {
    // Don't expand on hover for mobile devices
    if (isMobile) return;
    
    // Clear any pending collapse timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    setIsHovered(true);
    
    // Only expand if not already expanded
    if (!isNavExpanded) {
      setIsNavExpanded(true);
    }
  }, [isMobile, isNavExpanded]);

  const handleMouseLeave = useCallback(() => {
    // Don't handle mouse leave on mobile
    if (isMobile) return;
    
    setIsHovered(false);
    
    // Only auto-collapse if the menu is not pinned
    if (isNavExpanded && !isPinned) {
      // Clear any existing timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      
      // Adaptive delay based on user behavior
      const delay = isHovered ? 300 : 600; // Shorter if actively hovering
      
      hoverTimeoutRef.current = setTimeout(() => {
        // Double-check conditions before collapsing
        if (!isHovered && !isPinned && !isMobile) {
          setIsNavExpanded(false);
        }
        hoverTimeoutRef.current = null;
      }, delay);
    }
  }, [isMobile, isNavExpanded, isPinned, isHovered]);

  const handleToggleClick = useCallback(() => {
    // Clear any pending hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    const newExpandedState = !isNavExpanded;
    setIsNavExpanded(newExpandedState);
    
    // Smart pinning logic
    if (isMobile) {
      // On mobile, always treat as temporary unless explicitly pinned
      setIsPinned(false);
    } else {
      // On desktop, pin when manually toggling
      setIsPinned(newExpandedState);
    }
    
    setIsHovered(false);
  }, [isNavExpanded, isMobile]);

  // Enhanced menu item click with smart behavior
  const handleMenuItemClick = useCallback(() => {
    // Mobile: always collapse after selection
    if (isMobile) {
      setTimeout(() => {
        setIsNavExpanded(false);
        setIsHovered(false);
      }, 100);
      return;
    }
    
    // Desktop: only collapse if expanded by hover (not pinned)
    if (isNavExpanded && !isPinned) {
      setTimeout(() => {
        setIsNavExpanded(false);
        setIsHovered(false);
      }, 150);
    }
  }, [isMobile, isNavExpanded, isPinned]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col">
      {/* Compact Professional Header */}
      <header className={cn(
        "sticky top-0 z-[70] transition-all duration-300 backdrop-blur-md border-b border-white/20 shadow-sm px-4 py-2 flex items-center justify-between",
        isScrolled 
          ? "bg-white/95 shadow-md shadow-black/5" 
          : "bg-gradient-to-r from-white/95 via-white/90 to-white/95"
      )}>
        <div className="flex items-center gap-4">
          {/* Compact Professional Logo */}
          <div className="relative group">
            <div className="w-8 h-8 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-md shadow-primary/20 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/30 group-hover:scale-105">
            <img 
                src="/assets/RAl_logo.png" 
                alt="RenewabAL Logo" 
                className="w-4 h-4" 
              />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full animate-pulse shadow-md shadow-success/40"></div>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          <div className="flex flex-col">
          <div className="flex items-center justify-center">
            <h1 className="font-bold text-lg tracking-tight whitespace-nowrap text-solid">
              <span className="text-navy-blue-1000" style={{color: "#002147"}}>Renewab</span>
              <span className="text-orange-500" style={{color: "#F87060"}}>AL</span>
              <span className="text-primary ml-1" style={{color: "#002147"}}>Algorithms</span>
            </h1>
          </div>
            {/* <h1 className="font-bold text-lg tracking-tight items-center gap-1">
              Renewab 
            </h1>
            <h1 className="font-bold text-lg tracking-tight text-orange-500 items-center gap-1">AL</h1>
            <h1 className="font-bold text-lg tracking-tight  items-center gap-1">Algorithms</h1> */}
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Enabling Smarter Renewable Assets
            </p>
          </div>
        </div>

        {/* Compact Header Actions */}
        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-muted/40 backdrop-blur-sm rounded-lg border border-white/20 transition-all duration-300 hover:bg-muted/60 focus-within:bg-white/80 focus-within:border-primary/30">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search plants, alerts..." 
              className="bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground w-40"
            />
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 rounded-lg relative text-muted-foreground hover:text-foreground hover:bg-accent"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
          </Button>

          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Language Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span>Language</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>
                    <span>English</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Arabic</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              
              {/* Currency Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span>Currency</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>
                    <span>USD</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>AED</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Compact Account Section */}
          <div className="hidden sm:flex items-center gap-2">
            <LogoutButton showUserInfo={true} />
          </div>
          
          {/* Mobile logout button */}
          <div className="sm:hidden">
            <LogoutButton showUserInfo={false} />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Backdrop */}
        {isMobile && isNavExpanded && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300"
            onClick={() => {
              setIsNavExpanded(false);
              setIsHovered(false);
            }}
            aria-hidden="true"
          />
        )}

        {/* Enhanced Professional Sidebar */}
        <aside 
          ref={sidebarRef}
          className={cn(
            "sidebar-premium transition-all duration-300 ease-in-out flex flex-col relative z-[50]",
            // Responsive width handling
            isNavExpanded 
              ? isMobile ? "w-64" : "w-56" 
              : "w-16",
            // Mobile overlay behavior
            isMobile && isNavExpanded && "fixed inset-y-0 left-0 shadow-2xl",
            // Visual feedback for pinned state
            isPinned && !isMobile && "ring-1 ring-primary/20"
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          role="navigation"
          aria-label="Main navigation"
          aria-expanded={isNavExpanded}
        >
          {/* Sidebar Header */}
          <div className="p-3 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              {isNavExpanded && (
                <h2 className="text-xs font-semibold text-sidebar-foreground">Navigation</h2>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleClick}
                className={cn(
                  "p-1.5 rounded-lg text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent transition-all duration-200",
                  isPinned && !isMobile && "bg-primary/10 text-primary"
                )}
                title={`${isNavExpanded ? 'Collapse' : 'Expand'} sidebar (Ctrl+B)`}
                aria-label={`${isNavExpanded ? 'Collapse' : 'Expand'} navigation menu`}
              >
                <Menu className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isPinned && !isMobile && "rotate-90"
                )} />
              </Button>
            </div>
          </div>

          {/* Compact Navigation Items */}
          <nav className="flex-1 p-3 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={handleMenuItemClick}
                  className={cn(
                    "sidebar-item-premium group relative overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-sidebar rounded-lg",
                    isActive && "active"
                  )}
                  aria-current={isActive ? "page" : undefined}
                  title={!isNavExpanded ? item.label : undefined}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                      isActive 
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md" 
                        : "text-sidebar-foreground group-hover:bg-sidebar-accent"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    {isNavExpanded && (
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.badge && (
                          <span className={cn(
                            "px-1.5 py-0.5 text-xs font-medium rounded-full",
                            item.variant === "warning" && "bg-warning/20 text-warning border border-warning/30",
                            item.variant === "success" && "bg-success/20 text-success border border-success/30",
                            !item.variant && "bg-sidebar-accent text-sidebar-accent-foreground"
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-sidebar-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              );
            })}
          </nav>

          {/* Compact AI Assistant */}
          <div className="p-3 border-t border-sidebar-border">
            <Button
              onClick={() => setIsChatBotOpen(true)}
              className="w-full bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold py-2 px-3 rounded-lg shadow-md shadow-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105"
            >
              <div className="flex items-center gap-2 w-full">
                <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
                  <Bot className="w-3 h-3" />
                </div>
                {isNavExpanded && (
                  <div className="flex-1 text-left">
                    <p className="text-xs font-semibold">RAL AI Assistant</p>
                    <p className="text-xs opacity-90">Ask me anything</p>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
                  {isNavExpanded && <span className="text-xs">Online</span>}
                </div>
              </div>
            </Button>
          </div>
        </aside>

        {/* Compact Main Content */}
        <main className="flex-1 overflow-auto scrollbar-premium">
          <div className="p-4 space-y-4">
            {children}
          </div>
        </main>
      </div>

      {/* Expert-Level Status Bar */}
             <StatusBar messages={messages} onDismiss={removeMessage} />

      {/* Expert-Level Chat Bot */}
      <ChatBot isOpen={isChatBotOpen} onClose={() => setIsChatBotOpen(false)} />
    </div>
  );
}

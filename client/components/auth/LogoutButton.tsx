import React from 'react';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface LogoutButtonProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  showUserInfo?: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  className,
  variant = 'ghost',
  size = 'default',
  showUserInfo = true,
}) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (!showUserInfo) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleLogout}
        className={cn(
          "text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
          className
        )}
        title="Sign Out"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-3 px-4 py-2 bg-muted/50 backdrop-blur-sm rounded-xl border border-white/20 transition-all duration-300 hover:bg-muted/70 hover:border-white/30 group",
            className
          )}
        >
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
              <span className="text-sm font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div className="flex flex-col text-left">
            <p className="text-sm font-semibold text-foreground">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.email || 'user@example.com'}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || 'user@example.com'}
            </p>
            {user?.role && (
              <p className="text-xs leading-none text-muted-foreground capitalize">
                {user.role}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

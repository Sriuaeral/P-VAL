import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  buttonClassName?: string;
  labelClassName?: string;
  variant?: "default" | "modal" | "popover";
  size?: "sm" | "md" | "lg";
  showTime?: boolean;
  timeFormat?: "12h" | "24h";
  format?: string;
  error?: string;
  helpText?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  label,
  disabled = false,
  required = false,
  minDate,
  maxDate,
  className,
  buttonClassName,
  labelClassName,
  variant = "default",
  size = "md",
  showTime = false,
  timeFormat = "12h",
  format: dateFormat = "PPP",
  error,
  helpText,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [tempValue, setTempValue] = useState<Date | undefined>(value);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside or pressing Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      if (variant === "modal") {
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (variant === "modal") {
        document.body.style.overflow = 'unset';
      }
    };
  }, [open, variant]);

  const handleOpen = () => {
    if (disabled) return;
    setTempValue(value);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTempValue(undefined);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange?.(date);
      setOpen(false);
    }
  };

  const handleCancel = () => {
    setTempValue(undefined);
    setOpen(false);
  };

  const sizeClasses = {
    sm: "h-9 text-sm",
    md: "h-11 text-sm",
    lg: "h-12 text-base",
  };

  const buttonSizeClasses = {
    sm: "h-9 px-3",
    md: "h-11 px-4",
    lg: "h-12 px-5",
  };

  const renderButton = () => (
    <Button
      variant="outline"
      onClick={handleOpen}
      disabled={disabled}
      className={cn(
        "w-full justify-start text-left font-normal border-2 border-gray-200 rounded-lg hover:border-gray-300 bg-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-md hover:scale-[1.02]",
        sizeClasses[size],
        buttonSizeClasses[size],
        !value && "text-muted-foreground",
        error && "border-red-500 focus:border-red-500",
        buttonClassName
      )}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {value ? format(value, dateFormat) : placeholder}
    </Button>
  );

  const renderCalendar = () => (
    <Calendar
      mode="single"
      selected={tempValue || value}
      onSelect={handleDateSelect}
      disabled={(date) => {
        if (minDate && date < minDate) return true;
        if (maxDate && date > maxDate) return true;
        return false;
      }}
      initialFocus
      className="shadow-none transition-all duration-200"
    />
  );

  const renderPopover = () => (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {renderButton()}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {renderCalendar()}
      </PopoverContent>
    </Popover>
  );

  const renderModal = () => (
    <>
      {renderButton()}
      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-all duration-300 ease-in-out animate-in fade-in-0" 
            onClick={handleClose} 
          />
          
          {/* Calendar Modal */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl p-6 transition-all duration-300 ease-in-out animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Date</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {renderCalendar()}
          </div>
        </>
      )}
    </>
  );

  const renderDefault = () => (
    <div className="relative" ref={calendarRef}>
      {!open ? (
        renderButton()
      ) : (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-all duration-300 ease-in-out animate-in fade-in-0" 
            onClick={handleClose} 
          />
          
          {/* Calendar Overlay */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl p-6 transition-all duration-300 ease-in-out animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Date</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {renderCalendar()}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <Label 
          className={cn(
            "text-sm font-semibold text-gray-700",
            required && "after:content-['*'] after:ml-0.5 after:text-red-500",
            labelClassName
          )}
        >
          {label}
        </Label>
      )}
      
      <div className="relative group">
        {variant === "popover" ? renderPopover() : 
         variant === "modal" ? renderModal() : 
         renderDefault()}
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-gray-500 mt-1">{helpText}</p>
      )}
    </div>
  );
}

// Export a simplified version for backward compatibility
export const SimpleDatePicker = React.forwardRef<
  HTMLDivElement,
  Omit<DatePickerProps, 'variant' | 'size'> & {
    variant?: "default" | "modal" | "popover";
  }
>((props, ref) => {
  return <DatePicker {...props} />;
});

SimpleDatePicker.displayName = "SimpleDatePicker";

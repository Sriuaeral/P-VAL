import React from 'react';
import { createRoot } from 'react-dom/client';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { EnhancedAlertDialog } from '@/components/ui/alert-dialog';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'default';
export type AlertPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface AlertOptions {
  title: string;
  description?: string;
  duration?: number;
  position?: AlertPosition;
  variant?: AlertType;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: AlertType;
  onConfirm?: () => void;
  onCancel?: () => void;
}

class AlertService {
  private static instance: AlertService;
  private alertQueue: Array<{ id: string; component: React.ReactElement }> = [];
  private nextId = 0;

  private constructor() {}

  public static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  // Toast notifications for non-blocking alerts
  public showToast(options: AlertOptions): string {
    const { title, description, duration = 5000, variant = 'default', action } = options;
    
    const toastVariant = variant === 'error' ? 'destructive' : 'default';
    
    const actionElement = action
      ? (React.createElement(ToastAction, { altText: action.label, onClick: action.onClick }, action.label) as unknown as import("@/components/ui/toast").ToastActionElement)
      : undefined;

    return toast({
      title,
      description,
      variant: toastVariant,
      duration,
      action: actionElement,
    }).id;
  }

  // Success toast
  public success(title: string, description?: string, options?: Partial<AlertOptions>): string {
    return this.showToast({
      title,
      description,
      variant: 'success',
      ...options,
    });
  }

  // Error toast
  public error(title: string, description?: string, options?: Partial<AlertOptions>): string {
    return this.showToast({
      title,
      description,
      variant: 'error',
      ...options,
    });
  }

  // Warning toast
  public warning(title: string, description?: string, options?: Partial<AlertOptions>): string {
    return this.showToast({
      title,
      description,
      variant: 'warning',
      ...options,
    });
  }

  // Info toast
  public info(title: string, description?: string, options?: Partial<AlertOptions>): string {
    return this.showToast({
      title,
      description,
      variant: 'info',
      ...options,
    });
  }

  // Blocking dialog for confirmations and critical alerts
  public confirm(options: ConfirmOptions): Promise<boolean> {
    // SSR / non-DOM fallback
    if (typeof document === 'undefined') {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      let settled = false;

      const cleanup = () => {
        try {
          root.unmount();
        } catch {}
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      };

      const handleResolve = (value: boolean) => {
        if (settled) return;
        settled = true;
        resolve(value);
        cleanup();
      };

      const { title, description, confirmText = 'OK', cancelText = 'Cancel', variant } = options;

      root.render(
        React.createElement(EnhancedAlertDialog, {
          title,
          description,
          confirmText,
          cancelText,
          showCancel: true,
          variant: variant || 'default',
          open: true,
          onOpenChange: (open: boolean) => {
            if (!open) {
              handleResolve(false);
            }
          },
          onConfirm: () => handleResolve(true),
          onCancel: () => handleResolve(false),
        })
      );
    });
  }

  // Simple alert dialog (replaces window.alert)
  public alert(title: string, description?: string, variant: AlertType = 'info'): Promise<void> {
    if (typeof document === 'undefined') {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      let settled = false;

      const cleanup = () => {
        try {
          root.unmount();
        } catch {}
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      };

      const handleResolve = () => {
        if (settled) return;
        settled = true;
        resolve();
        cleanup();
      };

      root.render(
        React.createElement(EnhancedAlertDialog, {
          title,
          description,
          variant: variant || 'default',
          confirmText: 'OK',
          showCancel: false,
          open: true,
          onOpenChange: (open: boolean) => {
            if (!open) handleResolve();
          },
          onConfirm: () => handleResolve(),
        })
      );
    });
  }

  // Validation error helper
  public validationError(message: string): string {
    return this.error('Validation Error', message, {
      duration: 4000,
    });
  }

  // API error helper
  public apiError(message: string = 'An error occurred. Please try again.'): string {
    return this.error('Error', message, {
      duration: 6000,
    });
  }

  // Success operation helper
  public operationSuccess(message: string): string {
    return this.success('Success', message, {
      duration: 3000,
    });
  }

  // Feature under construction helper
  public featureUnderConstruction(featureName: string): string {
    return this.info('Feature Coming Soon', `${featureName} is under construction and will be available soon.`, {
      duration: 4000,
    });
  }

  // Export notification helper
  public exportNotification(format: string): string {
    return this.success('Export Started', `Your ${format} export has been initiated. You will be notified when it's ready.`, {
      duration: 5000,
    });
  }

  // File upload helper
  public fileUploadSuccess(fileName: string): string {
    return this.success('File Uploaded', `${fileName} has been uploaded successfully.`, {
      duration: 3000,
    });
  }

  public fileUploadError(fileName?: string): string {
    return this.error('Upload Failed', `Failed to upload ${fileName || 'file'}. Please try again.`, {
      duration: 4000,
    });
  }

  // Work order helpers
  public workOrderCreated(): string {
    return this.success('Work Order Created', 'The work order has been created successfully.', {
      duration: 3000,
    });
  }

  public workOrderUpdated(): string {
    return this.success('Work Order Updated', 'The work order has been updated successfully.', {
      duration: 3000,
    });
  }

  public workOrderError(action: 'create' | 'update' | 'delete'): string {
    return this.error('Operation Failed', `Failed to ${action} work order. Please try again.`, {
      duration: 4000,
    });
  }

  // Comment helpers
  public commentAdded(): string {
    return this.success('Comment Added', 'Your comment has been added successfully.', {
      duration: 2000,
    });
  }

  public commentError(): string {
    return this.error('Comment Failed', 'Failed to add comment. Please try again.', {
      duration: 3000,
    });
  }

  // Private methods for managing alert queue
  private addAlert(id: string, component: React.ReactElement): void {
    this.alertQueue.push({ id, component });
    this.renderAlerts();
  }

  private removeAlert(id: string): void {
    this.alertQueue = this.alertQueue.filter(alert => alert.id !== id);
    this.renderAlerts();
  }

  private renderAlerts(): void {
    // This would typically be handled by a React context or portal
    // For now, we'll rely on the individual components to handle rendering
  }

  // Clear all alerts
  public clearAll(): void {
    this.alertQueue = [];
    this.renderAlerts();
  }
}

// Export singleton instance
export const alertService = AlertService.getInstance();

// Convenience functions for direct use
export const showAlert = (title: string, description?: string, variant?: AlertType) => 
  alertService.alert(title, description, variant);

export const showConfirm = (options: ConfirmOptions) => 
  alertService.confirm(options);

export const showSuccess = (title: string, description?: string) => 
  alertService.success(title, description);

export const showError = (title: string, description?: string) => 
  alertService.error(title, description);

export const showWarning = (title: string, description?: string) => 
  alertService.warning(title, description);

export const showInfo = (title: string, description?: string) => 
  alertService.info(title, description);

// Validation helpers
export const showValidationError = (message: string) => 
  alertService.validationError(message);

export const showApiError = (message?: string) => 
  alertService.apiError(message);

export const showOperationSuccess = (message: string) => 
  alertService.operationSuccess(message);

export const showFeatureUnderConstruction = (featureName: string) => 
  alertService.featureUnderConstruction(featureName);

export const showExportNotification = (format: string) => 
  alertService.exportNotification(format);

export const showFileUploadSuccess = (fileName: string) => 
  alertService.fileUploadSuccess(fileName);

export const showFileUploadError = (fileName?: string) => 
  alertService.fileUploadError(fileName);

export const showWorkOrderCreated = () => 
  alertService.workOrderCreated();

export const showWorkOrderUpdated = () => 
  alertService.workOrderUpdated();

export const showWorkOrderError = (action: 'create' | 'update' | 'delete') => 
  alertService.workOrderError(action);

export const showCommentAdded = () => 
  alertService.commentAdded();

export const showCommentError = () => 
  alertService.commentError();

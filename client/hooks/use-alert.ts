import { useCallback } from 'react';
import { alertService, AlertOptions, ConfirmOptions, AlertType } from '@/lib/alert-service';

export const useAlert = () => {
  // Toast notifications
  const showToast = useCallback((options: AlertOptions) => {
    return alertService.showToast(options);
  }, []);

  const success = useCallback((title: string, description?: string, options?: Partial<AlertOptions>) => {
    return alertService.success(title, description, options);
  }, []);

  const error = useCallback((title: string, description?: string, options?: Partial<AlertOptions>) => {
    return alertService.error(title, description, options);
  }, []);

  const warning = useCallback((title: string, description?: string, options?: Partial<AlertOptions>) => {
    return alertService.warning(title, description, options);
  }, []);

  const info = useCallback((title: string, description?: string, options?: Partial<AlertOptions>) => {
    return alertService.info(title, description, options);
  }, []);

  // Dialog alerts
  const alert = useCallback((title: string, description?: string, variant?: AlertType) => {
    return alertService.alert(title, description, variant);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return alertService.confirm(options);
  }, []);

  // Validation helpers
  const validationError = useCallback((message: string) => {
    return alertService.validationError(message);
  }, []);

  const apiError = useCallback((message?: string) => {
    return alertService.apiError(message);
  }, []);

  const operationSuccess = useCallback((message: string) => {
    return alertService.operationSuccess(message);
  }, []);

  const featureUnderConstruction = useCallback((featureName: string) => {
    return alertService.featureUnderConstruction(featureName);
  }, []);

  const exportNotification = useCallback((format: string) => {
    return alertService.exportNotification(format);
  }, []);

  const fileUploadSuccess = useCallback((fileName: string) => {
    return alertService.fileUploadSuccess(fileName);
  }, []);

  const fileUploadError = useCallback((fileName?: string) => {
    return alertService.fileUploadError(fileName);
  }, []);

  const workOrderCreated = useCallback(() => {
    return alertService.workOrderCreated();
  }, []);

  const workOrderUpdated = useCallback(() => {
    return alertService.workOrderUpdated();
  }, []);

  const workOrderError = useCallback((action: 'create' | 'update' | 'delete') => {
    return alertService.workOrderError(action);
  }, []);

  const commentAdded = useCallback(() => {
    return alertService.commentAdded();
  }, []);

  const commentError = useCallback(() => {
    return alertService.commentError();
  }, []);

  // Clear all alerts
  const clearAll = useCallback(() => {
    alertService.clearAll();
  }, []);

  return {
    // Core methods
    showToast,
    alert,
    confirm,
    
    // Toast variants
    success,
    error,
    warning,
    info,
    
    // Helper methods
    validationError,
    apiError,
    operationSuccess,
    featureUnderConstruction,
    exportNotification,
    fileUploadSuccess,
    fileUploadError,
    workOrderCreated,
    workOrderUpdated,
    workOrderError,
    commentAdded,
    commentError,
    clearAll,
  };
};

export default useAlert;

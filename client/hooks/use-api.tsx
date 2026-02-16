import { useCallback } from 'react';
import { useStatusBar } from './use-status-bar';
import ApiService from '@/lib/api';

export function useApi() {
  const { addLoadingMessage, updateToSuccess, updateToError } = useStatusBar();

  const get = useCallback(async (endpoint: string, loadingMessage: string) => {
    const loadingId = addLoadingMessage(loadingMessage);
    try {
      const result = await ApiService.get(endpoint);
      updateToSuccess(loadingId, 'Data loaded successfully');
      return result;
    } catch (error) {
      const errorMsg = `Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`;
      updateToError(loadingId, errorMsg);
      return null;
    }
  }, [addLoadingMessage, updateToSuccess, updateToError]);

  return {
    get,
    ApiService,
  };
}

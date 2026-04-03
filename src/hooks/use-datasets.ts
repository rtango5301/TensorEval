'use client';

/**
 * Datasets Hooks
 * React hooks for dataset data fetching and mutations
 */

import { useState, useEffect, useCallback } from 'react';
import { getDatasets, getDataset, createDataset, deleteDataset } from '@/lib/api/datasets';
import { ApiError } from '@/lib/api/client';
import { usePolling } from './use-polling';
import type { Dataset, DatasetWithQueries, CreateDatasetRequest } from '@/lib/api/types';

// ============================================
// useDatasets - List all datasets
// ============================================

interface UseDatasetsState {
  datasets: Dataset[];
  isLoading: boolean;
  error: ApiError | null;
}

interface UseDatasets extends UseDatasetsState {
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching the list of datasets
 * GET /api/datasets
 */
export function useDatasets(): UseDatasets {
  const [state, setState] = useState<UseDatasetsState>({
    datasets: [],
    isLoading: true,
    error: null,
  });

  const fetchDatasets = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const datasets = await getDatasets();
      // Filter out inactive (soft-deleted) datasets
      const activeDatasets = datasets.filter((d) => d.status !== 'inactive');
      setState({ datasets: activeDatasets, isLoading: false, error: null });
    } catch (err) {
      const error = err instanceof ApiError ? err : new ApiError('Failed to fetch datasets', 500);
      setState((prev) => ({ ...prev, isLoading: false, error }));
    }
  }, []);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  return {
    ...state,
    refetch: fetchDatasets,
  };
}

// ============================================
// useDataset - Get single dataset by ID
// ============================================

interface UseDatasetState {
  dataset: DatasetWithQueries | null;
  isLoading: boolean;
  error: ApiError | null;
}

interface UseDataset extends UseDatasetState {
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching a single dataset by ID
 * GET /api/datasets/{id}
 */
export function useDataset(id: string): UseDataset {
  const [state, setState] = useState<UseDatasetState>({
    dataset: null,
    isLoading: true,
    error: null,
  });

  const fetchDataset = useCallback(async () => {
    if (!id) return;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const dataset = await getDataset(id);
      setState({ dataset, isLoading: false, error: null });
    } catch (err) {
      const error = err instanceof ApiError ? err : new ApiError('Failed to fetch dataset', 500);
      setState((prev) => ({ ...prev, isLoading: false, error }));
    }
  }, [id]);

  useEffect(() => {
    fetchDataset();
  }, [fetchDataset]);

  return {
    ...state,
    refetch: fetchDataset,
  };
}

// ============================================
// useDatasetWithPolling - Get dataset with auto-polling for in_progress status
// ============================================

interface UseDatasetWithPolling {
  dataset: DatasetWithQueries | null;
  isLoading: boolean;
  error: ApiError | null;
  isPolling: boolean;
  refetch: () => Promise<void>;
  stopPolling: () => void;
}

/**
 * Hook for fetching a dataset with automatic polling while in_progress
 * GET /api/datasets/{id}
 * Polls every 3 seconds while status === 'in_progress'
 */
export function useDatasetWithPolling(id: string, pollingInterval = 3000): UseDatasetWithPolling {
  const fetcher = useCallback(() => getDataset(id), [id]);

  const shouldContinue = useCallback((dataset: DatasetWithQueries) => {
    return dataset.status === 'in_progress';
  }, []);

  const { data, isLoading, error, isPolling, refetch, stopPolling } = usePolling({
    fetcher,
    shouldContinue,
    interval: pollingInterval,
    enabled: !!id,
  });

  return {
    dataset: data,
    isLoading,
    error,
    isPolling,
    refetch,
    stopPolling,
  };
}

// ============================================
// useCreateDataset - Create a new dataset
// ============================================

interface UseCreateDataset {
  createDataset: (data: CreateDatasetRequest) => Promise<Dataset | null>;
  isCreating: boolean;
  error: ApiError | null;
  createdDataset: Dataset | null;
  reset: () => void;
}

/**
 * Hook for creating a new dataset
 * POST /api/datasets
 * Returns 202 Accepted for background processing
 */
export function useCreateDataset(): UseCreateDataset {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [createdDataset, setCreatedDataset] = useState<Dataset | null>(null);

  const handleCreate = useCallback(async (data: CreateDatasetRequest): Promise<Dataset | null> => {
    setIsCreating(true);
    setError(null);
    try {
      const dataset = await createDataset(data);
      setCreatedDataset(dataset);
      setIsCreating(false);
      return dataset;
    } catch (err) {
      const apiError =
        err instanceof ApiError ? err : new ApiError('Failed to create dataset', 500);
      setError(apiError);
      setIsCreating(false);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setIsCreating(false);
    setError(null);
    setCreatedDataset(null);
  }, []);

  return {
    createDataset: handleCreate,
    isCreating,
    error,
    createdDataset,
    reset,
  };
}

// ============================================
// useDeleteDataset - Delete a dataset
// ============================================

interface UseDeleteDataset {
  deleteDataset: (id: string) => Promise<boolean>;
  isDeleting: boolean;
  error: ApiError | null;
}

/**
 * Hook for deleting a dataset
 * DELETE /api/datasets/{id}
 */
export function useDeleteDataset(): UseDeleteDataset {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleDelete = useCallback(async (id: string): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteDataset(id);
      console.warn(
        JSON.stringify({
          type: 'AUDIT',
          action: 'DELETE_DATASET',
          resourceId: id,
          timestamp: new Date().toISOString(),
        })
      );
      setIsDeleting(false);
      return true;
    } catch (err) {
      const apiError =
        err instanceof ApiError ? err : new ApiError('Failed to delete dataset', 500);
      setError(apiError);
      setIsDeleting(false);
      return false;
    }
  }, []);

  return {
    deleteDataset: handleDelete,
    isDeleting,
    error,
  };
}

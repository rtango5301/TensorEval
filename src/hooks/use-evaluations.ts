'use client';

/**
 * Evaluations Hooks
 * React hooks for evaluation data fetching and mutations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getEvaluations,
  getEvaluation,
  createEvaluation,
  deleteEvaluation,
} from '@/lib/api/evaluations';
import { ApiError } from '@/lib/api/client';
import { usePolling } from './use-polling';
import type { Evaluation, EvaluationWithResults, CreateEvaluationRequest } from '@/lib/api/types';

// ============================================
// useEvaluations - List all evaluations
// ============================================

interface UseEvaluationsState {
  evaluations: Evaluation[];
  isLoading: boolean;
  error: ApiError | null;
}

interface UseEvaluations extends UseEvaluationsState {
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching the list of evaluations
 * GET /api/evaluations
 */
export function useEvaluations(): UseEvaluations {
  const [state, setState] = useState<UseEvaluationsState>({
    evaluations: [],
    isLoading: true,
    error: null,
  });

  const fetchEvaluations = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const evaluations = await getEvaluations();
      // Filter out inactive (soft-deleted) evaluations
      const activeEvaluations = evaluations.filter((e) => e.status !== 'inactive');
      setState({ evaluations: activeEvaluations, isLoading: false, error: null });
    } catch (err) {
      const error =
        err instanceof ApiError ? err : new ApiError('Failed to fetch evaluations', 500);
      setState((prev) => ({ ...prev, isLoading: false, error }));
    }
  }, []);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  return {
    ...state,
    refetch: fetchEvaluations,
  };
}

// ============================================
// useEvaluation - Get single evaluation by ID
// ============================================

interface UseEvaluationState {
  evaluation: EvaluationWithResults | null;
  isLoading: boolean;
  error: ApiError | null;
}

interface UseEvaluation extends UseEvaluationState {
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching a single evaluation by ID
 * GET /api/evaluations/{id}
 */
export function useEvaluation(id: string): UseEvaluation {
  const [state, setState] = useState<UseEvaluationState>({
    evaluation: null,
    isLoading: true,
    error: null,
  });

  const fetchEvaluation = useCallback(async () => {
    if (!id) return;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const evaluation = await getEvaluation(id);
      setState({ evaluation, isLoading: false, error: null });
    } catch (err) {
      const error = err instanceof ApiError ? err : new ApiError('Failed to fetch evaluation', 500);
      setState((prev) => ({ ...prev, isLoading: false, error }));
    }
  }, [id]);

  useEffect(() => {
    fetchEvaluation();
  }, [fetchEvaluation]);

  return {
    ...state,
    refetch: fetchEvaluation,
  };
}

// ============================================
// useEvaluationWithPolling - Get evaluation with auto-polling for in_progress status
// ============================================

interface UseEvaluationWithPolling {
  evaluation: EvaluationWithResults | null;
  isLoading: boolean;
  error: ApiError | null;
  isPolling: boolean;
  refetch: () => Promise<void>;
  stopPolling: () => void;
}

/**
 * Hook for fetching an evaluation with automatic polling while in_progress
 * GET /api/evaluations/{id}
 * Polls every 2 seconds while status === 'in_progress'
 */
export function useEvaluationWithPolling(
  id: string,
  pollingInterval = 2000
): UseEvaluationWithPolling {
  const fetcher = useCallback(() => getEvaluation(id), [id]);

  const shouldContinue = useCallback((evaluation: EvaluationWithResults) => {
    return evaluation.status === 'in_progress';
  }, []);

  const { data, isLoading, error, isPolling, refetch, stopPolling } = usePolling({
    fetcher,
    shouldContinue,
    interval: pollingInterval,
    enabled: !!id,
  });

  return {
    evaluation: data,
    isLoading,
    error,
    isPolling,
    refetch,
    stopPolling,
  };
}

// ============================================
// useCreateEvaluation - Create a new evaluation
// ============================================

interface UseCreateEvaluation {
  createEvaluation: (data: CreateEvaluationRequest) => Promise<Evaluation | null>;
  isCreating: boolean;
  error: ApiError | null;
  createdEvaluation: Evaluation | null;
  reset: () => void;
}

/**
 * Hook for creating a new evaluation
 * POST /api/evaluations
 * Returns 202 Accepted for background processing
 */
export function useCreateEvaluation(): UseCreateEvaluation {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [createdEvaluation, setCreatedEvaluation] = useState<Evaluation | null>(null);

  const handleCreate = useCallback(
    async (data: CreateEvaluationRequest): Promise<Evaluation | null> => {
      setIsCreating(true);
      setError(null);
      try {
        const evaluation = await createEvaluation(data);
        setCreatedEvaluation(evaluation);
        setIsCreating(false);
        return evaluation;
      } catch (err) {
        const apiError =
          err instanceof ApiError ? err : new ApiError('Failed to create evaluation', 500);
        setError(apiError);
        setIsCreating(false);
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsCreating(false);
    setError(null);
    setCreatedEvaluation(null);
  }, []);

  return {
    createEvaluation: handleCreate,
    isCreating,
    error,
    createdEvaluation,
    reset,
  };
}

// ============================================
// useDeleteEvaluation - Delete an evaluation
// ============================================

interface UseDeleteEvaluation {
  deleteEvaluation: (id: string) => Promise<boolean>;
  isDeleting: boolean;
  error: ApiError | null;
}

/**
 * Hook for deleting an evaluation
 * DELETE /api/evaluations/{id}
 */
export function useDeleteEvaluation(): UseDeleteEvaluation {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleDelete = useCallback(async (id: string): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteEvaluation(id);
      console.warn(
        JSON.stringify({
          type: 'AUDIT',
          action: 'DELETE_EVALUATION',
          resourceId: id,
          timestamp: new Date().toISOString(),
        })
      );
      setIsDeleting(false);
      return true;
    } catch (err) {
      const apiError =
        err instanceof ApiError ? err : new ApiError('Failed to delete evaluation', 500);
      setError(apiError);
      setIsDeleting(false);
      return false;
    }
  }, []);

  return {
    deleteEvaluation: handleDelete,
    isDeleting,
    error,
  };
}

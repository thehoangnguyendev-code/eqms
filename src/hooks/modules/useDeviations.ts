/**
 * useDeviations Hook
 * Specific hook for Deviation & Non-Conformance module
 */

import { useState, useEffect, useCallback } from 'react';
import { deviationApi, GetDeviationsParams } from '@/services/api/deviations';
import { Deviation } from '@/features/deviations/types';
import { PaginatedResponse } from '@/types';

export function useDeviations(initialParams: GetDeviationsParams = { page: 1, limit: 10 }) {
  const [data, setData] = useState<PaginatedResponse<Deviation> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<GetDeviationsParams>(initialParams);

  const fetchDeviations = useCallback(async (currentParams: GetDeviationsParams) => {
    setLoading(true);
    try {
      const response = await deviationApi.getDeviations(currentParams);
      setData(response);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on mount and params change
  useEffect(() => {
    fetchDeviations(params);
  }, [params, fetchDeviations]);

  const updateFilters = (newFilters: Partial<GetDeviationsParams>) => {
    setParams((prev) => ({ ...prev, ...newFilters, page: 1 })); // Reset to page 1 on filter change
  };

  const changePage = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const refresh = () => fetchDeviations(params);

  return {
    data: data?.data || [],
    pagination: data?.pagination,
    loading,
    error,
    params,
    updateFilters,
    changePage,
    refresh,
  };
}

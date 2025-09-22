import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        // Retry up to 2 times for other errors (reduced)
        return failureCount < 2
      },
      staleTime: 3 * 60 * 1000, // 3 minutes - reduced for better responsiveness
      gcTime: 8 * 60 * 1000, // 8 minutes garbage collection
      refetchOnWindowFocus: false, // Prevent focus-based refetches
      refetchOnReconnect: 'always', // Refetch on reconnect
      refetchOnMount: true, // Refetch on mount for consistency
      networkMode: 'offlineFirst', // Better offline handling
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
})

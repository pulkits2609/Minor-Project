import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { globalAuthToken, globalUserRole } from '@/constants/auth';

export function useProtectedRoute(allowedRoles?: string[]) {
  const router = useRouter();

  useEffect(() => {
    // 1. Check if logged in
    if (!globalAuthToken || !globalUserRole) {
      router.replace('/login');
      return;
    }

    // 2. Check if role is allowed
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(globalUserRole)) {
        // Redirect to their default dashboard if they don't have access
        router.replace({ pathname: '/dashboard/[role]', params: { role: globalUserRole } });
      }
    }
  }, [allowedRoles, router]);
}

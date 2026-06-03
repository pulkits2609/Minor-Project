import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { globalAuthToken, globalUserRole } from '@/constants/auth';

export function useProtectedRoute(allowedRoles?: string[]) {
  const router = useRouter();
  const allowedRolesRef = useRef(allowedRoles);
  allowedRolesRef.current = allowedRoles;

  useEffect(() => {
    if (!globalAuthToken || !globalUserRole) {
      router.replace('/login');
      return;
    }

    const roles = allowedRolesRef.current;
    if (roles && roles.length > 0) {
      if (!roles.includes(globalUserRole)) {
        router.replace({ pathname: '/dashboard/[role]', params: { role: globalUserRole } });
      }
    }
  }, [router]);
}

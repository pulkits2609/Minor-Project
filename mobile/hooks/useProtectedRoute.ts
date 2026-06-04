import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { globalAuthToken, globalUserRole, loadAuthState } from '@/constants/auth';

export function useProtectedRoute(allowedRoles?: string[]) {
  const router = useRouter();
  const allowedRolesRef = useRef(allowedRoles);
  allowedRolesRef.current = allowedRoles;

  useEffect(() => {
    let cancelled = false;

    async function verifyAccess() {
      let token = globalAuthToken;
      let role = globalUserRole;

      if (!token || !role) {
        const authState = await loadAuthState();
        token = authState.token;
        role = authState.role;
      }

      if (cancelled) {
        return;
      }

      if (!token || !role) {
        router.replace('/login');
        return;
      }

      const roles = allowedRolesRef.current;
      if (roles && roles.length > 0) {
        if (!roles.includes(role)) {
          router.replace({ pathname: '/dashboard/[role]', params: { role } });
        }
      }
    }

    verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [router]);
}

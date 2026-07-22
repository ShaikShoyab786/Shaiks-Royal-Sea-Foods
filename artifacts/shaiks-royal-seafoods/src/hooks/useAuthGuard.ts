import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '../store/useAuthStore';
import { UserRole } from '@workspace/api-client-react';

export function useRequireAuth(allowedRoles?: UserRole[]) {
  const { token, user } = useAuthStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!token || !user) {
      if (allowedRoles?.includes(UserRole.admin)) {
        setLocation('/admin/login');
      } else if (allowedRoles?.includes(UserRole.executive)) {
        setLocation('/executive/login');
      } else {
        setLocation('/login');
      }
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      if (user.role === UserRole.admin) setLocation('/admin');
      else if (user.role === UserRole.executive) setLocation('/executive');
      else setLocation('/');
    }
  }, [token, user, allowedRoles, setLocation]);

  return { token, user };
}

export function useRequireNoAuth(redirectPath: string = '/') {
  const { token, user } = useAuthStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (token && user) {
      if (user.role === UserRole.admin) setLocation('/admin');
      else if (user.role === UserRole.executive) setLocation('/executive');
      else setLocation(redirectPath);
    }
  }, [token, user, setLocation, redirectPath]);
}

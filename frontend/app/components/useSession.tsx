// app/hooks/useSession.ts

import { useAuth } from '../authentication/context/AuthContext';

export const useSession = () => {
  const { user, loading } = useAuth();
  return { user, loading };
};


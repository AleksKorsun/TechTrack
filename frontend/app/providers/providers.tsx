// app/providers/providers.tsx

'use client';

import { Provider } from 'react-redux';
import store from '@store/store';
import { AuthProvider } from '../authentication/context/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Provider store={store}>{children}</Provider>
    </AuthProvider>
  );
}


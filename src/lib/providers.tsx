"use client";

import { QueryClientProviderWrapper } from "@/lib/providers/query-client-provider";
import { AuthProvider } from "@/lib/providers/auth-provider";

/**
 * Root providers component that wraps all application-level providers
 * Add additional providers here by nesting them in the component tree
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProviderWrapper>
      <AuthProvider>
        {/* Add additional providers here as needed */}
        {children}
      </AuthProvider>
    </QueryClientProviderWrapper>
  );
}


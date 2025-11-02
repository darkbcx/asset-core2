"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { getTokenCookie, getActiveCompanyCookie, setActiveCompanyCookie } from "@/lib/cookies";
import type { User as ValidatorUser, UserCompany } from "@/lib/validators";

// UserCompany with company details (from API)
interface UserCompanyWithDetails extends Omit<UserCompany, 'id' | 'user_id' | 'joined_at' | 'created_at' | 'updated_at'> {
  company_id: string;
  company_name?: string;
  company_slug?: string;
}

// Exported types for components (use validator types where possible)
export type User = ValidatorUser;
export type Company = UserCompanyWithDetails;

// API user response type (User without password_hash)
type ApiUserResponse = Omit<User, 'password_hash'>;

interface AuthContextType {
  user: User | null;
  companies: Company[];
  activeCompany: Company | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setActiveCompany: (companyId: string) => void;
  refreshUser: () => Promise<void>;
}

const AuthContextInstance = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to convert API user response (without password_hash) to full User type
// Adds password_hash as empty string since it's not needed in context
function mapApiUserToUser(apiUser: ApiUserResponse): User {
  return {
    ...apiUser,
    password_hash: "", // Not needed in context, API omits this field for security
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompanyState] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      const token = getTokenCookie();
      
      if (!token) {
        setUser(null);
        setCompanies([]);
        setActiveCompanyState(null);
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setUser(null);
        setCompanies([]);
        setActiveCompanyState(null);
        setIsLoading(false);
        return;
      }

      const result = await response.json();

      if (result.success) {
        // Map API response to validator User type
        const mappedUser = mapApiUserToUser(result.user);
        setUser(mappedUser);
        setCompanies((result.companies || []) as Company[]);

        // Set active company
        const activeCompanyId = getActiveCompanyCookie();
        
        if (activeCompanyId && result.companies) {
          const foundCompany = result.companies.find(
            (company: Company) => company.company_id === activeCompanyId && company.is_active
          );
          
          if (foundCompany) {
            setActiveCompanyState(foundCompany);
          } else if (result.companies.length > 0) {
            // If active company not found or inactive, use primary or first company
            const primaryCompany = result.companies.find(
              (company: Company) => company.is_primary && company.is_active
            );
            const firstActiveCompany = result.companies.find(
              (company: Company) => company.is_active
            );
            const companyToUse = primaryCompany || firstActiveCompany;
            
            if (companyToUse) {
              setActiveCompanyCookie(companyToUse.company_id);
              setActiveCompanyState(companyToUse);
            }
          }
        } else if (result.companies && result.companies.length > 0) {
          // No active company cookie, use primary or first company
          const primaryCompany = result.companies.find(
            (company: Company) => company.is_primary && company.is_active
          );
          const firstActiveCompany = result.companies.find(
            (company: Company) => company.is_active
          );
          const companyToUse = primaryCompany || firstActiveCompany;
          
          if (companyToUse) {
            setActiveCompanyCookie(companyToUse.company_id);
            setActiveCompanyState(companyToUse);
          }
        } else {
          setActiveCompanyState(null);
        }
      } else {
        setUser(null);
        setCompanies([]);
        setActiveCompanyState(null);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setUser(null);
      setCompanies([]);
      setActiveCompanyState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const setActiveCompany = useCallback((companyId: string) => {
    const company = companies.find(
      (c) => c.company_id === companyId && c.is_active
    );
    
    if (company) {
      setActiveCompanyCookie(companyId);
      setActiveCompanyState(company);
    }
  }, [companies]);

  const refreshUser = useCallback(async () => {
    await fetchUserData();
  }, [fetchUserData]);

  const value: AuthContextType = {
    user,
    companies,
    activeCompany,
    isLoading,
    isAuthenticated: !!user,
    setActiveCompany,
    refreshUser,
  };

  return <AuthContextInstance.Provider value={value}>{children}</AuthContextInstance.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContextInstance);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}


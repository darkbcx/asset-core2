"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Check, Loader2, LogOut } from "lucide-react";
import { setActiveCompanyCookie, getTokenCookie } from "@/lib/cookies";
import { handleLogout } from "@/lib/auth";
import { useAuth } from "@/lib/providers/auth-provider";

export default function SelectCompanyPage() {
  const router = useRouter();
  const { companies: allCompanies, activeCompany, isLoading: authLoading, isAuthenticated, setActiveCompany: setActiveCompanyInContext } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitializedSelection = useRef(false);

  // Filter to only active companies
  const companies = allCompanies.filter((company) => company.is_active);
  const activeCompanyId = activeCompany?.company_id || null;
  const isLoading = authLoading;

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // Handle error states
    if (!authLoading && isAuthenticated) {
      if (!allCompanies || allCompanies.length === 0) {
        setError("No companies found. Please contact your administrator.");
        return;
      }

      if (companies.length === 0) {
        setError("No active companies found. Please contact your administrator.");
        return;
      }

      // If only one company, auto-select it
      if (companies.length === 1) {
        const companyId = companies[0].company_id;
        setActiveCompanyCookie(companyId);
        setActiveCompanyInContext(companyId);
        router.push("/dashboard");
        return;
      }

      // Set active company as selected by default only once on initial load
      if (!hasInitializedSelection.current && activeCompanyId) {
        setSelectedCompanyId(activeCompanyId);
        hasInitializedSelection.current = true;
      }
    }
  }, [authLoading, isAuthenticated, allCompanies, companies, activeCompanyId, router, setActiveCompanyInContext]);

  const handleSelectCompany = async (companyId: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Get token from cookies for API authentication
      const token = getTokenCookie();
      
      if (!token) {
        router.push("/login");
        return;
      }

      // Call API to validate company access
      const response = await fetch("/api/auth/set-active-company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companyId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to set active company");
      }

      // Set cookie and update context, then redirect
      setActiveCompanyCookie(companyId);
      setActiveCompanyInContext(companyId);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select company");
      setIsSubmitting(false);
    }
  };

  const onLogout = () => {
    handleLogout(router);
  };

  const formatRole = (role: string): string => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (error && companies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onLogout} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Select Company</h1>
          <p className="text-muted-foreground">
            Choose which company you want to access
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {companies.map((company) => {
            const isActive = activeCompanyId === company.company_id;
            const isSelected = selectedCompanyId === company.company_id;
            
            return (
            <Card
              key={company.company_id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isActive
                  ? "ring-2 ring-primary bg-primary/5 border-primary"
                  : isSelected
                  ? "ring-2 ring-primary"
                  : ""
              }`}
              onClick={() => setSelectedCompanyId(company.company_id)}
            >
              <CardHeader className="grow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {company.company_name}
                      </CardTitle>
                      {company.company_slug && (
                        <CardDescription className="text-xs">
                          {company.company_slug}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  {company.is_primary && (
                    <Badge variant="default">Primary</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Role:</span>
                    <Badge variant="secondary">{formatRole(company.role)}</Badge>
                  </div>
                  {isActive && (
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <Check className="h-4 w-4" />
                      <span className="text-sm">Currently Active</span>
                    </div>
                  )}
                  {!isActive && isSelected && (
                    <div className="flex items-center gap-2 text-primary">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  )}
                  {!isActive && !isSelected && (
                    <div className="flex items-center gap-2 text-primary">
                      <span className="text-sm font-medium">&nbsp;</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onLogout}
            disabled={isSubmitting}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              if (selectedCompanyId) {
                handleSelectCompany(selectedCompanyId);
              }
            }}
            disabled={!selectedCompanyId || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Check, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { setActiveCompanyCookie, getTokenCookie } from "@/lib/cookies";

interface Company {
  company_id: string;
  company_name: string;
  company_slug?: string;
  role: string;
  is_primary: boolean;
  is_active: boolean;
}

export default function SelectCompanyPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user companies
    const fetchCompanies = async () => {
      try {
        // Get token from cookies
        const token = getTokenCookie();
        
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch companies");
        }

        const result = await response.json();

        if (!result.success || !result.companies || result.companies.length === 0) {
          setError("No companies found. Please contact your administrator.");
          setIsLoading(false);
          return;
        }

        // Filter to only active companies
        const activeCompanies = result.companies.filter(
          (company: Company) => company.is_active
        );

        if (activeCompanies.length === 0) {
          setError("No active companies found. Please contact your administrator.");
          setIsLoading(false);
          return;
        }

        // If only one company, auto-select it
        if (activeCompanies.length === 1) {
          const companyId = activeCompanies[0].company_id;
          setActiveCompanyCookie(companyId);
          router.push("/dashboard");
          return;
        }

        setCompanies(activeCompanies);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load companies");
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [router]);

  const handleSelectCompany = async (companyId: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Get token from cookies
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

      // Set cookie and redirect
      setActiveCompanyCookie(companyId);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select company");
      setIsSubmitting(false);
    }
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
            <Button asChild className="w-full">
              <Link href="/login">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
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
          {companies.map((company) => (
            <Card
              key={company.company_id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCompanyId === company.company_id
                  ? "ring-2 ring-primary"
                  : ""
              }`}
              onClick={() => setSelectedCompanyId(company.company_id)}
            >
              <CardHeader>
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
                  {selectedCompanyId === company.company_id && (
                    <div className="flex items-center gap-2 text-primary">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            asChild
            disabled={isSubmitting}
          >
            <Link href="/login">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
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


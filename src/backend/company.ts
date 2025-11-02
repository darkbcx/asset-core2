/**
 * Company Repository
 *
 * Backend business logic for company/tenant management operations.
 * Handles CRUD operations for companies and tenant management.
 *
 * Security:
 * - All queries use parameterized statements for SQL injection prevention
 * - Company data isolation enforcement
 * - Slug uniqueness validation
 */

import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import {
  createCompanySchema,
  updateCompanySchema,
} from "@/lib/validators/company";
import type {
  Company,
  CreateCompany,
  UpdateCompany,
} from "@/lib/validators/company";
import type { BackendResponse } from "@/backend/types";
import type { PaginatedResponse } from "@/lib/validators";

/**
 * Create a new company/tenant
 *
 * @param companyData - Company creation data
 * @returns Created company
 */
export async function createCompany(
  companyData: CreateCompany
): Promise<BackendResponse<Company>> {
  try {
    // Validate input
    const validatedData = createCompanySchema.parse(companyData);

    // Check if slug already exists
    const slugExists = await checkSlugExists(validatedData.slug);
    if (slugExists) {
      return {
        success: false,
        error: "Company slug already exists",
      };
    }

    const companyId = uuidv4();
    const now = new Date();

    const company: Company = {
      id: companyId,
      name: validatedData.name,
      slug: validatedData.slug,
      domain: validatedData.domain || null,
      settings: validatedData.settings || {},
      subscription_plan: validatedData.subscription_plan || "basic",
      is_active: validatedData.is_active ?? true,
      created_at: now,
      updated_at: now,
    };

    const query = `
      INSERT INTO companies (
        id, name, slug, domain, settings, subscription_plan,
        is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      company.id,
      company.name,
      company.slug,
      company.domain,
      JSON.stringify(company.settings),
      company.subscription_plan,
      company.is_active,
      company.created_at,
      company.updated_at,
    ];

    await db.execute(query, params);

    return {
      success: true,
      result: company,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create company",
    };
  }
}

/**
 * Get company by ID
 *
 * @param companyId - Company ID
 * @returns Company or null if not found
 */
export async function getCompanyById(
  companyId: string
): Promise<BackendResponse<Company>> {
  try {
    const query = `
      SELECT * FROM companies WHERE id = ?
    `;

    const company = await db.queryOne<Company>(query, [companyId]);

    if (!company) {
      return {
        success: false,
        error: "Company not found",
      };
    }

    return {
      success: true,
      result: company,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get company",
    };
  }
}

/**
 * Get company by slug
 *
 * @param slug - Company slug
 * @returns Company or null if not found
 */
export async function getCompanyBySlug(
  slug: string
): Promise<BackendResponse<Company>> {
  try {
    const query = `
      SELECT * FROM companies WHERE slug = ?
    `;

    const company = await db.queryOne<Company>(query, [slug]);

    if (!company) {
      return {
        success: false,
        error: "Company not found",
      };
    }

    return {
      success: true,
      result: company,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get company by slug",
    };
  }
}

/**
 * Get all companies
 *
 * @param filters - Optional filters
 * @returns Array of companies
 */
export async function getAllCompanies(filters?: {
  isActive?: boolean;
  subscriptionPlan?: string;
}): Promise<Company[]> {
  let query = "SELECT * FROM companies WHERE 1=1";
  const params: unknown[] = [];

  if (filters?.isActive !== undefined) {
    query += " AND is_active = ?";
    params.push(filters.isActive);
  }

  if (filters?.subscriptionPlan) {
    query += " AND subscription_plan = ?";
    params.push(filters.subscriptionPlan);
  }

  query += " ORDER BY created_at DESC";

  const [rows] = await db.execute<Company>(query, params);
  return rows;
}

/**
 * Get companies with pagination
 *
 * @param pagination - Pagination parameters
 * @param filters - Optional filters
 * @returns Paginated companies
 */
export async function getCompaniesWithPagination(
  pagination: {
    offset: number;
    limit: number;
  },
  filters?: {
    isActive?: boolean;
    subscriptionPlan?: string;
    search?: string;
  }
): Promise<BackendResponse<PaginatedResponse<Company>>> {
  try {
    const { offset, limit } = pagination;

    // Build WHERE clause
    let whereClause = "WHERE 1=1";
    const params: unknown[] = [];

    if (filters?.isActive !== undefined) {
      whereClause += " AND is_active = ?";
      params.push(filters.isActive);
    }

    if (filters?.subscriptionPlan) {
      whereClause += " AND subscription_plan = ?";
      params.push(filters.subscriptionPlan);
    }

    if (filters?.search) {
      whereClause += " AND (name LIKE ? OR slug LIKE ?)";
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM companies ${whereClause}`;
    const [countRows] = await db.execute<{ total: number }>(
      countQuery,
      params
    );
    const total = countRows[0]?.total || 0;

    // Get paginated companies
    const dataQuery = `
      SELECT * FROM companies ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const dataParams = [...params, limit, offset];
    const [rows] = await db.execute<Company>(dataQuery, dataParams);

    return {
      success: true,
      result: {
        data: rows,
        pagination: {
          total,
          offset,
          limit,
          has_more: offset + limit < total,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get companies with pagination",
    };
  }
}

/**
 * Update company
 *
 * @param companyId - Company ID
 * @param companyData - Company update data
 * @returns Updated company
 */
export async function updateCompany(
  companyId: string,
  companyData: UpdateCompany
): Promise<BackendResponse<Company>> {
  try {
    // Validate input
    const validatedData = updateCompanySchema.parse(companyData);

    // Check if company exists
    const existingCompanyResult = await getCompanyById(companyId);

    if (!existingCompanyResult.success) {
      return {
        success: false,
        error: existingCompanyResult.error || "Company not found",
      };
    }

    // Check slug uniqueness if slug is being updated
    if (validatedData.slug) {
      const slugExists = await checkSlugExists(validatedData.slug, companyId);
      if (slugExists) {
        return {
          success: false,
          error: "Company slug already exists",
        };
      }
    }

    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const params: unknown[] = [];

    if (validatedData.name !== undefined) {
      updates.push("name = ?");
      params.push(validatedData.name);
    }

    if (validatedData.slug !== undefined) {
      updates.push("slug = ?");
      params.push(validatedData.slug);
    }

    if (validatedData.domain !== undefined) {
      updates.push("domain = ?");
      params.push(validatedData.domain || null);
    }

    if (validatedData.settings !== undefined) {
      updates.push("settings = ?");
      params.push(JSON.stringify(validatedData.settings));
    }

    if (validatedData.subscription_plan !== undefined) {
      updates.push("subscription_plan = ?");
      params.push(validatedData.subscription_plan);
    }

    if (validatedData.is_active !== undefined) {
      updates.push("is_active = ?");
      params.push(validatedData.is_active);
    }

    // Always update updated_at
    updates.push("updated_at = ?");
    params.push(new Date());

    // Add companyId to params for WHERE clause
    params.push(companyId);

    const query = `
      UPDATE companies
      SET ${updates.join(", ")}
      WHERE id = ?
    `;

    await db.execute(query, params);

    // Fetch and return updated company
    const updatedCompanyResult = await getCompanyById(companyId);

    if (!updatedCompanyResult.success) {
      return {
        success: false,
        error: updatedCompanyResult.error || "Failed to retrieve updated company",
      };
    }

    return {
      success: true,
      result: updatedCompanyResult.result!,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update company",
    };
  }
}

/**
 * Delete company (soft delete by setting is_active = false)
 *
 * @param companyId - Company ID
 * @returns True if successful
 */
export async function deleteCompany(
  companyId: string
): Promise<BackendResponse<boolean>> {
  try {
    const companyResult = await getCompanyById(companyId);

    if (!companyResult.success) {
      return {
        success: false,
        error: companyResult.error || "Company not found",
      };
    }

    const query = `
      UPDATE companies
      SET is_active = false, updated_at = ?
      WHERE id = ?
    `;

    await db.execute(query, [new Date(), companyId]);

    return {
      success: true,
      result: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete company",
    };
  }
}

/**
 * Check if slug exists
 *
 * @param slug - Slug to check
 * @param excludeCompanyId - Optional company ID to exclude from check
 * @returns True if slug exists
 */
export async function checkSlugExists(
  slug: string,
  excludeCompanyId?: string
): Promise<boolean> {
  let query = "SELECT id FROM companies WHERE slug = ?";
  const params: unknown[] = [slug];

  if (excludeCompanyId) {
    query += " AND id != ?";
    params.push(excludeCompanyId);
  }

  const company = await db.queryOne<Company>(query, params);
  return company !== null;
}

/**
 * Get active companies count
 *
 * @returns Number of active companies
 */
export async function getActiveCompaniesCount(): Promise<number> {
  const query = `
    SELECT COUNT(*) as count
    FROM companies
    WHERE is_active = true
  `;

  const [rows] = await db.execute<{ count: number }>(query);
  return rows[0]?.count || 0;
}

/**
 * Get companies with user count
 *
 * @returns Array of companies with user counts
 */
export async function getCompaniesWithUserCount(): Promise<
  Array<Company & { user_count: number }>
> {
  const query = `
    SELECT 
      c.*,
      COUNT(uc.id) as user_count
    FROM companies c
    LEFT JOIN user_companies uc ON c.id = uc.company_id AND uc.is_active = true
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `;

  const [rows] = await db.execute(query);
  return rows as Array<Company & { user_count: number }>;
}


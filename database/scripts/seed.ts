#!/usr/bin/env tsx

/**
 * Database Seed Script
 *
 * Creates sample data for development and testing.
 * DO NOT run this in production!
 *
 * Usage:
 *   yarn seed
 */

import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

/**
 * Creates the database if it doesn't exist
 */
async function createDatabaseIfNotExists(
  connection: mysql.Connection,
  databaseName: string
): Promise<void> {
  await connection.execute(
    `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  console.log(`✓ Database '${databaseName}' ready`);
}

/**
 * Main seed runner
 */
async function seed(): Promise<void> {
  const dbName = process.env.DB_NAME || "assetcore_dev";

  // First, connect without database to create it if needed
  const adminConnection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  try {
    console.log("🌱 Starting database seeding...\n");

    // Create database if it doesn't exist
    await createDatabaseIfNotExists(adminConnection, dbName);
    await adminConnection.end();

    // Now connect to the specific database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: dbName,
      multipleStatements: true,
    });

    try {
      const passwordHash = await bcrypt.hash("Password123!", 10);

      // ============================================
      // Define seed data as arrays of objects
      // ============================================
      
      interface User {
        id: string;
        userType: string;
        systemRole: string | null;
        email: string;
        firstName: string;
        lastName: string;
        passwordHash: string;
      }

      const users: User[] = [
        {
          id: uuidv4(),
          userType: "system_admin",
          systemRole: "super_admin",
          email: "admin@assetcore.com",
          firstName: "System",
          lastName: "Administrator",
          passwordHash,
        },
        {
          id: uuidv4(),
          userType: "tenant",
          systemRole: null,
          email: "john.doe@acme.com",
          firstName: "John",
          lastName: "Doe",
          passwordHash,
        },
        {
          id: uuidv4(),
          userType: "tenant",
          systemRole: null,
          email: "jane.smith@acme.com",
          firstName: "Jane",
          lastName: "Smith",
          passwordHash,
        },
        {
          id: uuidv4(),
          userType: "tenant",
          systemRole: null,
          email: "mike.johnson@acme.com",
          firstName: "Mike",
          lastName: "Johnson",
          passwordHash,
        },
        {
          id: uuidv4(),
          userType: "tenant",
          systemRole: null,
          email: "sarah.lee@globallogistics.com",
          firstName: "Sarah",
          lastName: "Lee",
          passwordHash,
        },
      ];

      interface Company {
        id: string;
        name: string;
        slug: string;
        settings: string;
        subscriptionPlan: string;
      }

      const companies: Company[] = [
        {
          id: uuidv4(),
          name: "Acme Aviation Corporation",
          slug: "acme-aviation",
          settings: '{"timezone": "UTC"}',
          subscriptionPlan: "professional",
        },
        {
          id: uuidv4(),
          name: "Global Logistics Ltd",
          slug: "global-logistics",
          settings: '{"timezone": "America/New_York"}',
          subscriptionPlan: "enterprise",
        },
      ];

      interface UserCompany {
        id: string;
        userId: string;
        companyId: string;
        role: string;
        isPrimary: boolean;
      }

      const userCompanies: UserCompany[] = [
        {
          id: uuidv4(),
          userId: users[1].id, // John Doe
          companyId: companies[0].id, // Acme
          role: "company_admin",
          isPrimary: true,
        },
        {
          id: uuidv4(),
          userId: users[2].id, // Jane Smith
          companyId: companies[0].id, // Acme
          role: "asset_manager",
          isPrimary: false,
        },
        {
          id: uuidv4(),
          userId: users[3].id, // Mike Johnson
          companyId: companies[0].id, // Acme
          role: "maintenance_technician",
          isPrimary: false,
        },
        {
          id: uuidv4(),
          userId: users[4].id, // Sarah Lee
          companyId: companies[1].id, // Global Logistics
          role: "company_admin",
          isPrimary: true,
        },
      ];

      interface Location {
        id: string;
        companyId: string;
        parentId: string | null;
        name: string;
        type: string;
        address: string | null;
      }

      const locations: Location[] = [
        {
          id: uuidv4(),
          companyId: companies[0].id, // Acme
          parentId: null,
          name: "Main Hangar",
          type: "site",
          address: "123 Airport Blvd, Los Angeles, CA",
        },
        {
          id: uuidv4(),
          companyId: companies[0].id, // Acme
          parentId: null, // Will be set after first location created
          name: "Hangar A",
          type: "building",
          address: null,
        },
        {
          id: uuidv4(),
          companyId: companies[0].id, // Acme
          parentId: null, // Will be set after second location created
          name: "Maintenance Bay 1",
          type: "room",
          address: null,
        },
      ];

      // Set parent relationships after creating IDs
      locations[1].parentId = locations[0].id;
      locations[2].parentId = locations[1].id;

      interface Asset {
        id: string;
        companyId: string;
        assetCode: string;
        name: string;
        type: string;
        model: string;
        serialNumber: string;
        status: string;
        locationId: string;
        purchaseDate: string;
        purchaseCost: number;
      }

      const assets: Asset[] = [
        {
          id: uuidv4(),
          companyId: companies[0].id, // Acme
          assetCode: "ACME-A001",
          name: "Boeing 737-800",
          type: "aircraft",
          model: "Boeing 737-800",
          serialNumber: "N737AC",
          status: "operational",
          locationId: locations[2].id, // Maintenance Bay 1
          purchaseDate: "2020-01-15",
          purchaseCost: 85000000.0,
        },
        {
          id: uuidv4(),
          companyId: companies[0].id, // Acme
          assetCode: "ACME-V001",
          name: "Ground Support Vehicle",
          type: "vehicle",
          model: "Ford F-750",
          serialNumber: "GSV-12345",
          status: "operational",
          locationId: locations[1].id, // Hangar A
          purchaseDate: "2021-03-20",
          purchaseCost: 150000.0,
        },
      ];

      interface Component {
        id: string;
        assetId: string;
        componentCode: string;
        name: string;
        type: string;
        serialNumber: string;
        partNumber: string | null;
        manufacturer: string;
        position: string;
        status: string;
        purchaseCost: number;
      }

      const components: Component[] = [
        {
          id: uuidv4(),
          assetId: assets[0].id, // Aircraft
          componentCode: "ENG-001",
          name: "CFM56-7B Engine",
          type: "engine",
          serialNumber: "ENG-2020-001",
          partNumber: "CFM56-7B24",
          manufacturer: "CFM International",
          position: "left",
          status: "installed",
          purchaseCost: 12000000.0,
        },
        {
          id: uuidv4(),
          assetId: assets[0].id, // Aircraft
          componentCode: "ENG-002",
          name: "CFM56-7B Engine",
          type: "engine",
          serialNumber: "ENG-2020-002",
          partNumber: "CFM56-7B24",
          manufacturer: "CFM International",
          position: "right",
          status: "installed",
          purchaseCost: 12000000.0,
        },
        {
          id: uuidv4(),
          assetId: assets[1].id, // Vehicle
          componentCode: "TIRE-001",
          name: "Tire Set",
          type: "tire",
          serialNumber: "TIRE-12345",
          partNumber: null,
          manufacturer: "Michelin",
          position: "front_left",
          status: "installed",
          purchaseCost: 5000.0,
        },
      ];

      interface MaintenanceRecord {
        id: string;
        componentId: string;
        assignedTechnicianId: string;
        title: string;
        description: string;
        maintenanceType: string;
        priority: string;
        status: string;
        scheduledDate: string | null;
        estimatedDuration: number;
        notes: string;
      }

      const maintenanceRecords: MaintenanceRecord[] = [
        {
          id: uuidv4(),
          componentId: components[0].id, // Left engine
          assignedTechnicianId: users[3].id, // Mike Johnson
          title: "Routine Engine Inspection",
          description: "Quarterly engine inspection and oil change",
          maintenanceType: "scheduled",
          priority: "medium",
          status: "scheduled",
          scheduledDate: "DATE_ADD(NOW(), INTERVAL 7 DAY)",
          estimatedDuration: 180,
          notes: "Standard quarterly maintenance per manufacturer recommendations",
        },
        {
          id: uuidv4(),
          componentId: components[1].id, // Right engine
          assignedTechnicianId: users[3].id, // Mike Johnson
          title: "Engine Repair",
          description: "Unusual vibration detected during pre-flight checks",
          maintenanceType: "on_demand",
          priority: "high",
          status: "in_progress",
          scheduledDate: null,
          estimatedDuration: 240,
          notes: "Issue detected during routine pre-flight inspection",
        },
      ];

      // ============================================
      // Insert data into database
      // ============================================

      console.log("👤 Creating users...");
      for (const user of users) {
        await connection.execute(
          `INSERT INTO users (id, user_type, system_role, email, first_name, last_name, password_hash, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
          [
            user.id,
            user.userType,
            user.systemRole,
            user.email,
            user.firstName,
            user.lastName,
            user.passwordHash,
          ]
        );
      }
      console.log(`✅ Created ${users.length} users`);

      console.log("🏢 Creating companies...");
      for (const company of companies) {
        await connection.execute(
          `INSERT INTO companies (id, name, slug, settings, subscription_plan, is_active) VALUES (?, ?, ?, ?, ?, TRUE)`,
          [company.id, company.name, company.slug, company.settings, company.subscriptionPlan]
        );
      }
      console.log(`✅ Created ${companies.length} companies`);

      console.log("🔐 Assigning user roles...");
      for (const userCompany of userCompanies) {
        await connection.execute(
          `INSERT INTO user_companies (id, user_id, company_id, role, is_primary) VALUES (?, ?, ?, ?, ?)`,
          [
            userCompany.id,
            userCompany.userId,
            userCompany.companyId,
            userCompany.role,
            userCompany.isPrimary,
          ]
        );
      }
      console.log(`✅ Created ${userCompanies.length} user-company relationships`);

      console.log("📍 Creating locations...");
      for (const location of locations) {
        await connection.execute(
          `INSERT INTO locations (id, company_id, parent_id, name, type, address, is_active) VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
          [
            location.id,
            location.companyId,
            location.parentId,
            location.name,
            location.type,
            location.address,
          ]
        );
      }
      console.log(`✅ Created ${locations.length} locations`);

      console.log("📦 Creating assets...");
      for (const asset of assets) {
        await connection.execute(
          `INSERT INTO assets (id, company_id, asset_code, name, type, model, serial_number, status, location_id, purchase_date, purchase_cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            asset.id,
            asset.companyId,
            asset.assetCode,
            asset.name,
            asset.type,
            asset.model,
            asset.serialNumber,
            asset.status,
            asset.locationId,
            asset.purchaseDate,
            asset.purchaseCost,
          ]
        );
      }
      console.log(`✅ Created ${assets.length} assets`);

      console.log("🔧 Creating components...");
      for (const component of components) {
        await connection.execute(
          `INSERT INTO components (id, asset_id, component_code, name, type, serial_number, part_number, manufacturer, position, status, purchase_cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            component.id,
            component.assetId,
            component.componentCode,
            component.name,
            component.type,
            component.serialNumber,
            component.partNumber,
            component.manufacturer,
            component.position,
            component.status,
            component.purchaseCost,
          ]
        );
      }
      console.log(`✅ Created ${components.length} components`);

      console.log("🔨 Creating maintenance records...");
      for (const maintenance of maintenanceRecords) {
        if (maintenance.maintenanceType === "scheduled" && maintenance.scheduledDate) {
          await connection.execute(
            `INSERT INTO maintenance_records (id, component_id, assigned_technician_id, title, description, maintenance_type, priority, status, reported_date, scheduled_date, estimated_duration, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ${maintenance.scheduledDate}, ?, ?)`,
            [
              maintenance.id,
              maintenance.componentId,
              maintenance.assignedTechnicianId,
              maintenance.title,
              maintenance.description,
              maintenance.maintenanceType,
              maintenance.priority,
              maintenance.status,
              maintenance.estimatedDuration,
              maintenance.notes,
            ]
          );
        } else {
          await connection.execute(
            `INSERT INTO maintenance_records (id, component_id, assigned_technician_id, title, description, maintenance_type, priority, status, reported_date, estimated_duration, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
            [
              maintenance.id,
              maintenance.componentId,
              maintenance.assignedTechnicianId,
              maintenance.title,
              maintenance.description,
              maintenance.maintenanceType,
              maintenance.priority,
              maintenance.status,
              maintenance.estimatedDuration,
              maintenance.notes,
            ]
          );
        }
      }
      console.log(`✅ Created ${maintenanceRecords.length} maintenance records`);

      console.log("\n" + "=".repeat(50));
      console.log("🎉 Database seeding completed!");
      console.log("=".repeat(50));
      console.log("\n📝 Test Credentials:");
      console.log("   🔐 SYSADMIN:  admin@assetcore.com / Password123!");
      console.log("   • Admin:      john.doe@acme.com / Password123!");
      console.log("   • Manager:    jane.smith@acme.com / Password123!");
      console.log("   • Technician: mike.johnson@acme.com / Password123!");
      console.log("   • Admin (GL): sarah.lee@globallogistics.com / Password123!");
      console.log("\n🏢 Companies:");
      console.log("   • Acme Aviation Corporation");
      console.log("   • Global Logistics Ltd");
      console.log("=".repeat(50));
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error("\n❌ Seeding process failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  // Load environment variables
  dotenv.config({ path: ".env.local" });

  seed().catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
}

export { seed };

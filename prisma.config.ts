import { defineConfig } from "prisma/config";

// Get DATABASE_URL - it should be set in Vercel environment variables
// During prisma generate, we need a valid URL format even if it's a placeholder
// The actual connection will validate the URL at runtime in lib/db.ts
const databaseUrl = process.env.DATABASE_URL;

// For Vercel deployment: Make sure DATABASE_URL is set in Vercel's Environment Variables
// Settings > Your Project > Settings > Environment Variables
// Add DATABASE_URL with your PostgreSQL connection string

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use the URL if available, otherwise use a placeholder
    // This allows prisma generate to work during build
    // The real validation happens at runtime in lib/db.ts
    url: databaseUrl || "postgresql://user:password@localhost:5432/dbname",
  },
});

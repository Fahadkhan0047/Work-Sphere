-- Step 1: Add slug column as nullable (temporary)
ALTER TABLE "public"."Workspace" ADD COLUMN "slug" TEXT;

-- Step 2: Populate slugs for existing rows
-- This will convert names to simple lowercase hyphen slugs
UPDATE "public"."Workspace"
SET "slug" = lower(replace(name, ' ', '-'))
WHERE slug IS NULL;

-- Step 3: Ensure uniqueness if needed
-- If two workspaces have the same name, you need to manually update one
-- Example:
-- UPDATE "public"."Workspace" SET "slug" = 'team-alpha-2' WHERE id = '<uuid-of-duplicate>';

-- Step 4: Make slug NOT NULL
ALTER TABLE "public"."Workspace" ALTER COLUMN "slug" SET NOT NULL;

-- Step 5: Add unique constraint
CREATE UNIQUE INDEX "Workspace_slug_key" ON "public"."Workspace"("slug");

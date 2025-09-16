-- Rename Personnel table to People
ALTER TABLE "Personnel" RENAME TO "People";

-- Update the foreign key constraint name if it exists
-- (This might not be necessary depending on the database)

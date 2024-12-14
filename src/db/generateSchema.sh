#!/bin/bash

# Define file paths and command
OUTPUT_FILE="./src/db/db.d.ts"
DB_FILE="./app.db"
GENERATION_COMMAND="npx kysely-codegen --dialect sqlite --url $DB_FILE --out-file $OUTPUT_FILE --camel-case"

# Start logging
echo "🚀 Starting schema generation..."

# Step 1: Run the Kysely code generation command
echo "⏳ Running Kysely code generation for SQLite..."
$GENERATION_COMMAND

# Check if the file is generated
if [[ ! -f $OUTPUT_FILE ]]; then
  echo "❌ Error: The schema file was not generated."
  exit 1
fi

echo "✅ Schema file generated: $OUTPUT_FILE"

# Step 2: Replace 'kysely' with 'npm:kysely' in the generated TypeScript file
echo "🔄 Replacing 'kysely' with 'npm:kysely' in $OUTPUT_FILE..."

sed -i '' 's/"kysely"/"npm:kysely"/g' $OUTPUT_FILE

# Step 3: Verify the changes
if grep -q '"npm:kysely"' "$OUTPUT_FILE"; then
  echo "✅ Successfully replaced 'kysely' with 'npm:kysely'."
else
  echo "❌ Error: Could not replace 'kysely' with 'npm:kysely'."
  exit 1
fi

# Final log message
echo "✅ Schema generation complete and file updated successfully."

# Done
echo "🔒 Process finished."

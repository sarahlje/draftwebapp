#!/bin/bash

# Cleanup script to remove temporary and diagnostic files

echo "Cleaning up temporary and diagnostic files..."

# List of files to remove
FILES_TO_REMOVE=(
  "check-tables.js"
  "test-api.js"
  "routes/fallback-api.js"
  "manual-setup.js"
  "public/test.html"
  "public/js/browser-test.js"
  "views/dashboard.ejs"
  "public/dashboard.html"
  "public/css/dashboard.css"
  "public/js/dashboard.js"
  "routes/auth.js"
)

# Remove each file if it exists
for file in "${FILES_TO_REMOVE[@]}"
do
  if [ -f "$file" ]; then
    rm "$file"
    echo "Removed: $file"
  else
    echo "Not found: $file"
  fi
done

# Inform user that cleanup is complete
echo "Cleanup complete!"
echo "Note: You may need to restart your server for changes to take effect."
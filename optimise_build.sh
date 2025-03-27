#!/bin/bash

# Print memory status before cleanup
echo "Initial memory status:"
free -h

# Clear page cache, dentries, and inodes
echo "Clearing system cache..."
sync
sudo sh -c 'echo 3 > /proc/sys/vm/drop_caches'

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Run garbage collection on Node.js
echo "Running Node.js garbage collection..."
node --expose-gc -e "global.gc()"

# Clear any temporary files in /tmp older than 2 days
echo "Cleaning temporary files..."
sudo find /tmp -type f -atime +2 -delete

# Print memory status after cleanup
echo "Memory status after cleanup:"
free -h

# Run the build process
echo "Starting build process..."
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm run build

# Copy the build files to the server
echo "Copying build files to server..."
sudo cp -r build/ /usr/local/openresty/nginx/html/

# restart openresty
echo "Restarting openresty..."
sudo systemctl restart openresty

#!/bin/bash

echo "Building Essay Frontend ..."

# Navigate to essay prep directory
cd ~/essay-prep/cheveningbrew-client

# Clear cache and build
npm cache clean --force
npm run build


# Copy build files
sudo cp -r build/ /usr/local/openresty/nginx/html/

# Set proper permissions
# sudo chown -R nginx:nginx /usr/local/openresty/nginx/html/build
# sudo chmod -R 755 /usr/local/openresty/nginx/html/build

echo "Essay build files copied to build directory"

# Copy updated nginx config
sudo cp ~/interview-prep/cheveningbrew-client/cheveningbrew-app-dev.conf /usr/local/openresty/nginx/conf/conf.d/

# Test nginx configuration
echo "Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Nginx config is valid. Reloading OpenResty..."
    sudo systemctl reload openresty
    echo "✅ Essay frontend deployed successfully!"
    echo "🌐 Access at: https://www.cheveningbrew.com"
else
    echo "❌ Nginx config has errors. Please check the configuration."
    exit 1
fi
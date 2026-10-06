#!/usr/bin/env bash
set -e

# ========================================================
# PosePlease VPS Auto-Deploy Script
# Domain: poseplease.depstronaut.com
# ========================================================

DOMAIN="poseplease.depstronaut.com"
APP_DIR="/var/www/poseplease"
REPO_URL="https://github.com/depstronaut/poseplease.git"

echo "🚀 [1/6] Memeriksa hak akses root / sudo..."
if [ "$EUID" -ne 0 ]; then
  echo "⚠️ Harap jalankan script ini dengan sudo atau sebagai root: sudo bash deploy-vps.sh"
  exit 1
fi

echo "📦 [2/6] Memeriksa dependensi sistem (Node.js, Git, Nginx, Certbot)..."
apt-get update -y
apt-get install -y curl git nginx certbot python3-certbot-nginx

# Check Node.js version
NODE_MAJOR=0
if command -v node > /dev/null 2>&1; then
  NODE_MAJOR=$(node -v | cut -d'.' -f1 | tr -d 'v')
fi

if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "📥 Menginstall Node.js 22 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

# Install PM2 globally
if ! command -v pm2 > /dev/null 2>&1; then
  echo "📥 Menginstall PM2 process manager..."
  npm install -g pm2
fi

echo "📂 [3/6] Menyiapkan repositori di ${APP_DIR}..."
mkdir -p /var/www
if [ ! -d "${APP_DIR}/.git" ]; then
  if [ -d "./apps/web" ] && [ -d "./apps/server" ]; then
    echo "ℹ️ Menyalin dari direktori saat ini..."
    cp -r . "${APP_DIR}"
  else
    echo "📥 Melakukan clone dari GitHub..."
    git clone "${REPO_URL}" "${APP_DIR}"
  fi
else
  echo "🔄 Mengambil pembaruan terbaru dari GitHub..."
  cd "${APP_DIR}"
  git fetch origin main || true
  git reset --hard origin/main || true
fi

cd "${APP_DIR}"

echo "⚙️ [4/6] Menginstall paket & membuild aplikasi..."
npm ci || npm install
npm run build

echo "🎮 [5/6] Menjalankan layanan dengan PM2..."
pm2 start ecosystem.config.cjs --update-env || pm2 restart ecosystem.config.cjs --update-env
pm2 save
pm2 startup systemd -u root --hp /root || true

echo "🌐 [6/6] Mengkonfigurasi Nginx untuk ${DOMAIN}..."
cat << 'EOF' > /etc/nginx/sites-available/poseplease
map $http_upgrade $backend_upstream {
    default http://127.0.0.1:3000;
    websocket http://127.0.0.1:2567;
}

server {
    listen 80;
    server_name poseplease.depstronaut.com;

    location /matchmake/ {
        proxy_pass http://127.0.0.1:2567;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:2567;
    }

    location / {
        proxy_pass $backend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/poseplease /etc/nginx/sites-enabled/poseplease
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

nginx -t
systemctl reload nginx

echo ""
echo "🔒 [Otomatisasi SSL] Mencoba mengaktifkan HTTPS dengan Certbot..."
certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos --register-unsafely-without-email --redirect || {
  echo "⚠️ Catatan SSL: Jika Certbot belum berhasil, pastikan DNS A-Record ${DOMAIN} sudah mengarah ke IP VPS ini, lalu jalankan:"
  echo "   sudo certbot --nginx -d ${DOMAIN}"
}

echo ""
echo "========================================================="
echo "✅ DEPLOYMENT POSEPLEASE SELESAI!"
echo "Status PM2:"
pm2 status
echo ""
echo "🌐 Buka web Anda di: https://${DOMAIN}"
echo "========================================================="

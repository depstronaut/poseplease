#!/usr/bin/env bash
set -e

# ========================================================
# Update Nginx routing for PosePlease:
# Routes all WebSockets to Colyseus (port 2567)
# Routes normal HTTP to Next.js (port 3000)
# ========================================================

echo "🔧 Mengkonfigurasi Nginx WebSocket routing..."

cat << 'EOF' > /etc/nginx/sites-available/poseplease
map $http_upgrade $backend_upstream {
    default http://127.0.0.1:3000;
    websocket http://127.0.0.1:2567;
}

server {
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

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/poseplease.depstronaut.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/poseplease.depstronaut.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = poseplease.depstronaut.com) {
        return 301 https://$host$request_uri;
    }
    listen 80;
    server_name poseplease.depstronaut.com;
    return 404;
}
EOF

ln -sf /etc/nginx/sites-available/poseplease /etc/nginx/sites-enabled/poseplease
nginx -t
systemctl reload nginx

echo "✅ Nginx berhasil di-update & di-reload! WebSocket Colyseus sekarang aktif di port 443!"

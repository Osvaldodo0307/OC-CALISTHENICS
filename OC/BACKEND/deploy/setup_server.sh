#!/bin/bash
set -e

# ============================================================
# OC-Calisthenics — Setup completo para Oracle Cloud Always Free
# Ubuntu 22.04 ARM (aarch64)
# Ejecutar como: bash setup_server.sh
# ============================================================

APP_DIR="/home/ubuntu/OC-Calisthenics/OC/BACKEND"
VENV_DIR="$APP_DIR/venv"
REPO_URL="https://github.com/osvaldogonzalez0307-debug/OC-Calisthenics.git"

echo "============================================"
echo "  OC-Calisthenics — Setup del Servidor"
echo "============================================"
echo ""

# --- Pedir datos al usuario ---
read -p "Password para el usuario MySQL 'ocadmin': " MYSQL_PASS
read -p "Dominio DuckDNS (ej: oc-calisthenics.duckdns.org): " DOMAIN
read -p "URL del frontend en Netlify (ej: https://oc-club.netlify.app): " FRONTEND_URL

JWT_SECRET=$(openssl rand -hex 32)
echo ""
echo "JWT_SECRET generado: $JWT_SECRET"
echo ""

# ============================================================
# 1. Actualizar sistema e instalar dependencias base
# ============================================================
echo ">>> [1/8] Actualizando sistema..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y software-properties-common curl git

# ============================================================
# 2. Instalar Python 3.11
# ============================================================
echo ">>> [2/8] Instalando Python 3.11..."
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev

# ============================================================
# 3. Instalar MySQL Server
# ============================================================
echo ">>> [3/8] Instalando MySQL Server..."
sudo apt install -y mysql-server

sudo systemctl start mysql
sudo systemctl enable mysql

echo ">>> Creando base de datos y usuario MySQL..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS oc_calisthenics CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'ocadmin'@'localhost' IDENTIFIED BY '${MYSQL_PASS}';"
sudo mysql -e "GRANT ALL PRIVILEGES ON oc_calisthenics.* TO 'ocadmin'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
echo "    Base de datos 'oc_calisthenics' creada."
echo "    Usuario 'ocadmin' creado."

# ============================================================
# 4. Instalar Nginx
# ============================================================
echo ">>> [4/8] Instalando Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# ============================================================
# 5. Instalar Certbot (Let's Encrypt)
# ============================================================
echo ">>> [5/8] Instalando Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# ============================================================
# 6. Clonar repositorio e instalar app
# ============================================================
echo ">>> [6/8] Clonando repositorio..."
cd /home/ubuntu

if [ -d "OC-Calisthenics" ]; then
    echo "    Repo ya existe, actualizando..."
    cd OC-Calisthenics && git pull && cd ..
else
    git clone "$REPO_URL"
fi

echo ">>> Creando virtual environment..."
python3.11 -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"
pip install --upgrade pip
pip install -r "$APP_DIR/requirements.txt"

# ============================================================
# 7. Configurar la aplicacion
# ============================================================
echo ">>> [7/8] Configurando la aplicacion..."

cat > "$APP_DIR/.env" << EOF
DATABASE_URL=mysql+pymysql://ocadmin:${MYSQL_PASS}@localhost:3306/oc_calisthenics?charset=utf8mb4
JWT_SECRET=${JWT_SECRET}
JWT_ALGORITHM=HS256
JWT_EXPIRES_MINUTES=1440
ALLOWED_ORIGINS=${FRONTEND_URL}
EOF

echo "    Archivo .env creado."

echo ">>> Ejecutando seeds..."
cd "$APP_DIR"
python create_admin.py
python seed_classes.py
echo "    Seeds ejecutados correctamente."

# ============================================================
# 8. Configurar servicios del sistema
# ============================================================
echo ">>> [8/8] Configurando servicios..."

sudo cp "$APP_DIR/deploy/oc-backend.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable oc-backend
sudo systemctl start oc-backend

sudo cp "$APP_DIR/deploy/nginx-oc.conf" "/etc/nginx/sites-available/oc-calisthenics"
sudo ln -sf /etc/nginx/sites-available/oc-calisthenics /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

if [ -n "$DOMAIN" ]; then
    sudo sed -i "s/TU_DOMINIO_AQUI/${DOMAIN}/g" /etc/nginx/sites-available/oc-calisthenics
fi

sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "============================================"
echo "  Setup completado!"
echo "============================================"
echo ""
echo "Backend corriendo en: http://localhost:8000"
echo "Nginx proxy en:       http://${DOMAIN:-<tu-dominio>}"
echo ""
echo "Verificar:"
echo "  curl http://localhost:8000/health/db"
echo "  sudo systemctl status oc-backend"
echo ""
echo "Para SSL, ejecuta:"
echo "  sudo certbot --nginx -d ${DOMAIN:-tu-dominio.duckdns.org}"
echo ""
echo "Credenciales admin:"
echo "  Username: octavio"
echo "  Password: OcAdmin2026!"
echo ""

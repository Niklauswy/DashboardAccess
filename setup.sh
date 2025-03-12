#!/bin/bash

echo "🔹 Actualizando el sistema..."
sudo apt update && sudo apt upgrade -y

echo "🔹 Instalando herramientas de compilación (build-essential)..."
sudo apt install -y build-essential

echo "🔹 Instalando NVM..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

echo "⚠️  Cerrar y abrir otra terminal, y ejecutar script nuevamente pa continuar."
exit

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "🔹 Instalando Node.js versión 22..."
nvm install 22

echo "✅ Verificando instalación de Node.js y npm..."
node -v
npm -v

echo "🔹 Instalando dependencias del Backend..."
cd Backend |
npm install express-rate-limit
npm install -g pm2


pm2 start server.js --name "backend-server"
pm2 save
pm2 startup systemd | bash

echo "🔹 Instalando dependencias del Frontend..."
cd ../frontend
npm install

echo "🎉 Instalación completa"

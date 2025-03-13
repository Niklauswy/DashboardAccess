module.exports = {
  apps: [
    {
      name: "backend-server",
      script: "server.js",
      instances: "max",  
      exec_mode: "cluster",   balanceo de carga entre procesos
      autorestart: true,  // Reinicia automáticamente si falla
      watch: false,  // No reiniciar si hay cambios en los archivos
      max_memory_restart: "500M",  // Reiniciar si usa más de 500MB de RAM
    }
  ]
};

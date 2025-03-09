const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const rateLimit = require('express-rate-limit'); // You may need to install this

const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 });

const app = express();
const port = 5000;

// Security: Add rate limiting to prevent brute force attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false // Fixed: Removed incorrect apiLimiter reference
});

app.use(cors());
app.use(express.json());
app.use('/api/', apiLimiter);

// Security: Helper function to sanitize command inputs
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.replace(/[;&|`$()<>]/g, '');
};

const executeScript = (script, res) => {
  const command = script.replace('perl ', 'perl scripts/');
  const cacheKey = command;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  exec(command, { shell: '/bin/bash' }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Error ejecutando comando' });
    }
    try {
      const jsonData = JSON.parse(stdout);
      cache.set(cacheKey, jsonData);
      res.status(200).json(jsonData);
    } catch (parseError) {
      res.status(500).json({ error: 'Error en formato de respuesta' });
    }
  });
};

const executeScriptWithInput = (script, inputData, res) => {
  const command = script.replace('perl ', 'perl scripts/');
  const child = exec(command, { shell: '/bin/bash' }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Error ejecutando comando' });
    }
    try {
      const jsonData = JSON.parse(stdout);
      res.status(200).json(jsonData);
    } catch (parseError) {
      res.status(500).json({ error: 'Error en formato de respuesta' });
    }
  });

  child.stdin.write(JSON.stringify(inputData));
  child.stdin.end();
};

// Desactivamos completamente la caché para la ruta de usuarios
app.get('/api/users', (req, res) => {
  // Configuramos headers para evitar cacheo
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  
  // Siempre ejecutamos el script directamente sin usar caché
  exec('perl scripts/getUsers.pl', { shell: '/bin/bash' }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Error ejecutando comando' });
    }
    try {
      const jsonData = JSON.parse(stdout);
      res.status(200).json(jsonData);
    } catch (parseError) {
      res.status(500).json({ error: 'Error en formato de respuesta' });
    }
  });
});

app.get('/api/logs', (req, res) => {
  executeScript('perl getLogs.pl', res);
});

app.get('/api/groups', (req, res) => {
  executeScript('perl getGroups.pl', res);
});

app.get('/api/ous', (req, res) => {
  executeScript('perl getOus.pl', res);
});

app.get('/api/computers', (req, res) => {
  executeScript('perl getComputers.pl', res);
});

app.post('/api/users/create', (req, res) => {
  const userData = req.body;
  executeScriptWithInput('perl addUser.pl', userData, res);
});

// Mejoramos el endpoint de borrado para asegurar actualización
app.delete('/api/users/:username', (req, res) => {
  const username = sanitizeInput(req.params.username);
  
  if (!username) {
    return res.status(400).json({ error: 'Nombre de usuario inválido' });
  }
  
  exec(`perl scripts/deleteUser.pl "${username}"`, { shell: '/bin/bash' }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Error al eliminar usuario' });
    }
    
    try {
      const jsonData = JSON.parse(stdout);
      
      // Aseguramos limpiar cualquier caché que pueda existir
      cache.flushAll();
      
      return res.status(jsonData.error ? 400 : 200).json(jsonData);
    } catch (parseError) {
      // Limpiamos caché incluso en caso de error de parseo
      cache.flushAll();
      
      return res.status(200).json({ 
        success: true, 
        message: stdout.trim() || 'Usuario eliminado exitosamente'
      });
    }
  });
});

// Catch-all route for unmatched endpoints
app.all('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Security: Remove detailed error messages in production
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en http://0.0.0.0:${port}/`);
});
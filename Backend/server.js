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
  max: 1000, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false // Fixed: Removed incorrect apiLimiter reference
});

app.use(cors());
app.use(express.json());
app.use('/api/', apiLimiter);

// Helper function para sanitizar entradas con mejor seguridad
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  // Expresión regular mejorada para remover caracteres potencialmente peligrosos
  return input.replace(/[;&|`$()<>"'\[\]\{\}\\]/g, '');
};

const executeScript = (script, res) => {
  const command = script.replace('perl ', 'perl scripts/');
  const cacheKey = command;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  exec(command, { shell: '/bin/bash' }, (error, stdout, stderr) => {
    try {
      // Intentamos parsear la salida como JSON incluso con error
      const jsonData = JSON.parse(stdout);
      
      // Si hay un error en la ejecución o el script devolvió un error en JSON
      if (error || (jsonData && jsonData.error)) {
        // No guardamos en caché respuestas de error
        return res.status(jsonData.error ? 400 : 500).json({
          error: jsonData.error || 'Error ejecutando comando',
          details: jsonData.details || stderr
        });
      }
      
      // Todo bien, guardamos en caché
      cache.set(cacheKey, jsonData);
      res.status(200).json(jsonData);
    } catch (parseError) {
      res.status(500).json({ 
        error: 'Error en formato de respuesta', 
        details: stderr || parseError.message 
      });
    }
  });
};

const executeScriptWithInput = (script, inputData, res) => {
  const command = script.replace('perl ', 'perl scripts/');
  const child = exec(command, { shell: '/bin/bash' }, (error, stdout, stderr) => {
    try {
      // Intentamos parsear la salida como JSON incluso si hay error
      const jsonData = JSON.parse(stdout);
      
      // Si hay un error en la ejecución O si el script devolvió un error en formato JSON
      if (error || (jsonData && jsonData.error)) {
        // Si el script devolvió un mensaje de error específico, lo usamos
        const errorMessage = jsonData.error || 'Error ejecutando comando';
        const statusCode = jsonData.error ? 400 : 500;
        return res.status(statusCode).json({ error: errorMessage, details: jsonData.details || stderr });
      }
      
      // Todo salió bien, devolvemos la respuesta
      res.status(200).json(jsonData);
    } catch (parseError) {
      // Error al parsear la salida como JSON
      console.error('Error parseando salida como JSON:', parseError);
      res.status(500).json({ 
        error: 'Error en formato de respuesta',
        details: `${stderr || parseError.message}`
      });
    }
  });

  child.stdin.write(JSON.stringify(inputData));
  child.stdin.end();
};

// API routes
app.get('/api/users', (req, res) => {
  // Configuramos headers para evitar cacheo
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  
  // Ejecutamos el script sin usar caché
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

// Security: Properly sanitize username input
app.delete('/api/users/:username', (req, res) => {
  const username = sanitizeInput(req.params.username);
  
  if (!username) {
    return res.status(400).json({ error: 'Nombre de usuario inválido' });
  }
  
  // Añadimos cabeceras para evitar cacheo
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  
  exec(`perl scripts/deleteUser.pl "${username}"`, { shell: '/bin/bash' }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Error al eliminar usuario' });
    }
    
    try {
      const jsonData = JSON.parse(stdout);
      // Limpiamos la caché después de eliminar un usuario
      cache.del('perl scripts/getUsers.pl');
      
      return res.status(jsonData.error ? 400 : 200).json(jsonData);
    } catch (parseError) {
      // Limpiamos la caché incluso en caso de error
      cache.del('perl scripts/getUsers.pl');
      
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
const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');

const NodeCache = require('node-cache'); // Add this line
const cache = new NodeCache({ stdTTL: 60 }); // Cache TTL in seconds

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());


const executeScript = (script, res) => {
  // Agrega el prefijo "scripts/" después de "perl "
  const command = script.replace('perl ', 'perl scripts/');
  const cacheKey = command;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  exec(command, { shell: '/bin/bash' }, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: 'Server Error', details: error.message });
    }
    try {
      const jsonData = JSON.parse(stdout);
      cache.set(cacheKey, jsonData); // Cache the response
      res.status(200).json(jsonData);
    } catch (parseError) {
      console.error(`parse error: ${parseError}`);
      res.status(500).json({ error: 'Server Error', details: parseError.message });
    }
  });
};

// Function to execute Perl scripts with input data
const executeScriptWithInput = (script, inputData, res) => {
  // Agrega el prefijo "scripts/" después de "perl "
  const command = script.replace('perl ', 'perl scripts/');
  const child = exec(command, { shell: '/bin/bash' }, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: 'Server Error', details: error.message });
    }
    try {
      const jsonData = JSON.parse(stdout);
      res.status(200).json(jsonData);
    } catch (parseError) {
      console.error(`parse error: ${parseError}`);
      res.status(500).json({ error: 'Server Error', details: parseError.message });
    }
  });

  // Send input data to the Perl script via stdin
  child.stdin.write(JSON.stringify(inputData));
  child.stdin.end();
};

// API routes
app.get('/api/users', (req, res) => {
  executeScript('perl getUsers.pl', res);
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

// Create an endpoint specifically for user deletion at /api/users/delete
// Use a standard route without async/await to simplify
app.post('/api/users/delete', (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Nombre de usuario requerido' });
  }
  
  console.log(`Backend received delete request for user: ${username}`);
  
  // Make sure we're using the correct path to the Perl script
  exec(`perl ${__dirname}/scripts/deleteUser.pl "${username}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error.message}`);
      return res.status(500).json({ error: `Error al eliminar usuario: ${error.message}` });
    }
    
    if (stderr) {
      console.error(`Script stderr: ${stderr}`);
      return res.status(400).json({ error: stderr });
    }
    
    console.log(`Script output: ${stdout}`);
    
    // Return a clean JSON response
    return res.status(200).json({ 
      success: true,
      message: `Usuario '${username}' eliminado exitosamente`
    });
  });
});

// Remove or comment out the DELETE endpoint to avoid confusion
// app.delete('/api/users/delete', async (req, res) => { ... });

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});
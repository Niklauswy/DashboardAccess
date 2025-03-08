const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');

const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 }); 

const app = express();
const port = 5000;

// Enable debugging to see all routes
console.log('Starting API server with routes:');

app.use(cors());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

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

// Function to execute Perl scripts with special handling for non-JSON responses
const executeScriptRaw = (script, res) => {
  // Agrega el prefijo "scripts/" después de "perl "
  const command = script.replace('perl ', 'perl scripts/');
  console.log(`Executing command: ${command}`);
  
  exec(command, { shell: '/bin/bash' }, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: 'Server Error', details: error.message });
    }
    
    try {
      // Try to parse JSON, but if it fails, send raw output
      const jsonData = JSON.parse(stdout);
      res.status(200).json(jsonData);
    } catch (parseError) {
      // If not valid JSON, just return the raw output
      console.log(`Script output (not JSON): ${stdout}`);
      res.status(200).json({ 
        success: true, 
        message: stdout.trim()
      });
    }
  });
};

// Define user-specific routes BEFORE the general routes
// This is important for Express route matching precedence
app.delete('/api/users/:username', (req, res) => {
  const { username } = req.params;
  console.log(`Processing DELETE request for user: ${username}`);
  
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  // Use a relative path for the script
  console.log(`Executing delete script for user ${username}`);
  
  exec(`perl scripts/deleteUser.pl "${username}"`, { shell: '/bin/bash' }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Script execution error:`, error);
      return res.status(500).json({ error: 'Server Error', details: error.message });
    }
    
    if (stderr) {
      console.error(`Script stderr: ${stderr}`);
    }
    
    console.log(`Delete script stdout: ${stdout}`);
    
    try {
      // Try to parse JSON output
      const jsonData = JSON.parse(stdout);
      return res.status(jsonData.error ? 400 : 200).json(jsonData);
    } catch (parseError) {
      console.error(`JSON parse error:`, parseError);
      // If parsing fails, return the raw output
      return res.status(200).json({ 
        success: true, 
        message: stdout.trim() || 'Usuario eliminado exitosamente'
      });
    }
  });
});

// Now define the general routes
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

// Add a wildcard route at the end to catch unmatched routes
app.all('*', (req, res) => {
  console.log(`Unmatched route: ${req.method} ${req.path}`);
  res.status(404).json({ error: `No route found for ${req.method} ${req.path}` });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
  // Print all registered routes for debugging
  app._router.stack.forEach(function(r){
    if (r.route && r.route.path){
      Object.keys(r.route.methods).forEach(method => {
        console.log(`${method.toUpperCase()} ${r.route.path}`);
      });
    }
  });
});
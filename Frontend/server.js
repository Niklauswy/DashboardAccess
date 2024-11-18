const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');

const NodeCache = require('node-cache'); // Add this line
const cache = new NodeCache({ stdTTL: 60 }); // Cache TTL in seconds

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json()); // Move this middleware to parse JSON request bodies before routes

// Function to execute Perl scripts without input data
const executeScript = (script, res) => {
  const cacheKey = script;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    // Return cached response
    return res.json(cachedData);
  }

  exec(script, { shell: '/bin/bash' }, (error, stdout, stderr) => { // Ensure correct shell
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: 'Server Error', details: error.message });
    }
    try {
      const jsonData = JSON.parse(stdout);
      if (Array.isArray(jsonData)) {
        res.json(jsonData); // If the script returns an array
      } else if (jsonData.users && Array.isArray(jsonData.users)) {
        res.json(jsonData.users); // If the script returns an object with users array
      } else {
        res.status(500).json({ error: 'Invalid data format from script' });
      }
      cache.set(cacheKey, jsonData); // Cache the response
    } catch (parseError) {
      console.error(`parse error: ${parseError}`);
      res.status(500).json({ error: 'Server Error', details: parseError.message });
    }
  });
};

// Function to execute Perl scripts with input data
const executeScriptWithInput = (script, inputData, res) => {
  const child = exec(script, { shell: '/bin/bash' }, (error, stdout, stderr) => {
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

app.post('/api/users/create', (req, res) => {
  const userData = req.body;
  executeScriptWithInput('perl addUser.pl', userData, res);
});

app.put('/api/users/edit', (req, res) => {
  const userData = req.body;
  executeScriptWithInput('perl editUser.pl', userData, res);
});

app.delete('/api/users/delete', (req, res) => {
  const { username } = req.body;
  executeScriptWithInput('perl deleteUser.pl', { username }, res);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});

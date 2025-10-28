import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import loggerMiddlewar from './middlewares/logger.js';
import errorHandler from './middlewares/errorhandler.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userFilePath = path.join(__dirname, 'users.json');



dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(loggerMiddlewar);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(
    `<h1 style="color: blue; text-align: center; margin-top: 20%;">Welcome to the Express Server!</h1>`
  );
});

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  res.send(`User ID requested: ${userId}`);
});

app.get('/search', (req, res) => {
  const query = req.query.q;
  res.send(`Search query: ${query}`);
});

app.post('/form', (req, res) => {
  const name = req.body.name || 'anonimo';
  const email = req.body.email || 'no proporcionado';
  res.json({ message: `Form submitted successfully!`,
    Data: { 
      name, 
      email }
   });
});


app.post('/api/data', (req, res) => {
  const data = req.body;
  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'No data provided' });
  }
  res.status(201).json({ message: 'Data received successfully', data });
});

app.get('/users', (req, res) => {
  fs.readFile(userFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading user data' });
    }
    const users = JSON.parse(data);
    res.json(users);
  });  
  });

app.post('/users', (req, res) => {
  console.log(req.body);
  const newUser = req.body;

  // Validación inicial: verificar si se enviaron datos
  if (!newUser || Object.keys(newUser).length === 0) {
    return res.status(400).json({ error: 'No user data provided' });
  }

  // Validar que el nombre y el email estén presentes
  if (!newUser.name || !newUser.email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Validar formato del email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validar longitud del nombre
  if (newUser.name.length < 3) {
    return res.status(400).json({ error: 'Name must be at least 3 characters long' });
  }

  // Leer el archivo users.json
  fs.readFile(userFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading user data' });
    }

    let users = [];
    try {
      users = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).json({ error: 'Error parsing user data' });
    }

    // 🔹 Generar ID único y autoincremental
    const generateAutoId = (arr) => {
      if (!arr.length) return 1; // si no hay usuarios, empieza en 1
      const ids = arr.map(u => parseInt(u.id)).filter(n => !isNaN(n)); // evita valores inválidos
      const maxId = ids.length ? Math.max(...ids) : 0;
      return maxId + 1;
    };

    const id = generateAutoId(users);

    // Crear el nuevo usuario con valores por defecto si faltan
    const userToAdd = {
      id,
      name: newUser.name || 'anonimo',
      email: newUser.email || 'no proporcionado'
    };

    // Agregar el nuevo usuario al array
    users.push(userToAdd);

    // Escribir el nuevo array en el archivo JSON
    fs.writeFile(userFilePath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error saving user data' });
      }

      console.log('Usuario agregado:', userToAdd);
      res.status(201).json({ message: 'User added successfully', user: userToAdd });
    });
  });
});

  app.put('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const updatedUser = req.body;

  if (!updatedUser || Object.keys(updatedUser).length === 0) {
    return res.status(400).json({ error: 'No user data provided' });
  }

  fs.readFile(userFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading user data' });
    }

    let users;
    try {
      users = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).json({ error: 'Error parsing user data' });
    }

    const userIndex = users.findIndex(user => parseInt(user.id) === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Actualizar datos del usuario
    users[userIndex] = { ...users[userIndex], ...updatedUser };

    fs.writeFile(userFilePath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error updating user data' });
      }

      console.log('Usuario actualizado:', users[userIndex]);
      res.status(200).json(users[userIndex]); // responder dentro del callback
    });
  });
});

app.delete('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);

  fs.readFile(userFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading user data' });
    }

    let users;
    try {
      users = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).json({ error: 'Error parsing user data' });
    }

    users = users.filter(user => parseInt(user.id) !== userId);

    fs.writeFile(userFilePath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error deleting user data' });
      }
      res.status(200).json({ message: 'User deleted successfully' });
    });
  });
});

app.get('/error', (req, res, next) => {
  next(new Error('This is a test error'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});



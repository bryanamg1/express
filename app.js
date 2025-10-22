import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


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

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});



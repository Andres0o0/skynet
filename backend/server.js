// backend/server.js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor backend de SkyNet funcionando 🚀');
});

app.listen(4000, () => {
  console.log('Servidor corriendo en http://localhost:4000');
});

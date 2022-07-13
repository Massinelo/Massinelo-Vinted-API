const express = require('express');
const formidable = require('express-formidable');
const mongoose = require('mongoose');
require('dotenv').config();
//Import des routes
const userRoutes = require('./routes/user');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(formidable());
app.use(userRoutes);

mongoose.connect('mongodb://localhost:27017/Vinted-DB');

app.all('*', (req, res) => {
  res.status(404).json({ message: "Cette route n'existe pas" });
});

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});

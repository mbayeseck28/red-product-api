const express = require("express");
const app = express();
app.use(express.json());
const mongoose = require("mongoose");
const cors = require("cors");
app.use(cors());

// _______________________________________
// Ajout des headers pour éviter des erreurs
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

const hotelRoutes = require("./routes/hotel");
app.use("/api/hotels", hotelRoutes);

const userRoutes = require("./routes/user");
app.use("/api/auth", userRoutes);

const path = require("path");
app.use("/images", express.static(path.join(__dirname, "images")));

// _____________________________________________
// Connexion à la base de données grace à mongoose
mongoose
  .connect(
    "mongodb+srv://red_product:j9IfpgryXoAzwYz3@cluster0.nl2drgp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

module.exports = app;

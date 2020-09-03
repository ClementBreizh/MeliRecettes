const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require ("path")

const recipesRoutes = require("./routes/recipes");
const userRoutes = require("./routes/user");

const app = express();

mongoose
  .connect(
    "mongodb+srv://clement:XKNl9XNfsXuKJrI4@cluster0.kmvxw.mongodb.net/melirecettes?retryWrites=true&w=majority",
    { useUnifiedTopology: true, useNewUrlParser: true }
  )
  .then(() => {
    console.log("Connect to database");
  })
  .catch(() => {
    console.log("Connection failed");
  });

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// donne acces au dossier image des recipes
app.use("/images", express.static(path.join("backend/images")));

app.use((req, resp, next) => {
  resp.setHeader("Access-Control-Allow-Origin", "*");
  resp.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  resp.setHeader(
    "Acces-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  // resolution CORS DELETE, voir pourquoi
  resp.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  next();
});

app.use("/api/recipes", recipesRoutes);
app.use("/api/user", userRoutes);

module.exports = app;

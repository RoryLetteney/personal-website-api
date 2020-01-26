"use strict";

// NPM PACKAGE IMPORTS
require("dotenv").config();
const express = require("express");
const database = require("./database");
const swaggerUI = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

// SETUP
const app = (module.exports = express());
const PORT = process.env.PORT || 3300;
const swaggerDefinition = {
  info: {
    title: "Letteney Software API",
    version: "1.0.0",
    description: "API docs for letteney.software"
  },
  basePath: "/api/"
};
const swaggerOptions = {
  swaggerDefinition,
  apis: ["./routes/*.js"]
};
const swaggerDocument = swaggerJSDoc(swaggerOptions);
app.use(express.urlencoded({ extended: true }));
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// ROUTES
app.get("/", async (req, res) => {
  const client = await database.connect();
  const results = await client.query("SELECT NOW()");
  const tags = results.rows;
  client.release();
  res.send(tags);
});

// STARTUP
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

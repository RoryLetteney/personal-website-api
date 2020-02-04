"use strict";

// NPM PACKAGE IMPORTS
require("dotenv").config();
const express = require("express");
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
  basePath: "/"
};
const swaggerOptions = {
  swaggerDefinition,
  apis: ["./routes/*.js"]
};
const swaggerDocument = swaggerJSDoc(swaggerOptions);
app.use(express.urlencoded({ extended: true }));
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// ROUTES
app.use(require("./routes/tagsRoutes"));
app.use(require("./routes/skillsRoutes"));

// ERROR HANDLER
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({ error: { status: err.status, message: err.message } });
});

// STARTUP
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

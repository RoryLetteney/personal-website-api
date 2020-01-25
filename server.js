"use strict";

// NPM PACKAGE IMPORTS
require("dotenv").config();
const express = require("express");
const database = require("./database");

// SETUP
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: true }));

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

"use strict";

// NPM PACKAGE IMPORTS
require("dotenv").config();

// SETUP
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: true }));

// STARTUP
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

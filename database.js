// NPM PACKAGE IMPORTS
const { Pool } = require("pg");

// CONSTANTS
const DATABASE_URI = process.env.DATABASE_URI;

// EXPORTS
module.exports = new Pool({
  connectionString: DATABASE_URI
});

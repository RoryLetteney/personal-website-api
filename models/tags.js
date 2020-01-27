"use strict";

const database = require("../database");

module.exports = {
  create: async paramObj => {
    const { name } = paramObj;

    if (!name || typeof name !== "string" || !name.trim())
      return new Error({
        error: { status: 400, message: "Name must be supplied." }
      });

    const query = `
      INSERT INTO tags (name)
        VALUES ($1)
      RETURNING
        id
        ,name
    `;
    const values = [name];

    const client = await database.connect();
    return client
      .query(query, values)
      .then(results => {
        client.release();
        return results.rows;
      })
      .catch(err => {
        client.release();
        return new Error({
          error: { status: 500, message: `tags.create SQL Error: ${err}` }
        });
      });
  }
};

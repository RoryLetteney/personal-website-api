"use strict";

const createError = require("http-errors");
const database = require("../database");

module.exports = {
  create: async paramObj => {
    const { name } = paramObj;

    if (!name || typeof name !== "string" || !name.trim())
      return Promise.reject(createError(400, "Name must be supplied"));

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
        return Promise.resolve(results.rows);
      })
      .catch(err => {
        client.release();
        return Promise.reject(
          createError(500, `tags.create SQL Error: ${err}`)
        );
      });
  }
};

"use strict";

const createError = require("http-errors");
const database = require("../database");

module.exports = {
  fetchAll: async () => {
    const query = `
      SELECT
        id
        ,name
      FROM tags
    `;

    const client = await database.connect();
    return client
      .query(query)
      .then(results => {
        client.release();

        if (!results.rows.length)
          return Promise.reject(createError(404, "No tags found"));

        return Promise.resolve(results.rows);
      })
      .catch(err => {
        client.release();

        return Promise.reject(
          createError(500, `tags.fetchAll SQL Error: ${err}`)
        );
      });
  },
  create: async paramObj => {
    const { name } = paramObj;

    if (!name || typeof name !== "string" || !name.trim())
      return Promise.reject(
        createError(400, "Name must be supplied and must be a string")
      );

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
  },
  update: async paramObj => {
    const { id, name } = paramObj;

    if (id === null || id === undefined || !/^\d+$/.test(id) || !id.trim())
      return Promise.reject(
        createError(400, "ID must be supplied and must be a number")
      );

    if (!name || typeof name !== "string" || !name.trim())
      return Promise.reject(
        createError(400, "Name must be supplied and must be a string")
      );

    const query = `
      UPDATE tags
      SET name = $1
      WHERE id = $2
      RETURNING
        id
        ,name
    `;
    const values = [name, id];

    const client = await database.connect();
    return client
      .query(query, values)
      .then(results => {
        client.release();

        if (!results.rows.length)
          return Promise.reject(createError(404, "Tag not found"));

        return Promise.resolve(results.rows);
      })
      .catch(err => {
        return Promise.reject(
          createError(500, `tags.update SQL Error: ${err}`)
        );
      });
  }
};

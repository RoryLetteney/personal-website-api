"use strict";

const createError = require("http-errors");
const database = require("../database");

const { verifyString, verifyNumber } = require("./modelsHelper");

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

    if (!name || !verifyString(name))
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
    const values = [name.toLowerCase()];

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

    if (id === null || id === undefined || !verifyNumber(id))
      return Promise.reject(
        createError(400, "ID must be supplied and must be a number")
      );

    if (!name || !verifyString(name))
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
  },
  delete: async id => {
    if (id === null || id === undefined || !verifyNumber(id))
      return Promise.reject(
        createError(400, "ID must be supplied and must be a number")
      );

    let query = `
        DELETE FROM tags
        WHERE id = $1
    `;
    const values = [id];

    const client = await database.connect();
    await client
      .query(query, values)
      .then(results => {
        if (!results.rowCount)
          return Promise.reject(createError(404, "Tag not found"));

        query = `
          SELECT
            id
            ,name
          FROM tags
        `;
      })
      .catch(err => {
        return Promise.reject(
          createError(500, `tags.delete SQL Error: ${err}`)
        );
      });
    return client
      .query(query)
      .then(results => {
        client.release();

        if (!results.rows.length) {
          return Promise.reject(createError(404, "No tags found"));
        }

        return Promise.resolve(results.rows);
      })
      .catch(err => {
        return Promise.reject(
          createError(500, `tags.delete SQL Error: ${err}`)
        );
      });
  }
};

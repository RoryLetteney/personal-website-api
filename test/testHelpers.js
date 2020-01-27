"use strict";

const createError = require("http-errors");
const database = require("../database");

module.exports = {
  tags: {
    cleanup: {
      create: async () => {
        const client = await database.connect();

        const query = `
          DELETE FROM tags
          WHERE name = 'test-tag'
        `;

        return client
          .query(query)
          .then(() => {
            client.release();
            Promise.resolve();
          })
          .catch(err => {
            client.release();
            return Promise.reject(
              createError(500, `tags.cleanup.create SQL Error: ${err}`)
            );
          });
      }
    }
  }
};

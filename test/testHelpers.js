"use strict";

const createError = require("http-errors");
const database = require("../database");

module.exports = {
  tags: {
    cleanup: {
      create: async id => {
        const client = await database.connect();

        const query = `
          DELETE FROM tags
          WHERE id = $1
        `;
        const values = [id];

        return client
          .query(query, values)
          .then(() => {
            client.release();
            return Promise.resolve();
          })
          .catch(err => {
            client.release();
            return Promise.reject(
              createError(500, `tags.cleanup.create SQL Error: ${err}`)
            );
          });
      }
    }
  },
  skills: {
    cleanup: {
      create: async ids => {
        const client = await database.connect();

        const query = `
          DELETE FROM skills
          WHERE id IN (${"?,".repeat(ids.length).slice(0, -1)})
        `;
        const values = ids;

        return client
          .query(query, values)
          .then(() => {
            client.release();
            return Promise.resolve();
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

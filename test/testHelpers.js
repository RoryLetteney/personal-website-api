"use strict";

const createError = require("http-errors");
const database = require("../database");

module.exports = {
  tags: {
    cleanup: {
      create: async ids => {
        const client = await database.connect();

        const query = `
          DELETE FROM tags
          WHERE id IN (${ids.map((_, idx) => `$${idx + 1}`).join(",")})
        `;
        const values = [...ids];

        return client
          .query(query, values)
          .then(() => {
            client.release();
            return Promise.resolve();
          })
          .catch(err => {
            client.release();
            return Promise.reject(
              createError(
                err.status || 500,
                err.message || `tags.cleanup.create SQL Error: ${err}`
              )
            );
          });
      }
    }
  },
  skills: {
    cleanup: {
      create: async ids => {
        const client = await database.connect();

        const inClause = ids.map((_, idx) => `$${idx + 1}`).join(",");

        const query = `
          DELETE FROM skills
          WHERE id IN (${inClause})
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
              createError(
                err.status || 500,
                err.message || `tags.cleanup.create SQL Error: ${err}`
              )
            );
          });
      }
    }
  }
};

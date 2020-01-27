"use strict";

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
            return client.release();
          })
          .catch(err => {
            client.release();
            return new Error({
              error: {
                status: 500,
                message: `tags.cleanup.create SQL Error: ${err}`
              }
            });
          });
      }
    }
  }
};

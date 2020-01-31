"use strict";

const createError = require("http-errors");
const database = require("../database");

const { verifyString } = require("./modelsHelper");

module.exports = {
  fetchAll: async () => {
    const client = await database.connect();

    const query = `
      SELECT
        id
        ,name
        ,example
        ,start_date
      FROM skills
    `;

    return client
      .query(query)
      .then(results => {
        client.release();

        if (!results.rowCount)
          return Promise.reject(createError(404, "No skills found"));

        return Promise.resolve(results.rows);
      })
      .catch(err => {
        return Promise.reject(
          createError(
            err.status || 500,
            err.message || `skills.fetchAll SQL Error: ${err}`
          )
        );
      });
  },
  create: async paramObj => {
    const { skills } = paramObj;

    if (!skills || (skills && (!Array.isArray(skills) || !skills.length)))
      return Promise.reject(
        createError(400, "Must provide an array of skills to create")
      );

    const client = await database.connect();
    let promiseArray = [];

    for (let i = 0; i < skills.length; i++) {
      const { name, example, start_date } = skills[i];

      const columns = ["name", "example", "start_date"];
      let values = [];

      if (!name || !verifyString(name)) {
        client.release();
        return Promise.reject(
          createError(
            400,
            "Name must be supplied for each skill and must be a string"
          )
        );
      } else values.push(name.toLowerCase());

      if (example && !verifyString(example)) {
        client.release();
        return Promise.reject(createError(400, "Example must be a string"));
      } else if (example) values.push(example);

      if (start_date && !verifyString(start_date)) {
        client.release();
        return Promise.reject(createError(400, "Start date must be a string"));
      } else if (start_date) values.push(start_date);

      const query = `
        INSERT INTO skills (${columns.slice(0, values.length).join(",")})
        VALUES (${values.map((_, idx) => `$${idx + 1}`).join(",")})
        RETURNING id, name, example, start_date
      `;

      promiseArray.push(client.query(query, values));
    }

    return Promise.all(promiseArray)
      .then(results => {
        client.release();
        return results.reduce((acc, curr) => {
          acc.push(...curr.rows);
          return acc;
        }, []);
      })
      .then(results => Promise.resolve(results))
      .catch(err =>
        Promise.reject(
          createError(
            err.status || 500,
            err.message || `skills.create SQL Error: ${err}`
          )
        )
      );
  }
};

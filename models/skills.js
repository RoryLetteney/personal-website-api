"use strict";

const createError = require("http-errors");
const database = require("../database");

const { verifyString, verifyNumber } = require("./modelsHelper");

module.exports = {
  fetchAll: async () => {
    const client = await database.connect();

    const query = `
      SELECT
        id
        ,name
        ,example
        ,TO_CHAR(start_date :: DATE, 'YYYY-MM-DD') AS start_date
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
        RETURNING 
          id
          ,name
          ,example
          ,TO_CHAR(start_date :: DATE, 'YYYY-MM-DD') AS start_date
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
  },
  update: async paramObj => {
    const { id, name, example, start_date } = paramObj;

    if (id === null || id === undefined || !verifyNumber(id))
      return Promise.reject(createError(400, "Must provide a valid id"));

    if (
      (!name || !verifyString(name)) &&
      (!example || !verifyString(example)) &&
      (!start_date || !verifyString(start_date))
    )
      return Promise.reject(
        createError(
          400,
          "Must provide at least one of the parameters (name, example, start_date)"
        )
      );

    let nameClause = "";
    let exampleClause = "";
    let startDateClause = "";
    let values = [id];

    if (name) {
      nameClause = "name = $2";
      values.push(name);
    }
    if (example) {
      exampleClause = name ? ",example = $3" : "example = $2";
      values.push(example);
    }
    if (start_date) {
      startDateClause =
        name && example
          ? ",start_date = $4"
          : (name && !example) || (!name && example)
          ? ",start_date = $3"
          : "start_date = $2";
      values.push(start_date);
    }

    const query = `
      UPDATE skills
      SET ${nameClause}${exampleClause}${startDateClause}
      WHERE id = $1
      RETURNING
        id
        ,name
        ,example
        ,TO_CHAR(start_date :: DATE, 'YYYY-MM-DD') AS start_date
    `;

    const client = await database.connect();
    return client
      .query(query, values)
      .then(results => {
        client.release();

        if (!results.rowCount)
          return Promise.reject(createError(404, "Skill not found"));

        return Promise.resolve(results.rows);
      })
      .catch(err => {
        return Promise.reject(
          createError(
            err.status || 500,
            err.message || `skills.update SQL Error: ${err}`
          )
        );
      });
  },
  delete: async id => {
    if (id === null || id === undefined || !verifyNumber(id))
      return Promise.reject(
        createError(400, "ID must be supplied and must be a number")
      );

    let query = `
      DELETE FROM skills
      WHERE id = $1
    `;
    const values = [id];

    const client = await database.connect();
    await client
      .query(query, values)
      .then(results => {
        if (!results.rowCount)
          return Promise.reject(createError(404, "Skill not found"));

        query = `
          SELECT 
            id
            ,name
            ,example
            ,TO_CHAR(start_date :: DATE, 'YYYY-MM-DD') AS start_date
          FROM skills
        `;
      })
      .catch(err => {
        return Promise.reject(
          createError(
            err.status || 500,
            err.message || `skills.delete SQL Error: ${err}`
          )
        );
      });

    return client
      .query(query)
      .then(results => {
        if (!results.rowCount)
          return Promise.reject(createError(404, "No skills found"));

        return Promise.resolve(results.rows);
      })
      .catch(err => {
        return Promise.reject(
          createError(
            err.status || 500,
            err.message || `skills.delete SQL Error: ${err}`
          )
        );
      });
  }
};

"use strict";

const createError = require("http-errors");
const database = require("../database");

const { verifyString, verifyNumber } = require("./modelsHelper");

module.exports = {
  fetchAll: async () => {
    const client = await database.connect();

    const query = `
      SELECT
        S.id
        ,S.name
        ,S.example
        ,TO_CHAR(S.start_date :: DATE, 'YYYY-MM-DD') AS start_date
        ,ARRAY(
          SELECT T.name
          FROM tags T
          LEFT JOIN skills_tags_assignments STA
            ON STA.tag_id = T.id
            AND STA.skill_id = S.id
          WHERE STA.skill_id = S.id
        ) AS tags
      FROM skills S
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
    const newSkillIds = [];

    for (let i = 0; i < skills.length; i++) {
      const { name, example, start_date, tag_ids } = skills[i];

      const columns = ["name", "example", "start_date"];
      let valuesSkills = [];

      if (!name || !verifyString(name)) {
        client.release();
        return Promise.reject(
          createError(
            400,
            "Name must be supplied for each skill and must be a string"
          )
        );
      } else valuesSkills.push(name.toLowerCase());

      if (example && !verifyString(example)) {
        client.release();
        return Promise.reject(createError(400, "Example must be a string"));
      } else if (example) valuesSkills.push(example);

      if (start_date && !verifyString(start_date)) {
        client.release();
        return Promise.reject(createError(400, "Start date must be a string"));
      } else if (start_date) valuesSkills.push(start_date);

      const querySkills = `
        INSERT INTO skills (${columns.slice(0, valuesSkills.length).join(",")})
        VALUES (${valuesSkills.map((_, idx) => `$${idx + 1}`).join(",")})
        RETURNING id
      `;

      await client
        .query(querySkills, valuesSkills)
        .then(results => {
          const skillId = results.rows[0].id;
          newSkillIds.push(skillId);

          let valuesSkillsTagsAssignments = [];
          let splitTagIds = tag_ids
            ? tag_ids.split(",").map(ti => parseInt(ti))
            : null;
          if (splitTagIds) {
            let querySkillsTagsAssignments = `
              INSERT INTO skills_tags_assignments (skill_id, tag_id)
              VALUES 
            `;

            for (let s = 0; s < splitTagIds.length; s++) {
              valuesSkillsTagsAssignments.push(skillId, splitTagIds[s]);
              querySkillsTagsAssignments += `($${valuesSkillsTagsAssignments.length -
                1},$${valuesSkillsTagsAssignments.length}),`;
            }

            return client.query(
              querySkillsTagsAssignments.slice(0, -1),
              valuesSkillsTagsAssignments
            );
          }
        })
        .catch(err => {
          return Promise.reject(
            createError(
              err.status || 500,
              err.message || `skills.create SQL Error: ${err}`
            )
          );
        });
    }

    const queryReturn = `
      SELECT
        S.id
        ,S.name
        ,S.example
        ,TO_CHAR(S.start_date :: DATE, 'YYYY-MM-DD') AS start_date
        ,ARRAY(
          SELECT T.name
          FROM tags T
          LEFT JOIN skills_tags_assignments STA
            ON STA.tag_id = T.id
            AND STA.skill_id = S.id
          WHERE STA.skill_id = S.id
        ) AS tags
      FROM skills S
      WHERE S.id IN (${newSkillIds.map((_, idx) => `$${idx + 1}`).join(",")})
    `;
    const valuesReturn = newSkillIds;

    return client
      .query(queryReturn, valuesReturn)
      .then(results => {
        client.release();
        return Promise.resolve(results.rows);
      })
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
    const { id, name, example, start_date, add_tag_ids } = paramObj;

    if (id === null || id === undefined || !verifyNumber(id))
      return Promise.reject(createError(400, "Must provide a valid id"));

    if (
      (!name || !verifyString(name)) &&
      (!example || !verifyString(example)) &&
      (!start_date || !verifyString(start_date)) &&
      (!add_tag_ids || !verifyString(add_tag_ids))
    )
      return Promise.reject(
        createError(
          400,
          "Must provide at least one of the parameters (name, example, start_date, add_tag_ids)"
        )
      );

    let nameClause = "";
    let exampleClause = "";
    let startDateClause = "";
    let valuesSkills = [id];

    if (name) {
      nameClause = "name = $2";
      valuesSkills.push(name);
    }
    if (example) {
      exampleClause = name ? ",example = $3" : "example = $2";
      valuesSkills.push(example);
    }
    if (start_date) {
      startDateClause =
        name && example
          ? ",start_date = $4"
          : (name && !example) || (!name && example)
          ? ",start_date = $3"
          : "start_date = $2";
      valuesSkills.push(start_date);
    }

    const querySkills = `
      UPDATE skills
      SET ${nameClause}${exampleClause}${startDateClause}
      WHERE id = $1
    `;

    const client = await database.connect();

    await client
      .query(querySkills, valuesSkills)
      .then(() => {
        let valuesSkillsTagsAssignments = [];
        let splitAddTagIds = add_tag_ids
          ? add_tag_ids.split(",").map(ti => parseInt(ti))
          : null;
        if (splitAddTagIds) {
          let querySkillsTagsAssignments = `
            INSERT INTO skills_tags_assignments (skill_id, tag_id)
            VALUES 
          `;

          for (let s = 0; s < splitAddTagIds.length; s++) {
            valuesSkillsTagsAssignments.push(id, splitAddTagIds[s]);
            querySkillsTagsAssignments += `($${valuesSkillsTagsAssignments.length -
              1},$${valuesSkillsTagsAssignments.length}),`;
          }

          return client.query(
            querySkillsTagsAssignments.slice(0, -1),
            valuesSkillsTagsAssignments
          );
        }
      })
      .catch(err => {
        return Promise.reject(
          createError(
            err.status || 500,
            err.message || `skills.create SQL Error: ${err}`
          )
        );
      });

    const queryReturn = `
        SELECT
          S.id
          ,S.name
          ,S.example
          ,TO_CHAR(S.start_date :: DATE, 'YYYY-MM-DD') AS start_date
          ,ARRAY(
            SELECT T.name
            FROM tags T
            LEFT JOIN skills_tags_assignments STA
              ON STA.tag_id = T.id
              AND STA.skill_id = S.id
            WHERE STA.skill_id = S.id
          ) AS tags
        FROM skills S
        WHERE S.id = $1
      `;
    const valuesReturn = [id];

    return client
      .query(queryReturn, valuesReturn)
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

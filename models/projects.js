"use strict";

const createError = require("http-errors");
const database = require("../database");

const { verifyString, verifyCSL } = require("./modelsHelper");

module.exports = {
  create: async paramObj => {
    const {
      name,
      description,
      start_date,
      end_date,
      skill_ids,
      tag_ids
    } = paramObj;

    if (!name || !verifyString(name))
      return Promise.reject(
        createError(400, "Name must be provided and must be a string")
      );

    if (!description || !verifyString(description))
      return Promise.reject(
        createError(400, "Description must be provided and must be a string")
      );

    let valuesProjects = [name, description];
    let columnsToInsert = "name, description";

    if (skill_ids && (!verifyString(skill_ids) || !verifyCSL(skill_ids)))
      return Promise.reject(
        createError(400, "Skill ids must be a comma separated list of ids")
      );

    if (tag_ids && (!verifyString(tag_ids) || !verifyCSL(tag_ids)))
      return Promise.reject(
        createError(400, "Tag ids must be a comma separated list of ids")
      );

    if (start_date && !verifyString(start_date))
      return Promise.reject(createError(400, "Start date must be a string"));
    else if (start_date && verifyString(start_date)) {
      valuesProjects.push(start_date);
      columnsToInsert += ", start_date";
    }

    if (end_date && !verifyString(end_date))
      return Promise.reject(createError(400, "End date must be a string"));
    else if (end_date && verifyString(end_date)) {
      valuesProjects.push(end_date);
      columnsToInsert += ", end_date";
    }

    const queryProjects = `
      INSERT INTO projects (${columnsToInsert})
      VALUES (${valuesProjects.map((_, idx) => `$${idx + 1}`).join(",")})
      RETURNING id
    `;

    let newProjectId;

    const client = await database.connect();
    await client
      .query(queryProjects, valuesProjects)
      .then(result => (newProjectId = result.rows[0].id))
      .catch(err => {
        return Promise.reject(
          createError(
            err.status || 500,
            err.message || `projects.create projects SQL ERROR: ${err}`
          )
        );
      });

    const listOfSkillAssignments = skill_ids.split(",").map(si => parseInt(si));
    const queryProjectsSkillsAssignments = `
      INSERT INTO projects_skills_assignments (project_id, skill_id)
      VALUES ${listOfSkillAssignments
        .map((_, idx) => `(${newProjectId}, $${idx + 1})`)
        .join(",")}
    `;
    const valuesProjectsSkillsAssignments = listOfSkillAssignments;

    await client
      .query(queryProjectsSkillsAssignments, valuesProjectsSkillsAssignments)
      .catch(err => {
        return Promise.reject(
          createError(
            err.status || 500,
            err.message || `projects.create projects_skills SQL ERROR: ${err}`
          )
        );
      });

    const listOfTagAssignments = tag_ids.split(",").map(ti => parseInt(ti));
    const queryProjectsTagsAssignments = `
      INSERT INTO projects_tags_assignments (project_id, tag_id)
      VALUES ${listOfTagAssignments
        .map((_, idx) => `(${newProjectId}, $${idx + 1})`)
        .join(",")}
    `;
    const valuesProjectsTagsAssignments = listOfTagAssignments;

    await client
      .query(queryProjectsTagsAssignments, valuesProjectsTagsAssignments)
      .catch(err => {
        return Promise.reject(
          createError(
            err.status || 500,
            err.message || `projects.create projects_tags SQL ERROR: ${err}`
          )
        );
      });

    const queryReturn = `
      SELECT
        P.id
        ,P.name
        ,P.description
        ,TO_CHAR(P.start_date :: DATE, 'YYYY-MM-DD') AS start_date
        ,TO_CHAR(P.end_date :: DATE, 'YYYY-MM-DD') AS end_date
        ,ARRAY(
          SELECT name
          FROM skills S
          LEFT JOIN projects_skills_assignments PSA
            ON PSA.skill_id = S.id
          WHERE PSA.project_id = $1
        ) AS skills
        ,ARRAY(
        	SELECT distinct tag_names.name
        	FROM (
        		SELECT T.name
        		FROM tags T
        		LEFT JOIN projects_tags_assignments PTA
        			ON PTA.tag_id = T.id 
        		WHERE PTA.project_id = $2
        		UNION
        		SELECT T.name
        		FROM tags T
        		LEFT JOIN skills_tags_assignments STA
        			ON STA.tag_id = T.id
        		LEFT JOIN projects_skills_assignments PSA
        			ON PSA.skill_id = STA.skill_id
        		WHERE PSA.project_id = $3
        	) AS tag_names
        ) AS tags
      FROM projects P
      WHERE P.id = $4
    `;
    const valuesReturn = new Array(4).fill(newProjectId);

    return client
      .query(queryReturn, valuesReturn)
      .then(result => {
        client.release();
        return Promise.resolve(result.rows);
      })
      .catch(err => {
        return Promise.reject(
          createError(
            err.status || 500,
            err.message || `projects.create return SQL ERROR: ${err}`
          )
        );
      });
  }
};

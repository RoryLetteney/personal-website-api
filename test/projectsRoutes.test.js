"use strict";

const app = require("../server");
const request = require("supertest")(app);
const { expect } = require("chai");

const testHelpers = require("./testHelpers");

describe.only("projects-routes", () => {
  describe("POST /api/projects", () => {
    let createdProjectIds;
    let createdTagIds = [];
    let createdSkillIds;

    before(async () => {
      await request
        .post("/api/tags")
        .send({ name: "test-tag-1" })
        .then(res => {
          createdTagIds.push(JSON.parse(res.text)[0].id);
        });
      await request
        .post("/api/tags")
        .send({ name: "test-tag-2" })
        .then(res => {
          createdTagIds.push(JSON.parse(res.text)[0].id);
        });
      await request
        .post("/api/tags")
        .send({ name: "test-tag-3" })
        .then(res => {
          createdTagIds.push(JSON.parse(res.text)[0].id);
        });
      return request
        .post("/api/skills")
        .send({
          skills: [
            {
              name: "test-skill-1",
              tag_ids: `${createdTagIds[0]}`
            },
            { name: "test-skill-2", tag_ids: createdTagIds.slice(1).join(",") },
            { name: "test-skill-3" }
          ]
        })
        .then(res => {
          createdSkillIds = JSON.parse(res.text).map(s => s.id);
        });
    });

    after(() => {
      testHelpers.tags.cleanup.create(createdTagIds);
      testHelpers.skills.cleanup.create(createdSkillIds);
      return testHelpers.projects.cleanup.create(createdProjectIds);
    });
  });
});

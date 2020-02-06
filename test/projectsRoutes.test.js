"use strict";

const app = require("../server");
const request = require("supertest")(app);
const { expect } = require("chai");
const moment = require("moment");

const testHelpers = require("./testHelpers");

describe.only("projects-routes", () => {
  describe("POST /api/projects", () => {
    let createdProjectIds = [];
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
            { name: "test-skill-2", tag_ids: `${createdTagIds[1]}` },
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

    it("should return 200 and the newly created project", () => {
      return request
        .post("/api/projects")
        .send({
          name: "test-project-1",
          description: "This is a test project.",
          start_date: "2020-02-06",
          end_date: "2020-02-20",
          tag_ids: `${createdTagIds[2]}`,
          skill_ids: createdSkillIds.join(",")
        })
        .expect(200)
        .expect(res => {
          expect(res.text).to.be.a("string");

          const response = JSON.parse(res.text);
          createdProjectIds.push(response[0].id);

          expect(response).to.be.an("array");
          expect(response[0]).to.be.an("object");
          expect(response[0]).to.have.own.property("id");
          expect(response[0])
            .to.have.own.property("name")
            .and.to.equal("test-project-1");
          expect(response[0])
            .to.have.own.property("description")
            .and.to.equal("This is a test project.");
          expect(response[0])
            .to.have.own.property("start_date")
            .and.to.equal("2020-02-06");
          expect(response[0])
            .to.have.own.property("end_date")
            .and.to.equal("2020-02-20");
          expect(response[0])
            .to.have.own.property("tags")
            .and.to.have.lengthOf(3)
            .and.to.deep.equal(["test-tag-1", "test-tag-2", "test-tag-3"]);
          expect(response[0])
            .to.have.own.property("skills")
            .and.to.have.lengthOf(3)
            .and.to.deep.equal([
              "test-skill-1",
              "test-skill-2",
              "test-skill-3"
            ]);
        });
    });

    it("should return 200 and the newly created project with only the necessary information", () => {
      return request
        .post("/api/projects")
        .send({
          name: "test-project-2",
          description: "This is a test project."
        })
        .expect(200)
        .expect(res => {
          expect(res.text).to.be.a("string");

          const response = JSON.parse(res.text);
          createdProjectIds.push(response[0].id);

          expect(response).to.be.an("array");
          expect(response[0]).to.be.an("object");
          expect(response[0]).to.have.own.property("id");
          expect(response[0])
            .to.have.own.property("name")
            .and.to.equal("test-project-2");
          expect(response[0])
            .to.have.own.property("description")
            .and.to.equal("This is a test project.");
          expect(response[0])
            .to.have.own.property("start_date")
            .and.to.equal(moment().format("YYYY-MM-DD"));
          expect(response[0])
            .to.have.own.property("end_date")
            .and.to.equal(null);
          expect(response[0])
            .to.have.own.property("tags")
            .and.to.have.lengthOf(0);
          expect(response[0])
            .to.have.own.property("skills")
            .and.to.have.lengthOf(0);
        });
    });

    it("should return 400 if no name sent", () => {
      return request
        .post("/api/projects")
        .send({
          description: "This is a test project."
        })
        .expect(400)
        .expect(res => {
          expect(res.text).to.be.a("string");

          const response = JSON.parse(res.text);

          expect(response).to.be.an("object");
          expect(response)
            .to.have.own.property("error")
            .and.to.be.an("object");
          expect(response.error)
            .to.have.own.property("status")
            .and.to.equal(400);
          expect(response.error)
            .to.have.own.property("message")
            .and.to.be.a("string");
        });
    });

    it("should return 400 if no description sent", () => {
      return request
        .post("/api/projects")
        .send({
          name: "test-project-3"
        })
        .expect(400)
        .expect(res => {
          expect(res.text).to.be.a("string");

          const response = JSON.parse(res.text);

          expect(response).to.be.an("object");
          expect(response)
            .to.have.own.property("error")
            .and.to.be.an("object");
          expect(response.error)
            .to.have.own.property("status")
            .and.to.equal(400);
          expect(response.error)
            .to.have.own.property("message")
            .and.to.be.a("string");
        });
    });
  });
});

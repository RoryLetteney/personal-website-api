"use strict";

const app = require("../server");
const request = require("supertest")(app);
const { expect } = require("chai");

const testHelpers = require("./testHelpers");

describe("skills-routes", () => {
  describe("POST /api/skills", () => {
    let createdSkillIds;

    after(() => {
      return testHelpers.skills.cleanup.create(createdSkillIds);
    });

    it("should return status 200 and newly created skills", () => {
      return request
        .post("/api/skills")
        .send({
          skills: [
            {
              name: "test-skill-1",
              example: "test-example-1",
              start_date: "2015-01-01"
            },
            {
              name: "test-skill-2",
              example: "test-example-2"
            },
            {
              name: "test-skill-3",
              start_date: "2015-01-01"
            },
            {
              name: "test-skill-4"
            }
          ]
        })
        .expect(200)
        .expect(res => {
          expect(res.text).to.be.a("string");

          const response = JSON.parse(res.text);

          expect(response).to.be.an("array");
          expect(response[0]).to.be.an("object");
          expect(response[0]).to.have.own.property("id");
          expect(response[0]).to.have.own.property("name");
          expect(response[0]).to.have.own.property("example");
          expect(response[0]).to.have.own.property("start_date");

          createdSkillIds = response.map(i => i.id);
        });
    });

    it("should return status 400 and a helpful message when no list of skills sent", () => {
      return request
        .post("/api/skills")
        .send({})
        .expect(400)
        .expect(res => {
          expect(res.text).to.be.a("string");

          const response = JSON.parse(res.text);

          expect(response).to.be.an("object");
          expect(response).to.have.own.property("error");
          expect(response.error)
            .to.have.own.property("status")
            .and.to.equal(400);
          expect(response.error)
            .to.have.own.property("message")
            .and.to.be.a("string");
        });
    });

    it("should return status 400 and a helpful message when no name sent", () => {
      return request
        .post("/api/skills")
        .send({
          skills: [
            {
              example: "test-example",
              start_date: "2015-01-01"
            }
          ]
        })
        .expect(400)
        .expect(res => {
          expect(res.text).to.be.a("string");

          const response = JSON.parse(res.text);

          expect(response).to.be.an("object");
          expect(response).to.have.own.property("error");
          expect(response.error)
            .to.have.own.property("status")
            .and.to.equal(400);
          expect(response.error)
            .to.have.own.property("message")
            .and.to.be.a("string");
        });
    });
  });

  describe.only("GET /api/skills", () => {
    let createdSkills;

    before(() => {
      return request
        .post("/api/skills")
        .send({
          skills: [
            {
              name: "test-skill-1"
            },
            { name: "test-skill-2" },
            { name: "test-skill-3" }
          ]
        })
        .then(res => {
          createdSkills = JSON.parse(res.text);
        });
    });

    afterEach(() => {
      return testHelpers.skills.cleanup.create(createdSkills.map(cs => cs.id));
    });

    it("should return 200 and a list of the skills", () => {
      return request
        .get("/api/skills")
        .expect(200)
        .expect(res => {
          expect(res.text).to.be.a("string");

          const response = JSON.parse(res.text);

          expect(response)
            .to.be.an("array")
            .and.lengthOf.at.least(3);
          expect(response[0]).to.be.an("object");
          expect(response[0]).to.have.own.property("id");
          expect(response[0]).to.have.own.property("name");
          expect(response[0]).to.have.own.property("example");
          expect(response[0]).to.have.own.property("start_date");
        });
    });

    it("should return 404 if no skills found", () => {
      return request
        .get("/api/skills")
        .expect(404)
        .expect(res => {
          expect(res.text).to.be.a("string");

          const response = JSON.parse(res.text);

          expect(response).to.be.an("object");
          expect(response).to.have.own.property("error");
          expect(response.error)
            .to.have.own.property("status")
            .and.to.equal(404);
          expect(response.error)
            .to.have.own.property("message")
            .and.to.be.a("string");
        });
    });
  });
});

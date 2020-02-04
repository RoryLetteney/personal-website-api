"use strict";

const app = require("../server");
const request = require("supertest")(app);
const { expect } = require("chai");

const testHelpers = require("./testHelpers");

describe("skills-routes", () => {
  describe("POST /api/skills", () => {
    let createdSkillIds;
    let createdTagIds = [];

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
      return request
        .post("/api/tags")
        .send({ name: "test-tag-3" })
        .then(res => {
          createdTagIds.push(JSON.parse(res.text)[0].id);
        });
    });

    after(() => {
      testHelpers.tags.cleanup.create(createdTagIds);
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
              name: "test-skill-4",
              tag_ids: createdTagIds.slice(0, 2).join(",")
            }
          ]
        })
        .expect(200)
        .expect(res => {
          expect(res.text).to.be.a("string");

          const response = JSON.parse(res.text);
          createdSkillIds = response.map(i => i.id);

          expect(response).to.be.an("array");
          expect(response[0]).to.be.an("object");
          expect(response[0]).to.have.own.property("id");
          expect(response[0]).to.have.own.property("name");
          expect(response[0]).to.have.own.property("example");
          expect(response[0]).to.have.own.property("start_date");
          expect(response[0])
            .to.have.own.property("tags")
            .and.to.be.an("array")
            .and.to.have.lengthOf(0);
          expect(response[3])
            .to.have.own.property("tags")
            .and.to.deep.equal(["test-tag-1", "test-tag-2"]);
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

  describe("GET /api/skills", () => {
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
      return request.get("/api/skills").expect(res => {
        expect(res.text).to.be.a("string");

        const response = JSON.parse(res.text);

        if (typeof response === "object") {
          expect(response).to.be.an("object");
          expect(response).to.have.own.property("error");
          expect(response.error)
            .to.have.own.property("status")
            .and.to.equal(404);
          expect(response.error)
            .to.have.own.property("message")
            .and.to.be.a("string");
        }
      });
    });
  });

  describe("PUT /api/skills/:id", () => {
    let createdSkillId;

    before(() => {
      return request
        .post("/api/skills")
        .send({
          skills: [{ name: "test-skill-1" }]
        })
        .then(res => (createdSkillId = JSON.parse(res.text)[0].id));
    });

    after(() => {
      return testHelpers.skills.cleanup.create([createdSkillId]);
    });

    it("should return 200 and updated skill", () => {
      return request
        .put(`/api/skills/${createdSkillId}`)
        .send({
          name: "test-skill-1-updated",
          example: "test-example-1",
          start_date: "2015-01-01"
        })
        .expect(200)
        .expect(res => {
          expect(res.text).to.be.a("string");

          const response = JSON.parse(res.text);

          expect(response).to.be.an("array");
          expect(response[0]).to.be.an("object");
          expect(response[0])
            .to.have.own.property("id")
            .and.to.equal(createdSkillId);
          expect(response[0])
            .to.have.own.property("name")
            .and.to.equal("test-skill-1-updated");
          expect(response[0])
            .to.have.own.property("example")
            .and.to.equal("test-example-1");
          expect(response[0])
            .to.have.own.property("start_date")
            .and.to.equal("2015-01-01");
        });
    });

    it("should return 400 if sent an invalid id", () => {
      return request
        .put("/api/skills/invalid")
        .send({
          name: "test-skill-1-updated",
          example: "test-example-1",
          start_date: "2015-01-01"
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

    it("should return 400 if no parameters sent to update", () => {
      return request
        .put(`/api/skills/${createdSkillId}`)
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

    it("should return 404 if sent an id of a row that isn't found", () => {
      return request
        .put("/api/skills/0")
        .send({
          name: "test-skill-1-updated",
          example: "test-example-1",
          start_date: "2015-01-01"
        })
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

  describe("DELETE /api/skills/:id", () => {
    let createdSkillId;

    before(() => {
      return request
        .post("/api/skills")
        .send({ skills: [{ name: "test-skill-1" }] })
        .then(res => (createdSkillId = JSON.parse(res.text)[0].id));
    });

    it("should return 200 and list of the remaining skills", () => {
      return request.delete(`/api/skills/${createdSkillId}`).expect(res => {
        expect(res.text).to.be.a("string");

        const response = JSON.parse(res.text);

        if (Array.isArray(response)) {
          expect(res.status).to.equal(200);
          expect(response).to.be.an("array");
          expect(response[0]).to.be.an("object");
          expect(response[0]).to.have.own.property("id");
          expect(response[0]).to.have.own.property("name");
          expect(response[0]).to.have.own.property("example");
          expect(response[0]).to.have.own.property("start_date");
        } else if (typeof response === "object") {
          expect(res.status).to.equal(404);
          expect(response).to.be.an("object");
          expect(response).to.have.own.property("error");
          expect(response.error)
            .to.have.own.property("status")
            .and.to.equal(404);
          expect(response.error)
            .to.have.own.property("message")
            .and.to.be.a("string");
        }
      });
    });

    it("should return 400 if sent an invalid id", () => {
      return request
        .delete("/api/skills/invalid")
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

    it("should return 404 if sent an id of a row that isn't found", () => {
      return request
        .delete("/api/skills/0")
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

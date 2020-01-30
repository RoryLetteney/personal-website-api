"use strict";

const app = require("../server");
const request = require("supertest")(app);
const { expect } = require("chai");

const testHelpers = require("./testHelpers");

describe("skills-routes", () => {
  let createdSkillId;

  after(() => {
    return testHelpers.skills.cleanup.create(createdSkillId);
  });

  describe("POST /api/skills", () => {
    it("should return status 200 and newly created tag", () => {
      return request
        .post("/api/skills")
        .send({
          name: "test-skill",
          example: "test-example",
          start_date: "2015-01-01"
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

          createdSkillId = response[0].id;
        });
    });

    it("should return status 400 and a helpful message when no name sent", () => {
      return request
        .post("/api/skills")
        .send({
          example: "test-example",
          start_date: "2015-01-01"
        })
        .expect(400)
        .expect(res => {
          expect(res.text).to.be.a("string");

          const response = JSON.parse(res.text);

          expect(response).to.be.an("object");
          expect(response).to.have.own.property("error");
          expect(response.error).to.have.own.property("status");
          expect(response.error).to.have.own.property("message");
        });
    });
  });
});

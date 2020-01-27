"use strict";

const app = require("../server");
const request = require("supertest")(app);
const { expect } = require("chai");

const testHelpers = require("./testHelpers");

describe("tags-routes", () => {
  after(() => {
    return testHelpers.tags.cleanup.create();
  });

  describe("POST /api/tags", () => {
    it("should return status 200 and newly created tag", () => {
      return request
        .post("/api/tags")
        .send({ name: "test-tag" })
        .expect(200)
        .expect(res => {
          expect(res.text).to.be.a("string");

          const response = JSON.parse(res.text);

          expect(response).to.be.an("array");
          expect(response[0]).to.be.an("object");
          expect(response[0]).to.have.own.property("id");
          expect(response[0]).to.have.own.property("name");
        });
    });

    it("should return status 400 and helpful message when no name sent", () => {
      return request
        .post("/api/tags")
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
          expect(response.error).to.have.own.property("message");
        });
    });
  });

  describe("GET /api/tags", () => {
    it("should return status 200 and a list of tags", () => {
      return request
        .get("/api/tags")
        .expect(200)
        .expect(res => {
          expect(res.text).to.be.a("string");

          const response = JSON.parse(res.text);

          expect(response).to.be.an("array");
          expect(response[0]).to.be.an("object");
          expect(response[0]).to.have.own.property("id");
          expect(response[0]).to.have.own.property("name");
        });
    });
  });
});

"use strict";

const app = require("../server");
const request = require("supertest")(app);
const { expect } = require("chai");

const testHelpers = require("./testHelpers");

describe("tags-routes", () => {
  describe("POST /api/tags", () => {
    after(() => {
      return testHelpers.tags.cleanup.create();
    });

    it("should return status 200 and newly created tag", () => {
      return request
        .post("/api/tags")
        .send({ name: "test-tag" })
        .expect(200)
        .expect(res => {
          expect(typeof res.text).to.be.a("string");
          expect(JSON.parse(res.text)).to.be.an("array");
          expect(JSON.parse(res.text)[0]).to.have.own.property("id");
          expect(JSON.parse(res.text)[0]).to.have.own.property("name");
        });
    });
  });
});

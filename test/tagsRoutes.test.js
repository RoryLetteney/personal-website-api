"use strict";

const app = require("../server");
const request = require("supertest")(app);
const { expect } = require("chai");

const testHelpers = require("./testHelpers");

describe("tags-routes", () => {
  let createdTagId;

  after(() => {
    return testHelpers.tags.cleanup.create(createdTagId);
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

          createdTagId = response[0].id;
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

  describe("PUT /api/tags/:id", () => {
    it("should return status 200 and the updated tag", () => {
      return request
        .put(`/api/tags/${createdTagId}`)
        .send({ name: "test-tag-update" })
        .expect(200)
        .expect(res => {
          expect(res.text).to.be.a("string");

          const response = JSON.parse(res.text);

          expect(response).to.be.an("array");
          expect(response[0]).to.be.an("object");
          expect(response[0]).to.have.own.property("id");
          expect(response[0]).to.have.own.property("name");
          expect(response[0].id).to.equal(createdTagId);
          expect(response[0].name).to.equal("test-tag-update");
        });
    });

    it("should return status 400 when no name sent", () => {
      return request
        .put(`/api/tags/${createdTagId}`)
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

    it("should return status 400 when no id sent", () => {
      return request
        .put(`/api/tags/null`)
        .send({ name: "test-tag-update" })
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

    it("should return status 500 when the tag to update is not found", () => {
      return request
        .put("/api/tags/0")
        .send({ name: "test-tag-update" })
        .expect(500)
        .expect(res => {
          expect(res.text).to.be.a("string");

          const response = JSON.parse(res.text);

          expect(response).to.be.an("object");
          expect(response).to.have.own.property("error");
          expect(response.error)
            .to.have.own.property("status")
            .and.to.equal(500);
          expect(response.error).to.have.own.property("message");
        });
    });
  });

  describe("DELETE /api/tags/:id", () => {
    let createdTagId;

    before(() => {
      return request
        .post("/api/tags")
        .send({ name: "test-tag-delete" })
        .then(res => {
          return (createdTagId = JSON.parse(res.text)[0].id);
        });
    });

    it("should return 200 and return the list of tags without the deleted tag", () => {
      return request
        .delete(`/api/tags/${createdTagId}`)
        .expect(200)
        .expect(res => {
          expect(res.text).to.be.a("string");

          const response = JSON.parse(res.text);

          expect(response).to.be.an("array");
          expect(response[0]).to.be.an("object");
          expect(response[0]).to.have.own.property("id");
          expect(response[0]).to.have.own.property("name");
          expect(response.findIndex(r => r.id === createdTagId)).to.equal(-1);
        });
    });

    it("should return status 400 when no id sent", () => {
      return request
        .delete(`/api/tags/null`)
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

    it("should return status 500 when the tag to delete is not found", () => {
      return request
        .delete("/api/tags/0")
        .expect(500)
        .expect(res => {
          expect(res.text).to.be.a("string");

          const response = JSON.parse(res.text);

          expect(response).to.be.an("object");
          expect(response).to.have.own.property("error");
          expect(response.error)
            .to.have.own.property("status")
            .and.to.equal(500);
          expect(response.error).to.have.own.property("message");
        });
    });
  });
});

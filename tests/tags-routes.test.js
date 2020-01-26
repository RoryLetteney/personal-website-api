"use strict";

const app = require("../server");
const request = require("supertest")(app);
const { expect } = require("jest");

describe("tags-routes", () => {
  describe("POST /api/tags", () => {
    it("should return status 200 and newly created tag", () => {
      return request
        .post("/api/tags")
        .send({ name: "javascript" })
        .expect(200)
        .expect(res => {
          expect(typeof res.text).toBe("string");
          expect(Array.isArray(JSON.parse(res.text))).toBe(true);
          expect(JSON.parse(res.text)[0].id).toBeDefined();
          expect(JSON.parse(res.text)[0].name).toBeDefined();
        });
    });
  });
});

"use strict";

const { Router } = require("express");
const router = (module.exports = new Router());
const jsonParser = require("body-parser").json();

const tags = require("../models/tags");

/**
 * @swagger
 *
 * definitions:
 *   tags:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *       name:
 *         type: string
 *   error:
 *     type: object
 *     properties:
 *       error:
 *         type: object
 *         properties:
 *           status:
 *             type: integer
 *           message:
 *             type: string
 */

/**
 * @swagger
 * /api/tags:
 *   post:
 *     tags:
 *       - tags
 *     produces:
 *       - application/json
 *     description: Returns newly created tag
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         description: holds paramters to be entered
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: name of new tag
 *               required: true
 *     responses:
 *       200:
 *         description: success response
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/tags'
 *       400:
 *         description: bad request
 *         schema:
 *           $ref: '#/definitions/error'
 */

router.post("/api/tags", jsonParser, (req, res, next) => {
  return tags
    .create(req.body)
    .then(results => res.send(JSON.stringify(results)))
    .catch(next);
});

/**
 * @swagger
 * /api/tags:
 *   get:
 *     tags:
 *       - tags
 *     produces:
 *       - application/json
 *     description: Returns all tags in database
 *     responses:
 *       200:
 *         description: success response
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/tags'
 *       404:
 *         description: no tags found
 *         schema:
 *           $ref: '#/definitions/error'
 */

router.get("/api/tags", (req, res, next) => {
  return tags
    .fetchAll()
    .then(results => res.send(JSON.stringify(results)))
    .catch(next);
});

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

/**
 * @swagger
 * /api/tags/:id:
 *   put:
 *     tags:
 *       - tags
 *     produces:
 *       - application/json
 *     description: Update the name of the specified tag
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of tag
 *         required: true
 *         type: integer
 *       - name: body
 *         in: body
 *         description: holds new name value
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
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
 *       404:
 *         description: tag doesn't exist
 *         schema:
 *           $ref: '#/definitions/error'
 *
 */

router.put("/api/tags/:id", jsonParser, (req, res, next) => {
  req.body.id = req.params.id;
  return tags
    .update(req.body)
    .then(results => res.send(JSON.stringify(results)))
    .catch(next);
});

/**
 * @swagger
 * /api/tags/:id:
 *   delete:
 *     tags:
 *       - tags
 *     produces:
 *       - application/json
 *     description: Deletes the tag with the specified ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
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
 *       404:
 *         description: tag doesn't exist
 *         schema:
 *           $ref: '#/definitions/error'
 *
 */

router.delete("/api/tags/:id", (req, res, next) => {
  return tags
    .delete(req.params.id)
    .then(results => res.send(JSON.stringify(results)))
    .catch(next);
});

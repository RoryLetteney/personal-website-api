"use strict";

const { Router } = require("express");
const router = (module.exports = new Router());
const jsonParser = require("body-parser").json();

const skills = require("../models/skills");

/**
 * @swagger
 *
 * definitions:
 *   skills:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *       name:
 *         type: string
 *       example:
 *         type: string
 *       start_date:
 *         type: string
 *       tags:
 *         type: array
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
 *
 */

/**
 * @swagger
 * /api/skills:
 *   post:
 *     tags:
 *       - skills
 *     produces:
 *       - application/json
 *     description: Returns newly created skills
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         description: holds parameters to be entered
 *         schema:
 *           type: object
 *           properties:
 *             skills:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     required: true
 *                   example:
 *                     type: string
 *                     required: false
 *                     description: short example of skill use
 *                   start_date:
 *                     type: string
 *                     required: false
 *                     description: date skill was acquired, formatted YYYY-MM-DD
 *                   tag_ids:
 *                     type: string
 *                     required: false
 *                     description: comma separated list of tag ids
 *     responses:
 *       200:
 *         description: success response
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/skills'
 *       400:
 *         description: bad request
 *         schema:
 *           $ref: '#/definitions/error'
 */

router.post("/api/skills", jsonParser, (req, res, next) => {
  return skills
    .create(req.body)
    .then(results => res.send(JSON.stringify(results)))
    .catch(next);
});

/**
 * @swagger
 * /api/skills:
 *   get:
 *     tags:
 *       - skills
 *     produces:
 *       - application/json
 *     description: Returns list of all skills
 *     responses:
 *       200:
 *         description: success response
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/skills'
 *       404:
 *         description: no skills found
 *         schema:
 *           $ref: '#/definitions/error'
 *
 */

router.get("/api/skills", (req, res, next) => {
  return skills
    .fetchAll()
    .then(results => res.send(JSON.stringify(results)))
    .catch(next);
});

/**
 * @swagger
 * /api/skills/:id:
 *   put:
 *     tags:
 *       - skills
 *     produces:
 *       - application/json
 *     description: Updates the specified skill and returns the updated row
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: id of skill to update
 *       - name: body
 *         in: body
 *         required: true
 *         description: Holds parameters to be entered. Results in 400 if no parameters sent.
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               required: false
 *             example:
 *               type: string
 *               required: false
 *             start_date:
 *               type: string
 *               required: false
 *     responses:
 *       200:
 *         description: success response
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/skills'
 *       400:
 *         description: bad request
 *         schema:
 *           $ref: '#/definitions/error'
 *       404:
 *         description: no skills found
 *         schema:
 *           $ref: '#/definitions/error'
 *
 */

router.put("/api/skills/:id", jsonParser, (req, res, next) => {
  req.body.id = req.params.id;
  return skills
    .update(req.body)
    .then(results => res.send(JSON.stringify(results)))
    .catch(next);
});

/**
 * @swagger
 * /api/skills/:id:
 *   delete:
 *     tags:
 *       - skills
 *     produces:
 *       - application/json
 *     description: Deletes the specified skill and returns the remaining rows
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: id of skill to delete
 *     responses:
 *       200:
 *         description: success response
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/skills'
 *       400:
 *         description: bad request
 *         schema:
 *           $ref: '#/definitions/error'
 *       404:
 *         description: no skills found
 *         schema:
 *           $ref: '#/definitions/error'
 *
 */

router.delete("/api/skills/:id", (req, res, next) => {
  return skills
    .delete(req.params.id)
    .then(results => res.send(JSON.stringify(results)))
    .catch(next);
});

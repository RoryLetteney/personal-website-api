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

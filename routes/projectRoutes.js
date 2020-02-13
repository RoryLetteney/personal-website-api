"use strict";

const { Router } = require("express");
const router = (module.exports = new Router());
const jsonParser = require("body-parser").json();

const projects = require("../models/projects");

/**
 * @swagger
 * definitions:
 *   projects:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *       name:
 *         type: string
 *       description:
 *         type: string
 *       start_date:
 *         type: string
 *       end_date:
 *         type: string
 *       skills:
 *         type: array
 *         items:
 *           type: string
 *       tags:
 *         type: array
 *         items:
 *           type: string
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
 * /api/projects:
 *   post:
 *     tags:
 *       - projects
 *     produces:
 *       - application/json
 *     description: Returns newly created project
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               required: true
 *             description:
 *               type: string
 *               required: true
 *             start_date:
 *               type: string
 *               required: true
 *             end_date:
 *               type: string
 *               required: false
 *             skill_ids:
 *               type: string
 *               description: Comma separated list of skill ids
 *               required: true
 *             tag_ids:
 *               type: string
 *               description: Comma separated list of tag ids
 *               required: true
 *     responses:
 *       200:
 *         description: success response
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/projects'
 *       400:
 *         description: bad request
 *         schema:
 *           $ref: '#/definitions/error'
 */

router.post("/api/projects", jsonParser, (req, res, next) => {
  return projects
    .create(req.body)
    .then(result => res.send(JSON.stringify(result)))
    .catch(next);
});

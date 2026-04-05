'use strict';

const { validationResult } = require('express-validator');
const { badRequest }       = require('../utils/response');

/**
 * Place this after express-validator chain definitions.
 * If any validation failed, it responds with 400 + error list.
 * Otherwise calls next().
 */
function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => e.msg);
    return badRequest(res, 'Validation failed.', errors);
  }
  next();
}

module.exports = validate;

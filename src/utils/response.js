'use strict';


function ok(res, payload = {}, status = 200) {
  return res.status(status).json({ success: true, ...payload });
}

function created(res, payload = {}) {
  return ok(res, payload, 201);
}

function badRequest(res, message, errors = []) {
  const body = { success: false, message };
  if (errors.length) body.errors = errors;
  return res.status(400).json(body);
}

function unauthorized(res, message = 'Authentication required.') {
  return res.status(401).json({ success: false, message });
}

function forbidden(res, message = 'You do not have permission to perform this action.') {
  return res.status(403).json({ success: false, message });
}

function notFound(res, message = 'Resource not found.') {
  return res.status(404).json({ success: false, message });
}

function conflict(res, message) {
  return res.status(409).json({ success: false, message });
}

function serverError(res, message = 'Internal server error.') {
  return res.status(500).json({ success: false, message });
}

module.exports = { ok, created, badRequest, unauthorized, forbidden, notFound, conflict, serverError };

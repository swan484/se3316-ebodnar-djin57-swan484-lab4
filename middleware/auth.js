const jwt = require('jsonwebtoken')
const {SECRET_TOKEN} = require('./config')

/**
 * Middleware for verifying token
 */
const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers.authorization || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, SECRET_TOKEN);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;
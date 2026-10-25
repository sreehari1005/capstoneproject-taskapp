/**
 * Basic protection against NoSQL operator injection.
 * Removes keys that start with "$" or contain "." from body, params and query,
 * so input like { "email": { "$gt": "" } } can never reach a MongoDB query as an operator.
 */
function clean(value) {
  if (Array.isArray(value)) {
    value.forEach(clean);
  } else if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete value[key];
      } else {
        clean(value[key]);
      }
    }
  }
  return value;
}

module.exports = (req, res, next) => {
  clean(req.body);
  clean(req.params);
  clean(req.query);
  next();
};

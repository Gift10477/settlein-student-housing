const router = require('express').Router();
// One transformation, with the same query, database, validation and errors as v1.
const toV2 = rows => ({ data: rows, count: rows.length });
router.get('/', (req, res, next) => {
  const json = res.json;
  res.json = function (body) {
    return json.call(this, this.statusCode === 200 && Array.isArray(body) ? toV2(body) : body);
  };
  next();
});
router.use(require('./routes/properties'));
module.exports = router;

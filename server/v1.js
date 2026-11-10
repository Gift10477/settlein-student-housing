// FROZEN: existing handlers live in routes/properties.js and are reused unchanged.
const router = require('express').Router();
const { deprecated } = require('./deprecate');
const old = deprecated({ sunset: '2026-11-13', successor: '/api/v2/properties' });
// Only the list contract is deprecated. Unknown paths and other operations are not.
router.get('/', old);
router.use(require('./routes/properties'));
module.exports = router;

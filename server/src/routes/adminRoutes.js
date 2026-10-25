const router = require('express').Router();
const { listUsers } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/users', protect, authorize('admin'), listUsers);

module.exports = router;

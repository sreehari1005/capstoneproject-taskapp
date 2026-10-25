const router = require('express').Router();
const { listTasks, createTask, getTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect); // every task route needs a logged-in user

router.route('/').get(listTasks).post(createTask);
router.route('/:id').get(getTask).put(updateTask).patch(updateTask).delete(deleteTask);

module.exports = router;

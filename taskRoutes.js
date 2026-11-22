import { Router } from 'express';
import { createTask, deleteTask, getStats, getTask, listTasks, updateTask } from '../controllers/taskController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = Router();

router.use(requireAuth); // every task route needs a signed-in user

router.get('/stats', getStats); // must come before '/:id'
router.route('/').get(listTasks).post(createTask);
router.route('/:id').all(validateObjectId).get(getTask).patch(updateTask).delete(deleteTask);

export default router;

import express from 'express';
import {
	createIntern,
	listInterns,
	getIntern,
	updateIntern,
	deleteIntern
} from '../controllers/internController.js';

const router = express.Router();
router.post('/', createIntern);
router.get('/', listInterns);
router.get('/:id', getIntern);
router.patch('/:id', updateIntern);
router.delete('/:id', deleteIntern);
export default router;

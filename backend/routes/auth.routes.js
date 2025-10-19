import express from 'express';
import { getUsers, addUser, loginUser } from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/users', getUsers);
router.post('/users', addUser);
router.post('/login', loginUser); // 👈 Nuevo endpoint

export default router;

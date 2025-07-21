import express from 'express';
import { authService } from '../controller/auth';

const router = express.Router();

router.post('/signup', authService.signUp.bind(authService));
router.post('/login', authService.logIn.bind(authService));
router.post('/logout', authService.logOut.bind(authService));
router.post('/refresh', authService.refreshToken.bind(authService));
router.get('/', authService.getAllUsers.bind(authService));


export default router;
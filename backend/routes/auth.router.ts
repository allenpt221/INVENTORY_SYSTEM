import express from 'express';
import { authService } from '../controller/auth';
import { adminRoute, protectRoute } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/signup', authService.signUp.bind(authService));
router.post('/signstaff', protectRoute, adminRoute,  authService.createStaff.bind(authService));
router.post('/login', authService.logIn.bind(authService));
router.post('/logout', authService.logOut.bind(authService));
router.post('/refresh', authService.refreshToken.bind(authService));
router.get('/', authService.getAllUsers.bind(authService));

router.put('/account', protectRoute, authService.updateAccount.bind(authService));


router.get('/getprofile', protectRoute,  authService.getProfile.bind(authService));
router.get('/getstaff', protectRoute, adminRoute,  authService.ObtainAuthStaff.bind(authService));




export default router;
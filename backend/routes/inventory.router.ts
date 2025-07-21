import express from 'express';
import { inventoryController } from '../controller/Inventory';
import { adminRoute, protectRoute } from '../middleware/auth.middleware';


const router = express.Router();

router.post('/create', protectRoute, adminRoute ,inventoryController.addItem.bind(inventoryController));


export default router;
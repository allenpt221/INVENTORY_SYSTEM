import express from 'express';
import { inventoryController } from '../controller/Inventory';
import { adminRoute, protectRoute } from '../middleware/auth.middleware';


const router = express.Router();

router.post('/create', protectRoute, adminRoute ,inventoryController.addItem.bind(inventoryController));
router.get('/', protectRoute, inventoryController.getItems.bind(inventoryController));

//search method
router.get('/search', protectRoute, inventoryController.searchItem.bind(inventoryController));

router.put('/:id', protectRoute, inventoryController.updateQuantity.bind(inventoryController));
router.delete('/:id', protectRoute, inventoryController.deleteProduct.bind(inventoryController));





export default router;
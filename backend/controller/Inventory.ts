import { Request, Response } from 'express';
import { supabase } from '../supabase/supa-client';

interface InventoryItem {
    uuid: string;
    user_id: string;
    productName: string;
    SKU: string;
    quantity: number;
    location: string;
    created_at: string;
}

class InventoryController {

    public async addItem(req: Request, res: Response): Promise<void> {
        try {
            const { user_id, productName, SKU, quantity, location }: InventoryItem = req.body;

            if (!productName || !SKU || quantity === undefined || !location) {
                res.status(400).json({ error: 'All fields are required' });
                return;
            }
            // Insert item into the Inventory table
            const { data, error } = await supabase
            .from('Inventory')
            .insert([{
                user_id,
                productName,
                SKU,
                quantity,
                location,
                created_at: new Date().toISOString(),
            }]).select()
            .single();


            res.status(201).json({
                message: 'Item added successfully', data: data})
            
        } catch (error: any) {
            console.error('Creating Item Erro', error);
            res.status(401).json({ error: 'Internal server error' });
        }
    }

}

export const inventoryController = new InventoryController();
import { Request, Response } from 'express';
import { supabase } from '../supabase/supa-client';
import cloudinary from '../lib/cloudinary';

interface InventoryItem {
    id: number;
    user_id: string;
    productName: string;
    SKU: string;
    quantity: number;
    barcode: string;
    brand: string;
    category: string,
    image: string,
    created_at: string;
}


class InventoryController {

    public async addItem(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const {  productName, SKU, quantity, barcode, brand, category, image }: InventoryItem = req.body;

            let cloudinaryResponse = null;


            if(image){
                cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products"});
            }

            if (!productName || !SKU || quantity === undefined || !barcode || !brand || !category) {
                res.status(400).json({ error: 'All fields are required' });
                return;
            }

            if (!userId) {
                console.error('No user ID found on request');
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            // Insert item into the Inventory table
            const { data, error } = await supabase
            .from('Inventory')
            .insert([{
                user_id: userId,
                productName,
                SKU,
                quantity,
                barcode,
                brand,
                category,
                image: cloudinaryResponse?.secure_url ?? "",
                created_at: new Date().toISOString(),
            }]).select()
            .single();

            if (error) {
                console.error('Error creating items:', error);
                res.status(500).json({ error: 'Failed to creating items' });
                return;
            }

        

            res.status(201).json({
                message: 'Item added successfully', products: data})
            
        } catch (error: any) {
            console.error('Creating Item Error', error);
            res.status(401).json({ error: 'Internal server error' });
        }
    }

    public async getItems(req: Request, res: Response): Promise<void> {
        try {

            // Fetch items from the Inventory table
            const { data, error } = await supabase
                .from('Inventory')
                .select('*')

            if (error) {
                console.error('Error fetching items:', error);
                res.status(500).json({ error: 'Failed to fetch items' });
                return;
            }

            res.status(200).json({ items: data });

        } catch (error: any) {
            console.error('Error in getItems:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async updateQuantity(req: Request, res: Response): Promise<void> {
        try {
            const itemId = req.params.id;
            const { quantity }:InventoryItem = req.body;

            if (quantity === undefined) {
                res.status(400).json({ error: 'Quantity is required' });
                return;
            }

            const { data} = await supabase
                .from('Inventory')
                .update({ quantity })
                .eq('id', itemId)
                .select()
                .single();

            res.status(200).json({
                message: 'Quantity updated successfully',
                item: data
            });

            
        } catch (error) {
            console.error('Error updating quantity:', error);
            res.status(500).json({ error: 'Failed to update quantity' });
        }
    }

    public async updateProduct(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const { productName, SKU, quantity, barcode, brand, category, image }: InventoryItem = req.body;

            if (!id) {
            res.status(400).json({ error: "Missing product ID" });
            return;
            }

            let updatedFields: Partial<InventoryItem> = { productName, SKU, quantity, barcode, brand, category };

            if (image) {
            const cloudinaryResponse = await cloudinary.uploader.upload(image, {
                folder: "products",
            });
            updatedFields.image = cloudinaryResponse.secure_url;
            }

            const { data, error } = await supabase
            .from("Inventory")
            .update(updatedFields)
            .eq("id", id) // <-- critical: specify which row to update
            .select(); // optional: return updated row

            if (error) {
            console.error("Supabase update error:", error);
            res.status(500).json({ error: "Failed to update product" });
            return;
            }

            res.status(200).json({ message: "Product updated successfully", data });
        } catch (error: any) {
            console.error("Error updating product:", error);
            res.status(500).json({ error: "Server error while updating product" });
        }
    }


    public async searchItem(req: Request, res: Response): Promise<void> {
        const query = req.query.q as string;

        if (!query || query.trim() === '') {
            res.status(400).json({ error: 'Missing or empty query parameter "q"' });
            return;
        }

        try {
            const { data, error } = await supabase
            .from('Inventory')
            .select('*')
            .or(`
                productName.ilike.%${query}%,
                SKU.ilike.%${query}%,
                location.ilike.%${query}%,
                supplier.ilike.%${query}%,
                category.ilike.%${query}%
            `.replace(/\s+/g, '')
        );

            if (error) throw error;

            console.log('Search results:', data); // <--- Add this

            res.status(200).json({ results: data });
        } catch (err: any) {
            console.error('❌ Search error:', err.message); // <--- Add this
            res.status(500).json({ error: err.message || 'Internal server error' });
        }
    }

    public async deleteProduct(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const { data, error } = await supabase
            .from("Inventory")
            .delete()
            .eq("id", id)
            .select(); // Ensures `data` is returned

            if (error) {
                res.status(500).json({ message: "Failed to delete product", error });
                return
            }

            const deletedProduct = data?.[0];

            // Delete image from Cloudinary if it exists
            if (deletedProduct?.image) {
            const imageUrlParts = deletedProduct.image.split("/");
            const filenameWithExt = imageUrlParts.pop();
            const publicId = filenameWithExt?.split(".")[0];

            if (publicId) {
                try {
                await cloudinary.uploader.destroy(`products/${publicId}`);
                } catch (cloudErr: any) {
                console.error("Cloudinary deletion failed:", cloudErr.message);
                // Optional: continue anyway or return 500 here if it's critical
                }
            }
            }

            res.status(200).json({ message: "Product deleted successfully" });
        } catch (err: any) {
            res.status(500).json({ message: "Unexpected error in deleteProduct", error: err.message });
        }
        }


}

export const inventoryController = new InventoryController();
import { Request, Response } from 'express';
import { supabase } from '../supabase/supa-client';
import cloudinary from '../lib/cloudinary';

interface InventoryItem {
    id: number;
    user_id: number;
    productName: string;
    SKU: string;
    quantity: number;
    barcode: string;
    brand: string;
    category: string,
    image: string;
    price: number;
    total: number;
    created_at: string;
}


class InventoryController {

    public async addItem(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const {  productName, SKU, quantity, barcode, brand, category, image, price }: InventoryItem = req.body;

            const Parseprice = parseFloat(price as any);
            const ParseQuantity = parseInt(quantity as any);

            const total = Parseprice * ParseQuantity

            let cloudinaryResponse = null;


            if(image){
                cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products"});
            }

            if (!productName || !SKU || quantity === undefined || !barcode || !brand || !category || !price) {
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
                quantity: ParseQuantity,
                barcode,
                brand,
                category,
                price: Parseprice,
                total,
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
            const user = req.user;  

            if (!user) {
            res.status(401).json({ error: "User not authenticated" });
            return;
            }

            const userIdToQuery = user.role === 'staff' ? user.admin_id : user.id;

            if (!userIdToQuery) {
            res.status(400).json({ error: "Cannot determine user context" });
            return;
            }

            const { data, error } = await supabase
            .from("Inventory")
            .select("*")
            .eq("user_id", userIdToQuery);

            if (error) {
            console.error("Error fetching inventory:", error);
            res.status(500).json({ error: "Failed to fetch inventory" });
            return;
            }

            res.status(200).json({ items: data });
        } catch (error: any) {
            console.error("Error in getItems:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }


    public async updateQuantity(req: Request, res: Response): Promise<void> {
            try {
                const itemId = req.params.id;
                const { quantity }: { quantity: number } = req.body;

                if (typeof quantity !== 'number' || isNaN(quantity)) {
                    res.status(400).json({ error: 'Quantity must be a valid number' });
                    return;
                }

                const { data: item, error: fetchError } = await supabase
                    .from('Inventory')
                    .select('price')
                    .eq('id', itemId)
                    .single();

                if (fetchError || !item) {
                    console.error('Fetch error:', fetchError?.message);
                    res.status(404).json({ error: 'Item not found' });
                    return;
                }

                //Ensure price is a valid number
                const price = Number(item.price);
                if (isNaN(price)) {
                    res.status(500).json({ error: 'Invalid price in database' });
                    return;
                }

                const total = quantity * price;


                const { data: updatedItem, error: updateError } = await supabase
                    .from('Inventory')
                    .update({ quantity, total })
                    .eq('id', itemId)
                    .select('id, quantity, price, total')
                    .single();

                if (updateError || !updatedItem) {
                    console.error('Update error:', updateError?.message);
                    res.status(500).json({ error: 'Failed to update inventory' });
                    return;
                }

                res.status(200).json({ message: 'Updated successfully', stock: updatedItem });
            } catch (error) {
                console.error('Server error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }



    public async updateProduct(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const { productName, SKU, quantity, barcode, brand, category, price, image }: InventoryItem = req.body;

            if (!id) {
            res.status(400).json({ error: "Missing product ID" });
            return;
            }

            const parsedPrice = Number(price);
            const parsedQuantity = Number(quantity);
            const total = parsedPrice * parsedQuantity;

            let updatedFields: Partial<InventoryItem> = { productName, SKU,  barcode, brand, category, quantity: parsedQuantity, price: parsedPrice, total };

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
                brand.ilike.%${query}%,
                category.ilike.%${query}%
            `.replace(/\s+/g, '')
        );

            if (error) throw error;

            console.log('Search results:', data); // <--- Add this

            res.status(200).json({ results: data });
        } catch (err: any) {
            console.error(' Search error:', err.message); // <--- Add this
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
                .select()
                .single();

            if (error) {
                res.status(500).json({ message: "Failed to delete product", error });
                return;
            }

            const deletedProduct = data;

            if (deletedProduct?.public_id) {
                try {
                    await cloudinary.uploader.destroy(deletedProduct.public_id);
                } catch (cloudErr: any) {
                    console.error("Cloudinary deletion failed:", cloudErr.message);
                }
            }

            res.status(200).json({ message: "Product deleted successfully" });
        } catch (err: any) {
            res.status(500).json({ message: "Unexpected error in deleteProduct", error: err.message });
        }
    }


}

export const inventoryController = new InventoryController();
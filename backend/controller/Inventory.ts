import { Request, Response } from 'express';
import { supabase } from '../supabase/supa-client';
import cloudinary from '../lib/cloudinary';
import removeBackgroundFromImage from '../lib/removeBackgroundFromImage';

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

            let imageUrl = "";

            try {
            if (image && image.startsWith("data:image")) {

                // using this function is to remove directly the bg of the image
                const transparentImage = await removeBackgroundFromImage(image); 


                const result = await cloudinary.uploader.upload(transparentImage, {
                folder: "products",
            });
                imageUrl = result.secure_url;
            }
            } catch (error) {
            console.warn("Background removal failed, uploading original image.");
            const fallback = await cloudinary.uploader.upload(image, {
                folder: "products",
            });
            imageUrl = fallback.secure_url;
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
                image: imageUrl,
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
            const user = req.user;
            const userEmail = user?.email;
            const { quantity }: { quantity: number } = req.body;

            if (typeof quantity !== 'number' || isNaN(quantity)) {
            res.status(400).json({ error: 'Quantity must be a valid number' });
            return;
            }

            if (!user) {
            res.status(401).json({ error: "User not authenticated" });
            return;
            }

            const userIdToQuery = user.role === 'staff' ? user.admin_id : user.id;

            // Fetch current item
            const { data: item, error: fetchError } = await supabase
            .from('Inventory')
            .select('*')
            .eq('id', itemId)
            .single();

            if (fetchError || !item) {
            console.error('Fetch error:', fetchError?.message);
            res.status(404).json({ error: 'Item not found' });
            return;
            }

            const previousStock = item.quantity;

            if (quantity === previousStock) {
            console.log('No stock change');
            res.status(400).json({ message: 'No stock changes' });
            return;
            }

            // Fetch total_before_all
            const { data: allBefore } = await supabase
            .from("Inventory")
            .select("total, quantity");

            const totalBeforeAll =
            allBefore?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
            const stockBeforeAll =
            allBefore?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

            // Calculate new total
            const price = Number(item.price);
            if (isNaN(price)) {
            res.status(500).json({ error: 'Invalid price in database' });
            return;
            }
            const total = quantity * price;

            // Update Inventory
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

            // Fetch total_after_all
            const { data: allAfter } = await supabase
            .from("Inventory")
            .select("total, quantity");

            const totalAfterAll =
            allAfter?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
            const stockAfterAll =
            allAfter?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

            // Log stock update
            const stockStatus = quantity > previousStock ? "increase" : "decrease";

            const { data: insertedLogs, error: logError } = await supabase
            .from('after_update_the_stock')
            .insert([
                {
                userId: userIdToQuery,
                productname: item.productName,
                stock_status: stockStatus,
                stock: quantity,
                price: item.price,
                total: total,
                previous_total: item.total,
                updateby: userEmail,
                created_at: new Date().toISOString(),
                },
            ])
            .select()
            .single();

            if (logError) {
            throw new Error('Error logging stock change: ' + logError.message);
            }

            // Log stock management totals
            const { data: insertedTotal, error: stockError } = await supabase
            .from("stock_management")
            .insert([
                {
                user_id: userIdToQuery,
                stock_before: stockBeforeAll,
                current_stock: stockAfterAll,
                before_price: item.price,
                current_price: item.price,
                total_before: totalBeforeAll,
                current_total: totalAfterAll,
                created_at: new Date().toISOString(),
                },
            ])
            .select()
            .single();

            if (stockError) {
            console.error("Stock management insert failed:", stockError.message);
            }

            res.status(200).json({
            message: 'Updated successfully',
            stock: updatedItem,
            log: insertedLogs,
            latestTotal: insertedTotal?.current_total || 0,
            });

        } catch (error) {
            console.error('Server error:', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
    }
   

    public async updateProduct(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const {
            productName,
            SKU,
            quantity,
            barcode,
            brand,
            category,
            price,
            image,
            }: InventoryItem = req.body;

            const user = req.user;

            if (!id) {
            res.status(400).json({ error: "Missing product ID" });
            return;
            }

            if (!user) {
            res.status(401).json({ error: "User not authenticated" });
            return;
            }

            // 1. Fetch existing product
            const { data: existingItem, error: fetchError } = await supabase
            .from("Inventory")
            .select("*")
            .eq("id", id)
            .single();

            if (fetchError || !existingItem) {
            console.error("Fetch error:", fetchError?.message);
            res.status(404).json({ error: "Product not found" });
            return;
            }

            // 2. Get total_before_all
            const { data: allItemsBefore, error: fetchAllBeforeError } = await supabase
            .from("Inventory")
            .select("total, quantity");

            if (fetchAllBeforeError || !allItemsBefore) {
            console.error("Error fetching totals before update:", fetchAllBeforeError?.message);
            }

            const totalBeforeAll =
            allItemsBefore?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;

            const stockBeforeAll =
            allItemsBefore?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

            // 3. Parse and prepare updated fields
            const parsedPrice = Number(price);
            const parsedQuantity = Number(quantity);
            const total = parsedPrice * parsedQuantity;

            let updatedFields: Partial<InventoryItem> = {
            productName,
            SKU,
            barcode,
            brand,
            category,
            quantity: parsedQuantity,
            price: parsedPrice,
            total,
            };

            if (image) {
            const cloudinaryResponse = await cloudinary.uploader.upload(image, {
                folder: "products",
            });
            updatedFields.image = cloudinaryResponse.secure_url;
            }

            // 4. Perform update
            const { data: updatedData, error: updateError } = await supabase
            .from("Inventory")
            .update(updatedFields)
            .eq("id", id)
            .select()
            .single();

            if (updateError || !updatedData) {
            console.error("Supabase update error:", updateError?.message);
            res.status(500).json({ error: "Failed to update product" });
            return;
            }

            // 5. Get total_after_all
            const { data: allItemsAfter, error: fetchAllAfterError } = await supabase
            .from("Inventory")
            .select("total, quantity");

            if (fetchAllAfterError || !allItemsAfter) {
            console.error("Error fetching totals after update:", fetchAllAfterError?.message);
            }

            const totalAfterAll =
            allItemsAfter?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
            const stockAfterAll =
            allItemsAfter?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

            // 6. Log to stock_management
            const { data: insertedLog, error: stockLogError } = await supabase
            .from("stock_management")
            .insert([
                {
                user_id: user.role === "staff" ? user.admin_id : user.id,
                stock_before: stockBeforeAll,
                current_stock: stockAfterAll,
                before_price: existingItem.price,
                current_price: parsedPrice,
                total_before: totalBeforeAll,
                current_total: totalAfterAll,
                created_at: new Date().toISOString(),
                },
            ])
            .select()
            .single();

            if (stockLogError) {
            console.warn("Stock management log error:", stockLogError.message);
            // Don't block response
            }

            res.status(200).json({
            message: "Product updated successfully",
            data: updatedData,
            currentTotal: insertedLog?.current_total ?? 0,
            currentStock: insertedLog?.current_stock ?? 0
            });
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

    public async getUpdateLogs(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;

            const userIdToQuery = user?.role === "staff" ? user.admin_id : user?.id;

            const {data: updateData, error: updateErrors } = await supabase
            .from('after_update_the_stock')
            .select("*")
            .eq("userId", userIdToQuery);

            const {data: totalStocks, error: totalStockError} = await supabase
            .from('stock_management')
            .select("*")
            .eq("user_id", userIdToQuery);

            const { data: latestStock, error: latestStockError } = await supabase
            .from('stock_management')
            .select("current_stock, current_total, stock_before, total_before")
            .eq("user_id", userIdToQuery)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

            if (updateErrors || totalStockError || latestStockError) {
                if (updateErrors) console.error("Update logs error:", updateErrors.message);
                if (totalStockError) console.error("Stock logs error:", totalStockError.message);
                if (latestStockError) console.error("Latest stock fetch error:", latestStockError.message);
                res.status(500).json({ error: "Error fetching logs from database" });
                return;
            }

            res.status(200).json({
                success: true, 
                updateLogs: updateData, 
                stockLogs: totalStocks,
                latest: {
                    lastestStock: latestStock.current_stock,
                    latestTotal: latestStock.current_total,
                    beforestock: latestStock.stock_before,
                    beforetotal: latestStock.total_before
                }
            })

        } catch (error) {
            console.error("Error fetching inventorylogs:", error);
            res.status(500).json({ error: "Server error while fetching inventorylogs" });
        }
    }


}

export const inventoryController = new InventoryController();
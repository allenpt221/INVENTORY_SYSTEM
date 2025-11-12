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
        const user = req.user;
        const userId = user?.role === "staff" ? user.admin_id : user?.id;

        const {
            productName,
            SKU,
            quantity,
            barcode,
            brand,
            category,
            image,
            price,
        }: InventoryItem = req.body;

        const Parseprice = parseFloat(price as any);
        const ParseQuantity = parseInt(quantity as any);
        const total = Parseprice * ParseQuantity;

        if (!productName || !SKU || quantity === undefined || !barcode || !brand || !category || !price) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const [totalsBefore, imageUrl] = await Promise.all([
            supabase.from("Inventory")
            .select("total, quantity")
            .eq("user_id", userId),
            (async () => {
            if (image && image.startsWith("data:image")) {
                try {
                const transparentImage = await removeBackgroundFromImage(image);
                const result = await cloudinary.uploader.upload(transparentImage, { folder: "products" });
                return result.secure_url;
                } catch (error: any) {
                    console.warn("removeBackgroundFromImage failed:", error?.message || error);
                    const fallback = await cloudinary.uploader.upload(image, { folder: "products" });
                    return fallback.secure_url;
                }
            }
            return "";
            })(),
        ]);

        const insertItem = await supabase
            .from("Inventory")
            .insert([
            {
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
            },
            ])
            .select()
            .single();

        if (insertItem.error || !insertItem.data) {
            res.status(500).json({ error: 'Failed to create item' });
            return;
        }

        const totalBeforeAll = totalsBefore.data?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
        const stockBeforeAll = totalsBefore.data?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

        const totalsAfter = await supabase
        .from("Inventory")
        .select("total, quantity")
        .eq("user_id", userId);

        
        const totalAfterAll = totalsAfter.data?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
        const stockAfterAll = totalsAfter.data?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

        const userEmail = user?.email || "Unknown";

        const [logInsert, stockInsert] = await Promise.all([
            supabase
            .from("after_update_the_stock")
            .insert([
                {
                userId: userId,
                productname: insertItem.data.productName,
                stock_status: "New",
                stock: insertItem.data.quantity,
                price: insertItem.data.price,
                total: insertItem.data.total,
                previous_total: insertItem.data.total,
                updateby: userEmail,
                created_at: new Date().toISOString(),
                product_id: insertItem.data.id
                },
            ]),
            supabase
            .from("stock_management")
            .insert([
                {
                user_id: userId,
                stock_before: stockBeforeAll,
                current_stock: stockAfterAll,
                before_price: 0,
                current_price: Parseprice,
                total_before: totalBeforeAll,
                current_total: totalAfterAll,
                created_at: new Date().toISOString(),
                },
            ]),
        ]);

        if (logInsert.error) console.warn("Inventory log failed:", logInsert.error.message);
        if (stockInsert.error) console.warn("Stock log failed:", stockInsert.error.message);

        res.status(201).json({
            message: 'Item added successfully',
            product: insertItem.data,
            inventoryLog: logInsert.data,
            stockLog: stockInsert.data,
        });
        } catch (error: any) {
        console.error('Creating Item Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async getItems(req: Request, res: Response): Promise<void> {
        try {
        const user = req.user!;
        const userIdToQuery = user?.role === "staff" ? user.admin_id : user.id;

        const { data: items, error } = await supabase
            .from("Inventory")
            .select("*")
            .eq("user_id", userIdToQuery)
            .order("created_at", { ascending: false })
            .limit(100);

        if (error) {
            res.status(500).json({ error: 'Failed to fetch inventory' });
            return;
        }

        res.status(200).json(items);
        } catch (error: any) {
        console.error('Fetching Items Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
        }
    }


    public async updateQuantity(req: Request, res: Response): Promise<void> {
        try {
            const itemId = req.params.id;
            const user = req.user;
            const userId = user?.role === "staff" ? user.admin_id : user?.id;
            const userEmail = user?.email;

            if (!user) {
                res.status(401).json({ error: "User not authenticated" });
                return
            }

            const { quantity }: { quantity: number } = req.body;

            if (typeof quantity !== "number" || isNaN(quantity) || quantity < 0) {
                res.status(400).json({ error: "Quantity must be a valid number >= 0" });
                return
            }

            const userIdToQuery = user.role === "staff" ? user.admin_id : user.id;

            // Fetch current item
            const { data: item, error: fetchError } = await supabase
                .from("Inventory")
                .select("*")
                .eq("id", itemId)
                .eq("user_id", userId)
                .single();

            if (fetchError || !item) {
                console.error("Fetch error:", fetchError?.message);
                res.status(404).json({ error: "Item not found" });
                return
            }

            const previousStock = item.quantity;   // previous quantity of this item
            const price = Number(item.price);

            if (isNaN(price)) {
                res.status(500).json({ error: "Invalid price in database" });
                return
            }

            // Directly set the quantity to the user input
            const total = quantity * price;

            // Update Inventory
            const { data: updatedItem, error: updateError } = await supabase
                .from("Inventory")
                .update({ quantity, total })
                .eq("id", itemId)
                .eq("user_id", userId)
                .select("id, quantity, price, total")
                .single();

            if (updateError || !updatedItem) {
                console.error("Update error:", updateError?.message);
                res.status(500).json({ error: "Failed to update inventory" });
                return
            }

            // Determine stock status for this item
            let stockStatus = "";
            if (quantity > previousStock) {
                stockStatus = "increase";
            } else if (quantity < previousStock) {
                stockStatus = "decrease";
            } else {
                stockStatus = "No Change";
            }

            // Fetch totals for this user
            const { data: allAfter } = await supabase
                .from("Inventory")
                .select("total, quantity")
                .eq("user_id", userId);

            const totalAfterAll = allAfter?.reduce((sum, i) => sum + (i.total || 0), 0) || 0;
            const stockAfterAll = allAfter?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0;

            // Log stock update per item
            const { data: insertedLogs, error: logError } = await supabase
                .from("after_update_the_stock")
                .insert([
                    {
                        userId: userIdToQuery,
                        productname: item.productName,
                        stock_status: stockStatus,
                        stock: quantity,
                        price: price,
                        total: total,
                        previous_total: item.total,
                        updateby: userEmail,
                        created_at: new Date().toISOString(),
                    },
                ])
                .select()
                .single();

            if (logError) {
                throw new Error("Error logging stock change: " + logError.message);
            }

            // Log stock management totals per user
            const { data: insertedTotal, error: stockError } = await supabase
                .from("stock_management")
                .insert([
                    {
                        user_id: userIdToQuery,
                        stock_before: stockAfterAll - quantity + previousStock,
                        current_stock: stockAfterAll,
                        before_price: item.price,
                        current_price: price,
                        total_before: totalAfterAll - total + item.total,
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
                message: "Stock updated successfully",
                stock: updatedItem,
                log: insertedLogs,
                latestTotal: insertedTotal?.current_total || 0,
            });

        } catch (error) {
            console.error("Server error:", error);
            res.status(500).json({ error: "Internal server error" });
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
            const userId = user?.role === "staff" ? user.admin_id : user?.id;
            const userEmail = user?.email || "Unknown"; // Get user email for logging

            if (!id) {
                res.status(400).json({ error: "Missing product ID" });
                return;
            }

            if (!user) {
                res.status(401).json({ error: "User not authenticated" });
                return;
            }

            // Fetch existing product
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

            // Get total_before_all
            const { data: allItemsBefore, error: fetchAllBeforeError } = await supabase
                .from("Inventory")
                .select("total, quantity")
                .eq("user_id", userId);

            if (fetchAllBeforeError || !allItemsBefore) {
                console.error("Error fetching totals before update:", fetchAllBeforeError?.message);
            }

            const totalBeforeAll =
                allItemsBefore?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;

            const stockBeforeAll =
                allItemsBefore?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

            // Parse and prepare updated fields
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

            // Perform update
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

            // Get total_after_all
            const { data: allItemsAfter, error: fetchAllAfterError } = await supabase
                .from("Inventory")
                .select("total, quantity")
                .eq("user_id", userId);

            if (fetchAllAfterError || !allItemsAfter) {
                console.error("Error fetching totals after update:", fetchAllAfterError?.message);
            }

            const totalAfterAll =
                allItemsAfter?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
            const stockAfterAll =
                allItemsAfter?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

            // Determine stock status for the product update
            let stockStatus = "";
            if (parsedQuantity > existingItem.quantity) {
                stockStatus = "increase";
            } else if (parsedQuantity < existingItem.quantity) {
                stockStatus = "decrease";
            } else if (parsedPrice !== existingItem.price) {
                stockStatus = "price Update";
            } else {
                stockStatus = "Update Info"; 
            }

            // Log to after_update_the_stock (individual product change)
            const { data: productLog, error: productLogError } = await supabase
                .from("after_update_the_stock")
                .insert([
                    {
                        userId: userId,
                        productname: updatedData.productName,
                        stock_status: stockStatus,
                        stock: parsedQuantity,
                        price: parsedPrice,
                        total: total,
                        previous_total: existingItem.total,
                        updateby: userEmail,
                        created_at: new Date().toISOString(),
                        product_id: updatedData.id,
                    },
                ])
                .select()
                .single();

            if (productLogError) {
                console.warn("Product update log error:", productLogError.message);
            }

            // Log to stock_management (overall inventory totals)
            const { data: insertedLog, error: stockLogError } = await supabase
                .from("stock_management")
                .insert([
                    {
                        user_id: userId,
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
            }

            res.status(200).json({
                message: "Product updated successfully",
                data: updatedData,
                productLog: productLog,
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


            res.status(200).json({ results: data });
        } catch (err: any) {
            console.error(' Search error:', err.message);
            res.status(500).json({ error: err.message || 'Internal server error' });
        }
    }

    public async deleteProduct(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const user = req.user; 
            const userId = req.user?.id; 



            const { data: existingItem, error: fetchError } = await supabase
                .from("Inventory")
                .select("*")
                .eq("id", id)
                .single();

            if (fetchError || !existingItem) {
                res.status(404).json({ message: "Product not found", error: fetchError?.message });
                return
            }

            const { data: allItemsBefore, error: fetchBeforeError } = await supabase
                .from("Inventory")
                .select("total, quantity");

            if (fetchBeforeError) {
                console.error("Error fetching totals before delete:", fetchBeforeError.message);
            }

            const totalBeforeAll = allItemsBefore?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
            const stockBeforeAll = allItemsBefore?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

        const { error: deleteErrorLog } = await supabase
                .from("after_update_the_stock")
                .delete()
                .eq("product_id", id)
                .select()
                .single();

            if (deleteErrorLog) {
                res.status(500).json({ message: "Failed to delete product from after_update_the_stock", error: deleteErrorLog?.message });
            }

             
            const { data: deletedProduct, error: deleteError } = await supabase
                .from("Inventory")
                .delete()
                .eq("id", id)
                .select()
                .single();

            if (deleteError || !deletedProduct) {
                res.status(500).json({ message: "Failed to delete product", error: deleteError?.message });
            }




            const { error: afterdelete } = await supabase
            .from("deletion_log")
            .insert([{
                productName: existingItem.productName,
                SKU: existingItem.SKU,
                quantity: existingItem.quantity,
                category: existingItem.category,
                barcode: existingItem.barcode,
                brand: existingItem.brand,
                image: existingItem.image,
                price: existingItem.price,
                total: existingItem.total,
                deleteby: user?.email,
                user_id: user?.role === "staff" ? user.admin_id : user?.id,
                created_at: new Date().toISOString()
            }])

            if (afterdelete) {
                console.error("Error deleting delete:", afterdelete.message);
            }

            const { data: allItemsAfter, error: fetchAfterError } = await supabase
                .from("Inventory")
                .select("total, quantity")
                .eq('user_id', userId);

            if (fetchAfterError) {
                console.error("Error fetching totals after delete:", fetchAfterError.message);
            }

            const totalAfterAll = allItemsAfter?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
            const stockAfterAll = allItemsAfter?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

            const parsedPrice = parseFloat(existingItem.price); 

            const { data: insertedLog, error: stockLogError } = await supabase
                .from("stock_management")
                .insert([
                    {
                        user_id: user?.role === "staff" ? user.admin_id : user?.id,
                        stock_before: stockBeforeAll,
                        current_stock: stockAfterAll,
                        before_price: parsedPrice,
                        current_price: 0, // deleted item, no current price
                        total_before: totalBeforeAll,
                        current_total: totalAfterAll,
                        created_at: new Date().toISOString(),
                    },
                ])
                .select()
                .single();

            if (stockLogError) {
                console.error("Failed to log stock deletion:", stockLogError.message);
            }

            if (deletedProduct?.public_id) {
                try {
                    await cloudinary.uploader.destroy(deletedProduct.public_id);
                } catch (cloudErr: any) {
                    console.error("Cloudinary deletion failed:", cloudErr.message);
                }
            }
            res.status(200).json({
                message: "Product deleted successfully",
                deletedProduct,
                stockLog: insertedLog,
            });

        } catch (err: any) {
            console.error("Unexpected error during deletion:", err.message);
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
                    latestStock: latestStock.current_stock,
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

    public async disposedProducts(req: Request, res: Response): Promise<void> {
        try {

            const user = req.user;
            const userId = user?.role === "staff" ? user.admin_id : user?.id;    
            
            const { data , error } = await supabase
            .from("deletion_log")
            .select("*")
            .eq("user_id", userId)

            if(error){
                res.status(500).json({message: error});
            }

            res.status(200).json({sucess:true, dispose: data});
            return;
            
        } catch (error: any) {
            console.error("Error in disposedProducts", error);
            res.status(400).json({error: "Server error while fetching deletion_log"});
        }
    }


}

export const inventoryController = new InventoryController();
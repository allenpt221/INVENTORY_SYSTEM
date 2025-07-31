import { create } from 'zustand';
import axios from '../lib/axios';

export type Products = {
    id: number;
    productName: string;
    SKU: string;
    quantity: number;
    barcode: string;
    brand: string;
    created_at: Date;
    category: string;
    price: number;
    total: number;
    image?: string;
    descp?: string;
}

type InvetoryLogs = {
    userId?: number;
    productname: string;
    stock: number;
    stock_status: string;
    price: number;
    total: number;
    previous_total: number;
    updateby: string;
    created_at: Date;
}

export type ProductInput = {
    productName: string;
    SKU: string;
    quantity: number;
    brand: string;
    barcode: string;
    category: string;
    image?: string; 
    price: number;
    total?: number;
    descp?: string;

};

export type ProductUpdatePayload = Omit<Products, 'created_at' | 'total'>;

interface productState {
    loading: boolean;
    products: Products[];
    Inventorylog: InvetoryLogs[];
    setProduct: (products: Products[]) => void;
    getProducts: () => void;
    createProduct: (registedProduct: ProductInput) => void;
    deleteProduct: (id: number) => void;
    updateStock: (id: number, quantity: number) => void;
    updateProduct: (productId: ProductUpdatePayload) => void;
    productSearch: (query: string) => void;
    getProductLog: () => void;
}


export const productStore = create<productState>((set, get) => ({
    products: [],
    Inventorylog: [],
    loading: true,
    setProduct: (products) => set({products}),

    getProducts: async (): Promise<void> => {
        try {
            const res = await axios.get('/inventory');
            set({ products:res.data.items, loading: false});
        } catch (error: any) {
            console.error('Failed fetching data:', error);    
        }
    },

    getProductLog: async (): Promise<void> => {
        try {
            const res = await axios.get('/inventory/updatelog');

            set({Inventorylog: res.data.log})
        } catch (error) {
            
        }
    },

    createProduct: async( registedProduct: ProductInput ): Promise<void> => {
        try {
            const res = await axios.post('/inventory/create', registedProduct);

            set((prevState) => ({
                products: [...prevState.products, res.data.products]
            }));
            
        } catch (error: any) {
            console.error("Error creating product:", error);
        }
    },

    deleteProduct: async(id: number): Promise<void> => { 
        try {
            await axios.delete(`/inventory/${id}`);
            const updated = get().products.filter(product => product.id !== id);
            set({ products: updated });


        } catch (error: any) {
            console.error('Failed to delete Product:', error);    
        }
    },

    updateStock: async (id: number, quantity: number): Promise<void> => {
        try {
            const res = await axios.put(`/inventory/${id}`, { quantity });

            const updatedData = res.data.stock;
            const newLog = res.data.log;

            const updatedProducts = get().products.map(product =>
            product.id === id ? { ...product, ...updatedData } : product
            );

            // Only push if new log is present
            if (newLog) {
            set({
                products: updatedProducts,
                Inventorylog: [newLog, ...get().Inventorylog]
            });
            } else {
            set({ products: updatedProducts });
            }

        } catch (error: any) {
            console.error('Failed to update Product stock:', error);
        }
    },


    updateProduct: async (productData: ProductUpdatePayload): Promise<void> => {
        try {
            const response = await axios.put(`/inventory/productupdate/${productData.id}`, productData);

            const updatedProduct = response.data?.data;

            if (!updatedProduct) {
            console.warn("No product returned from backend");
            return;
            }

            // Update the product in local state using backend response
            set((state) => ({
            products: state.products.map((product) =>
                product.id === updatedProduct.id ? updatedProduct : product
            ),
            }));
        } catch (error) {
            console.error("Failed to update product:", error);
        }
    },

    productSearch: async (query: string) => {
    try {
      const res = await axios.get(`inventory/search?q=${encodeURIComponent(query)}`);
      set({ products: res.data.results });
    } catch (error) {
      console.error('Error searching products:', error);
    }
  },


}));
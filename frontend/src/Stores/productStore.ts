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
    image?: string | File;
}

export type ProductInput = {
  productName: string;
  SKU: string;
  quantity: number;
  brand: string;
  barcode: string;
  category: string;
  image?: string; 
};

interface productState {
    products: Products[];
    setProduct: (products: Products[]) => void;
    getProducts: () => void;
    createProduct: (registedProduct: ProductInput) => void;
    deleteProduct: (id: number) => void;

}


export const productStore = create<productState>((set, get) => ({
    products: [],
    setProduct: (products) => set({products}),

    getProducts: async (): Promise<void> => {
        try {
            const res = await axios.get('/inventory');
            set({ products:res.data.items });
        } catch (error: any) {
            console.error('Failed fetching data:', error);    
        }
    },

    createProduct: async( registedProduct: ProductInput ): Promise<void> => {
        try {
            const res = await axios.post('inventory/create', registedProduct);

            set((prevState) => ({
                products: [...prevState.products, res.data.products]
            }));
            
        } catch (error: any) {
            console.error("Error creating product:", error);
        }
    },

    deleteProduct: async(id: number): Promise<void> => { 
        try {
            await axios.delete(`inventory/${id}`);
            const updated = get().products.filter(product => product.id !== id);
            set({ products: updated });


        } catch (error: any) {
            console.error('Failed to delete Product:', error);    
        }
    }
}));
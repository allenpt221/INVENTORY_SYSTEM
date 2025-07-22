import { create } from 'zustand';
import axios from '../lib/axios';
import { Products } from '@/Common/Products';

export type Products = {
    id: number;
    productName: string;
    SKU: string;
    quantity: number;
    location: string;
    supplier: string;
    created_at: Date;
    category: string;
}

interface productState {
    products: Products[];
    setProduct: (products: Products[]) => void;
    getProducts: () => void;
    deleteProduct:(id: number) => void;
}


export const productStore = create<productState>((set, get) => ({
    products: [],
    setProduct: (products) => set({products}),

    getProducts: async (): Promise<void> => {
        try {
            const res = await axios.get('/inventory');
            set({ products:res.data.items });
        } catch (error) {
            console.error('Failed fetching data:', error);    
        }
    },

    deleteProduct: async(id: number): Promise<void> => { 
        try {
            await axios.delete(`inventory/${id}`);
            const updated = get().products.filter(product => product.id !== id);
            set({ products: updated });

            console.log(`Product with ID ${id} deleted successfully`);

        } catch (error) {
            console.error('Failed to delete Product:', error);    
        }
    }
}));
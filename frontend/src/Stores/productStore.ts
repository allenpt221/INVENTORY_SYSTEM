import { create } from 'zustand';
import axios from '../lib/axios';

export type Products = {
    id: number;
    productName: string;
    SKU: string;
    quantity: number;
    barcode: string;
    brand: string;
    created_at: Date ;
    category: string;
    price: number;
    total: number;
    image?: string;
    descp?: string;
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
    products: Products[];
    setProduct: (products: Products[]) => void;
    getProducts: () => void;
    createProduct: (registedProduct: ProductInput) => void;
    deleteProduct: (id: number) => void;
    updateStock: (id: number, quantity: number) => void;
    updateProduct: (productId: ProductUpdatePayload) => void;
    productSearch: (query: string) => void;
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
            const res = await axios.put(`/inventory/${id}`, { quantity }); // <-- Add slash before ID

            const updatedData = res.data.stock

            const updated = get().products.map(product =>
            product.id === id ? { ...product, ...updatedData } : product // or update as needed
            );
            set({ products: updated });
        } catch (error: any) {
            console.error('Failed to update Product stock:', error);
        }
    },

    updateProduct: async (productData: ProductUpdatePayload): Promise<void> => {
        try {
            await axios.put(`/inventory/productupdate/${productData.id}`, productData);


            set((prevState) => ({
            products: prevState.products.map((product) =>
                product.id === productData.id ? { ...product, ...productData } : product
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
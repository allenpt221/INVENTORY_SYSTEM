import { Input } from '@/components/ui/input';
import type { ProductUpdatePayload } from '@/Stores/productStore';
import { Label } from '@radix-ui/react-label';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

type UpdateProductsProps = {
  isOpen: boolean;
  isClose: () => void;
  updateProductData: ProductUpdatePayload | null;
  updateProduct: (data: ProductUpdatePayload) => void;
};

const generateBarcode = (length = 8): string => {
  const digits = "0123456789";
  return Array.from({ length }, () => digits[Math.floor(Math.random() * digits.length)]).join("");
};

export function UpdateProduct({
  isOpen,
  isClose,
  updateProductData,
  updateProduct,
}: UpdateProductsProps) {
  if (!isOpen) return null;

  const [products, setProducts] = useState<ProductUpdatePayload>({
    id: 0,
    productName: '',
    SKU: '',
    quantity: 0,
    brand: '',
    category: '',
    barcode: '',
    image: '',
    price: 0,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (updateProductData) {
      setProducts({
        id: updateProductData.id ?? 0,
        productName: updateProductData.productName ?? '',
        SKU: updateProductData.SKU ?? '',
        quantity: updateProductData.quantity ?? 0,
        brand: updateProductData.brand ?? '',
        barcode: updateProductData.barcode ?? '',
        category: updateProductData.category ?? '',
        image: updateProductData.image ?? '',
        price: updateProductData.price ?? 0,
      });
    }
  }, [updateProductData]);

    const [panelWidth, setPanelWidth] = useState(400);

  useEffect(() => {
    const handleResize = () => {
      setPanelWidth(window.innerWidth <= 640 ? 300 : 400); // sm breakpoint
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setProducts((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateBarcode = () => {
    setProducts((prev) => ({
      ...prev,
      barcode: generateBarcode(),
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateProduct(products);
    isClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-end z-50"
      onClick={isClose}
      role="dialog"
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: panelWidth }}
        exit={{ width: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white h-full shadow-lg overflow-y-auto dark:bg-black dark:border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center py-2 border-b-2 mx-5">
          <h2 className="text-lg font-semibold">Update Product</h2>
          <button
            onClick={isClose}
            className="text-gray-500 hover:text-black transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 grid gap-4">
          {[
            ['Product Name', 'productName'],
            ['Stock Keeping Unit', 'SKU'],
            ['Quantity', 'quantity'],
            ['Brand', 'brand'],
            ['Category', 'category'],
            ['Price', 'price'],
          ].map(([label, name]) => (
            <div key={name} className="grid gap-1.5">
              <Label className="text-sm font-medium capitalize">{label}</Label>
              <Input
                name={name}
                type={name === 'quantity' || name === 'price' || name === 'total' ? 'number' : 'text'}
                value={products[name as keyof ProductUpdatePayload] as string | number}
                onChange={(e) =>
                  setProducts({ ...products, [name]: e.target.value })
                }
              />
            </div>
          ))}

          <div className="grid gap-1.5">
            <Label className="text-sm font-medium">Barcode</Label>
            <div className="flex gap-2">
              <Input
                name="barcode"
                type="text"
                value={products.barcode}
                placeholder="Enter or generate barcode"
                className="rounded-md flex-1"
                onChange={(e) => setProducts({ ...products, barcode: e.target.value})}
              />
              <button
                type="button"
                onClick={handleGenerateBarcode}
                className="px-3 py-1 rounded-md bg-black text-white hover:bg-gray-200 text-sm dark:bg-white dark:border dark:text-black font-medium"
              >
                Auto
              </button>
            </div>
          </div>

          <div className="grid gap-2">
                <Label htmlFor="image" className="text-sm font-medium">
                    Upload Image
                </Label>
                <label
                    htmlFor="image"
                    className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition"
                >
                    {(imagePreview || (typeof products.image === 'string' && products.image !== '')) ? (
                    <img
                        src={imagePreview || products.image}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-md"
                    />
                    ) : (
                    <span className="text-sm text-gray-500">Click to upload</span>
                    )}
                    <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    />
                </label>
            </div>


          <button
            type="submit"
            className="mt-4 w-full bg-black text-white py-2 rounded-md hover:bg-black/70 cursor-pointer transition dark:bg-white dark:text-black"
          >
            Save Changes
          </button>
        </form>
      </motion.div>
    </div>
  );
}

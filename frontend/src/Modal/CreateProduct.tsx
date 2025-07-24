import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { productStore, type ProductInput } from "@/Stores/productStore";

type RegisteredProduct = {
  isOpen: boolean;
  isClose: () => void;
};

// Barcode generator function
const generateBarcode = (length = 12): string => {
  const digits = "0123456789";
  let barcode = "";
  for (let i = 0; i < length; i++) {
    barcode += digits[Math.floor(Math.random() * digits.length)];
  }
  return barcode;
};

export function CreateProduct({ isOpen, isClose }: RegisteredProduct) {
  if (!isOpen) return null;

  const [registered, setIsRegistered] = useState<ProductInput>({
    productName: "",
    SKU: "",
    quantity: 0,
    brand: "",
    barcode: "",
    category: "",
    image: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const createProduct = productStore((state) => state.createProduct);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIsRegistered((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setIsRegistered((prev) => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateBarcode = () => {
    setIsRegistered((prev) => ({
      ...prev,
      barcode: generateBarcode(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createProduct(registered);

    setIsRegistered({
      productName: "",
      SKU: "",
      quantity: 0,
      brand: "",
      barcode: "",
      category: "",
      image: "",
    });
    setImagePreview(null);
    isClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      onClick={isClose}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative mx-2 dark:bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">Register Product</h1>
          <button
            onClick={isClose}
            className="text-gray-500 hover:text-black transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {["productName", "SKU", "quantity", "brand", "category"].map((field) => (
            <div className="grid gap-1.5" key={field}>
              <Label className="text-sm font-medium capitalize">{field === "SKU" ? "Stock Keeping Unit" : field}</Label>
              <Input
                name={field}
                type="text"
                value={(registered as any)[field]}
                placeholder={`Enter ${field}`}
                className="rounded-md"
                onChange={handleChange}
              />
            </div>
          ))}

          {/* Barcode Input + Generate Button */}
          <div className="grid gap-1.5">
            <Label className="text-sm font-medium">Barcode</Label>
            <div className="flex gap-2">
              <Input
                name="barcode"
                type="text"
                value={registered.barcode}
                placeholder="Enter or generate barcode"
                className="rounded-md flex-1"
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={handleGenerateBarcode}
                className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm dark:text-black"
              >
                Auto
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div className="grid gap-2">
            <Label htmlFor="image" className="text-sm font-medium">
              Upload Image
            </Label>
            <label
              htmlFor="image"
              className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
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

          {/* Action Buttons */}
          <div className="flex font-medium justify-end gap-2">
            <button
              type="button"
              onClick={isClose}
              className="border shadow hover:bg-muted cursor-pointer px-3 py-1 rounded-md dark:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="border bg-black text-white rounded-md px-3 py-1 cursor-pointer dark:bg-white dark:text-black"
            >
              Register Product
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

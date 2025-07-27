import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { productStore, type ProductInput } from "@/Stores/productStore";

type RegisteredProduct = {
  isOpen: boolean;
  isClose: () => void;
};

const generateBarcode = (length = 8): string => {
  const digits = "0123456789";
  return Array.from({ length }, () => digits[Math.floor(Math.random() * digits.length)]).join("");
};

export function CreateProduct({ isOpen, isClose }: RegisteredProduct) {
  if (!isOpen) return null;

  const [error, setError] = useState<Record<string, string>>({});

  const [registered, setRegistered] = useState<ProductInput>({
    productName: "",
    SKU: "",
    quantity: 0,
    brand: "",
    barcode: "",
    category: "",
    image: "",
    price: 0,
  });


  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const createProduct = productStore((state) => state.createProduct);


  const [panelWidth, setPanelWidth] = useState(400);

  useEffect(() => {
    const handleResize = () => {
      setPanelWidth(window.innerWidth <= 640 ? 300 : 400); // sm breakpoint
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  const parsedValue = ["quantity", "price"].includes(name) ? Number(value) : value;

  // Update the registered values
  setRegistered((prev) => ({
    ...prev,
    [name]: parsedValue,
  }));

  // Remove error for the field if value is not empty
  if (value.trim() !== "") {
    setError((prev) => {
      const updatedError = { ...prev };
      delete updatedError[name];
      return updatedError;
    });
  }
}



  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setRegistered((prev) => ({ ...prev, image: result }));
        
        setError((prev) => {
        const updated = { ...prev };
        delete updated.image;
        return updated;
      });
    };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateBarcode = () => {
    setRegistered((prev) => ({
      ...prev,
      barcode: generateBarcode(),
    }));

    setError((prev) => {
    const updated = { ...prev };
    delete updated.barcode;
    return updated;
  });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      const newErrors: Record<string, string> = {};

      if(!registered.productName){
        newErrors.productName = "Product name is required";
      }
      if(!registered.SKU){
        newErrors.SKU = "Stock Keeping Unit is required";
      }
      if (registered.quantity === undefined || registered.quantity <= 0){
        newErrors.quantity = "Quantity is required";
      }
      if(!registered.brand){
        newErrors.brand = "Brand name is required";
      }
      if(!registered.barcode){
        newErrors.barcode = "Barcode is required";
      }
      if(!registered.price){
        newErrors.price = "product price is required";
      }

      if(!registered.category){
        newErrors.category = "product category is required";
      }
      if(!registered.image){
        newErrors.image = "product image is required";
      }

      if(Object.keys(newErrors).length > 0){
        setError(newErrors);
        return;
      }

      createProduct(registered);
      setRegistered({
        productName: "",
        SKU: "",
        quantity: 0,
        brand: "",
        barcode: "",
        category: "",
        image: "",
        price: 0,
      });
      setImagePreview(null);
      isClose();
    } catch (error: any) {
      console.log("Failed to create Products", error.message);
    }
  };

  const getValue = (key: keyof ProductInput) => registered[key];

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50" onClick={isClose} role="dialog">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: panelWidth }}
        exit={{ width: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white h-full shadow-lg overflow-y-auto dark:bg-black border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center py-2 border-b-2 mx-5">
          <h2 className="text-lg font-semibold">Register Product</h2>
          <button
            onClick={isClose}
            className="text-gray-500 hover:text-black transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 h-full">
          {[
            { name: "productName", label: "Product" },
            { name: "SKU", label: "Stock Keeping Unit" },
            { name: "quantity", label: "Quantity" },
            { name: "brand", label: "Brand" },
            { name: "category", label: "Category" },
            { name: "price", label: "Price" },
          ].map(({ name, label }) => (
            <div className="grid gap-1.5" key={name}>
              <Label className="text-sm font-medium">{label}</Label>
              <Input
                name={name}
                type={name === "price" ? "number" : "text"}
                step={name === "price" ? "0.01" : undefined}
                placeholder={`Enter ${label}`}
                className="rounded-md"
                value={getValue(name as keyof ProductInput)}
                onChange={handleChange}
              />
              {error[name] && (
                <p className="text-red-500 text-xs mt-1">{(error as any)[name]}</p>
              )}
            </div>
          ))}

          {/* Barcode with Generate */}
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
                className="px-3 py-1 rounded-md bg-black text-white hover:bg-gray-200 text-sm dark:bg-white dark:border dark:text-black font-medium"
              >
                Auto
              </button>
            </div>
              {error.barcode && (
                <p className="text-red-500 text-xs mt-1">{error.barcode}</p>
              )}
          </div>

          {/* Image Upload */}
          <div className="grid gap-2">
            <Label htmlFor="image" className="text-sm font-medium">
              Upload Image
            </Label>
            <label
              htmlFor="image"
              className="border-2 border-dashed h-[14rem] border-gray-300 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition"
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
            {error.image && (
                <p className="text-red-500 text-xs mt-1">{error.image}</p>
              )}
          </div>

          {/* Buttons */}
            <button
              type="submit"
              className="mt-4 w-full bg-black text-white py-2 rounded-md hover:bg-black/70 cursor-pointer transition dark:text-black dark:bg-white"
            >
              Register Product
            </button>
        </form>
      </motion.div>
    </div>
  );
}

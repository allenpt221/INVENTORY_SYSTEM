import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from 'framer-motion';

type StockUpdateProps = {
  isOpen: boolean;
  isClose: () => void;
  updatedStock: () => number | null;
  updateStock: (newQuantity: number) => void; // function that takes new quantity
};

export function UpdateStock({ isOpen, isClose, updatedStock, updateStock }: StockUpdateProps) {
  if (!isOpen) return null;

  const [quantity, setQuantity] = useState<number>(0);

  useEffect(() => {
    const initialQuantity = updatedStock();
    if (initialQuantity !== null) {
      setQuantity(initialQuantity);
    }
  }, [updatedStock]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(parseInt(e.target.value, 10) || 0);
  };

  const handleSubmit = () => {
    updateStock(quantity); // properly typed and passed
    isClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" 
    role="dialog"
    aria-modal="true"
    onClick={isClose}>
      <motion.div 
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative mx-2 dark:bg-black">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">Update Stock</h1>
          <button
            onClick={isClose}
            className="text-gray-500 hover:text-black transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Field */}
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <input
            type="text"
            value={quantity}
            onChange={handleInputChange}
            className="border p-2 rounded w-full mb-4"
          />

          <button
            type="submit"
            className="float-right bg-black text-white px-4 py-2 rounded hover:bg-black/80 font-medium cursor-pointer"
          >
            Save
          </button>
        </form>
      </motion.div>
    </div>
  );
}

import { ProductBarcode } from "@/components/ProductBarcode";
import { productStore } from "@/Stores/productStore";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRef } from "react";

import { motion } from 'framer-motion';


interface BarcodeModalProps {
  isOpen: boolean;
  isClose: () => void;
  productId: number; // ID of the product to show
}

function Barcode({ isOpen, isClose, productId }: BarcodeModalProps) {
  const products = productStore((state) => state.products);
  const [product, setProduct] = useState<{ SKU: number | string; barcode: number | string } | null>(null);
const printRef = useRef<HTMLDivElement>(null);


  const handlePrint = () => {
  if (!printRef.current) return;

  const printContents = printRef.current.innerHTML;
  const originalContents = document.body.innerHTML;

  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;
  window.location.reload(); // to re-render the app properly
};


  useEffect(() => {
    if (isOpen) {
      const found = products.find((p) => p.id === productId);
      if (found) {
        setProduct({ SKU: found.SKU, barcode: found.barcode });
      } else {
        setProduct(null);
      }
    }
  }, [isOpen, productId, products]);

  if (!isOpen) return null;

  return (
    <div className="flex justify-center items-center fixed inset-0 bg-black/50 z-50"
    role="dialog"
    onClick={isClose}>
    <motion.div 
    initial={{opacity: 0, y: 0}}
    animate={{opacity: 1, y: 15}}
    exit={{opacity: 0, y: -100}}
    transition={{duration: 0.5}}
    onClick={(e) => e.stopPropagation()}
    className="bg-white p-4 rounded-lg shadow-lg w-[20rem]">
        <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Barcode</h2>
        <button onClick={isClose}>
            <X />
        </button>
        </div>

        {/* Barcode Content to Print */}
        <div ref={printRef}>
        {product ? (
            <ProductBarcode sku={product.SKU} barcode={product.barcode} />
        ) : (
            <p className="text-red-500">Product not found</p>
        )}
        </div>

        {/* Print Button */}
        <div className="mt-4 text-right">
        <button
            onClick={handlePrint}
            className="px-4 py-1 bg-black text-white rounded hover:bg-black/60"
        >
            Print
        </button>
        </div>
    </motion.div>
    </div>

  );
}

export default Barcode;

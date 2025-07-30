import Barcode from 'react-barcode';

export function ProductBarcode({ barcode, sku }: { barcode: string | number, sku: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1 mt-4">
      {/* Barcode Graphic */}
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 tracking-widest">
        {sku}
      </span>
      <Barcode
        value={String(barcode)}
        height={50}
        width={2}
        fontSize={0} // hide default text under barcode
        displayValue={false}
        background="#ffffff"
        lineColor="#000000"
      />

      {/* Manual Barcode Value Below */}
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 tracking-widest">
        {barcode}
      </span>
    </div>
  );
}

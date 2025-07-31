import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { productStore } from "@/Stores/productStore";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export function InventoryLog() {
  const Inventorylog = productStore((state) => state.Inventorylog);
  const products = productStore((state) => state.products);

  const totalRevenue = products.reduce((sum, items) => sum + items.total, 0);

  console.log(totalRevenue);

  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSortToggle = () => setSortAsc(!sortAsc);

  const sortedLogs = [...Inventorylog].sort((a, b) =>
    sortAsc
      ? a.productname.localeCompare(b.productname)
      : b.productname.localeCompare(a.productname)
  );

  const capitalizedFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatNumberPrice = (num: number) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const isLoading = Inventorylog.length === 0;

  const renderSkeletonRow = (key: number) => (
    <TableRow key={key}>
      {Array(7)
        .fill(0)
        .map((_, idx) => (
          <TableCell className="text-center" key={idx}>
            <Skeleton className="h-4 w-full" />
          </TableCell>
        ))}
    </TableRow>
  );

  return (
    <div className="max-w-[1480px] mx-auto overflow-auto">
      <div className="grid grid-cols-3">
        <div className="flex bg-white">
            <h1>total Revenue</h1>
        </div>
      </div>
      <Table className="lg:min-w-full min-w-[1000px]">
        <TableCaption>A list of your recent stock updates.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] flex items-center gap-1">
              Product
              <button onClick={handleSortToggle}>
                <ChevronsUpDown size={15} />
              </button>
            </TableHead>
            <TableHead className="text-center">Price</TableHead>
            <TableHead className="text-center">Stock</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="text-center">Updated By</TableHead>
            <TableHead className="text-center">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => renderSkeletonRow(i))
            : sortedLogs.map((logs, index) => {
                const date = new Date(logs.created_at);
                const formattedDate = date.toLocaleDateString();

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium w-[10rem] overflow-ellipsis">
                      {logs.productname}
                    </TableCell>
                    <TableCell className="text-center">
                      ₱{logs.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">{logs.stock}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`${
                          logs.stock_status === "increase"
                            ? "bg-green-500/20 border-green-500 text-green-500"
                            : "bg-red-500/20 border-red-500 text-red-500"
                        } px-2 border rounded`}
                      >
                        {capitalizedFirstLetter(logs.stock_status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      ₱{formatNumberPrice(logs.previous_total || 0)} → ₱
                      {formatNumberPrice(logs.total)}
                    </TableCell>
                    <TableCell className="text-center">
                      {logs.updateby}
                    </TableCell>
                    <TableCell className="text-center">
                      {formattedDate}
                    </TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
    </div>
  );
}

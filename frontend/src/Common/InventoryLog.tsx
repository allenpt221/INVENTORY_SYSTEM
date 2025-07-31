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
import { ArrowDownRight, ArrowUpRight, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export function InventoryLog() {
  const Inventorylog = productStore((state) => state.inventorylog);
  const latest = productStore((state) => state.latest);
  const loading = productStore((state) => state.loading);
  const product = productStore((state) => state.products);

  const totalProduct = product.filter((items) => items.productName).length;

  const latestPercentage = ((latest?.latestTotal ?? 0) / 1000000) * 100;
  const latestStockPercentage = (latest?.lastestStock ?? 0) / 100;

  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSortToggle = () => setSortAsc(!sortAsc);

  const sortedLogs = [...Inventorylog].sort((a, b) =>
    sortAsc
      ? a.productname.localeCompare(b.productname)
      : b.productname.localeCompare(a.productname)
  );

  const capitalizedFirstLetter = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const formatNumberPrice = (num: number) =>
    num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="max-w-[1480px] mx-auto px-4">
      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border shadow p-4 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Total Revenue */}
          <div className="bg-white rounded-2xl border shadow p-4">
            <h2 className="text-sm font-medium text-muted-foreground mb-1">
              Total Revenue
            </h2>
            <div className="text-2xl font-semibold text-gray-900 flex items-end justify-between">
              ₱{formatNumberPrice(latest?.latestTotal ?? 0)}
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  (latest?.latestTotal ?? 0) > (latest?.beforetotal ?? 0)
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {(latest?.latestTotal ?? 0) > (latest?.beforetotal ?? 0) ? (
                  <ArrowUpRight size={16} />
                ) : (
                  <ArrowDownRight size={16} />
                )}
                {latestPercentage.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Total Stock */}
          <div className="bg-white rounded-2xl border shadow p-4">
            <h2 className="text-sm font-medium text-muted-foreground mb-1">
              Total Stock
            </h2>
            <div className="text-2xl font-semibold text-gray-900 flex items-end justify-between">
              {latest?.lastestStock ?? 0}
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  (latest?.latestTotal ?? 0) > (latest?.beforestock ?? 0)
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {(latest?.latestTotal ?? 0) > (latest?.beforestock ?? 0) ? (
                  <ArrowUpRight size={16} />
                ) : (
                  <ArrowDownRight size={16} />
                )}
                {latestStockPercentage.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-2xl border shadow p-4">
            <h2 className="text-sm font-medium text-muted-foreground mb-1">
              Total Products
            </h2>
            <div className="text-2xl font-semibold text-gray-900">
              {totalProduct}
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="overflow-x-auto rounded-lg bg-white">
        <Table className="min-w-[1000px]">
          <TableCaption className="text-muted-foreground">
            A list of your recent stock updates.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-1">
                  Product
                  <button onClick={handleSortToggle}>
                    <ChevronsUpDown size={15} className="text-muted-foreground" />
                  </button>
                </div>
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
            {loading ? (
              Array.from({ length: 9 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-28 mx-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                </TableRow>
              ))
            ) : Inventorylog.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No inventory logs available.
                </TableCell>
              </TableRow>
            ) : (
              sortedLogs.map((logs, index) => {
                const date = new Date(logs.created_at).toLocaleDateString();
                return (
                  <TableRow
                    key={index}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium w-[10rem] truncate">
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
                            ? "bg-green-500/20 text-green-600 border-green-600"
                            : "bg-red-500/20 text-red-600 border-red-600"
                        } px-2 py-0.5 border rounded-full text-xs font-medium`}
                      >
                        {capitalizedFirstLetter(logs.stock_status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      ₱{formatNumberPrice(logs.previous_total || 0)} → ₱
                      {formatNumberPrice(logs.total)}
                    </TableCell>
                    <TableCell className="text-center">{logs.updateby}</TableCell>
                    <TableCell className="text-center">{date}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

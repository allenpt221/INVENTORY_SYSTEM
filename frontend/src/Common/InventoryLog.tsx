import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { productStore } from "@/Stores/productStore";
import { ArrowDownRight, ArrowUpRight, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authUserStore } from "@/Stores/authStore";

export function InventoryLog() {
  const Inventorylog = productStore((state) => state.inventorylog);
  const user = authUserStore((state) => state.user);
  const latest = productStore((state) => state.latest);
  const loading = productStore((state) => state.loading);
  const product = productStore((state) => state.products);

  const totalProduct = product.filter((items) => items.productName).length;

  const latestPercentage = ((latest?.latestTotal ?? 0) / 10000000) * 100;
  const latestStockPercentage = (latest?.latestStock ?? 0) / 100;

  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [filters, setFilters] = useState<string[]>([]);

  const statusOptions = ["new", "increase", "decrease"];

  const handleSortToggle = () => setSortAsc(!sortAsc);

  const toggleFilter = (status: string) => {
    setFilters((prev) => {
      const updated = prev.includes(status.toLowerCase())
        ? prev.filter((s) => s !== status.toLowerCase())
        : [...prev, status.toLowerCase()];
      localStorage.setItem("inventoryFilters", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem("inventoryFilters");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setFilters(parsed.map((s) => s.toLowerCase()));
        }
      } catch {
        setFilters([]);
      }
    }
  }, []);

  const capitalizedFirstLetter = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const formatNumberPrice = (num: number) =>
    num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const filteredLogs = filters.length
    ? Inventorylog.filter((log) =>
        filters.includes(log.stock_status.toLowerCase())
      )
    : Inventorylog;

  const sortedLogs = [...filteredLogs].sort((a, b) =>
    sortAsc
      ? a.productname.localeCompare(b.productname)
      : b.productname.localeCompare(a.productname)
  );



  if (user?.role === "request") {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Request Access
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
          This user is a request to manage the product. Please wait for approval or contact the administrator.
        </p>
      </div>
    </div>
  );
}

  return (
    <div className="max-w-[1480px] mx-auto px-4">
      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border shadow p-4 space-y-2 dark:bg-black"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl border shadow p-4 dark:bg-black">
            <h2 className="text-sm font-medium text-muted-foreground mb-1 dark:text-white">
              Total Revenue
            </h2>
            <div className="text-2xl font-semibold text-gray-900 flex items-end justify-between dark:text-white">
              ₱{formatNumberPrice(latest?.latestTotal ?? 0)}
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  (latest?.latestTotal ?? 0) > (latest?.beforetotal ?? 0)
                    ? "text-green-500"
                    : (latest?.latestTotal ?? 0) === (latest?.beforetotal ?? 0)
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {(latest?.latestTotal ?? 0) > (latest?.beforetotal ?? 0) ? (
                  <ArrowUpRight size={16} />
                ) : (latest?.latestTotal ?? 0) ===
                  (latest?.beforetotal ?? 0) ? (
                  <ArrowUpRight size={16} />
                ) : (
                    <ArrowDownRight size={16} />
                )}
                {latestPercentage.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border shadow p-4 dark:bg-black">
            <h2 className="text-sm font-medium text-muted-foreground mb-1 dark:text-white">
              Total Stock
            </h2>
            <div className="text-2xl font-semibold text-gray-900 flex items-end justify-between dark:text-white">
              {latest?.latestStock ?? 0}
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  (latest?.latestStock ?? 0) > (latest?.beforestock ?? 0)
                    ? "text-green-500"
                    : (latest?.latestStock ?? 0) === (latest?.beforestock ?? 0)
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {(latest?.latestStock ?? 0) > (latest?.beforestock ?? 0) ? (
                  <ArrowUpRight size={16} />
                ) : (latest?.beforestock ?? 0) ===
                  (latest?.latestStock ?? 0) ? (
                  <ArrowUpRight size={16} />
                ) : (
                  <ArrowDownRight size={16} />
                )}
                {latestStockPercentage.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border shadow p-4 dark:bg-black">
            <h2 className="text-sm font-medium text-muted-foreground mb-1 dark:text-white">
              Total Products
            </h2>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {totalProduct}
            </div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="w-[15rem] flex justify-between mb-4">
        {statusOptions.map((status) => {
          const isActive = filters.includes(status);

          const activeStyles: Record<string, string> = {
            new: "bg-yellow-100 text-yellow-700 border-yellow-500",
            increase: "bg-green-100 text-green-700 border-green-500",
            decrease: "bg-red-100 text-red-700 border-red-500",
          };

          const inactiveStyle = "bg-white text-black border-gray-300";

          return (
            <button
              key={status}
              onClick={() => toggleFilter(status)}
              className={`px-3 py-0.5 rounded-md text-sm font-medium border capitalize ${
                isActive ? activeStyles[status] : inactiveStyle
              }`}
            >
              {status}
            </button>
          );
        })}
      </div>

      {/* Table */}
      {product.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-white dark:bg-black border rounded-md shadow-md">
          <div className="text-4xl">📦</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            No Products Logs Found
          </h2>
          <p className="text-muted-foreground max-w-sm">
            It looks like your inventory is empty. Start by registering your
            first product to begin logging updates.
          </p>
          <Link
            to="/Inventory"
            className={`px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition ${
              user?.role === "manager" ? "block" : "hidden"
            }`}
          >
            Register Product
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white dark:bg-black h-fit max-h-[46rem]">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-1">
                    Product
                    <button onClick={handleSortToggle}>
                      <ChevronsUpDown
                        size={15}
                        className="text-muted-foreground"
                      />
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
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-4 w-20 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-4 w-12 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-4 w-28 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : sortedLogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-6 text-muted-foreground"
                  >
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
                        ₱{formatNumberPrice(logs.price)}
                      </TableCell>
                      <TableCell className="text-center">
                        {logs.stock}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`${
                            logs.stock_status === "increase"
                              ? "bg-green-500/20 text-green-600 border-green-600"
                              : logs.stock_status === "decrease"
                              ? "bg-red-500/20 text-red-600 border-red-600"
                              : "bg-yellow-500/20 text-yellow-600 border-yellow-600"
                          } px-2 py-0.5 border rounded-full text-xs font-medium`}
                        >
                          {capitalizedFirstLetter(logs.stock_status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {logs.previous_total === logs.total
                          ? `₱${formatNumberPrice(logs.total)}`
                          : `₱${formatNumberPrice(
                              logs.previous_total || 0
                            )} → ₱${formatNumberPrice(logs.total)}`}
                      </TableCell>
                      <TableCell className="text-center">
                        {logs.updateby}
                      </TableCell>
                      <TableCell className="text-center">{date}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

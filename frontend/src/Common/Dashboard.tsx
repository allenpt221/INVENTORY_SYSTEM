import { useMemo, useState } from "react";
import { ChevronsUpDown } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { productStore } from "@/Stores/productStore";
import { ComboChart } from "@/components/ComboChart";
import { authUserStore } from "@/Stores/authStore";

export function Dashboard() {
  const dispose = productStore((state) => state.dispose);
  const staffDetails = authUserStore((state) => state.staffDetails);
  const loading = productStore((state) => state.loading);


  const [sortAsc, setSortAsc] = useState(true);

  const sortedDispose = useMemo(() => {
    return [...dispose].sort((a, b) => {
      const nameA = a.productName.toLowerCase();
      const nameB = b.productName.toLowerCase();
      return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  }, [dispose, sortAsc]);

  const toggleSort = () => setSortAsc((prev) => !prev);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Inventory Dashboard</h1>

      <div className="flex flex-col lg:flex-row justify-between gap-6">
        {/* Disposed Products Table */}
        <div className="bg-white border rounded-xl shadow p-4 overflow-x-auto w-full h-fit max-h-[51rem]">
          <h2 className="text-lg font-medium mb-4">Disposed Products</h2>

          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow>
                <TableHead
                  onClick={toggleSort}
                  className="cursor-pointer select-none"
                >
                  <div className="flex items-center gap-1">
                    Product <ChevronsUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead className="text-center">Price</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center">Barcode</TableHead>
                <TableHead className="text-center">SKU</TableHead>
                <TableHead className="text-center">Category</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Disposed By</TableHead>
                <TableHead className="text-center">Date</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-4 w-28 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : sortedDispose.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                    No disposed products available.
                  </TableCell>
                </TableRow>
              ) : (
                sortedDispose.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell className="text-center">₱{item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-center">{item.barcode}</TableCell>
                    <TableCell className="text-center">{item.SKU}</TableCell>
                    <TableCell className="text-center">{item.category}</TableCell>
                    <TableCell className="text-center">₱{item.total.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{item.deleteby || "—"}</TableCell>
                    <TableCell className="text-center">
                      {new Date(item.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Placeholder Section */}
        <div className="lg:w-[40rem] w-full flex flex-col gap-3">
          <ComboChart />
          {/* staff table where the manager only access this */}
          <div className="bg-white border rounded-xl shadow p-4 overflow-x-auto overflow-hidden w-full h-fit">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Profile</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffDetails.map((staff, index) => (
                <TableRow key={index}>
                  <TableCell>{staff.username}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.role}</TableCell>
                  <TableCell>
                      <div className="flex justify-center items-center">
                        <img
                          src={staff.image}
                          alt="error fetching profile"
                          className="w-9 h-9 rounded-full"
                        />
                      </div>
                  </TableCell>
                </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

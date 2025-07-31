import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Trash,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Skeleton } from "@/components/ui/skeleton";


import { productStore, type Products, type ProductUpdatePayload } from "@/Stores/productStore";
import { authUserStore } from "@/Stores/authStore";
import { CreateProduct } from "@/Modal/CreateProduct";
import { AnimatePresence } from "framer-motion";
import { UpdateStock } from "@/Modal/UpdateStock";
import { UpdateProduct } from "@/Modal/UpdateProduct";
import { ConfirmationModal } from "@/Modal/ConfirmationModal";
import Barcode from "@/Modal/Barcode";

export function Inventory() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const rawProducts = productStore((state) => state.products) ?? [];
  const deleteProduct = productStore((state) => state.deleteProduct);
  const user = authUserStore((state) => state.user);
  const updateProductStock = productStore((state) => state.updateStock);

  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isUpdateOpen, setIsUpdateOpen] = React.useState<boolean>(false);
  const [selectId, setSelectId] = React.useState<number | null>(null);
  const [updateProduct, setUpdateProduct] = React.useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = React.useState<ProductUpdatePayload | null>(null);
  
  const [selectedProductDelete, setSelectedProductDelete] = React.useState<number | null>(null);
  const [showDeletion, setShowDeletion] = React.useState<boolean>(false);

  const [selectedbarcodeId, setSelectedBarcodeId] = React.useState<number | null>(null);
  const [barcodeModal, setBarcodeModal] = React.useState<boolean>(false);

  const isLoading = rawProducts.length === 0;



   const handleDelete = (id: number) => {
    setSelectedProductDelete(id);
    setShowDeletion(true);
  };

   const confirmDelete = () => {
    if (selectedProductDelete !== null) {
      deleteProduct(selectedProductDelete);
    }
    setShowDeletion(false);
  };



  const productupdate = productStore((state) => state.updateProduct);

  // product update using the id and map it to show the item base on the id
  const handleUpdateProduct = (id: number) => {
    setSelectId(id);
    const productToUpdate = products.find((p) => p.id === id);
  if (productToUpdate) {
    setSelectedProduct(productToUpdate);
    setUpdateProduct(true);
  }
  }

  // handle the update id and open the modal if it true
const handleUpdateStock = (id: number) => {
  setSelectId(id);
  // Optional: ensure product is available before showing modal
  const product = products.find(p => p.id === id);
  if (product) {
    setIsUpdateOpen(true);
  }
};

  const handleBarcode = (id: number) => {
    setSelectedBarcodeId(id);
    setBarcodeModal(true);
  }

  // fetch also the product here to prevent the reload relaod the website

  // map off the product here using the reactUsememo
  const products = React.useMemo(() => {
    return Array.isArray(rawProducts)
      ? rawProducts.map((item) => ({
          ...item,
          product: item.productName,
          created_at: new Date(item.created_at),
        }))
      : [];
  }, [rawProducts]);

    // will the quantity of the product to store in the modal updating the stock
   const getSelectedProductQuantity = () => {
    if (!selectId) return null;
    const selected = products.find((product) => product.id === selectId);
    return selected?.quantity ?? null;
  };

  // handle the id of what stock is to update
  const handleUpdateStockSubmit = (newQuantity: number) => {
    if (selectId !== null) {
      updateProductStock(selectId, newQuantity);
    }
  };

  // convert the price into 1,000.00 instead of the 1000
  const formatNumberPrice = (num: number) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // capitalized the first letter of each space
  const capitalizeLetter = (str: string) =>
    str
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");


  const columns: ColumnDef<Products>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            const selected = row.original.id;
            console.log(
              `Row ${!!value ? "selected" : "deselected"}: ID =`,
              selected
            );
          }}
          aria-label="Select row"
        />
      ),
    },
    {
      accessorKey: "product",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
          className="flex items-center"
        >
          Product
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          {capitalizeLetter(row.getValue("product"))}
        </div>
      )
    },
    {
      accessorKey: "SKU",
      header: () => <div className="text-center">SKU</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("SKU")}</div>
      ),
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-center">Stock</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("quantity")}</div>
      ),
    },
    {
      id: "Status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => {
        const quantity = row.getValue<number>("quantity");
        const outStock = quantity <= 0;
        const lowStock = quantity < 10 && quantity > 0;

        return (
          <div className="text-center">
            {outStock ? (
              <span className="bg-red-200/20 border border-red-400 rounded text-red-500 text-sm px-2">
                Out of Stock
              </span>
            ) : lowStock ? (
              <span className="bg-yellow-200/20 border border-yellow-400 rounded text-yellow-500 text-sm px-2">
                Low Stock
              </span>
            ) : (
              <span className="bg-green-300/20 border border-green-400 rounded text-green-500 text-sm px-2">
                On Stock
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "brand",
      header: "Brand",
      cell: ({ row }) => <div>{capitalizeLetter(row.getValue("brand"))}</div>,
    },
    {
      accessorKey: "barcode",
      header: "Barcode",
      cell: ({ row }) => <div>{row.getValue("barcode")}</div>,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <div>{formatNumberPrice(row.getValue("price"))}</div>,
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => <div>{formatNumberPrice(row.getValue("total"))}</div>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("category") as string;
        const capitalized =
          category.charAt(0).toUpperCase() + category.slice(1);
        return <div>{capitalized}</div>;
      },
    },
    {
      accessorKey: "created_at",
      header: "Registered On",
      cell: ({ row }) => {
        const rawDate = row.getValue("created_at") as string;
        const date = new Date(rawDate);
        return (
          <div>
            {isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString()}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(String(product.id))}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(product.id)}>
                Delete product
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdateStock(product.id)}>
                Update Stock
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBarcode(product.id)}>
                Show Barcode
              </DropdownMenuItem>
              {user?.role === "manager" && (
              <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleUpdateProduct(product.id)}>Update Product</DropdownMenuItem>
              </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: products,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    globalFilterFn: (row, _, filterValue) => {
      const name = String(row.getValue("product") || "").toLowerCase();
      const category = String(row.getValue("category") || "").toLowerCase();
      const SKU = String(row.getValue("SKU") || "").toLowerCase();
      const brand = String(row.getValue("brand") || "").toLowerCase();

      const value = String(filterValue).toLowerCase();

      return (
        name.includes(value) ||
        category.includes(value) ||
        SKU.includes(value) ||
        brand.includes(value)
      );
    },
  });


  return (
    <div className="w-full">
      {user?.role === "manager" && (
          <button
            onClick={() => setIsOpen(true)}
            className="border py-1 w-[9rem] rounded text-sm flex justify-center items-center gap-1 cursor-pointer"
          >
            Register Product <Plus size={15} />
          </button>
      )}
      <div className="flex flex-col sm:flex-row gap-2 lg:items-center items-start py-3 px-2">
        <div className="space-y-1 lg:w-[20rem]">
          <Input
            placeholder="Search product or brand..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <button
            disabled={table.getSelectedRowModel().rows.length === 0}
            onClick={() => {
              const selectedIds = table
                .getSelectedRowModel()
                .rows.map((row) => row.original.id);
              selectedIds.forEach((id) => deleteProduct(id));
            }}
            className={`${
              table.getSelectedRowModel().rows.length === 0 ? "hidden" : "block"
            } text-sm px-2 text-black/50 cursor-pointer`}
          >
            <span className="flex items-center gap-1">
              <Trash size={15} />
              Delete Selected ({table.getSelectedRowModel().rows.length})
            </span>
          </button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="sm:ml-auto ml-0">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="w-full border rounded mx-2 overflow-auto  max-h-[800px]">
        <Table className="lg:min-w-full min-w-[1300px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, idx) => (
                <TableRow key={`skeleton-${idx}`}>
                  {Array.from({ length: columns.length }).map((_, colIdx) => (
                    <TableCell key={colIdx}>
                      <Skeleton className="h-4 w-full rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) :
            table.getPaginationRowModel().rows.length ? (
              table.getFilteredRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-20 text-center">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      </div>


      {/* modal section */}
      <AnimatePresence>
        {isOpen && (
          <CreateProduct isOpen={true} isClose={() => setIsOpen(false)} />
        )}
        {isUpdateOpen && (
          <UpdateStock
            isOpen={true}
            isClose={() => setIsUpdateOpen(false)}
            updatedStock={getSelectedProductQuantity}
            updateStock={handleUpdateStockSubmit}
          />
        )}
        {updateProduct && (
          <UpdateProduct
          isOpen={true}
          isClose={() => setUpdateProduct(false)}
          updateProductData={selectedProduct} 
          updateProduct={productupdate}

          />
        )}
        {barcodeModal && selectedbarcodeId !== null && (
          <Barcode
            isOpen={true}
            isClose={() => setBarcodeModal(false)}
            productId={selectedbarcodeId}
          />
        )}

        {showDeletion && (
        <ConfirmationModal
          title="Delete Product?"
          message="Are you sure you want to delete this product? This action is irreversible."
          onCancel={() => setShowDeletion(false)}
          onConfirm={confirmDelete}
        />
      )}
      </AnimatePresence>
    </div>
  );
}

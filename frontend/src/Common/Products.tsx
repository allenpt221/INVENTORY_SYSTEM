import * as React from "react"
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
} from "@tanstack/react-table"

import {  ArrowUpDown, ChevronDown, MoreHorizontal, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { productStore, type Products } from "@/Stores/productStore"

export type Product = {
  id: number
  product: string
  SKU: string
  quantity: number
  barcode: string
  brand: string
  created_at:  string | Date
  category: string
}


export const columns: ColumnDef<Products>[] = [
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
        className="cursor-pointer"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => {row.toggleSelected(!!value)
          const selected = row.original.id;
          console.log(`Row ${!!value ? "selected" : "deselected"}: ID =`, selected);
        }}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "product",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center"
      >
        Product
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const product = row.getValue("product") as String
      const capitalizedProduct = product.charAt(0).toUpperCase() + product.slice(1)
    return <div>{capitalizedProduct}</div>
  },
  },
  {
    accessorKey: "SKU",
    header: () => (
    <div className="text-center">
      SKU
    </div>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue("SKU")}</div>,
  },
  {
    accessorKey: "quantity",
    header: () => (
    <div className="text-center">
      Stock
    </div>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue("quantity")}</div>
  },
  {
    id: "Status",
    header: () => (
    <div className="text-center">
      Status
    </div>
    ),
    cell: ({ row }) => {
    const quantity = row.getValue<number>("quantity"); 
    const outStock = quantity <= 0;
    const lowStock = quantity < 10 && quantity > 0;

    return (
      <div className={`text-center`}>
        {outStock
          ? 
          <span className="bg-red-200/20 border border-red-400 rounded text-red-500 text-sm px-2">Out of Stock </span>
          : lowStock
          ? 
          <span className="bg-yellow-200/20 border border-yellow-400 rounded text-yellow-500 text-sm px-2">Low Stock </span>
          : 
          <span className="bg-green-300/20 border border-green-400 rounded text-green-500 text-sm px-2">On Stock </span>
          }
      </div>
    )
    }
  },
  {
    accessorKey: "brand",
    header: "Location",
    cell: ({ row }) => <div>{row.getValue("brand")}</div>,
  },
  {
    accessorKey: "barcode",
    header: "Supplier",
    cell: ({ row }) => <div>{row.getValue("barcode")}</div>,
  },
  {
    accessorKey: "created_at",
    header: "Registered On",
    cell: ({ row }) => {
      const rawDate = row.getValue("created_at") as string;
      const date = new Date(rawDate);
      return <div>{isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string
      const capitalized = category.charAt(0).toUpperCase() + category.slice(1) 
      return <div>{capitalized}</div>
    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const product = row.original

    const deleteProduct =  productStore((state) => state.deleteProduct);

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
            <DropdownMenuItem
              onClick={() => deleteProduct((product.id))}
            >
              Delete product
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(String(product.id))}
            >
              Update Stock
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function Products() {
  const rawProducts = productStore((state) => state.products) ?? []
  const deleteProduct =  productStore((state) => state.deleteProduct);



  const products = React.useMemo(() => {
    return Array.isArray(rawProducts)
      ? rawProducts.map((item) => ({
          ...item,
          product: item.productName,
          created_at: new Date(item.created_at),
        }))
      : []
  }, [rawProducts])

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")


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
      globalFilter
    },
    globalFilterFn: (row, _, filterValue) => {
      const name = String(row.getValue("productName") || "").toLowerCase()
      const supplier = String(row.getValue("supplier") || "").toLowerCase()
      const category = String(row.getValue("category") || "").toLowerCase()
      const SKU = String(row.getValue("SKU") || "").toLowerCase()
      const Location = String(row.getValue("location") || "").toLowerCase()

      const value = String(filterValue).toLowerCase()

      return name.includes(value) || supplier.includes(value) || category.includes(value) || SKU.includes(value) || Location.includes(value)
    }

    
  })

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-2 lg:items-center items-start py-3 px-2 ">
        <div className="space-y-1">
        <Input
          placeholder="Search product or supplier..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <button
          disabled={table.getSelectedRowModel().rows.length === 0}
          onClick={() => {
            const selectedIds = table
              .getSelectedRowModel()
              .rows
              .map(row => row.original.id)
            selectedIds.forEach(id => deleteProduct(id))
          }}
          className={`${table.getSelectedRowModel().rows.length === 0 ? 'hidden' : 'block'} text-sm px-2 text-black/50 cursor-pointer`}
        >
          <span className="flex items-center gap-1">
          <Trash size={15}/>
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
      <div className="w-full  border rounded mx-2">
        <Table className="lg:min-w-full min-w-[1300px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
    </div>
  )
}

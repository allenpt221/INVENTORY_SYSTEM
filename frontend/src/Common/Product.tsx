import { Input } from "@/components/ui/input";
import { productStore } from "@/Stores/productStore";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import debounce from "lodash/debounce";

export function Product() {
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const productSearch = productStore((state) => state.productSearch);
  const products = productStore((state) => state.products);
  const getAllProducts = productStore((state) => state.getProducts);

  const ITEMS_PER_PAGE = 15;
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const paginatedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim()) {
        productSearch(query.trim());
      } else {
        getAllProducts();
      }
    }, 500),
    []
  );

  useEffect(() => {
    setCurrentPage(1); // reset to first page on search
    debouncedSearch(search);
    return debouncedSearch.cancel;
  }, [search]);

  const formatNumberPrice = (num: number) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const capitalizeLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="py-6 max-w-[1490px] mx-auto">
      {/* Search Form */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="relative w-full max-w-2xl mb-8"
      >
        <Input
          type="text"
          placeholder="Search products, brands, or categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-14 pl-6 py-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-base placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-200 hover:shadow-md"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-lg bg-gradient-to-br transition-all duration-300 hover:scale-105"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      </form>

      {/* Products Grid */}
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {products.length > 0
            ? "All Products in Inventory"
            : "No products found"}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedProducts.map((prod, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              {/* Product Image */}
              <div className="relative w-full aspect-square bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={prod.image}
                  alt={prod.productName || "Product"}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/200?text=No+Image";
                  }}
                />
              </div>

              {/* Product Info */}
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900 dark:text-white text-xs">
                    {prod.productName}
                  </h3>
                  <p className="text-sm font-semibold text-primary whitespace-nowrap ml-2">
                    ₱{formatNumberPrice(prod.price)}
                  </p>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {prod.descp || "No description available"}
                </p>

                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Brand:</span>
                    <span className="text-xs">
                      {capitalizeLetter(prod.brand)}
                    </span>
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      prod.quantity > 0
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {prod.quantity > 0
                      ? `${prod.quantity} in stock`
                      : "Out of stock"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-4 items-center text-sm">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

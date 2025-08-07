import { Input } from "@/components/ui/input";
import { productStore } from "@/Stores/productStore";
import { AlertCircleIcon, CheckCircleIcon, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import debounce from "lodash/debounce";
import { authUserStore } from "@/Stores/authStore";
import axios from "@/lib/axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function Product() {
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasRequested, setHasRequested] = useState<boolean>(false);

  useEffect(() => {
  const alreadyRequested = localStorage.getItem("hasRequestedAccess");
  if (alreadyRequested === "true") {
    setHasRequested(true);
  }
}, []);


  const user = authUserStore((state) => state.user);

  const productSearch = productStore((state) => state.productSearch);
  const products = productStore((state) => state.listProduct) ?? [];
  const getAllProducts = productStore((state) => state.getProducts);
  const loading = productStore((state) => state.loading);


  const ITEMS_PER_PAGE = 12;
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


  const sendRequestAccess = async () => {
    try {
      const res = await axios.post("/auth/request-access", {
        userEmail: user?.email,
        userName: user?.username,
      });

      if (res.status === 200) {
        setSuccess("Request sent successfully!");
        setError(null);
        setHasRequested(true);
        localStorage.setItem("hasRequestedAccess", "true");
      } else {
        setError("Something went wrong.");
        setSuccess(null);
      }
    } catch (err: any) {
      console.error("Request failed:", err);
      setError("Failed to send access request.");
      setSuccess(null);
    }

    // Optional: auto-clear after 5 seconds
    setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 5000);
  };



// Inside the Product component

  if (user?.role === "request") {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Request Access
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
            This user is a request to manage the product. Please click the button below to request access.
          </p>
          <button
            onClick={sendRequestAccess}
            disabled={hasRequested}
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition"
          >
            {hasRequested ? "Request Sent" : "Send Request Email"}
          </button>
        </div>
        {success && (
          <Alert className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 sm:w-full w-[18rem] max-w-md md:max-w-xl px-4">
            <CheckCircleIcon className="text-green-500" />
            <AlertTitle className="text-green-700">Success</AlertTitle>
            <AlertDescription className="text-green-600">
              <p>{success}</p>
            </AlertDescription>
          </Alert>
        )}
  
        {error && (
          <Alert
            variant="destructive"
            className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 sm:w-full w-[18rem] max-w-md md:max-w-xl px-4"
          >
            <AlertCircleIcon />
            <AlertTitle>Oops! Something went wrong</AlertTitle>
            <AlertDescription>
              <p>{error}</p>
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }



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
          {loading ? (
            Array.from({ length: 15 }).map((_, index) => (
              <div
                key={index}
                className="w-full shrink-0 shadow-lg border p-4 rounded animate-pulse"
              >
                <div className="w-full h-40 bg-gray-200 rounded mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2 w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            ))
          ) : paginatedProducts.length === 0 ? (
            <p className="text-center col-span-full text-gray-500 dark:text-gray-400">
              No products found.
            </p>
          ) : (
            paginatedProducts.map((prod) => (
              <div
                key={prod.id}
                className="flex flex-col gap-3 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Product Image */}
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
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
            ))
          )}
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

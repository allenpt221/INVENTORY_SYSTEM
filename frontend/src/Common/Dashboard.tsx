import { productStore } from "@/Stores/productStore"

export function Dashboard() {
    const products = productStore((state) => state.products);

    const totalProducts = products.reduce((sum, items) =>  sum + items.total , 0);

    console.log(totalProducts);

  return (
    <div>Dashboard</div>
  )
}

import ShoppingList from "@/app/order/shopping-list/shopping-list";

export default function ShoppingListPage() {
  return (
    <>
      <section className="flex flex-col items-center justify-between p-4 max-w-6xl m-auto">
        <ShoppingList />
      </section>
    </>
  );
}

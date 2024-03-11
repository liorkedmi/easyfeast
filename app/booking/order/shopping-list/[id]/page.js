import ShoppingList from "@/app/booking/order/shopping-list/[id]/shopping-list";
import { getSessionInfo } from "@/app/actions";

export default async function ShoppingListPage({ params }) {
  // const bookingInfo = await getSessionInfo(params.id);

  return (
    <>
      <section className="flex flex-col items-start justify-between p-4 max-w-4xl m-auto">
        <ShoppingList />
      </section>
    </>
  );
}

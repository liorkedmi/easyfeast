import PageFooter from "@/components/page-footer";
import PageHeader from "@/components/page-header";
import { getSessionInfo } from "@/app/actions";

export default async function MenuLayout({ children }) {
  const bookingInfo = await getSessionInfo();

  return (
    <>
      <main className="flex flex-col items-start justify-between p-4 max-w-4xl m-auto">
        <PageHeader bookingInfo={bookingInfo} menu={true} mode="booking" />
      </main>

      {!bookingInfo.error ? (
        <div className="pb-4">{children}</div>
      ) : (
        <section className="flex flex-col items-start justify-between p-4 max-w-4xl m-auto">
          <div className="pb-4 text-xs tracking-wider">No bookings found</div>
        </section>
      )}

      <PageFooter />
    </>
  );
}

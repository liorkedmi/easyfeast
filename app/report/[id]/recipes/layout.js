import PageHeader from "@/components/page-header";
import { getSessionInfo } from "@/app/actions";

export default async function MenuLayout({ children, params }) {
  const bookingInfo = await getSessionInfo(params.id);

  return (
    <>
      <main className="flex flex-col items-start justify-between p-4 max-w-4xl m-auto">
        <PageHeader bookingInfo={bookingInfo} menu={false} mode="report" />
      </main>

      {!bookingInfo.error ? (
        <div className="pb-4">{children}</div>
      ) : (
        <section className="flex flex-col items-start justify-between p-4 max-w-4xl m-auto">
          <div className="pb-4 text-sm tracking-wider">
            Oops! There&apos;s been an error loading our menu. <br />
            Please contact us at{" "}
            <a
              href="mailto:hi@easyfeast.com?subject=Error loading menu"
              className="underline"
            >
              hi@easyfeast.com
            </a>{" "}
            so we can get this straightened out for you.
          </div>
        </section>
      )}
    </>
  );
}

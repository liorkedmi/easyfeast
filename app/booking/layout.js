import PageFooter from "@/components/page-footer";
import PageHeader from "@/components/page-header";
import { cookies } from "next/headers";
import { getSessionInfo } from "@/app/actions";

export default async function MenuLayout({ children }) {
  const cookieStore = cookies();
  const cookie = cookieStore.get("__backdoor");
  const backdoor = cookie ? cookie.value : null;
  const bookingInfo = await getSessionInfo(null, backdoor);

  return (
    <>
      <main className="flex flex-col items-start justify-between p-4 max-w-4xl m-auto">
        <PageHeader bookingInfo={bookingInfo} menu={true} mode="booking" />
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

      <PageFooter />
    </>
  );
}

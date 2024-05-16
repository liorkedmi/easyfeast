import Image from "next/image";
import Link from "next/link";
import { getSessionInfo } from "@/app/actions";

export default async function MenuLayout({ children, params }) {
  const bookingInfo = await getSessionInfo(params.id);

  return (
    <>
      <main className="flex flex-col items-center justify-between p-4 max-w-4xl m-auto">
        <Link href="/" className="hover:opacity-75 transition-all">
          <Image
            className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
            src="/logo.png"
            alt="EasyFeast"
            width={118}
            height={18}
            priority
          />
        </Link>
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

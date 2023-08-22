import PageHeader from "@/components/page-header";

export default function OrderLayout({ children }) {
  return (
    <>
      <main className="flex flex-col items-center justify-between p-4 max-w-6xl m-auto">
        <PageHeader />
      </main>
      {children}
    </>
  );
}

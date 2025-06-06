"use client";

import { Button } from "@workspace/ui/components/button";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 max-w-5xl w-full text-center">
        <div className="flex justify-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-4xl font-bold mb-4">
          Order Submitted Successfully!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Thank you for your order. We will process it shortly.
        </p>
        <Button onClick={() => router.push("/")} size="lg" className="px-8">
          Return to Home
        </Button>
      </div>
    </main>
  );
}

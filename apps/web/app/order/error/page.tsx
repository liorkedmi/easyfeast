"use client";

import { Button } from "@workspace/ui/components/button";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

export default function ErrorPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 max-w-5xl w-full text-center">
        <div className="flex justify-center mb-8">
          <XCircle className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Order Submission Failed</h1>
        <p className="text-lg text-gray-600 mb-8">
          We apologize, but there was an error submitting your order. Please try
          again or contact support if the problem persists.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => router.push("/order/submit")}
            size="lg"
            className="px-8"
          >
            Try Again
          </Button>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            size="lg"
            className="px-8"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </main>
  );
}

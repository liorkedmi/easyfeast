"use client";

import { useEffect, useState } from "react";

import { FormattedMessage } from "react-intl";
import Image from "next/image";
import SignUpForm from "./form";

export default function Page() {
  const [isPermitted, setIsPermitted] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    if (
      searchParams.has("secret") &&
      searchParams.get("secret") === "809b9c12-aa9b-4697-b5b2-cd1cb37845c7"
    ) {
      setIsPermitted(true);
    }
  }, []);

  if (!isPermitted) {
    return (
      <main className="flex flex-col items-center justify-between p-24 gap-8">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/logo.png"
          alt="EasyFeast"
          width={182}
          height={27}
          priority
        />
        <FormattedMessage
          id="page.signUp.message"
          defaultMessage="You're not allowed to access to signup. If this is a mistake, please reach out to"
        />{" "}
        <a href="mailto:support@easyfeast.com">support@easyfeast.com</a>
      </main>
    );
  }

  return <SignUpForm />;
}

"use client";

import * as React from "react";

import { Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

function PageFooter() {
  return (
    <footer className="flex flex-col items-center justify-center p-4 pb-8 max-w-4xl m-auto print:hidden">
      <Separator className="my-8" />

      <nav>
        <menu>
          <ul>
            <li className="uppercase text-xs font-semibold tracking-wider">
              <a
                href="https://www.easyfeast.com/contact-2"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-normal gap-2 color-[#1d1d1d] hover:opacity-50 transition-all"
              >
                <Mail />
                Contact Us
              </a>
            </li>
          </ul>
        </menu>
      </nav>
    </footer>
  );
}

export default PageFooter;

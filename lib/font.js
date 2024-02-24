import { Shadows_Into_Light } from "next/font/google";

const shadowsIntoLight = Shadows_Into_Light({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-shadows-into-light",
  weight: ["400"],
});

export const shadowsIntoLightClass = shadowsIntoLight.variable;

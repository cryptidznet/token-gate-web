import { Baloo_2 } from "next/font/google";
import { Luckiest_Guy } from "next/font/google";
import { Roboto_Condensed } from "next/font/google";

export const body = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const heading = Luckiest_Guy({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-heading",
});

export const dialogue = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-roboto-condensed",
});

import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ChakraProvider } from "@/components/providers/ChakraProvider";

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["300"],
  style: ["normal"],
});

export const metadata: Metadata = {
  title: "RemySales - Premium Jewelry Store",
  description: "Discover our collection of exquisite diamonds and fine jewelry",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={urbanist.className}>
        <ChakraProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}
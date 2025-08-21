import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoE Access Control",
  description: "Access control system for the Computer Engineering department",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

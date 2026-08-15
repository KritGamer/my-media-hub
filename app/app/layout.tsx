import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Private Media Hub",
  description: "Personal Vault for Videos & Picture Collections",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}

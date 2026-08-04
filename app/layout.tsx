import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Personal expense tracking app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-slate-50">
        {/* Desktop Navigation */}
        <aside className="hidden md:block w-64 fixed inset-y-0 z-50 border-r border-slate-200 bg-white">
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 md:pl-64 pb-24 md:pb-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Mobile Navigation */}
        <MobileNav />
      </body>
    </html>
  );
}

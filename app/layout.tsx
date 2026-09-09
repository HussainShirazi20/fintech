import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { FlowProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "PaisaLens — What is your money telling you?",
  description:
    "A personalised financial behaviour reflection tool. Upload a month of transactions, add life context, get three grounded insights.",
};

const NAV = [
  { href: "/", label: "Home" },
  { href: "/sample", label: "Sample" },
  { href: "/upload", label: "Upload" },
  { href: "/context", label: "Context" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <FlowProvider>
          <header className="border-b">
            <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3">
              <Link
                href="/"
                className="text-sm font-semibold tracking-tight"
              >
                PaisaLens
              </Link>
              <nav className="flex gap-1 text-sm">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="flex flex-1 flex-col px-4">{children}</main>
          <footer className="border-t">
            <div className="mx-auto w-full max-w-4xl px-4 py-3 text-center text-xs text-muted-foreground">
              Reflection, not judgement · your data never leaves this browser
              tab
            </div>
          </footer>
        </FlowProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "PlanCraft AI — Transform Ideas into Developer-Ready PRDs",
  description:
    "PlanCraft AI transforms raw product ideas into comprehensive, developer-ready Product Requirement Documents and task breakdowns. Export as a single Markdown file for your AI coding assistant.",
  keywords: [
    "PRD generator",
    "product requirements",
    "AI tool",
    "project planning",
    "developer tools",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <TooltipProvider delay={200}>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}

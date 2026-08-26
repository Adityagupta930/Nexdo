import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexdo - Smart Task Manager",
  description: "Plan your week, track daily tasks, visualize progress",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

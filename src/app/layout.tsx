import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atlantic-2 School, Gwalior",
  description: "Official website of Atlantic-2 School, Factory Road, Pinto Park, Gwalior",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}


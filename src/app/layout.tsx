import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atlantic Public School, Gwalior",
  description: "Official website of Atlantic Public School, Near Shiv Mandir, Chakra Wali Mata, Road,Pinto Park Gwalior",
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


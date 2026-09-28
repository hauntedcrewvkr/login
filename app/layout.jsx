import "./globals.css";
import { siteConfig } from "@/core/config/site-config";

export const metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-neutral-100 flex flex-col justify-center items-center antialiased">
        {children}
      </body>
    </html>
  );
}

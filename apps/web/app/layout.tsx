import "./globals.css";
import Providers from "./Providers";

export const metadata = {
  title: "پنل مدیریت",
  description: "پنل مدیریت جامع",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className="h-full">
      <body className="h-full bg-gray-50 dark:bg-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
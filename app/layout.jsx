import "./globals.css";

export const metadata = {
  title: "FinSphere",
  description: "Finance management for micro-finance operations",
  themeColor: "#2c3e50",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

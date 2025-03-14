import { SessionProvider } from "next-auth/react";
import "./globals.css"; // Adjust if your CSS file is elsewhere

export const metadata = {
  title: "Dashboard UABC",
  description: "Sistema de acceso al Dashboard UABC",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

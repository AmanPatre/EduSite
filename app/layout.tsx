import "./globals.css";
import AuthProvider from "./providers/authProvider";
import Navbar from "./components/Navbar";
export default function RootLayout({children}:{ children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar></Navbar>

          {children}

          </AuthProvider>
      </body>
    </html>
  );
}

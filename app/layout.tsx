import "./globals.css";
import AuthProvider from "./providers/authProvider";
import Navbar from "./components/Navbar";
import PageWrapper from "./components/PageWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar></Navbar>

          <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-[#05050A]"></div>

          <PageWrapper>
            {children}
          </PageWrapper>

        </AuthProvider>
      </body>
    </html>
  );
}

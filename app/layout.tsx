import "./globals.css";
import AuthProvider from "./providers/authProvider";
import Navbar from "./components/Navbar";
import PageWrapper from "./components/PageWrapper";
import { ThemeProvider } from "./providers/theme-provider";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Navbar />

            {/* Dynamic Background: White/Slate for Light, Dark #05050A for Dark */}
            <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-white dark:bg-[#05050A] transition-colors duration-300"></div>

            <PageWrapper>
              {children}
            </PageWrapper>
            <Toaster position="top-right" reverseOrder={false} toastOptions={{
              style: {
                background: '#0F0F12',
                color: '#fff',
                border: '1px solid #1e293b'
              }
            }} />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnnouncementBar from '../components/AnnouncementBar';
import ErrorBoundary from '../components/ErrorBoundary';
import { ShopProvider } from '../context/ShopContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '9tangle - Professional eBay Consultant LMS',
  description: 'Learn eBay selling from expert consultants through comprehensive courses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <ShopProvider>
            <AnnouncementBar />
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </ShopProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

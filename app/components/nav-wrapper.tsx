'use client';

import { usePathname } from 'next/navigation';
import FNAV from "./firstnav/page";
import SNAV from "./snav/page";
import Footer from "./footer/page";

export default function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth') || 
                    pathname === '/onboarding' || 
                    pathname === '/dashboard';

  if (isAuthPage) {
    return children;
  }

  return (
    <>
      <FNAV />
      <SNAV />
      {children}
      <Footer />
    </>
  );
} 
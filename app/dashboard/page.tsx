'use client';

import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "../components/loading";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/auth/signin');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !user) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center">
              <UserButton afterSignOutUrl="/"/>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold">Welcome, {user.firstName || 'User'}!</h2>
          {/* Add your dashboard content here */}
        </div>
      </main>
    </div>
  );
} 
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex space-x-4">
        <Link
          href="/auth/signin"
          className="text-gray-800 hover:text-gray-600 transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/auth/signup"
          className="text-gray-800 hover:text-gray-600 transition-colors"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-gray-800">
        Welcome, {session?.user?.name || session?.user?.email}
      </span>
      <button
        onClick={() => signOut()}
        className="text-gray-800 hover:text-gray-600 transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}

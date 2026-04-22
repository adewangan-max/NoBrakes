"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Hide sidebar entirely on login and register pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <aside className="w-64 bg-zinc-950 text-zinc-100 flex flex-col h-screen sticky top-0 border-r border-zinc-800 shadow-2xl">
      <div className="flex items-center justify-center">
        <Image
          src="/nblogo.png"
          alt="Logo"
          width={200}
          height={120}
          className="h-30 w-auto scale-140"
        />
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <Link
          href="/"
          className="block px-4 py-3 rounded-md transition-colors hover:bg-zinc-800/80 hover:text-white font-medium"
        >
          Home
        </Link>
        <Link
          href="/posts"
          className="block px-4 py-3 rounded-md transition-colors hover:bg-zinc-800/80 hover:text-white font-medium"
        >
          Posts
        </Link>
        <Link
          href="/api-demo"
          className="block px-4 py-3 rounded-md transition-colors hover:bg-zinc-800/80 hover:text-white font-medium"
        >
          API Explorer
        </Link>
      </nav>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
        {user ? (
          <div>
            <div className="px-4 py-2 mb-2">
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                Account
              </p>
              <p className="text-sm font-medium truncate mt-1">
                {user.user_metadata?.username || user.email || "Admin"}
              </p>
            </div>
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 mt-2 rounded transition-all bg-red-950/30 text-red-400 hover:bg-red-900/50 hover:text-red-300 font-medium"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full text-center px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors font-medium"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="block w-full text-center px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors font-medium shadow-lg shadow-indigo-500/20"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}

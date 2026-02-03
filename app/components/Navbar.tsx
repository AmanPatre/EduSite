"use client"
import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { useTheme } from "next-themes";
import Image from "next/image";
import { LogOut, History, BookOpen, Menu, Activity, Book, Sun, Moon } from "lucide-react"
import { useState, useEffect } from "react";


export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${isScrolled
      ? "border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#05050A]/80 backdrop-blur-md shadow-lg"
      : "border-transparent bg-transparent"
      }`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">

        {/* LEFT: Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo2.png" alt="EduSite Logo" width={100} height={200} className="rounded-lg h-10 w-auto" />
          </Link>
        </div>

        {/* CENTER: Desktop Navigation */}
        <div className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 -translate-x-1/2">
          {session && (
            <>
              <Link href="/learn" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-purple-400 transition">
                <Book className="h-4 w-4" />Learn
              </Link>
              <Link href="/roadmap" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-purple-400 transition">
                <BookOpen className="h-4 w-4" />Roadmap
              </Link>
              <Link href="/trending" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-purple-400 transition">
                <Activity className="h-4 w-4" />Trending
              </Link>
              <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-purple-400 transition">
                <History className="h-4 w-4" />Dashboard
              </Link>
            </>
          )}
        </div>

        {/* RIGHT: Desktop Profile & Theme */}
        <div className="hidden md:flex items-center gap-1">
          {session ? (
            <div className="relative ml-4 hover:cursor-pointer">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 focus:outline-none rounded-full transition hover:ring-2 hover:ring-purple-500/40 hover:cursor-pointer"
              >
                <Image
                  src={session.user?.image || "/placeholder.png"}
                  alt="Avatar"
                  width={32}
                  height={32}
                  className="rounded-full border border-slate-700"
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-[#0B0F19] border border-slate-800 shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-slate-800/50 mb-1">
                    <p className="text-sm font-semibold text-white">{session.user?.name}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{session.user?.email}</p>
                  </div>
                  <button onClick={() => signOut()} className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => signIn("google")} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700 hover:cursor-pointer shadow-lg shadow-purple-500/20">
              Sign In
            </button>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-300 hover:text-white p-2"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0B0F19] px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-5">
          {session ? (
            <>
              <Link href="/learn" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)}>Learn</Link>
              <Link href="/roadmap" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)}>Roadmap</Link>
              <Link href="/trending" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)}>Trending</Link>
              <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
              <div className="border-t border-slate-800 my-2 pt-2">
                <div className="flex items-center px-3 gap-3 mb-3">
                  <Image src={session.user?.image || "/placeholder.png"} alt="Avatar" width={32} height={32} className="rounded-full border border-slate-700" />
                  <div>
                    <p className="text-sm font-bold text-white">{session.user?.name}</p>
                    <p className="text-xs text-slate-400">{session.user?.email}</p>
                  </div>
                </div>
                <button onClick={() => signOut()} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-500/10">Sign Out</button>
              </div>
            </>
          ) : (
            <button onClick={() => signIn("google")} className="block w-full text-center mt-4 bg-purple-600 px-4 py-2 rounded-lg text-white font-bold">Sign In</button>
          )}
        </div>
      )}
    </nav>
  )
}
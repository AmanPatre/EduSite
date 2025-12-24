"use client"
import Link from "next/link"
import { useSession,signIn,signOut } from "next-auth/react"
import Image from "next/image";
import {LogOut , History , BookOpen, Menu} from "lucide-react"
import { useState } from "react";
import { directly } from './../../.next/dev/server/chunks/ssr/node_modules_66f4c7c3._';



export default function Navbar(){
    const {data:session}=useSession();


    return (
       <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex  max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

            <Link href="/" className="flex items-center gap-2">
            <Image src="/Eduzard_logo.png" alt="EduSite Logo" width={100} height={200} className="rounded-lg h-12 w-40"/></Link>
            <div className="hidden md:flex items-center gap-6">
                {session?(<>
                <Link href="/history" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600 transition"><History className="h-4"/>History</Link>
                 <Link href="/trending" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600 transition"><History className="h-4"/>Trending</Link>

                <div className="flex items-center gap-3" >
                    <span className="text-sm font-medium text-gray-700">
                  {session.user?.name}
                </span>
                <Image
                  src={session.user?.image || "/placeholder.png"}
                  alt="Avatar"
                  width={32}
                  height={32}
                  className="rounded-full border border-gray-200"
                />
                <button
                  onClick={() => signOut()}
                  className="rounded-full p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>

                </div>
                </>):(<><button
              onClick={() => signIn("google")}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Sign In
            </button>   </>)}
            </div>




        </div>
       </nav>
    )
}
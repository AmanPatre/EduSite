"use client"  
import { sign } from "crypto";
import Image from "next/image";
import {signIn , signOut  , useSession } from "next-auth/react";
import { useState } from "react";
import axios from "axios";

function Home(){
  const [query, setQuery] = useState("");
  const [loading, setloading] = useState(false);

  const {data:session}=useSession();

  const handleSearch = async()=>{
    if(!query.trim())return;

    setloading(true);
    try{
      const res = await axios.post("/api/search" , {query});
      console.log("Search Results" , res.data)

    }
    catch(error){
      console.log(error)

    }
    setloading(false);



  }
  return( <div>
    {!session ? (
      <button onClick={()=>signIn("google")} className="bg-blue-600 text-white p-3 rounded">Sign in With Google </button>):
      (<div>
        <h2>Welcome {session.user?.name}</h2>
        <Image className="rounded-full"
          src={session.user?.image ?? "/placeholder.png"}
          alt={session.user?.name ?? "User avatar"}
          width={48}
          height={48}
        />
        <button className ="bg-red-500 text-white p-3 rounded-2xl mt-4"onClick={()=>signOut()}>Signout</button>

        {/*Search bar section*/}

        <div className="w-[80vw] bg-amber-100 h-[50vh] m-auto">
          <div ><h1 className="m-auto text-center font-bold ">What Do you want to learn today ?</h1></div>
          <div className="flex gap-1.5">
          <input type="text" className="m-auto focus:ring-2 focus:ring-blue-500 border border-gray-300 rounded-1xl flex mt-2 w-[50vw] text-[12px] p-2" value={query} onChange={(e)=>setQuery(e.target.value)}placeholder="Search eg React, DSA , OS , Node.js" />
          <button className="bg-blue-600 text-white px-3 rounded-xl text-sm hover:bg-blue-700 transition" onClick={handleSearch}>{loading?"Searching..." : "Search"}</button>
</div>


        </div>


      </div>)}
  </div>)

}
export default Home

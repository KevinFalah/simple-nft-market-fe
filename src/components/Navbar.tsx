'use client'

import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <div className="bg-slate-700 px-3 py-4 flex justify-around items-center text-white">
      <div className="flex items-center gap-x-4">
        <Image alt="Logo" src="/Logo.svg" width={80} height={80} />
        <span className="text-2xl font-bold">BuySell Your NFT</span>
      </div>

      <ul className="flex items-center gap-x-6">
      <Link href="/">Home</Link>
      <Link href="/create">Create</Link>
      <Link href="/listed-items">My Listed Items</Link>
      <Link href="/purchases">My Purchases</Link>
      </ul>

      <ConnectButton chainStatus="icon" />
    </div>
  );
};

export default Navbar;

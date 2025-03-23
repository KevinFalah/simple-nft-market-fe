'use client'
import dynamic from 'next/dynamic';
import React from 'react'

const HomeComp = dynamic(() => import("@/components/HomeComp"), {
  ssr: false,
});

const Home = () => {
  return <HomeComp />
}

export default Home
'use client'

import React from "react";
import dynamic from "next/dynamic";

const CreateComp = dynamic(() => import("./CreateComp"), { ssr: false });

const Create = () => {
  return <CreateComp />;
};

export default Create;

"use client";

import React, { useCallback, useState } from "react";
import { Button, Input, Spin } from "antd";

const initialNftInput = {
  name: "",
  desc: "",
  price: 0
} 

const Create = () => {
  const { TextArea } = Input;

  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [inputNft, setInputNft] = useState(initialNftInput);

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target?.files?.[0];

      if (!file) {
        alert("No file selected");
        return;
      }

      setUploading(true);
      const data = new FormData();
      data.set("file", file);
      const uploadRequest = await fetch("/api/files", {
        method: "POST",
        body: data,
      });
      const ipfsUrl = await uploadRequest.json();
      setUrl(ipfsUrl);
      setUploading(false);
    } catch (e) {
      console.log(e);
      setUploading(false);
      alert("Trouble uploading file");
    }
  };

  const renderImg = useCallback(() => {
    {
      let result;
      const contentStyle: React.CSSProperties = {
        padding: 50,
        background: "rgba(0, 0, 0, 0.05)",
        borderRadius: 4,
      };

      const content = <div style={contentStyle} />;

      if (uploading) {
        result = (
          <Spin tip="Loading" size="large">
            {content}
          </Spin>
        );
      }

      if (url && !uploading) {
        result = (
          <img
            alt="nft-created"
            src={url}
            width={150}
            height={150}
            className="rounded-md mb-5 ml-2"
          />
        );
      }

      return result;
    }
  }, [url, uploading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value, name } = e.target;
    setInputNft((prev) => ({
      ...prev,
      [name]: value
    }))
  };

  const createNft = async () => {
    const metadata = {
      ...inputNft,
      image: url,
    };

    try {
      const res = await fetch("/api/pin-json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      });
      const data = await res.json();
      console.log('data ==>> ', data)
    } catch (error) {
      console.error("Error uploading metadata:", error);
    }
  }

  console.log(inputNft, url)
  return (
    <div className="flex justify-center items-center w-full pt-10">
      <main className="w-[50%]">
        <h2 className="text-4xl mb-8 font-bold text-slate-700">Create NFT</h2>
        <Input
          className="mb-2"
          size="large"
          type="file"
          onChange={uploadFile}
        />
        {renderImg()}
        <Input
          className="placeholder:text-black mb-5"
          size="large"
          placeholder="Name"
          onChange={handleChange}
          name="name"
        />
        <TextArea
          rows={3}
          placeholder="Description"
          className="placeholder:text-black mb-5"
          onChange={handleChange}
          name="desc"
        />
        <Input
          placeholder="Price in ETH"
          className="placeholder:text-black"
          size="large"
          type="number"
          onChange={handleChange}
          name="price"
        />

        <button onClick={createNft} className="w-full mt-5 font-bold bg-blue-500 text-white p-3 rounded-lg">
          CREATE & LIST NFT
        </button>
      </main>
    </div>
  );
};

export default Create;

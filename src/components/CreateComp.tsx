"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button, Input, Spin } from "antd";
import {
  useAccount,
  useWatchContractEvent,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { nftAbi } from "@/contracts/abi/Nft";
import { marketplaceAbi } from "@/contracts/abi/Marketplace";
import { contractAddresses } from "@/contracts/address";
import { config } from "@/lib/config";
import { ethers } from "ethers";

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL;

const initialNftInput = {
  name: "",
  desc: "",
  price: 0,
};

const CreateComp = () => {
  const {
    writeContractAsync: writeContractMint,
    data: dataNftMint,
    isPending: isPendingNftMint,
    isSuccess: isSuccessNftMint,
  } = useWriteContract({ config });

  const {
    writeContractAsync: writeContractNftApprove,
    isSuccess: isSuccessNftApprove,
  } = useWriteContract({
    config,
  });

  // const { writeContractAsync: writeContractMakeItem } = useWriteContract({
  //   config,
  // });

  const {
    data: tokenId,
    refetch,
    isFetched,
  } = useReadContract({
    abi: nftAbi,
    address: contractAddresses.nft as `0x${string}`,
    functionName: "getCurrentTokenId",
    chainId: 31337,
  });

  // useWatchContractEvent({
  //   config,
  //   address: contractAddresses.nft as `0x${string}`,
  //   abi: nftAbi,
  //   eventName: "TokenIdMinted",
  //   onLogs(logs) {
  //     console.log("New logs!", logs);
  //   },
  //   onError(error) {
  //     console.error("Wagmi event error:", error);
  //   },
  // });

  const { isConnected } = useAccount();
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
            className="rounded-md mb-5 ml-2 border-gray-400"
          />
        );
      }

      return result;
    }
  }, [url, uploading]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value, name } = e.target;
    setInputNft((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      const tokenUri = `https://ipfs.io/ipfs/${data?.IpfsHash}`;
      await mintAndList(tokenUri);
      console.log(
        "mintAndList tokenuri and metadata ==>> ",
        tokenUri,
        metadata
      );
    } catch (error) {
      console.error("Error uploading metadata:", error);
    }
  };

  const mintAndList = async (tokenUri: string) => {
    console.log("heree before refetch");
    await writeContractMint({
      abi: nftAbi,
      address: contractAddresses.nft,
      functionName: "mint",
      args: [tokenUri],
    });
    await refetch();
    console.log("after refetch");
  };

  const approveAndMakeItem = async () => {
    if (isFetched && isSuccessNftMint) {
      const _tokenId = !tokenId ? 1 : Number(tokenId) + 1;
      console.log(_tokenId, "<- tokenApprove");
      await writeContractNftApprove({
        abi: nftAbi,
        address: contractAddresses.nft,
        functionName: "approve",
        args: [contractAddresses.marketplace, BigInt(_tokenId)],
      });

      const { price } = inputNft;
      const _price = ethers.parseEther(price.toString());

      await writeContractNftApprove({
        abi: marketplaceAbi,
        address: contractAddresses.marketplace,
        functionName: "makeItem",
        args: [contractAddresses.nft, BigInt(_tokenId), _price],
      });
      setInputNft(initialNftInput);
      setUrl("");
    }
  };

  const isDisabledButton = () =>
    isPendingNftMint || !inputNft.desc || !inputNft.name || !inputNft.price;

  useEffect(() => {
    approveAndMakeItem();
  }, [isSuccessNftMint]);

  return (
    <div className="flex justify-center items-center w-full pt-10">
      {isConnected ? (
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
            value={inputNft.name}
          />
          <TextArea
            rows={3}
            placeholder="Description"
            className="placeholder:text-black mb-5"
            onChange={handleChange}
            name="desc"
            value={inputNft.desc}
          />
          <Input
            placeholder="Price in ETH"
            className="placeholder:text-black"
            size="large"
            type="number"
            onChange={handleChange}
            name="price"
            value={inputNft.price}
          />

          <button
            disabled={isDisabledButton()}
            onClick={createNft}
            className={`${isDisabledButton() ? "opacity-90" : "opacity-100"} w-full mt-5 font-bold bg-blue-500 text-white p-3 rounded-lg`}
          >
            {isPendingNftMint ? <Spin /> : <span>CREATE & LIST NFT</span>}
          </button>
        </main>
      ) : (
        <div className="text-xl font-bold">You haven't connected</div>
      )}
    </div>
  );
};

export default CreateComp;

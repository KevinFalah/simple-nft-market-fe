"use client";

import Navbar from "@/components/Navbar";
import Image from "next/image";
import { useAccount, useCall, useReadContract, useReadContracts } from "wagmi";
import { Card, Spin } from "antd";
import { nftAbi } from "@/contracts/abi/Nft";
import { contractAddresses } from "@/contracts/address";
import { marketplaceAbi } from "@/generated";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

const { Meta } = Card;

interface MarketplaceItem {
  itemId: bigint;
  nft: string; // address of the NFT contract
  tokenId: bigint;
  price: bigint;
  seller: string;
  sold: boolean;
}

interface ReadCallResult<T> {
  result: T;
}

export default function Home() {
  const [cards, setCards] = useState<ItemCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { data: getTotalAmount, refetch } = useReadContract({
    abi: marketplaceAbi,
    address: contractAddresses.marketplace,
    functionName: "getCurrentTokenCount",
  });

  const itemCalls = useMemo(() => {
    let result = [];
    console.log(
      Number(getTotalAmount?.toString()),
      "<-- Number(getTotalAmount?.toString())"
    );
    for (let i = 1; i <= Number(getTotalAmount?.toString()); i++) {
      result.push({
        address: contractAddresses.marketplace,
        abi: marketplaceAbi,
        functionName: "getItem",
        args: [BigInt(i)],
      });
    }

    return result;
  }, [getTotalAmount]);

  const { data: marketplaceCalls } = useReadContracts({
    contracts: itemCalls,
  });
  const tokenUriCalls = useMemo(() => {
    if (!marketplaceCalls) return [];
    return marketplaceCalls?.map((item) => {
      const tokenId = BigInt(item?.result?.tokenId);
      return {
        address: contractAddresses.nft,
        abi: nftAbi,
        functionName: "tokenURI",
        args: [tokenId],
      };
    });
  }, [marketplaceCalls]);

  const { data: tokenUris } = useReadContracts({
    contracts: tokenUriCalls,
  });

  const fetchUri = async (uri: string): Promise<JsonUriType | undefined> => {
    console.log(uri, "<urii");
    try {
      const response = await fetch(uri);
      const metadata = await response.json();
      // console.log(uri, response, "<- res ");
      return metadata;
    } catch (error) {
      console.error("Error fetching URI:", error);
      return undefined;
    }
  };

  const itemCards = useCallback(async (): Promise<ItemCardType[]> => {
    if (!marketplaceCalls || !tokenUris) return [];
    const items = await Promise.all(
      marketplaceCalls.map(async (item, i) => {
        const tokenUri = tokenUris[i]?.result;
        console.log(tokenUri, i, "<- ind");
        let metadata = {};
        if (tokenUri) {
          try {
            metadata = await fetchUri(tokenUri as string);
          } catch (err) {
            console.error("Error fetching metadata for item", i, err);
          }
        }
        return {
          ...item.result,
          ...metadata,
        };
      })
    );
    return items;
  }, [marketplaceCalls, tokenUris]);

  const loadCards = async () => {
    try {
      const data = await itemCards();
      setCards(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, [itemCards]);

  console.log(cards, "<- itemCards");

  //! FETCH URI

  return (
    <>
      <div className="px-20 py-5 min-h-screen">
        <main className="flex flex-wrap gap-y-5 gap-x-16 pl-5">
          <RenderItemCards items={cards} isLoading={loading} />
        </main>
      </div>
    </>
  );
}

const RenderItemCards = ({
  items,
  isLoading,
}: {
  items: ItemCardType[];
  isLoading: boolean;
}) => {
  const { address } = useAccount();

  if (items.length <= 0 && !isLoading)
    return <div className="text-2xl text-black font-semibold">Empty</div>;
  if (isLoading) return <Spin />;
  return items?.map((el, i) => (
    <Card
      key={i}
      hoverable
      style={{ width: 240 }}
      cover={<img alt={el.image} src={el.image} />}
    >
      <Meta
        title={el.name}
        description={`Owner: ${el.seller === address ? "You" : el.seller}`}
      />
      <button className="w-full mt-5 font-bold hover:bg-blue-300 bg-blue-500 text-white p-3 rounded-lg">
        Buy for {el.price} ETH
      </button>
    </Card>
  ));
};

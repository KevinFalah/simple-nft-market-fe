"use client";

import Navbar from "@/components/Navbar";
import Image from "next/image";
import {
  useAccount,
  useCall,
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWatchPendingTransactions,
  useWriteContract,
} from "wagmi";
import { Card, Spin } from "antd";
import { nftAbi } from "@/contracts/abi/Nft";
import { contractAddresses } from "@/contracts/address";
import { marketplaceAbi } from "@/generated";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ethers } from "ethers";
import { config } from "@/lib/config";

const { Meta } = Card;

export default function Home() {
  const [cards, setCards] = useState<ItemCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    writeContract: writeContractPurchases,
    data: dataHashPurchases,
    isPending,
    isError: errorPurchases,
  } = useWriteContract({
    config,
  });

  const { error } = useWaitForTransactionReceipt({
    hash: dataHashPurchases,
  });

  console.log(error, "<--- error purchases");

  const { data: getTotalAmount, refetch } = useReadContract({
    abi: marketplaceAbi,
    address: contractAddresses.marketplace,
    functionName: "getCurrentTokenCount",
  });

  const selectedNft = useRef<number | null>(null);

  const itemCalls = useMemo(() => {
    let result = [];

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
        let metadata: JsonUriType | undefined = {} as JsonUriType;

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

  const getTotalPrice = async (itemId: number) => {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    const contract = new ethers.Contract(
      contractAddresses.marketplace,
      marketplaceAbi,
      provider
    );

    const number = await contract.getTotalPrice(itemId);
    return number;
  };

  const handlePurchases = async (itemId: number) => {
    selectedNft.current = itemId;
    const totalPrice = await getTotalPrice(itemId);
    console.log(
      totalPrice,
      ethers.parseEther(totalPrice.toString()),
      "<= totalPrice"
    );

    writeContractPurchases({
      abi: marketplaceAbi,
      address: contractAddresses.marketplace,
      functionName: "purchaseItem",
      args: [BigInt(itemId)],
      value: totalPrice,
    });
  };

  const loadCards = async () => {
    try {
      const data = await itemCards();
      console.log(data, '<- ')
      setCards(data);
    } catch (err: any) {
      console.log(err, "<- err loadCards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, [itemCards]);

  return (
    <>
      <div className="px-20 py-5 min-h-screen">
        <main className="flex flex-wrap gap-y-5 gap-x-16 pl-5">
          <RenderItemCards
            items={cards}
            isLoading={loading}
            handlePurchases={handlePurchases}
          />
        </main>
      </div>
    </>
  );
}

const RenderItemCards = ({
  items,
  isLoading,
  isBuying,
  handlePurchases,
  purchasesHash,
}: {
  items: ItemCardType[];
  isLoading: boolean;
  isBuying?: boolean;
  purchasesHash?: string;
  handlePurchases: (itemId: number) => void;
}) => {
  const { address, isConnected } = useAccount();
  const { isSuccess: isSuccessPurchases, isLoading: isLoadingPurchases } =
    useWaitForTransactionReceipt({ hash: purchasesHash as `0x${string}` });

  const isDisabled = () => isLoadingPurchases || !isConnected;

  if (items.length <= 0 && !isLoading)
    return <div className="text-2xl text-black font-semibold">Empty</div>;
  if (isLoading) return <Spin />;

  return items?.map((el, i) => {
    const userIsSeller = el.seller === address;
    return (
      <Card
        key={i}
        hoverable
        style={{ width: 240 }}
        cover={<img alt={el.image} src={el.image} />}
      >
        <Meta
          title={el.name}
          description={`Owner: ${userIsSeller ? "You" : el.seller}`}
        />
        <button
          onClick={() => handlePurchases(Number(el.itemId))}
          disabled={userIsSeller || isDisabled()}
          className={`w-full mt-5 font-bold  bg-blue-500 text-white p-3 rounded-lg ${userIsSeller || isDisabled() ? "opacity-40" : "hover:bg-blue-300"}`}
        >
          {isLoadingPurchases ? <Spin /> : `Buy for ${el.price} ETH`}
        </button>
      </Card>
    );
  });
};

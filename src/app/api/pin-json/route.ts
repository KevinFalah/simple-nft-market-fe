import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON data from the request body
    const jsonData = await request.json();

    // Prepare the data for Pinata
    const data = JSON.stringify({
      pinataContent: jsonData,
      pinataMetadata: {
        name: `${jsonData.name}.json`
      }
    });

    // Get your JWT from an environment variable (keep it secret on the server)
    const JWT = process.env.PINATA_JWT;
    if (!JWT) {
      throw new Error("Missing PINATA_JWT");
    }

    // Call Pinata's pinJSONToIPFS endpoint
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JWT}`,
      },
      body: data,
    });

    const resData = await res.json();
    // Return the result (which contains the IPFS hash) back to the client
    return NextResponse.json(resData, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
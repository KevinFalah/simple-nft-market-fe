import { pinata } from "@/utils/configPinata";
import { NextResponse, type NextRequest } from "next/server";

export async function POST (request: Request) {

    const data = request.json();

    const gatewayAccessKey = process.env.GATEWAY_ACCESS_KEY as string;
    const file = await pinata.gateways.get(data);
    console.log(file, data, '<-- file')
    return NextResponse.json(file, { status: 200 });
}
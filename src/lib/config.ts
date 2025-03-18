'use client'

import { http, createConfig, cookieStorage } from 'wagmi'
import { mainnet, sepolia, anvil } from 'wagmi/chains'
import { getDefaultConfig, Chain } from '@rainbow-me/rainbowkit'

const projectId = '';
const supportedChains: Chain[] = [sepolia];

export const config = createConfig({
  chains: [mainnet, sepolia, anvil],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/RcaBbwbqVbxxw_qr-ucozqP1KxlWRsHI'),
    [anvil.id]: http('http://127.0.0.1:8545'),
  },
  syncConnectedChain: true,
})
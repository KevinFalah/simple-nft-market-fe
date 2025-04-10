export const marketplaceAbi = [
  {
    type: 'constructor',
    inputs: [{ name: '_feePercent', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentTokenCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'itemId', internalType: 'uint256', type: 'uint256' }],
    name: 'getItem',
    outputs: [
      {
        name: '',
        internalType: 'struct Marketplace.Item',
        type: 'tuple',
        components: [
          { name: 'itemId', internalType: 'uint256', type: 'uint256' },
          { name: 'nft', internalType: 'contract IERC721', type: 'address' },
          { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
          { name: 'price', internalType: 'uint256', type: 'uint256' },
          { name: 'seller', internalType: 'address payable', type: 'address' },
          { name: 'sold', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_itemId', internalType: 'uint256', type: 'uint256' }],
    name: 'getTotalPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'itemCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'items',
    outputs: [
      { name: 'itemId', internalType: 'uint256', type: 'uint256' },
      { name: 'nft', internalType: 'contract IERC721', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'price', internalType: 'uint256', type: 'uint256' },
      { name: 'seller', internalType: 'address payable', type: 'address' },
      { name: 'sold', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_nft', internalType: 'contract IERC721', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'price', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'makeItem',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_itemId', internalType: 'uint256', type: 'uint256' }],
    name: 'purchaseItem',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'itemId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'nft', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'price',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'seller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'buyer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Bought',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'itemId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'nft', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'price',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'seller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Offered',
  },
  { type: 'error', inputs: [], name: 'Marketplace__ItemIsMissing' },
  { type: 'error', inputs: [], name: 'Marketplace__ItemSold' },
  {
    type: 'error',
    inputs: [{ name: 'price', internalType: 'uint256', type: 'uint256' }],
    name: 'Marketplace__PriceMustAboveZero',
  },
  { type: 'error', inputs: [], name: 'Marketplace__SentIsFailed' },
  {
    type: 'error',
    inputs: [{ name: 'price', internalType: 'uint256', type: 'uint256' }],
    name: 'Marketplace__ValueMustAboveTotalPrice',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
] as const
import { defineChain } from 'viem';

// ─── Flow EVM Testnet Chain Definition ───
export const flowTestnet = defineChain({
  id: 545,
  name: 'Flow EVM Testnet',
  nativeCurrency: { name: 'Flow', symbol: 'FLOW', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet.evm.nodes.onflow.org'] },
  },
  blockExplorers: {
    default: { name: 'FlowScan', url: 'https://evm-testnet.flowscan.io' },
  },
  testnet: true,
});

// ─── Deployed Contract Addresses (Flow EVM Testnet) ───
export const CONTRACTS = {
  USDC: '0x1b568EaBb15edb5CAd05ac3Ba983e238DE1854B3' as `0x${string}`,
  FACTORY: '0xE7579839f736Be431750DCC8715de34305C71c4E' as `0x${string}`,
} as const;

// ─── ABIs ───

export const USDC_ABI = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'allowance', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { name: 'faucet', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { name: 'decimals', type: 'function', stateMutability: 'pure', inputs: [], outputs: [{ type: 'uint8' }] },
  { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
] as const;

export const FACTORY_ABI = [
  { name: 'getMarketCount', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'getMarkets', type: 'function', stateMutability: 'view', inputs: [{ name: '_offset', type: 'uint256' }, { name: '_limit', type: 'uint256' }], outputs: [{ type: 'address[]' }] },
  { name: 'getMarketsByCategory', type: 'function', stateMutability: 'view', inputs: [{ name: '_category', type: 'string' }], outputs: [{ type: 'address[]' }] },
  { name: 'isMarket', type: 'function', stateMutability: 'view', inputs: [{ name: '', type: 'address' }], outputs: [{ type: 'bool' }] },
  { name: 'allMarkets', type: 'function', stateMutability: 'view', inputs: [{ name: '', type: 'uint256' }], outputs: [{ type: 'address' }] },
] as const;

export const MARKET_ABI = [
  { name: 'getMarketInfo', type: 'function', stateMutability: 'view', inputs: [], outputs: [
    { name: '_question', type: 'string' },
    { name: '_category', type: 'string' },
    { name: '_imageUri', type: 'string' },
    { name: '_endTime', type: 'uint256' },
    { name: '_totalYes', type: 'uint256' },
    { name: '_totalNo', type: 'uint256' },
    { name: '_totalCollateral', type: 'uint256' },
    { name: '_resolved', type: 'bool' },
    { name: '_outcome', type: 'uint8' },
    { name: '_createdAt', type: 'uint256' },
  ] },
  { name: 'getUserPosition', type: 'function', stateMutability: 'view', inputs: [{ name: '_user', type: 'address' }], outputs: [
    { name: '_yes', type: 'uint256' },
    { name: '_no', type: 'uint256' },
    { name: '_claimed', type: 'bool' },
  ] },
  { name: 'getYesPrice', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'getNoPrice', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'buyShares', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: '_isYes', type: 'bool' }, { name: '_amount', type: 'uint256' }], outputs: [] },
  { name: 'sellShares', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: '_isYes', type: 'bool' }, { name: '_amount', type: 'uint256' }], outputs: [] },
  { name: 'claimWinnings', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { name: 'resolved', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool' }] },
  { name: 'outcome', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { name: 'question', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'category', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'endTime', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'totalYesShares', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'totalNoShares', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'totalCollateral', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'yesShares', type: 'function', stateMutability: 'view', inputs: [{ name: '', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'noShares', type: 'function', stateMutability: 'view', inputs: [{ name: '', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'collateralToken', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
] as const;

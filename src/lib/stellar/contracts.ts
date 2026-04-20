// ─── Stellar Contract Addresses (Testnet) ───
export const STELLAR_CONTRACTS = {
  USDC: process.env.NEXT_PUBLIC_STELLAR_USDC ?? 'CDDEX6FS3GISJG366H7RRP432UZ6P3QBDWFFF6RBQE3D7F6KQ4SNFSWC',
  FACTORY: process.env.NEXT_PUBLIC_STELLAR_FACTORY ?? 'CDGM6NNJGNSI36L32A4NDVVJXMU4CPDNYERPR6F44SPRWCAMOGHE6OHP',
  CLOB: process.env.NEXT_PUBLIC_STELLAR_CLOB ?? 'CBCCF22KDF6UMKX6QCKNQ6LE4ROEOIAZEHO7ZJKUANKN6FF5MLWXUJ6O',
  ORACLE: process.env.NEXT_PUBLIC_STELLAR_ORACLE ?? 'CCZCR627NOPJGWSQ7W7SRFM5YXTUCJ4MLUEKFZJXHTEIAZWYXROHHZK2',
} as const;

export const STELLAR_RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC ?? 'https://soroban-testnet.stellar.org';

export const STELLAR_NETWORK =
  (process.env.NEXT_PUBLIC_STELLAR_NETWORK as 'testnet' | 'mainnet') ?? 'testnet';

export const STELLAR_NETWORK_PASSPHRASE =
  STELLAR_NETWORK === 'mainnet'
    ? 'Public Global Stellar Network ; September 2015'
    : 'Test SDF Network ; September 2015';

export const STELLAR_EXPLORER_BASE =
  STELLAR_NETWORK === 'mainnet'
    ? 'https://stellar.expert/explorer/public'
    : 'https://stellar.expert/explorer/testnet';

export function explorerLink(address: string) {
  return `${STELLAR_EXPLORER_BASE}/contract/${address}`;
}

export function accountLink(address: string) {
  return `${STELLAR_EXPLORER_BASE}/account/${address}`;
}

/**
 * Freighter wallet helpers.
 * All functions are browser-only — guard with typeof window !== 'undefined'.
 */

export interface FreighterAccount {
  address: string;
  network: string;
}

async function getFreighter() {
  if (typeof window === 'undefined') return null;
  // Dynamic import so SSR doesn't break
  const mod = await import('@stellar/freighter-api');
  return mod;
}

/** Check if Freighter extension is installed */
export async function isFreighterInstalled(): Promise<boolean> {
  const f = await getFreighter();
  if (!f) return false;
  try {
    return await f.isConnected().then(r => r.isConnected);
  } catch {
    return false;
  }
}

/** Request wallet connection — opens Freighter modal */
export async function connectFreighter(): Promise<FreighterAccount | null> {
  const f = await getFreighter();
  if (!f) return null;
  try {
    const result = await f.requestAccess();
    if (result.error) return null;
    const addr = await f.getAddress();
    const net = await f.getNetwork();
    return { address: addr.address, network: net.network };
  } catch {
    return null;
  }
}

/** Get currently connected public key (null if not connected) */
export async function getConnectedAddress(): Promise<string | null> {
  const f = await getFreighter();
  if (!f) return null;
  try {
    const result = await f.getAddress();
    return result.address ?? null;
  } catch {
    return null;
  }
}

/** Sign an XDR transaction string with Freighter */
export async function signTransactionXDR(
  xdrTx: string,
  networkPassphrase: string,
): Promise<string> {
  const f = await getFreighter();
  if (!f) throw new Error('Freighter not available');
  const result = await f.signTransaction(xdrTx, { networkPassphrase });
  if (result.error) throw new Error(`Freighter signing error: ${result.error}`);
  return result.signedTxXdr;
}

/** Shorten a Stellar address for display */
export function shortenStellarAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return address.slice(0, 4) + '···' + address.slice(-4);
}

/** Generate a deterministic avatar gradient from a Stellar address */
export function stellarAvatarGradient(address: string): string {
  if (!address) return 'linear-gradient(135deg, #00D26A, #00B85E)';
  const h1 = address.charCodeAt(2) * 1.4;
  const h2 = (h1 + 140) % 360;
  return `linear-gradient(135deg, hsl(${h1},80%,55%) 0%, hsl(${h2},80%,45%) 100%)`;
}

/**
 * Call the MockUSDC faucet — mints 10,000 testnet USDC to the caller.
 * Requires Freighter to sign the transaction.
 */
export async function callUsdcFaucet(address: string): Promise<string> {
  const [
    { Contract, TransactionBuilder, BASE_FEE, Address, rpc: rpcNs },
    { getSorobanServer },
    { STELLAR_CONTRACTS, STELLAR_NETWORK_PASSPHRASE },
  ] = await Promise.all([
    import('@stellar/stellar-sdk'),
    import('@/lib/stellar/client'),
    import('@/lib/stellar/contracts'),
  ]);

  const server = getSorobanServer();
  const account = await server.getAccount(address);
  const contract = new Contract(STELLAR_CONTRACTS.USDC);
  const addrScVal = new Address(address).toScVal();

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call('faucet', addrScVal))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpcNs.Api.isSimulationError(sim)) throw new Error(`Simulation failed: ${sim.error}`);

  const assembled = rpcNs.assembleTransaction(tx, sim).build();
  const signedXdr = await signTransactionXDR(assembled.toXDR(), STELLAR_NETWORK_PASSPHRASE);

  const result = await server.sendTransaction(
    TransactionBuilder.fromXDR(signedXdr, STELLAR_NETWORK_PASSPHRASE),
  );
  if (result.status === 'ERROR') throw new Error(`Submit failed: ${result.errorResult?.toXDR()}`);
  return result.hash;
}

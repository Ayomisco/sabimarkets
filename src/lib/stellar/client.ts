import { rpc, Contract, Networks, TransactionBuilder, BASE_FEE, xdr } from '@stellar/stellar-sdk';
import { STELLAR_RPC_URL, STELLAR_NETWORK_PASSPHRASE } from './contracts';

// Re-export for convenience
export { rpc, Networks, TransactionBuilder, BASE_FEE, xdr };

// Singleton RPC server
let _server: rpc.Server | null = null;

export function getSorobanServer(): rpc.Server {
  if (!_server) {
    _server = new rpc.Server(STELLAR_RPC_URL, { allowHttp: false });
  }
  return _server;
}

// Simulate + get footprint for a contract call
export async function simulateTransaction(tx: import('@stellar/stellar-sdk').Transaction): Promise<rpc.Api.SimulateTransactionResponse> {
  const server = getSorobanServer();
  return server.simulateTransaction(tx);
}

// Helper: read a contract value (view call — no auth needed)
export async function readContract<T = unknown>(
  contractId: string,
  method: string,
  args: xdr.ScVal[] = [],
): Promise<T> {
  const server = getSorobanServer();
  const contract = new Contract(contractId);
  const account = await server.getAccount('GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN');
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const result = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(result)) {
    throw new Error(`Contract read error: ${result.error}`);
  }
  if (!result.result) throw new Error(`No result for ${method}`);
  return xdr.ScVal.fromXDR(result.result.retval.toXDR('hex'), 'hex') as unknown as T;
}

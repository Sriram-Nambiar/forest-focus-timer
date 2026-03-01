import { Connection } from '@solana/web3.js';
import { RPC_ENDPOINTS, type SolanaCluster } from './config';

let cachedConnection: Connection | null = null;
let cachedCluster: SolanaCluster | null = null;

/**
 * Returns a memoized Connection instance. Recreates only when the cluster changes.
 */
export function getConnection(cluster: SolanaCluster): Connection {
  if (cachedConnection && cachedCluster === cluster) {
    return cachedConnection;
  }
  cachedConnection = new Connection(RPC_ENDPOINTS[cluster], 'confirmed');
  cachedCluster = cluster;
  return cachedConnection;
}

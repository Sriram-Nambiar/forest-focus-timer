import { create } from 'zustand';
import { STORAGE_KEYS } from '../constants';
import { safeGetItem, safeSetItem } from '../utils/storage';
import { DEFAULT_CLUSTER, type SolanaCluster } from '../solana/config';

interface WalletState {
  /** Base58-encoded public key (null when disconnected) */
  publicKey: string | null;
  /** Currently selected Solana cluster */
  cluster: SolanaCluster;
  /** Whether a wallet operation is in progress */
  connecting: boolean;
  /** Last reward transaction timestamp for rate-limiting */
  lastRewardTimestamp: number;
  /** Most recent transaction signature */
  lastTxSignature: string | null;

  setPublicKey: (key: string | null) => void;
  setCluster: (cluster: SolanaCluster) => void;
  setConnecting: (value: boolean) => void;
  setLastRewardTimestamp: (ts: number) => void;
  setLastTxSignature: (sig: string | null) => void;
  loadWalletSettings: () => Promise<void>;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  publicKey: null,
  cluster: DEFAULT_CLUSTER,
  connecting: false,
  lastRewardTimestamp: 0,
  lastTxSignature: null,

  setPublicKey: (key: string | null) => {
    set({ publicKey: key });
  },

  setCluster: (cluster: SolanaCluster) => {
    set({ cluster, publicKey: null, lastTxSignature: null });
    safeSetItem(STORAGE_KEYS.WALLET_CLUSTER, cluster);
  },

  setConnecting: (value: boolean) => {
    set({ connecting: value });
  },

  setLastRewardTimestamp: (ts: number) => {
    set({ lastRewardTimestamp: ts });
  },

  setLastTxSignature: (sig: string | null) => {
    set({ lastTxSignature: sig });
  },

  loadWalletSettings: async () => {
    const saved = await safeGetItem<string>(STORAGE_KEYS.WALLET_CLUSTER);
    if (saved === 'devnet' || saved === 'mainnet-beta') {
      set({ cluster: saved });
    }
  },

  disconnect: () => {
    set({ publicKey: null, connecting: false, lastTxSignature: null });
  },
}));

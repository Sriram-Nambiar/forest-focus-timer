import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PublicKey } from '@solana/web3.js';
import {
  transact,
  Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { COLORS } from '../constants';
import { useSettingsStore } from '../store/settingsStore';
import { useWalletStore } from '../store/walletStore';
import {
  getExplorerUrl,
  REWARD_AMOUNT_SOL,
  REWARD_COOLDOWN_MS,
  type SolanaCluster,
} from '../solana/config';
import { buildRewardTransaction, buildMemoTransaction, confirmTransaction } from '../solana/transactions';

const APP_IDENTITY = {
  name: 'Seeker Solana Forest',
  uri: 'https://forestfocus.app',
};

export default function WalletScreen() {
  const darkMode = useSettingsStore((s) => s.darkMode);
  const {
    publicKey,
    cluster,
    connecting,
    lastTxSignature,
    lastRewardTimestamp,
    setPublicKey,
    setCluster,
    setConnecting,
    setLastTxSignature,
    setLastRewardTimestamp,
  } = useWalletStore();

  const [txLoading, setTxLoading] = useState(false);
  const txInProgressRef = useRef(false);

  const handleConnect = useCallback(async () => {
    if (connecting) return;
    setConnecting(true);
    try {
      const authorizationResult = await transact(
        async (wallet: Web3MobileWallet) => {
          return await wallet.authorize({
            identity: APP_IDENTITY,
            cluster: cluster as 'devnet' | 'mainnet-beta',
          });
        },
      );

      if (authorizationResult?.accounts?.[0]) {
        const pubkeyBytes = authorizationResult.accounts[0].address;
        const pubkey = new PublicKey(pubkeyBytes);
        setPublicKey(pubkey.toBase58());
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message.includes('cancel') || message.includes('reject')) {
        Alert.alert('Connection Cancelled', 'You cancelled the wallet connection.');
      } else if (message.includes('not found') || message.includes('not installed')) {
        Alert.alert(
          'Wallet Not Found',
          'Please install a Solana wallet app (e.g., Phantom, Solflare) to connect.',
        );
      } else {
        Alert.alert('Connection Error', `Failed to connect wallet: ${message}`);
      }
    } finally {
      setConnecting(false);
    }
  }, [connecting, cluster, setPublicKey, setConnecting]);

  const handleDisconnect = useCallback(() => {
    Alert.alert('Disconnect Wallet', 'Are you sure you want to disconnect?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect',
        style: 'destructive',
        onPress: () => {
          useWalletStore.getState().disconnect();
        },
      },
    ]);
  }, []);

  const handleSendReward = useCallback(async () => {
    if (!publicKey || txInProgressRef.current) return;

    // Rate-limit
    const now = Date.now();
    if (now - lastRewardTimestamp < REWARD_COOLDOWN_MS) {
      const waitSec = Math.ceil((REWARD_COOLDOWN_MS - (now - lastRewardTimestamp)) / 1000);
      Alert.alert('Please Wait', `You can send another reward in ${waitSec} seconds.`);
      return;
    }

    txInProgressRef.current = true;
    setTxLoading(true);
    try {
      const payerPubkey = new PublicKey(publicKey);
      const rewardTx = await buildRewardTransaction(payerPubkey, cluster);

      const signedResult = await transact(
        async (wallet: Web3MobileWallet) => {
          await wallet.authorize({
            identity: APP_IDENTITY,
            cluster: cluster as 'devnet' | 'mainnet-beta',
          });

          const signedTransactions = await wallet.signAndSendTransactions({
            transactions: [rewardTx],
          });
          return signedTransactions;
        },
      );

      if (signedResult?.[0]) {
        const sig = typeof signedResult[0] === 'string'
          ? signedResult[0]
          : Buffer.from(signedResult[0] as Uint8Array).toString('base64');

        setLastTxSignature(sig);
        setLastRewardTimestamp(Date.now());

        const confirmed = await confirmTransaction(sig, cluster);
        if (confirmed) {
          Alert.alert('Reward Sent! 🎉', `Sent ${REWARD_AMOUNT_SOL} SOL to treasury.\nSignature: ${sig.slice(0, 16)}...`);
        } else {
          Alert.alert('Pending', 'Transaction submitted but not yet confirmed.');
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message.includes('insufficient') || message.includes('balance')) {
        Alert.alert('Insufficient Balance', 'You do not have enough SOL for this transaction.');
      } else if (message.includes('cancel') || message.includes('reject')) {
        Alert.alert('Transaction Cancelled', 'You cancelled the transaction.');
      } else {
        Alert.alert('Transaction Error', message);
      }
    } finally {
      txInProgressRef.current = false;
      setTxLoading(false);
    }
  }, [publicKey, cluster, lastRewardTimestamp, setLastTxSignature, setLastRewardTimestamp]);

  const handleSendMemo = useCallback(async () => {
    if (!publicKey || txInProgressRef.current) return;

    txInProgressRef.current = true;
    setTxLoading(true);
    try {
      const payerPubkey = new PublicKey(publicKey);
      const memoTx = await buildMemoTransaction(payerPubkey, cluster, 25);

      const signedResult = await transact(
        async (wallet: Web3MobileWallet) => {
          await wallet.authorize({
            identity: APP_IDENTITY,
            cluster: cluster as 'devnet' | 'mainnet-beta',
          });

          const signedTransactions = await wallet.signAndSendTransactions({
            transactions: [memoTx],
          });
          return signedTransactions;
        },
      );

      if (signedResult?.[0]) {
        const sig = typeof signedResult[0] === 'string'
          ? signedResult[0]
          : Buffer.from(signedResult[0] as Uint8Array).toString('base64');

        setLastTxSignature(sig);
        Alert.alert('Memo Recorded! 📝', `Focus proof written on-chain.\nSignature: ${sig.slice(0, 16)}...`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Memo Error', message);
    } finally {
      txInProgressRef.current = false;
      setTxLoading(false);
    }
  }, [publicKey, cluster, setLastTxSignature]);

  const handleViewTx = useCallback(() => {
    if (!lastTxSignature) return;
    const url = getExplorerUrl(lastTxSignature, cluster);
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open browser.');
    });
  }, [lastTxSignature, cluster]);

  const handleToggleCluster = useCallback(() => {
    const next: SolanaCluster = cluster === 'devnet' ? 'mainnet-beta' : 'devnet';
    Alert.alert(
      'Switch Network',
      `Switch to ${next}? This will disconnect your current wallet session.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () => setCluster(next),
        },
      ],
    );
  }, [cluster, setCluster]);

  const shortKey = publicKey
    ? `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`
    : null;

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, darkMode && styles.titleDark]}>Wallet</Text>

        {/* Network Badge */}
        <TouchableOpacity
          style={[styles.networkBadge, cluster === 'mainnet-beta' && styles.networkBadgeMainnet]}
          onPress={handleToggleCluster}
          activeOpacity={0.7}
        >
          <View style={[styles.networkDot, cluster === 'mainnet-beta' && styles.networkDotMainnet]} />
          <Text style={styles.networkText}>
            {cluster === 'devnet' ? 'Devnet' : 'Mainnet'}
          </Text>
        </TouchableOpacity>

        {/* Connection Card */}
        <View style={[styles.card, darkMode && styles.cardDark]}>
          {publicKey ? (
            <>
              <Text style={[styles.cardLabel, darkMode && styles.subtextDark]}>CONNECTED</Text>
              <Text style={[styles.publicKey, darkMode && styles.textDark]}>{shortKey}</Text>
              <Text style={[styles.fullKey, darkMode && styles.subtextDark]} numberOfLines={1} ellipsizeMode="middle">
                {publicKey}
              </Text>
              <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
                <Text style={styles.disconnectText}>Disconnect</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.cardLabel, darkMode && styles.subtextDark]}>NOT CONNECTED</Text>
              <Text style={[styles.cardDescription, darkMode && styles.subtextDark]}>
                Connect a Solana wallet to send rewards and record focus proofs on-chain.
              </Text>
              <TouchableOpacity
                style={[styles.connectBtn, connecting && styles.connectBtnDisabled]}
                onPress={handleConnect}
                disabled={connecting}
                activeOpacity={0.8}
              >
                {connecting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.connectBtnText}>Connect Wallet</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Actions */}
        {publicKey && (
          <View style={[styles.card, darkMode && styles.cardDark]}>
            <Text style={[styles.cardLabel, darkMode && styles.subtextDark]}>ACTIONS</Text>

            <TouchableOpacity
              style={[styles.actionBtn, txLoading && styles.actionBtnDisabled]}
              onPress={handleSendReward}
              disabled={txLoading}
              activeOpacity={0.8}
            >
              {txLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.actionBtnText}>
                  Send {REWARD_AMOUNT_SOL} SOL Reward 🌳
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.memoBtn, txLoading && styles.actionBtnDisabled]}
              onPress={handleSendMemo}
              disabled={txLoading}
              activeOpacity={0.8}
            >
              {txLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.actionBtnText}>Record Focus Memo 📝</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Last Transaction */}
        {lastTxSignature && (
          <View style={[styles.card, darkMode && styles.cardDark]}>
            <Text style={[styles.cardLabel, darkMode && styles.subtextDark]}>LAST TRANSACTION</Text>
            <Text style={[styles.txSig, darkMode && styles.textDark]} numberOfLines={1} ellipsizeMode="middle">
              {lastTxSignature}
            </Text>
            <TouchableOpacity style={styles.viewTxBtn} onPress={handleViewTx}>
              <Text style={styles.viewTxText}>View on Solscan ↗</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={[styles.footerText, darkMode && styles.subtextDark]}>
            Seeker Solana Forest – Focus Timer
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerDark: {
    backgroundColor: COLORS.backgroundDark,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primaryDark,
    paddingVertical: 16,
  },
  titleDark: {
    color: COLORS.primaryLight,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  networkBadgeMainnet: {
    backgroundColor: '#F3E5F5',
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 8,
  },
  networkDotMainnet: {
    backgroundColor: COLORS.solana,
  },
  networkText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardDark: {
    backgroundColor: COLORS.surfaceDark,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  publicKey: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  fullKey: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  textDark: {
    color: COLORS.textDark,
  },
  subtextDark: {
    color: COLORS.textSecondaryDark,
  },
  connectBtn: {
    backgroundColor: COLORS.solana,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  connectBtnDisabled: {
    opacity: 0.6,
  },
  connectBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disconnectBtn: {
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  disconnectText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '600',
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  memoBtn: {
    backgroundColor: COLORS.solana,
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  txSig: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: COLORS.text,
    marginBottom: 8,
  },
  viewTxBtn: {
    alignSelf: 'flex-start',
  },
  viewTxText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.solana,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

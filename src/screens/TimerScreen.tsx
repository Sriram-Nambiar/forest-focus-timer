import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PublicKey } from '@solana/web3.js';
import {
  transact,
  Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { COLORS, STATE_RESET_DELAY_MS } from '../constants';
import { formatTime } from '../utils/helpers';
import { useTimerStore } from '../store/timerStore';
import { useSettingsStore } from '../store/settingsStore';
import { useWalletStore } from '../store/walletStore';
import { useFocusTimer } from '../hooks/useFocusTimer';
import { TreeAnimation } from '../components/TreeAnimation';
import { DurationSelector } from '../components/DurationSelector';
import { TimerControls } from '../components/TimerControls';
import { buildMemoTransaction, confirmTransaction } from '../solana/transactions';
import { REWARD_COOLDOWN_MS } from '../solana/config';

const APP_IDENTITY = {
  name: 'Seeker Solana Forest',
  uri: 'https://forestfocus.app',
};

export default function TimerScreen() {
  const {
    durationMinutes,
    remainingSeconds,
    status,
    progress,
    treeStage,
    handleFail,
    resetTimer,
  } = useFocusTimer();

  const { setDuration, startTimer, pauseTimer, resumeTimer, restoreSession } = useTimerStore();
  const darkMode = useSettingsStore((s) => s.darkMode);
  const walletPublicKey = useWalletStore((s) => s.publicKey);
  const walletCluster = useWalletStore((s) => s.cluster);
  const memoPromptedRef = useRef(false);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Prompt on-chain memo after focus session completion when wallet is connected
  useEffect(() => {
    if (status === 'completed' && walletPublicKey && !memoPromptedRef.current) {
      memoPromptedRef.current = true;

      const now = Date.now();
      const lastReward = useWalletStore.getState().lastRewardTimestamp;
      if (now - lastReward < REWARD_COOLDOWN_MS) return;

      Alert.alert(
        'Record on-chain? 📝',
        `Write a focus proof memo (${durationMinutes} min) to Solana ${walletCluster}?`,
        [
          { text: 'Skip', style: 'cancel' },
          {
            text: 'Record',
            onPress: async () => {
              try {
                const payerPubkey = new PublicKey(walletPublicKey);
                const memoTx = await buildMemoTransaction(payerPubkey, walletCluster, durationMinutes);

                const signedResult = await transact(async (wallet: Web3MobileWallet) => {
                  await wallet.authorize({
                    identity: APP_IDENTITY,
                    cluster: walletCluster as 'devnet' | 'mainnet-beta',
                  });
                  return await wallet.signAndSendTransactions({ transactions: [memoTx] });
                });

                if (signedResult?.[0]) {
                  const sig = typeof signedResult[0] === 'string'
                    ? signedResult[0]
                    : Buffer.from(signedResult[0] as Uint8Array).toString('base64');

                  useWalletStore.getState().setLastTxSignature(sig);
                  useWalletStore.getState().setLastRewardTimestamp(Date.now());

                  const confirmed = await confirmTransaction(sig, walletCluster);
                  if (confirmed) {
                    Alert.alert('Recorded! ✅', 'Focus proof written on-chain.');
                  }
                }
              } catch {
                // User cancelled or error – silently ignore for UX
              }
            },
          },
        ],
      );
    }
    if (status === 'idle') {
      memoPromptedRef.current = false;
    }
  }, [status, walletPublicKey, walletCluster, durationMinutes]);

  const handleSelectDuration = useCallback(
    (minutes: number) => {
      setDuration(minutes);
    },
    [setDuration],
  );

  const handleStart = useCallback(() => {
    if (status === 'completed' || status === 'failed') {
      resetTimer();
      setTimeout(() => {
        useTimerStore.getState().startTimer();
      }, STATE_RESET_DELAY_MS);
    } else {
      startTimer();
    }
  }, [status, resetTimer, startTimer]);

  const handleCancel = useCallback(() => {
    Alert.alert(
      'Give Up?',
      'Your tree will die if you give up now. Are you sure?',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Give Up',
          style: 'destructive',
          onPress: () => handleFail(),
        },
      ],
    );
  }, [handleFail]);

  const isActive = status === 'running' || status === 'paused';

  const statusMessage = (() => {
    switch (status) {
      case 'idle':
        return 'Ready to focus?';
      case 'running':
        return 'Stay focused... 🌱';
      case 'paused':
        return 'Paused';
      case 'completed':
        return 'Great job! 🌳';
      case 'failed':
        return 'Tree died 🥀';
      default:
        return '';
    }
  })();

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]} edges={['top']}>
      <View style={styles.content}>
        <Text style={[styles.title, darkMode && styles.titleDark]}>Forest Focus</Text>

        <DurationSelector
          selectedDuration={durationMinutes}
          onSelect={handleSelectDuration}
          disabled={isActive}
          darkMode={darkMode}
        />

        <View style={styles.treeContainer}>
          <TreeAnimation
            progress={progress}
            stage={treeStage}
            failed={status === 'failed'}
          />
        </View>

        <Text style={[styles.timer, darkMode && styles.timerDark]}>
          {formatTime(remainingSeconds)}
        </Text>

        <Text style={[styles.statusText, darkMode && styles.statusTextDark]}>
          {statusMessage}
        </Text>

        <TimerControls
          status={status}
          onStart={handleStart}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onCancel={handleCancel}
          darkMode={darkMode}
        />
      </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 24,
  },
  titleDark: {
    color: COLORS.primaryLight,
  },
  treeContainer: {
    marginVertical: 16,
  },
  timer: {
    fontSize: 56,
    fontWeight: '200',
    color: COLORS.text,
    fontVariant: ['tabular-nums'],
    marginBottom: 8,
  },
  timerDark: {
    color: COLORS.textDark,
  },
  statusText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  statusTextDark: {
    color: COLORS.textSecondaryDark,
  },
});

// Node.js polyfills required for @solana/web3.js in React Native
import 'react-native-get-random-values';
import { Buffer } from 'buffer';

global.Buffer = global.Buffer || Buffer;

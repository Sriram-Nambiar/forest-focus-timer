import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { COLORS } from '../constants';
import type { TreeStage } from '../constants';

interface TreeAnimationProps {
  progress: number;
  stage: TreeStage;
  failed?: boolean;
}

const TreeAnimation = memo(function TreeAnimation({ progress, stage, failed }: TreeAnimationProps) {
  const treeColor = failed ? COLORS.deadTree : COLORS.primaryLight;
  const trunkColor = failed ? '#5D4037' : '#795548';

  const stageIndex = useMemo(() => {
    switch (stage) {
      case 'seed': return 0;
      case 'small': return 1;
      case 'medium': return 2;
      case 'full': return 3;
      default: return 0;
    }
  }, [stage]);

  const trunkStyle = useAnimatedStyle(() => {
    const height = withSpring(interpolate(stageIndex, [0, 1, 2, 3], [8, 30, 60, 80]), {
      damping: 15,
      stiffness: 90,
    });
    const width = withSpring(interpolate(stageIndex, [0, 1, 2, 3], [6, 10, 14, 16]), {
      damping: 15,
      stiffness: 90,
    });
    return { height, width };
  });

  const canopyStyle = useAnimatedStyle(() => {
    const scale = withSpring(interpolate(stageIndex, [0, 1, 2, 3], [0, 0.4, 0.7, 1]), {
      damping: 12,
      stiffness: 80,
    });
    const opacity = withTiming(stageIndex > 0 ? 1 : 0, { duration: 300 });
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const groundStyle = useAnimatedStyle(() => {
    const scale = withSpring(interpolate(progress, [0, 0.5, 1], [0.5, 0.8, 1]), {
      damping: 15,
    });
    return {
      transform: [{ scaleX: scale }],
    };
  });

  return (
    <View style={styles.container}>
      {/* Canopy */}
      <Animated.View
        style={[
          styles.canopy,
          { backgroundColor: treeColor },
          canopyStyle,
        ]}
      />

      {/* Sub canopy */}
      {stageIndex >= 2 && (
        <Animated.View
          style={[
            styles.subCanopy,
            { backgroundColor: failed ? '#6D4C41' : COLORS.primary },
            canopyStyle,
          ]}
        />
      )}

      {/* Trunk */}
      <Animated.View
        style={[
          styles.trunk,
          { backgroundColor: trunkColor },
          trunkStyle,
        ]}
      />

      {/* Ground */}
      <Animated.View
        style={[
          styles.ground,
          { backgroundColor: failed ? '#5D4037' : COLORS.primaryDark },
          groundStyle,
        ]}
      />

      {/* Seed indicator */}
      {stageIndex === 0 && (
        <View style={[styles.seed, { backgroundColor: trunkColor }]} />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  canopy: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'absolute',
    top: 10,
  },
  subCanopy: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'absolute',
    top: 0,
  },
  trunk: {
    borderRadius: 4,
    marginBottom: 0,
  },
  ground: {
    width: 100,
    height: 6,
    borderRadius: 3,
  },
  seed: {
    width: 16,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    bottom: 26,
  },
});

export { TreeAnimation };

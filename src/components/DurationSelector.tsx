import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { DURATION_OPTIONS, COLORS } from '../constants';
import { validateDuration } from '../utils/helpers';

interface DurationSelectorProps {
  selectedDuration: number;
  onSelect: (minutes: number) => void;
  disabled: boolean;
  darkMode: boolean;
}

const DurationSelector = memo(function DurationSelector({
  selectedDuration,
  onSelect,
  disabled,
  darkMode,
}: DurationSelectorProps) {
  const handleCustom = useCallback(() => {
    Alert.prompt(
      'Custom Duration',
      'Enter duration in minutes (1-120)',
      (text) => {
        const value = parseInt(text, 10);
        if (validateDuration(value)) {
          onSelect(value);
        } else {
          Alert.alert('Invalid Duration', 'Please enter a number between 1 and 120.');
        }
      },
      'plain-text',
      String(selectedDuration),
      'number-pad',
    );
  }, [onSelect, selectedDuration]);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, darkMode && styles.labelDark]}>Duration</Text>
      <View style={styles.options}>
        {DURATION_OPTIONS.map((minutes) => (
          <TouchableOpacity
            key={minutes}
            style={[
              styles.option,
              darkMode && styles.optionDark,
              selectedDuration === minutes && styles.optionSelected,
              disabled && styles.optionDisabled,
            ]}
            onPress={() => onSelect(minutes)}
            disabled={disabled}
          >
            <Text
              style={[
                styles.optionText,
                darkMode && styles.optionTextDark,
                selectedDuration === minutes && styles.optionTextSelected,
              ]}
            >
              {minutes}m
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[
            styles.option,
            darkMode && styles.optionDark,
            !DURATION_OPTIONS.includes(selectedDuration as typeof DURATION_OPTIONS[number]) && styles.optionSelected,
            disabled && styles.optionDisabled,
          ]}
          onPress={handleCustom}
          disabled={disabled}
        >
          <Text
            style={[
              styles.optionText,
              darkMode && styles.optionTextDark,
              !DURATION_OPTIONS.includes(selectedDuration as typeof DURATION_OPTIONS[number]) && styles.optionTextSelected,
            ]}
          >
            {DURATION_OPTIONS.includes(selectedDuration as typeof DURATION_OPTIONS[number]) ? 'Custom' : `${selectedDuration}m`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  labelDark: {
    color: COLORS.textSecondaryDark,
  },
  options: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionDark: {
    backgroundColor: COLORS.surfaceDark,
    borderColor: COLORS.borderDark,
  },
  optionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  optionTextDark: {
    color: COLORS.textDark,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
});

export { DurationSelector };

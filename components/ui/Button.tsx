import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';

interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'lg' | 'icon';
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  children,
  variant = 'default',
  size = 'default',
  disabled = false,
  style,
}) => {
  const buttonStyles: ViewStyle[] = [styles.button];
  const textStyles: TextStyle[] = [styles.text];

  if (variant === 'outline') {
    buttonStyles.push(styles.outline);
    textStyles.push(styles.outlineText);
  } else if (variant === 'ghost') {
    buttonStyles.push(styles.ghost);
    textStyles.push(styles.ghostText);
  } else {
    buttonStyles.push(styles.default);
    textStyles.push(styles.defaultText);
  }

  if (size === 'lg') {
    buttonStyles.push(styles.lg);
    textStyles.push(styles.lgText);
  } else if (size === 'icon') {
    buttonStyles.push(styles.icon);
  }

  if (disabled) {
    buttonStyles.push(styles.disabled);
  }

  return (
    <TouchableOpacity
      style={[...buttonStyles, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {typeof children === 'string' ? (
        <Text style={textStyles}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  default: {
    backgroundColor: '#E3256B',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  icon: {
    width: 44,
    height: 44,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  defaultText: {
    color: '#ffffff',
  },
  outlineText: {
    color: '#111827',
  },
  ghostText: {
    color: '#111827',
  },
  lgText: {
    fontSize: 16,
  },
});

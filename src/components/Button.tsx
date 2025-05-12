// Button component (Button.tsx)
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: object; 
  disabled?: boolean;  
}

const Button: React.FC<ButtonProps> = ({ title, onPress, style, disabled }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, style, disabled && styles.disabled]}  
      onPress={onPress}
      disabled={disabled}  
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  disabled: {
    backgroundColor: '#d3d3d3',  
  },
});

export default Button;

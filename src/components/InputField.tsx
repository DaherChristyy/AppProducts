import React from 'react';
import { TextInput, StyleSheet, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';  

interface InputFieldProps {
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  errorMessage?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  errorMessage,
}) => {
  const { isDarkMode } = useTheme(); 

  return (
    <React.Fragment>
      <TextInput
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, { backgroundColor: isDarkMode ? '#555' : '#fff', color: isDarkMode ? 'white' : 'black' }]}  // Apply dark mode styles
      />
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
});

export default InputField;

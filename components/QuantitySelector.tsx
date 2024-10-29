import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface QuantitySelectorProps {
  initialQuantity?: number;
  onQuantityChange?: (quantity: number) => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  initialQuantity = 1,
  onQuantityChange,
}) => {
  const [quantity, setQuantity] = useState<number>(initialQuantity);

  const increment = () => {
    setQuantity(prev => {
      const newQuantity = prev + 1;
      if (onQuantityChange) onQuantityChange(newQuantity);
      return newQuantity;
    });
  };

  const decrement = () => {
    setQuantity(prev => {
      const newQuantity = Math.max(0, prev - 1); // Prevents going below 1
      if (onQuantityChange) onQuantityChange(newQuantity);
      return newQuantity;
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={decrement} style={styles.button}>
        <Text style={styles.buttonText}>-</Text>
      </TouchableOpacity>
      <View style={styles.quantityBox}>
        <Text style={styles.quantityText}>{quantity}</Text>
      </View>
      <TouchableOpacity onPress={increment} style={styles.button}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 12,
  },
  buttonText: {
    color: '#2196F3',
    fontSize: 30,
    fontWeight: 'bold',
  },
  quantityBox: {
    marginHorizontal: 10,
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 5,
  },
  quantityText: {
    fontSize: 16,
    color: '#fff', // Black text for the quantity
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default QuantitySelector;

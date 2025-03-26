import React from 'react';
import {TouchableOpacity, StyleSheet, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface LikeButtonProps {
  isLiked: boolean;
  onPress: () => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({isLiked, onPress}) => {
  const scaleAnim = new Animated.Value(1);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.5,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View
        style={[styles.container, {transform: [{scale: scaleAnim}]}]}>
        <Icon
          name={isLiked ? 'heart' : 'heart-outline'}
          size={30}
          color={isLiked ? 'red' : 'white'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LikeButton;

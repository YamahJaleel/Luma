import {StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import React from 'react';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {OnboardingData} from '../data/onboardingData';
import {Ionicons} from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

type Props = {
  index: number;
  x: SharedValue<number>;
  item: OnboardingData;
};

const RenderItem = ({index, x, item}: Props) => {
  const {width: SCREEN_WIDTH} = useWindowDimensions();

  const iconAnimationStyle = useAnimatedStyle(() => {
    const translateYAnimation = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [200, 0, -200],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{translateY: translateYAnimation}],
    };
  });

  const circleAnimation = useAnimatedStyle(() => {
    const scale = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [1, 4, 4],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{scale: scale}],
    };
  });

  // Get appropriate icon for each item (fallback when no Lottie animation)
  const getIcon = (id: number) => {
    switch (id) {
      case 1:
        return 'search';
      case 2:
        return 'people';
      case 3:
        return 'lock-closed';
      case 4:
        return 'sunny';
      default:
        return 'help-circle';
    }
  };

  return (
    <View style={[styles.itemContainer, {width: SCREEN_WIDTH}]}>
      <View style={styles.circleContainer}>
        <Animated.View
          style={[
            {
              width: SCREEN_WIDTH,
              height: SCREEN_WIDTH,
              borderRadius: SCREEN_WIDTH / 2,
              backgroundColor: item.backgroundColor,
            },
            circleAnimation,
          ]}
        />
      </View>
      <Animated.View style={[iconAnimationStyle, item.id === 6 && styles.getStartedContent]}>
        <View style={styles.iconContainer}>
          {item.animation ? (
            <LottieView
              source={item.animation}
              style={{
                width: SCREEN_WIDTH * 0.9,
                height: SCREEN_WIDTH * 0.9,
              }}
              autoPlay
              loop
            />
          ) : (
            <Ionicons 
              name={getIcon(item.id)} 
              size={SCREEN_WIDTH * 0.3} 
              color={item.textColor} 
            />
          )}
        </View>
      </Animated.View>
      <View style={item.id === 6 && styles.getStartedTextContainer}>
        <Text style={[styles.itemText, {color: item.textColor}]}>
          {item.title}
        </Text>
        <Text style={[styles.descriptionText, {color: item.textColor}]}>
          {item.description}
        </Text>
      </View>
    </View>
  );
};

export default RenderItem;

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 120,
  },
  itemText: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 0,
    marginHorizontal: 20,
    lineHeight: 32,
  },
  subtitleText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginHorizontal: 20,
    lineHeight: 24,
  },
  descriptionText: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  circleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedContent: {
    marginTop: -50, // Adjust as needed for the Get Started page
  },
  getStartedTextContainer: {
    marginTop: 20, // Adjust as needed for the Get Started page
  },
}); 
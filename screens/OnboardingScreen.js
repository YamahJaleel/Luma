import React, {useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedRef,
} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import {useSettings} from '../components/SettingsContext';

import RenderItem from '../components/RenderItem';
import Pagination from '../components/Pagination';
import CustomButton from '../components/CustomButton';
import onboardingData from '../data/onboardingData';

const OnboardingScreen = ({route}) => {
  const {width: SCREEN_WIDTH} = useWindowDimensions();
  const navigation = useNavigation();
  const {setIsOnboarded} = route.params;

  const flatListRef = useAnimatedRef();
  const flatListIndex = useSharedValue(0);
  const x = useSharedValue(0);

  const onScroll = (event) => {
    x.value = event.nativeEvent.contentOffset.x;
  };

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems[0] !== null) {
      flatListIndex.value = viewableItems[0].index;
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleCompleteOnboarding = () => {
    setIsOnboarded(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={({item, index}) => {
          return <RenderItem index={index} x={x} item={item} />;
        }}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onScroll={onScroll}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
      />
      
      <View style={styles.footer}>
        <Pagination data={onboardingData} x={x} />
        <CustomButton
          flatListRef={flatListRef}
          flatListIndex={flatListIndex}
          dataLength={onboardingData.length}
          x={x}
          setIsOnboarded={setIsOnboarded}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});

export default OnboardingScreen; 
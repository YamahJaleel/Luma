import { View, Dimensions, FlatList, StyleSheet } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useEffect, useRef, useState, useCallback } from 'react';

const videos = [
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
];

export default function VideoScrollScreen() {
  const [currentViewableItemIndex, setCurrentViewableItemIndex] = useState(0);
  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };
  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentViewableItemIndex(viewableItems[0].index ?? 0);
    }
  }, []);
  const viewabilityConfigCallbackPairs = useRef([{ viewabilityConfig, onViewableItemsChanged }]);

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        renderItem={({ item, index }) => (
          <Item item={item} shouldPlay={index === currentViewableItemIndex} />
        )}
        keyExtractor={(item) => item}
        pagingEnabled
        horizontal={false}
        showsVerticalScrollIndicator={false}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
      />
    </View>
  );
}

const Item = ({ item, shouldPlay }) => {
  const player = useVideoPlayer(item, (p) => {
    p.loop = true;
    p.muted = false;
  });

  useEffect(() => {
    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
    }
  }, [shouldPlay, player]);

  return (
    <View style={styles.videoContainer}>
      <VideoView
        style={styles.video}
        player={player}
        allowsPictureInPicture={false}
        contentFit="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  video: {
    width: '100%',
    height: '100%',
  },
});

import React, {useRef, useState, useCallback} from 'react';
import {Dimensions} from 'react-native';
import {FlashList} from '@shopify/flash-list';

import ReelCard from './ReelCard';

const ScreenHeight = Dimensions.get('window').height;

function Reels({
  videos,
  backgroundColor = 'black',
  headerTitle,
  headerIconName,
  headerIconColor,
  headerIconSize,
  headerIcon,
  headerComponent,
  onHeaderIconPress,
  optionsComponent,
  pauseOnOptionsShow,
  onSharePress,
  onCommentPress,
  onLikePress,
  onDislikePress,
  onFinishPlaying,
  minimumTrackTintColor,
  maximumTrackTintColor,
  thumbTintColor,
  timeElapsedColor,
  totalTimeColor,
}) {
  const ListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Viewability configuration
  const viewConfigRef = useRef({
    viewAreaCoveragePercentThreshold: 50,
    waitForInteraction: false,
  });

  // Viewability handlers
  // const onViewableItemsChanged = useCallback(({viewableItems}) => {
  //   if (viewableItems.length > 0) {
  //     const index = viewableItems[0].index;
  //     if (index !== null && index !== undefined) {
  //       setCurrentIndex(index);
  //     }
  //   }
  // }, []);

  const onViewableItemsChanged = useCallback(({viewableItems}) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== null && index !== undefined) {
        setCurrentIndex(index);
      }
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
    waitForInteraction: false,
  };

  const viewabilityConfigCallbackPairs = useRef([
    {viewabilityConfig: viewConfigRef.current, onViewableItemsChanged},
  ]);

  return (
    <FlashList
      ref={ListRef}
      data={videos}
      keyExtractor={item => item._id}
      renderItem={({item, index}) => (
        <ReelCard
          {...item}
          index={index}
          ViewableItem={videos[currentIndex]?._id}
          isPlaying={currentIndex === index}
          currentIndex={currentIndex}
          onFinishPlaying={() => {
            if (index < videos.length - 1) {
              ListRef.current?.scrollToIndex({
                index: index + 1,
                animated: true,
              });
            }
          }}
          {...{
            backgroundColor,
          }}
        />
      )}
      estimatedItemSize={ScreenHeight}
      getItemLayout={(_, index) => ({
        length: ScreenHeight,
        offset: ScreenHeight * index,
        index,
      })}
      pagingEnabled
      decelerationRate="fast"
      // viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{
        viewabilityConfig,
      }}
    />
  );
}

export default React.memo(Reels);

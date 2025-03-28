import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Pressable,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import Video from 'react-native-video';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {TouchableWithoutFeedback} from 'react-native';

import Buttons from './Buttons';
import Header from './Header';
import helper from '../utils/helper';

// Screen Dimensions
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

function ReelCard({
  uri,
  _id,
  ViewableItem,
  isPlaying,
  liked = false,
  disliked = false,
  index,
  currentIndex,

  // Container Props
  backgroundColor = 'black',

  // Header Props
  headerTitle = 'Reels',
  headerIconName,
  headerIconColor,
  headerIconSize,
  headerIcon,
  headerComponent,
  onHeaderIconPress = () => {},

  // Options Props
  optionsComponent,
  pauseOnOptionsShow = true,
  onSharePress = () => {},
  onCommentPress = () => {},
  onLikePress = () => {},
  onDislikePress = () => {},

  // Player Props
  onFinishPlaying = () => {},

  // Slider Props
  minimumTrackTintColor = 'white',
  maximumTrackTintColor = 'grey',
  thumbTintColor = 'white',

  // Time Props
  timeElapsedColor = 'white',
  totalTimeColor = 'white',
}) {
  // ref for Video Player
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const isSeeking = useRef(false);

  // States
  const [videoDimensions, setVideoDimensions] = useState({
    width: ScreenWidth,
    height: ScreenWidth,
  });
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [seekBarWidth, setSeekBarWidth] = useState(0);

  // Show controls temporarily
  const showControlsTemporarily = useCallback(() => {
    // If controls are already visible, hide them
    if (showControls) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowControls(false);
      });

      // Clear timeout if exists
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
      // Show controls
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowControls(true);
      });

      // Clear any existing timeout
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      // Set a timeout to hide controls
      controlsTimeoutRef.current = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowControls(false);
        });
      }, 4000);
    }
  }, [fadeAnim, showControls]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setPaused(!isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    // Play the video if its index matches the current index
    setPaused(currentIndex !== index);
  }, [currentIndex, index]);

  // Play/Pause based on viewability
  useEffect(() => {
    if (ViewableItem === _id) {
      setPaused(false); // Ensure it plays if it's the current item
    } else {
      setPaused(true);
    }
  }, [ViewableItem, _id]);

  // Seek functionality
  const onSeek = location => {
    const seekTime = location * duration;
    videoRef.current?.seek(seekTime);
    progressAnim.setValue(location);
    setProgress(location * 100);
  };

  // Seek bar pan responder
  const seekBarPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      isSeeking.current = true;
      setPaused(true);
    },
    onPanResponderMove: (_, {moveX}) => {
      if (seekBarWidth <= 0) return;

      const parentX = 40;
      const location = Math.min(
        Math.max((moveX - parentX) / seekBarWidth, 0),
        1,
      );
      progressAnim.setValue(location);
    },
    onPanResponderRelease: (_, {moveX}) => {
      if (seekBarWidth <= 0) return;

      const parentX = 40;
      const location = Math.min(
        Math.max((moveX - parentX) / seekBarWidth, 0),
        1,
      );
      onSeek(location);
      isSeeking.current = false;
      setPaused(false);
    },
  });

  // Render play/pause button
  const renderPlayPauseButton = () => {
    if (!showControls) return null;

    return (
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.seekButton}
          onPress={() => {
            if (videoRef.current) {
              const currentTime = (progress / 100) * duration;
              videoRef.current.seek(Math.max(currentTime - 10, 0));
            }
          }}>
          <MaterialCommunityIcons name="rewind" size={40} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.playPauseButton}
          onPress={() => setPaused(!paused)}>
          <View style={styles.playPauseButtonContainer}>
            <MaterialCommunityIcons
              name={paused ? 'play' : 'pause'}
              size={50}
              color="white"
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.seekButton}
          onPress={() => {
            if (videoRef.current) {
              const currentTime = (progress / 100) * duration;
              videoRef.current.seek(Math.min(currentTime + 10, duration));
            }
          }}>
          <MaterialCommunityIcons name="fast-forward" size={40} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  // Render seek bar
  const renderSeekBar = () => {
    if (!showControls) return null;

    const progressValue = duration ? progress / 100 : 0;

    return (
      <>
        <Text style={[styles.timeText, styles.currentTime]}>
          {helper.GetDurationFormat(Math.floor((progress * duration) / 100))}
        </Text>
        <Text style={[styles.timeText, styles.duration]}>
          {helper.GetDurationFormat(duration)}
        </Text>
        <View
          {...seekBarPanResponder.panHandlers}
          style={styles.seekBar}
          onLayout={event => {
            setSeekBarWidth(event.nativeEvent.layout.width);
          }}>
          <View style={styles.seekBarBackground} />
          <Animated.View
            style={[
              styles.seekBarProgress,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.seekBarKnob,
              {
                transform: [
                  {translateY: -8},
                  {
                    translateX: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, seekBarWidth],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </>
    );
  };

  return (
    <TouchableWithoutFeedback
      onPress={showControlsTemporarily}
      style={[styles.container, {backgroundColor: 'black'}]}>
      <View style={[styles.container, {backgroundColor: 'black'}]}>
        <Video
          ref={videoRef}
          source={uri}
          style={videoDimensions}
          resizeMode="contain"
          paused={paused}
          muted={false}
          repeat={true}
          onLoad={event => {
            const {naturalSize, duration: videoDuration} = event;
            const naturalWidth = naturalSize.width;
            const naturalHeight = naturalSize.height;

            if (naturalWidth > naturalHeight) {
              setVideoDimensions({
                width: ScreenWidth,
                height: ScreenWidth * (naturalHeight / naturalWidth),
              });
            } else {
              setVideoDimensions({
                width: ScreenHeight * (naturalWidth / naturalHeight),
                height: ScreenHeight,
              });
            }
            setDuration(videoDuration);
          }}
          onProgress={data => {
            if (!isSeeking.current) {
              const progressPercentage = (data.currentTime / duration) * 100;
              setProgress(progressPercentage);
              progressAnim.setValue(data.currentTime / duration);
            }
          }}
          onEnd={() => {
            // Handle video end
          }}
        />
        <Animated.View
          style={[
            styles.controlsOverlay,
            {opacity: showControls ? 1 : fadeAnim},
          ]}>
          {renderPlayPauseButton()}
          {renderSeekBar()}
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    width: ScreenWidth,
    height: ScreenHeight,
    justifyContent: 'center',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    top: '50%',
    transform: [{translateY: -25}],
  },
  playPauseButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  playPauseButtonContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 50,
    padding: 15,
  },
  seekButton: {
    padding: 20,
  },
  seekBar: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    height: 24,
    justifyContent: 'center',
  },
  seekBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  seekBarProgress: {
    position: 'absolute',
    height: 4,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  seekBarKnob: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    top: '50%',
    marginLeft: -8,
    transform: [{translateY: -8}],
  },
  timeText: {
    position: 'absolute',
    bottom: -15,
    color: 'white',
    fontSize: 12,
  },
  currentTime: {
    left: 10,
  },
  duration: {
    right: 10,
  },
});

export default ReelCard;

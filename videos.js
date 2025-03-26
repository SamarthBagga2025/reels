const videos = [
  {
    _id: '1',
    uri: {
      uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
  },
  {
    _id: '2',
    uri: {
      uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    },
  },
  {
    _id: '3',
    uri: {
      uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },
  },
  {
    _id: '4',
    uri: {
      uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    },
  },
  {
    _id: '5',
    uri: {
      uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    },
  },
];

for (let i = 6; i <= 100; i++) {
  let original = videos[(i - 1) % 5];
  videos.push({_id: i.toString(), uri: {uri: original.uri.uri}});
}

export default videos;

import {Platform, Dimensions} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import {getDeviceType} from 'react-native-device-info';

import dimension from '../utils/dimension';

type TrackType = 'local' | 'remote' | 'screen';

type LayoutParams = 'audio' | 'normal';

export const getThemeColour = () => '#4578e0';

export const getRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const getInitials = (name: String): String => {
  let initials = '';
  if (name.includes(' ')) {
    const nameArray = name.split(' ');
    if (nameArray[1].length > 0) {
      initials = nameArray[0].substring(0, 1) + nameArray[1].substring(0, 1);
    } else {
      if (nameArray[0].length > 1) {
        initials = nameArray[0].substring(0, 2);
      } else {
        initials = nameArray[0].substring(0, 1);
      }
    }
  } else {
    if (name.length > 1) {
      initials = name.substring(0, 2);
    } else {
      initials = name.substring(0, 1);
    }
  }
  return initials.toUpperCase();
};

export const pairDataForFlatlist = (data: any) => {
  let pairedData: any[] = [];

  let currentObject: {first: any; second: any} = {
    first: undefined,
    second: undefined,
  };
  data.map((item: any) => {
    if (item?.type === 'screen') {
      pairedData.push({first: item});
    } else {
      if (currentObject?.first) {
        pairedData.push({...currentObject, second: item});
        currentObject = {
          first: undefined,
          second: undefined,
        };
      } else {
        currentObject.first = item;
      }
    }
  });

  if (currentObject.first) {
    pairedData.push({...currentObject});
  }

  return pairedData;
};

export const pairDataForScrollView = (data: Array<any>, batch: number) => {
  const pairedData: Array<any> = [];
  let groupData: Array<any> = [];
  let itemsPushed: number = 0;
  data.map((item: any) => {
    if (item?.type === 'screen') {
      pairedData.push([item]);
    } else {
      if (itemsPushed === batch) {
        pairedData.push(groupData);
        groupData = [];
        itemsPushed = 0;
      }
      groupData.push(item);
      itemsPushed++;
    }
  });
  if (groupData.length) {
    pairedData.push(groupData);
  }
  return pairedData;
};

export const isPortrait = () => {
  const dim = Dimensions.get('window');
  return dim.height >= dim.width;
};

export const getHmsViewHeight = (
  layout: LayoutParams,
  type: TrackType,
  peersInPage: number,
  top: number,
  bottom: number,
) => {
  const isTab = getDeviceType() === 'Tablet';

  // window height - (header + bottom container + top + bottom + padding) / views in one screen
  const viewHeight =
    type === 'screen'
      ? Dimensions.get('window').height -
        (dimension.viewHeight(50) +
          dimension.viewHeight(90) +
          (isTab ? dimension.viewHeight(20) : top + bottom) +
          2)
      : isPortrait()
      ? (Dimensions.get('window').height -
          (dimension.viewHeight(50) +
            dimension.viewHeight(90) +
            (isTab ? dimension.viewHeight(20) : top + bottom) +
            2)) /
        (layout === 'audio' ? 3 : 2)
      : Dimensions.get('window').height -
        (Platform.OS === 'ios' ? 0 : 25) -
        (dimension.viewHeight(50) +
          dimension.viewHeight(90) +
          (isTab ? dimension.viewHeight(20) : top + bottom) +
          2);

  const height =
    peersInPage === 1
      ? viewHeight * 2
      : peersInPage === 2
      ? viewHeight
      : peersInPage === 3
      ? (viewHeight * 2) / 3
      : viewHeight;
  const width =
    peersInPage === 1
      ? '100%'
      : peersInPage === 2
      ? '100%'
      : peersInPage === 3
      ? '100%'
      : '50%';

  return {height, width};
};

export const writeFile = async (content: any, fileUrl: string) => {
  await RNFetchBlob.fs
    .writeFile(fileUrl, JSON.stringify(content), 'utf8')
    .then(() => {
      shareFile(fileUrl);
    })
    .catch(e => console.log(e));
};

export const shareFile = async (fileUrl: string) => {
  await Share.open({
    url: Platform.OS === 'android' ? 'file://' + fileUrl : fileUrl,
    type: 'application/json',
  })
    .then(success => console.log(success))
    .catch(e => console.log(e));
};

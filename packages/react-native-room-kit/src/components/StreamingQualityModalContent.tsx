import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  HMSRemoteVideoTrack,
  HMSTrack,
  HMSLayer,
  HMSSimulcastLayerDefinition,
} from '@100mslive/react-native-hms';

import { CustomButton } from './CustomButton';
import type { RootState } from '../redux';
import { COLORS } from '../utils/theme';
import { Menu, MenuItem } from './MenuModal';
import { ChevronIcon } from '../Icons';

interface PeerSettingsModalContentProps {
  track: HMSTrack;
  cancelModal(): void;
}

export const StreamingQualityModalContent: React.FC<
  PeerSettingsModalContentProps
> = ({ track, cancelModal }) => {
  const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);
  const [remoteVideoTrack, setRemoteVideoTrack] =
    useState<HMSRemoteVideoTrack | null>(null);
  const [showQualityOptions, setShowQualityOptions] = useState(false);
  const [originalLayer, setOriginalLayer] = useState<HMSLayer | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<HMSLayer | null>(null);
  const [layerDefinitions, setLayerDefinitions] = useState<
    HMSSimulcastLayerDefinition[]
  >([]);

  useEffect(() => {
    if (remoteVideoTrack) {
      const getSelectedLayer = async () => {
        const layer = await remoteVideoTrack.getLayer();
        setOriginalLayer(layer);
        setSelectedLayer(layer);
      };

      const getLayerDefinitions = async () => {
        const layerDefinitions = await remoteVideoTrack.getLayerDefinition();
        setLayerDefinitions(layerDefinitions);
      };

      getSelectedLayer();
      getLayerDefinitions();
    }
  }, [remoteVideoTrack]);

  useEffect(() => {
    if (hmsInstance) {
      const getRemoteVideoTrack = async () => {
        const remoteVideoTrack =
          await hmsInstance.getRemoteVideoTrackFromTrackId(track.trackId);

        setRemoteVideoTrack(remoteVideoTrack);
      };

      getRemoteVideoTrack();
    }
  }, [track, hmsInstance]);

  const changeStreamingQuality = async () => {
    cancelModal();
    if (
      !selectedLayer ||
      !remoteVideoTrack ||
      selectedLayer === originalLayer
    ) {
      return;
    }

    remoteVideoTrack
      .setLayer(selectedLayer)
      .then((value) => {
        if (value) {
          console.log('Set Layer Success: ', value);
        }
      })
      .catch((e) => console.log('Set Layer Error: ', e));
  };

  const changeSubmitDisabled =
    !remoteVideoTrack || selectedLayer === originalLayer;
  return (
    <View style={styles.container}>
      <Text style={styles.roleChangeModalHeading}>
        Change Streaming Quality
      </Text>
      <Text style={styles.participantRole}>
        Current Layer: {originalLayer || '-'}
      </Text>

      <View style={styles.contentContainer}>
        <Menu
          visible={showQualityOptions}
          anchor={
            <TouchableOpacity
              style={styles.participantFilterContainer}
              onPress={() => setShowQualityOptions(true)}
            >
              <Text style={styles.participantFilterText} numberOfLines={1}>
                {selectedLayer}
              </Text>
              <ChevronIcon
                direction={'down'}
                style={{
                  transform: [
                    { rotateZ: showQualityOptions ? '180deg' : '0deg' },
                  ],
                }}
              />
            </TouchableOpacity>
          }
          onRequestClose={() => setShowQualityOptions(false)}
          style={styles.participantsMenuContainer}
        >
          {layerDefinitions.map((layerDefinition) => {
            const isSelected = layerDefinition.layer === selectedLayer;

            return (
              <MenuItem
                onPress={() => {
                  setShowQualityOptions(false);
                  setSelectedLayer(layerDefinition.layer);
                }}
                key={layerDefinition.layer}
                style={
                  isSelected ? styles.participantMenuActiveItem : undefined
                }
              >
                <View style={styles.participantMenuItem}>
                  <Text style={styles.participantFilterText}>
                    {layerDefinition.layer} {layerDefinition.resolution.width}x
                    {layerDefinition.resolution.height}
                  </Text>
                </View>
              </MenuItem>
            );
          })}
        </Menu>
      </View>

      <View style={styles.roleChangeModalPermissionContainer}>
        <CustomButton
          title="Cancel"
          onPress={cancelModal}
          viewStyle={styles.roleChangeModalCancelButton}
          textStyle={styles.roleChangeModalButtonText}
        />
        <CustomButton
          disabled={changeSubmitDisabled}
          title="Change"
          onPress={changeStreamingQuality}
          viewStyle={styles.roleChangeModalSuccessButton}
          textStyle={styles.roleChangeModalButtonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    position: 'relative',
  },
  contentContainer: {
    justifyContent: 'center',
    marginTop: 24,
  },
  participantRole: {
    color: COLORS.TEXT.MEDIUM_EMPHASIS,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    marginTop: 8,
    fontFamily: 'Inter-Regular',
    textTransform: 'capitalize',
  },
  participantFilterContainer: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.BORDER.LIGHT,
    borderRadius: 8,
  },
  participantFilterText: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 16 * 1.4,
    marginRight: 12,
    textTransform: 'capitalize',
  },
  roleChangeModalHeading: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0.15,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  participantsMenuContainer: {
    paddingTop: 8,
    backgroundColor: COLORS.SURFACE.LIGHT,
    overflow: 'hidden',
  },
  participantMenuActiveItem: {
    backgroundColor: COLORS.PRIMARY.DEFAULT,
  },
  participantMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Platform.OS === 'ios' ? 16 : 0,
  },
  roleChangeModalPermissionContainer: {
    flexDirection: 'row',
    marginTop: 28,
    alignItems: 'center',
  },
  roleChangeModalCancelButton: {
    backgroundColor: COLORS.SECONDARY.DISABLED,
    borderColor: COLORS.SECONDARY.DISABLED,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    width: '48%',
    alignSelf: 'center',
    marginRight: '4%',
  },
  roleChangeModalSuccessButton: {
    backgroundColor: COLORS.PRIMARY.DEFAULT,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY.DEFAULT,
    borderRadius: 8,
    width: '48%',
    alignSelf: 'center',
  },
  roleChangeModalButtonText: {
    color: COLORS.TEXT.HIGH_EMPHASIS,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
});

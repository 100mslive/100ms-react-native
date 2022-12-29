import React from 'react';
import { View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useSelector } from 'react-redux';

import { styles } from '../styles';

import { CustomButton } from '../../../components';
import type { RootState } from '../../../redux';

export const Footer: React.FC = () => {
	const localPeer = useSelector((state: RootState) => state.user.hmsLocalPeer);

	/**
	 * Checking Mute Status of local audio track
	 * For more info, checkout {@link https://www.100ms.live/docs/react-native/v2/features/mute#mute-unmute-status | Mute/Unmute Status}
	 */
	const isAudioMute = localPeer?.audioTrack?.isMute() ?? false;

	/**
	 * Checking Mute Status of local video track
	 * For more info, checkout {@link https://www.100ms.live/docs/react-native/v2/features/mute#mute-unmute-status | Mute/Unmute Status}
	 */
	const isVideoMute = localPeer?.videoTrack?.isMute() ?? false;

	/**
	 * Toggling Mute status of local audio track
	 * For more info, checkout {@link https://www.100ms.live/docs/react-native/v2/features/mute | Mute & Unmute}
	 */
	const toggleLocalAudio = () => {
		localPeer?.localAudioTrack()?.setMute(!isAudioMute);
	}

	/**
	 * Toggling Mute status of local video track
	 * For more info, checkout {@link https://www.100ms.live/docs/react-native/v2/features/mute | Mute & Unmute}
	 */
	const toggleLocalVideo = () => {
		localPeer?.localVideoTrack()?.setMute(!isVideoMute);
	}

	return (
		<View style={styles.iconBotttomWrapper}>
			<View style={styles.iconBotttomButtonWrapper}>
				{/**
				 * If User (i.e. Local Peer) has Audio permissions, then we can show button to mute and unmute audio.
				 * User's allowed permissions are decided by the current `Role` of user
				 * For more info about Roles and Permissions, checkout {@link https://www.100ms.live/docs/react-native/v2/foundation/templates-and-roles#roles | Roles}
				 */}
				{localPeer?.role?.publishSettings?.allowed?.includes('audio') ? (
					<CustomButton
						onPress={toggleLocalAudio}
						viewStyle={[styles.iconContainer, isAudioMute ? styles.iconMuted : null]}
						LeftIcon={
							<Feather
								name={isAudioMute ? 'mic-off' : 'mic'}
								style={styles.icon}
								size={24}
							/>
						}
					/>
				) : null}

				{/**
				 * If User (i.e. Local Peer) has permission to show Video, then we can show button to mute and unmute video.
				 * User's allowed permissions are decided by the current `Role` of user
				 * For more info about Roles and Permissions, checkout {@link https://www.100ms.live/docs/react-native/v2/foundation/templates-and-roles#roles | Roles}
				 */}
				{localPeer?.role?.publishSettings?.allowed?.includes('video') ? (
					<CustomButton
						onPress={toggleLocalVideo}
						viewStyle={[styles.iconContainer, isVideoMute ? styles.iconMuted : null]}
						LeftIcon={
							<Feather
								name={isVideoMute ? 'video-off' : 'video'}
								style={styles.icon}
								size={24}
							/>
						}
					/>
				) : null}
			</View>
		</View>
	);
};

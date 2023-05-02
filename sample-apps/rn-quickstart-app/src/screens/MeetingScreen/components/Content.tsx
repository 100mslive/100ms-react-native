import React from 'react';
import {
	View,
	Text,
	ActivityIndicator,
	FlatList,
	Platform,
} from 'react-native';
import type { HMSSDK, HMSSpeaker } from '@100mslive/react-native-hms';

import { styles } from '../styles';

import { DefaultModal } from '../../../components';
import { ModalTypes, PeerTrackNode } from '../../../utils/types';
import { LeaveRoomModal } from './Modals';
import { usePeerTrackNodes } from '../hooks';
import { COLORS } from '../../../utils/theme';
import PeerTile from './PeerTile';
import { getPeerTrackNodeId } from '../utils';

const _keyExtractor = (item: PeerTrackNode) => item.id;

interface ContentProps {
	modalVisible: ModalTypes;
	setModalVisible: React.Dispatch<React.SetStateAction<ModalTypes>>;
}

export const Content: React.FC<ContentProps> = (props) => {
  /**
   * `usePeerTrackNodes` hook takes care of setting up {@link HMSSDK | HMSSDK} instance, joining meeting and adding all required event listeners.
   * It gives us:
   *  1. peerTrackNodes - This is a list of {@link PeerTrackNode}, we can use this list to render local and remote peer tiles.
   *  2. loading - We can show loader while Meeting Room join is under process.
   *  3. activeSpeakers - This is a list of {@link HMSSpeaker | HMSSpeaker}, we can use this list to style active speaker tiles differently.
   *  4. leaveMeeting - This is a function that can be called on a button press to leave meeting and go back to Welcome screen.
   */
	const { peerTrackNodes, loading, activeSpeakers, leaveMeeting } = usePeerTrackNodes();

	const _renderItem = ({ item }: { item: PeerTrackNode }) => {
		// checking if current PeerTrackNode is active speaker
		const isActiveSpeaker = activeSpeakers.some(activeSpeaker => {
			return getPeerTrackNodeId(activeSpeaker.peer, activeSpeaker.track) === item.id
		});

		return <PeerTile node={item} isActive={isActiveSpeaker} />;
	};

	return (
		<View style={styles.container}>
			{peerTrackNodes.length > 0 ? (
        // Rendering list of Peers
				<FlatList
					centerContent={true}
					data={peerTrackNodes}
					showsVerticalScrollIndicator={false}
					keyExtractor={_keyExtractor}
					renderItem={_renderItem}
					contentContainerStyle={Platform.OS === 'android' ? styles.scrollCenterContent : null}
				/>
			) : loading ? (
        // Showing loader while Join is under process
				<View style={styles.loadingContainer}>
					<ActivityIndicator size={'large'} color={COLORS.WHITE} />
				</View>
			) : (
				<View style={styles.welcomeContainer}>
					<Text style={styles.welcomeHeading}>Welcome!</Text>
					<Text style={styles.welcomeDescription}>
						You’re the first one here.
					</Text>
					<Text style={styles.welcomeDescription}>
						Sit back and relax till the others join.
					</Text>
				</View>
			)}

      {/* Rendering Meeting Leave Modal */}
			<DefaultModal
				animationType="fade"
				overlay={false}
				modalPosiion="center"
				modalVisible={props.modalVisible === ModalTypes.LEAVE_ROOM}
				setModalVisible={() => props.setModalVisible(ModalTypes.DEFAULT)}
			>
				<LeaveRoomModal
					onSuccess={leaveMeeting}
					cancelModal={() => props.setModalVisible(ModalTypes.DEFAULT)}
				/>
			</DefaultModal>
		</View>
	);
};

import React, { memo } from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import { styles } from '../styles';

import PeerDisplayView from './PeerDisplayView';

const PeerTile = ({ node, isActive }) => {
	return (
		<View style={styles.tileContainer}>
			<View style={isActive ? styles.activeTile : [styles.generalTile, {borderWidth: 1, borderColor: 'transparent'}]}>
				<PeerDisplayView
					peer={node?.peer}
					isDegraded={node?.isDegraded}
					isLocal={node?.peer?.isLocal}
					videoTrack={node?.track}
				/>

				<View style={styles.peerNameContainer}>
					<Text numberOfLines={2} style={styles.peerName}>
						{node?.peer?.isLocal ? `You (${node?.peer.name})` : node?.peer.name}
					</Text>
				</View>
			</View>

			{node?.peer?.audioTrack?.isMute() ? (
				<View style={styles.micContainer}>
					<Feather name="mic-off" style={styles.mic} size={20} />
				</View>
			) : null}
		</View>
	);
}

export default memo(PeerTile);
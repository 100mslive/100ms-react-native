import {
	HMSAudioTrackSettings,
	HMSCameraFacing,
	HMSConfig,
	HMSException,
	HMSLocalPeer,
	HMSPeer,
	HMSPeerUpdate,
	HMSRoom,
	HMSSDK,
	HMSSpeaker,
	HMSTrack,
	HMSTrackSettings,
	HMSTrackSettingsInitState,
	HMSTrackSource,
	HMSTrackType,
	HMSTrackUpdate,
	HMSUpdateListenerActions,
	HMSVideoTrackSettings,
} from '@100mslive/react-native-hms';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootState } from '../../redux';
import { Constants, PeerTrackNode } from '../../utils/types';
import type { AppStackParamList } from '../../navigator';
import { clearHmsReference, saveUserData } from '../../redux/actions';
import { removeNode, removeNodeWithPeerId, removeTrackFromNodes, updateNode, updateNodeWithPeer } from './utils';

type MeetingScreenProp = NativeStackNavigationProp<
	AppStackParamList,
	'MeetingScreen'
>;

type MeetingScreenParams = RouteProp<AppStackParamList, 'MeetingScreen'>

/**
 * Creates an instance of HMSTrackSettings
 * @param {Object} config - Config which sets up state of Audio and Video Tracks Settings
 * @param {boolean} config.mutedAudio - Muted Audio
 * @param {boolean} config.mutedVideo - Muted Video
 * @returns {HMSTrackSettings} Track Settings
 * 
 * For more info, checkout {@link https://www.100ms.live/docs/react-native/v2/advanced-features/track-settings | Track Settings}
 */
const getTrackSettings = ({ mutedAudio, mutedVideo }: { mutedAudio: boolean, mutedVideo: boolean }) => {
	const listOfFaultyDevices = [
		'Pixel',
		'Pixel XL',
		'Moto G5',
		'Moto G (5S) Plus',
		'Moto G4',
		'TA-1053',
		'Mi A1',
		'Mi A2',
		'E5823', // Sony z5 compact
		'Redmi Note 5',
		'FP2', // Fairphone FP2
		'MI 5',
	];
	// DOUBT: do we have to add device modal?
	const deviceModal = '';

	let audioSettings = new HMSAudioTrackSettings({
		initialState: mutedAudio
			? HMSTrackSettingsInitState.MUTED
			: HMSTrackSettingsInitState.UNMUTED,
		useHardwareEchoCancellation: listOfFaultyDevices.includes(deviceModal) // DOUBT: remove this?
	});

	let videoSettings = new HMSVideoTrackSettings({
		initialState: mutedVideo
			? HMSTrackSettingsInitState.MUTED
			: HMSTrackSettingsInitState.UNMUTED,
		cameraFacing: HMSCameraFacing.FRONT,
		disableAutoResize: true, // DOUBT: remove this?
		forceSoftwareDecoder: true, // DOUBT: remove this?
	});

	return new HMSTrackSettings({
		video: videoSettings,
		audio: audioSettings,
	});
};

/**
 * Sets up HMSSDK instance, Adds required Event Listeners
 * Checkout Quick Start guide to know things covered {@link https://www.100ms.live/docs/react-native/v2/guides/quickstart | Quick Start Guide}
 */
export const usePeerTrackNodes = () => {
	// params passed to Meeting Screen. We need `token` from params to join meeting room.
	const { params } = useRoute<MeetingScreenParams>();
	const dispatch = useDispatch();
	const navigation = useNavigation<MeetingScreenProp>();

	/**
	 * {@link HMSSDK} instance, Initially this is null.
	 */
	const hmsInstance = useSelector((state: RootState) => state.user.hmsInstance);
	/**
	 * Username enter by user in Meeting Setup screen
	 */
	const userName = useSelector((state: RootState) => state.user.userName);
	/**
	 * Join Options that are set from Welcome screen
	 */
	const joinConfig = useSelector((state: RootState) => state.app.joinConfig);
	/**
	 * Meeting Joining Link that is set from Welcome screen
	 */
	const roomLink = useSelector((state: RootState) => state.user.roomLink);

	const [loading, setLoading] = useState(true);
	const [peerTrackNodes, setPeerTrackNodes] = useState<PeerTrackNode[]>([]); // Use this state to render Peer Tiles
	const [activeSpeakers, setActiveSpeakers] = useState<HMSSpeaker[]>([]); // Use this state to identify active speaker peer tiles

	/**
	 * Handles Meeting leave process
	 */
	const handleMeetingLeave = useCallback(async () => {
		try {
			if (!hmsInstance) {
				return Promise.reject('HMSSDK instance is null');
			}
			// Removing all registered listeners
			hmsInstance.removeAllListeners();
			
			/**
			 * Leave Meeting. For more info, Check out {@link https://www.100ms.live/docs/react-native/v2/features/leave | Leave Room}
			 */
			const leaveResult = await hmsInstance.leave();
			console.log('Leave Success: ', leaveResult);

			// Go to Welcome screen
			navigation.navigate('WelcomeScreen');

			/**
			 * Free/Release Resources. For more info, Check out {@link https://www.100ms.live/docs/react-native/v2/features/release-resources | Release Resources}
			 */
			const destroyResult = await hmsInstance.destroy();
			console.log('Destroy Success: ', destroyResult);

			// Removing HMSSDK instance stored in redux store
			dispatch(clearHmsReference());
		} catch (error) {
			console.log('Leave or Destroy Error: ', error);
		}
	}, [hmsInstance]);

	/**
	 * Handles Errors received from {@link HMSUpdateListenerActions.ON_ERROR} event listener
	 * @param {HMSException} error 
	 * 
	 * For more info, Check out {@link https://www.100ms.live/docs/react-native/v2/features/error-handling | Error Handling}
	 */
	const onErrorListener = (error: HMSException) => {
		setLoading(false);

		Toast.showWithGravity(
			`${error?.code} ${error?.description}` || 'Something went wrong',
			Toast.LONG,
			Toast.TOP,
		);
	};

	/**
	 * Handles Peer Updates received from {@link HMSUpdateListenerActions.ON_PEER_UPDATE} event listener
	 * @param {HMSSDK} hmsInstance - {@link HMSSDK} instance. This param not passed from listener, We bind it while registering listener with bind method call.
	 * @param {Object} data - This has updated peer and update type
	 * @param {HMSPeer} data.peer - Updated Peer
	 * @param {HMSPeerUpdate} data.type - Update Type
	 */
	const onPeerListener = (hmsInstance: HMSSDK, data: { peer: HMSPeer; type: HMSPeerUpdate }) => {
		const { peer, type } = data;

		// We will create Tile for the Joined Peer when we receive HMSUpdateListenerActions.ON_TRACK_UPDATE.
		// We are chosing to not create Tiles for Peers which does not have any tracks
		if (type === HMSPeerUpdate.PEER_JOINED) return;

		if (type === HMSPeerUpdate.PEER_LEFT) {
			// Remove all Tiles which has peer same as the peer which just left the call/meeting.
			// `removeNodeWithPeerId` function removes peerTrackNodes which has given peerID and returns updated list.
			setPeerTrackNodes(prevPeerTrackNodes => removeNodeWithPeerId(prevPeerTrackNodes, peer.peerID));
			return;
		}

		if (peer.isLocal) {
			// Local Peer has been updated. We are updaing Local Peer object stored in redux store. This will also update our Local Peer controls UI accordingly.
			hmsInstance.getLocalPeer().then(localPeer => dispatch(saveUserData({ hmsLocalPeer: localPeer })));

			// Updating the LocalPeer Tile.
			// `updateNodeWithPeer` function updates Peer object in PeerTrackNodes and returns updated list.
			// if none exist then we are "creating a new PeerTrackNode for the updated Peer".
			setPeerTrackNodes(prevPeerTrackNodes => updateNodeWithPeer({
        nodes: prevPeerTrackNodes,
        peer,
        createNew: true
      }));
			return;
		}

		if (type === HMSPeerUpdate.ROLE_CHANGED) {
			// If Peer's role has changed to a Role Which does not have publish permissions.
			// We will remove Tile with that Peer object
			if (
				peer.role?.publishSettings?.allowed === undefined ||
				(peer.role?.publishSettings?.allowed &&
					peer.role?.publishSettings?.allowed.length < 1)
			) {
				// Remove all Tiles which has peer same as the peer whom role just got changed
				// `removeNodeWithPeerId` function removes peerTrackNodes which has given peerID and returns updated list.
				setPeerTrackNodes(prevPeerTrackNodes => removeNodeWithPeerId(prevPeerTrackNodes, peer.peerID));
			}
			return;
		}

		if (
			type === HMSPeerUpdate.METADATA_CHANGED ||
			type === HMSPeerUpdate.NAME_CHANGED ||
			type === HMSPeerUpdate.NETWORK_QUALITY_UPDATED
		) {
			// Updating the Tiles with updated Peer.
			// `updateNodeWithPeer` function updates Peer object in PeerTrackNodes and returns updated list.
			// Note: We are not creating new PeerTrackNode object.
			setPeerTrackNodes(prevPeerTrackNodes => updateNodeWithPeer({
        nodes: prevPeerTrackNodes,
        peer,
        createNew: false
      }));
			return;
		}
	};

	/**
	 * Handles Track Updates received from {@link HMSUpdateListenerActions.ON_TRACK_UPDATE} event listener
	 * @param {HMSSDK} hmsInstance - {@link HMSSDK} instance. This param not passed from listener, We bind it while registering listener with bind method call.
	 * @param {Object} data - This has updated track with peer and update type
	 * @param {HMSPeer} data.peer - Peer
	 * @param {HMSTrack} data.track - Peer Track
	 * @param {HMSTrackUpdate} data.type - Update Type
	 */
	const onTrackListener = (hmsInstance: HMSSDK, data: { peer: HMSPeer; track: HMSTrack; type: HMSTrackUpdate }) => {
		const { peer, track, type } = data;

		// on TRACK_ADDED update
		// We will update Tile with the track or
		// create new Tile for with the track and peer
		if (type === HMSTrackUpdate.TRACK_ADDED) {

			// We will only update or create Tile "with updated track" when track type is Video.
			// Tiles without Video Track are already respresenting Peers with or without Audio.
			if (track.type === HMSTrackType.VIDEO) {

				// Updating the Tiles with Track and Peer.
				// `updateNode` function updates "Track and Peer objects" in PeerTrackNodes and returns updated list.
				// if none exist then we are "creating a new PeerTrackNode with the received Track and Peer".
				setPeerTrackNodes(prevPeerTrackNodes => updateNode({
					nodes: prevPeerTrackNodes,
					peer,
					track,
					createNew: true
				}));
			} else {

				// Updating the Tiles with Peer.
				// `updateNodeWithPeer` function updates Peer object in PeerTrackNodes and returns updated list.
				// if none exist then we are "creating a new PeerTrackNode for the Peer"
        setPeerTrackNodes(prevPeerTrackNodes => updateNodeWithPeer({
          nodes: prevPeerTrackNodes,
          peer,
          createNew: true
        }));
			}
			return;
		}

		if (type === HMSTrackUpdate.TRACK_REMOVED) {
			// If non-regular track, or
			// both regular video and audio tracks are removed
			// Then we will remove Tiles (PeerTrackNodes) with removed track and received peer
			if (
				track.source !== HMSTrackSource.REGULAR ||
				(peer.audioTrack?.trackId === undefined &&
					peer.videoTrack?.trackId === undefined)
			) {
				// We will not remove Local Peer Tile, we'll only remove track from Local Peer Tile (PeerTrackNode)
				if (peer.isLocal) {
					
					// Removing Track from LocalPeer Tile
					// `removeTrackFromNodes` function removes track from the PeerTrackNodes with given peer & track and returns updated list.
					setPeerTrackNodes(prevPeerTrackNodes => removeTrackFromNodes(prevPeerTrackNodes, peer, track));
				} else {

					// Removing Tiles
					// `removeNode` function removes PeerTrackNode objects with given peer and track and returns updated list.
					setPeerTrackNodes(prevPeerTrackNodes => removeNode(prevPeerTrackNodes, peer, track));
				}
			}
			return;
		}

		// on TRACK_MUTED or TRACK_UNMUTED updates, We will update Tiles (PeerTrackNodes)
		if (
			type === HMSTrackUpdate.TRACK_MUTED ||
			type === HMSTrackUpdate.TRACK_UNMUTED
		) {
			// If Local Audio/Video track is muted/unmuted.
			if (peer.isLocal) {
				// We are updaing Local Peer object stored in redux store. This will also update our Local Peer controls UI accordingly.
				hmsInstance.getLocalPeer().then(localPeer => dispatch(saveUserData({ hmsLocalPeer: localPeer })));
			}

			// We will only update Tile "with updated track" when track type is Video.
			if (track.type === HMSTrackType.VIDEO) {

				// Updating the Tiles with Track and Peer.
				// `updateNode` function updates "Track and Peer objects" in PeerTrackNodes and returns updated list.
				// Note: We are not creating new PeerTrackNode object.
				setPeerTrackNodes(prevPeerTrackNodes => updateNode({
					nodes: prevPeerTrackNodes,
					peer,
					track,
					createNew: false
				}));
			} else {

				// Updating the Tiles with Peer.
				// `updateNodeWithPeer` function updates Peer object in PeerTrackNodes and returns updated list.
				// Note: We are not creating new PeerTrackNode object.
				setPeerTrackNodes(prevPeerTrackNodes => updateNodeWithPeer({
          nodes: prevPeerTrackNodes,
          peer,
          createNew: false
        }));
			}
			return;
		}

		/**
		 * For more info about Degrade/Restore. check out {@link https://www.100ms.live/docs/react-native/v2/features/auto-video-degrade | Auto Video Degrade}
		 */
		if (
			type === HMSTrackUpdate.TRACK_RESTORED ||
			type === HMSTrackUpdate.TRACK_DEGRADED
		) {
			// DOUBT: does TRACK_RESTORED and TRACK_DEGRADED only emitted for video track?

			// Updating the Tiles with Track, Peer and correct `isDegraded` value.
			// `updateNode` function updates "Track object, Peer object and isDegraded value" in PeerTrackNodes and returns updated list.
			// Note: We are not creating new PeerTrackNode object.
			setPeerTrackNodes(prevPeerTrackNodes => updateNode({
				nodes: prevPeerTrackNodes,
				peer,
				track,
				isDegraded: type === HMSTrackUpdate.TRACK_DEGRADED,
				createNew: false
			}));
			return;
		}
	};

	/**
	 * Handles Speaker Updates received from {@link HMSUpdateListenerActions.ON_SPEAKER} event listener
	 * @param {HMSSpeaker[]} data - List of Active speakers
	 * 
	 * For more info about Audio Levels (Speakers), check out {@link https://www.100ms.live/docs/react-native/v2/advanced-features/show-audio-level | Show Audio Levels}
	 */
	const onSpeakerListener = (data: HMSSpeaker[]) => setActiveSpeakers(data);

	/**
	 * Handles Join Update received from {@link HMSUpdateListenerActions.ON_JOIN} event listener
	 * Receiving This event means User (i.e. Local Peer) has successfully joined meeting room
	 * @param {Object} data - object which has room object
	 * @param {Object} data.room - current {@link HMSRoom | room} object
	 */
	const onJoinSuccess = (data: { room: HMSRoom }) => {
		/**
		 * Checkout {@link HMSLocalPeer | HMSLocalPeer} Class
		 */
		const { localPeer } = data.room;

		// Creating or Updating Local Peer Tile
		if (localPeer.videoTrack) {

			// `updateNode` function updates "Track and Peer objects" in PeerTrackNodes and returns updated list.
			// if none exist then we are "creating a new PeerTrackNode with the received Track and Peer"
			setPeerTrackNodes(prevPeerTrackNodes => updateNode({
				nodes: prevPeerTrackNodes,
				peer: localPeer,
				track: (localPeer.videoTrack as HMSTrack),
				createNew: true
			}));
		} else {

			// `updateNodeWithPeer` function updates Peer object in PeerTrackNodes and returns updated list.
			// if none exist then we are "creating a new PeerTrackNode for the updated Peer".
			setPeerTrackNodes(prevPeerTrackNodes => updateNodeWithPeer({
        nodes: prevPeerTrackNodes,
        peer: localPeer,
        createNew: true
      }));
		}

		// Turning off loading state on successful Meeting Room join
		setLoading(false);

		// Saving Local Peer object in redux store
		dispatch(saveUserData({ hmsLocalPeer: localPeer }));

		// Saving Meeting Link to Async Storage for persisting it between app starts.
		AsyncStorage.setItem(
			Constants.MEET_URL,
			roomLink.replace('preview', 'meeting'),
		);
	};

	// Effect to handle HMSSDk and Listeners Setup 
	useEffect(() => {
		/**
		 * Returning early if we don't have Auth Token
		 * For more info, Check out {@link https://www.100ms.live/docs/react-native/v2/foundation/security-and-tokens | Token Concept}
		 */
		if (!params.token) return;

		const joinMeeting = async () => {
			setLoading(true);

			/**
			 * Getting Track Settings to set initial state of local tracks
			 * For more info, Check out {@link https://www.100ms.live/docs/react-native/v2/features/join#join-with-muted-audio-video | Join with Muted Audio / Video}
			 */
			const trackSettings = getTrackSettings({
				mutedAudio: joinConfig.mutedAudio,
				mutedVideo: joinConfig.mutedVideo
			});

			/**
			 * creating {@link HMSSDK} instance to join meeting room
			 * For more info, Check out {@link https://www.100ms.live/docs/react-native/v2/features/join#join-a-room | Join a Room}
			 */
			const hmsInstance = await HMSSDK.build({ trackSettings });

			// Saving HMSSDK instance in redux store
			dispatch(saveUserData({ hmsInstance }));

			/**
			 * Adding HMSSDK Event Listeners before calling Join method on HMSSDK instance
			 * For more info, Check out -
			 * {@link https://www.100ms.live/docs/react-native/v2/features/join#update-listener | Adding Event Listeners before Join},
			 * {@link https://www.100ms.live/docs/react-native/v2/features/event-listeners | Event Listeners},
			 * {@link https://www.100ms.live/docs/react-native/v2/features/event-listeners-enums | Event Listeners Enums}
			 */
			hmsInstance.addEventListener(
				HMSUpdateListenerActions.ON_JOIN,
				onJoinSuccess,
			);

			hmsInstance.addEventListener(
				HMSUpdateListenerActions.ON_PEER_UPDATE,
				onPeerListener.bind(this, hmsInstance),
			);

			hmsInstance.addEventListener(
				HMSUpdateListenerActions.ON_TRACK_UPDATE,
				onTrackListener.bind(this, hmsInstance),
			);

			/**
			 * For more info about Audio Levels (Speakers), check out {@link https://www.100ms.live/docs/react-native/v2/advanced-features/show-audio-level | Show Audio Levels}
			 */
			hmsInstance.addEventListener(
				HMSUpdateListenerActions.ON_SPEAKER,
				onSpeakerListener,
			);

			hmsInstance.addEventListener(
				HMSUpdateListenerActions.ON_ERROR,
				onErrorListener
			);

			/**
			 * creating {@link HMSConfig} hmsConfig to use as a argument to `join` method of HMSSDK instance
			 * For more info, Check out {@link https://www.100ms.live/docs/react-native/v2/features/join#join-a-room | Join a Room}
			 */
			const hmsConfig = new HMSConfig({
				authToken: params.token,
				username: userName,
			});

			hmsInstance.join(hmsConfig);
		};

		joinMeeting();
	}, [params.token, userName, joinConfig.mutedAudio, joinConfig.mutedVideo]);

	// When effect unmounts for any reason, We are calling leave function
	useEffect(() => {
		return () => {
			handleMeetingLeave();
		};
	}, [handleMeetingLeave]);

	return { loading, leaveMeeting: handleMeetingLeave, peerTrackNodes, activeSpeakers };
};

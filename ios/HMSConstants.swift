//
//  HMSConstants.swift
//  HMSSDK
//
//  Created by Yogesh Singh on 27/12/22.
//  Copyright © 2023 100ms. All rights reserved.
//

import Foundation

struct HMSConstants {

    static let ON_PREVIEW = "ON_PREVIEW"
    static let ON_JOIN = "ON_JOIN"
    static let ON_ROOM_UPDATE = "ON_ROOM_UPDATE"
    static let ON_PEER_UPDATE = "3"
    static let ON_TRACK_UPDATE = "ON_TRACK_UPDATE"
    static let ON_ROLE_CHANGE_REQUEST = "ON_ROLE_CHANGE_REQUEST"
    static let ON_CHANGE_TRACK_STATE_REQUEST = "ON_CHANGE_TRACK_STATE_REQUEST" // new
    static let ON_REMOVED_FROM_ROOM = "ON_REMOVED_FROM_ROOM"
    static let ON_ERROR = "ON_ERROR"
    static let ON_MESSAGE = "ON_MESSAGE"
    static let ON_SPEAKER = "ON_SPEAKER"
    static let RECONNECTING = "RECONNECTING"
    static let RECONNECTED = "RECONNECTED"
    static let ON_RTC_STATS = "ON_RTC_STATS"
    static let ON_LOCAL_AUDIO_STATS = "ON_LOCAL_AUDIO_STATS"
    static let ON_LOCAL_VIDEO_STATS = "ON_LOCAL_VIDEO_STATS"
    static let ON_REMOTE_AUDIO_STATS = "ON_REMOTE_AUDIO_STATS"
    static let ON_REMOTE_VIDEO_STATS = "ON_REMOTE_VIDEO_STATS"
}

//
//  HMSPipModel.swift
//  react-native-hms
//
//  Created by Yogesh Singh on 21/06/24.
//

import SwiftUI
import HMSSDK

@available(iOS 15.0, *)
class HMSPipModel: ObservableObject {
    @Published var track: HMSVideoTrack?
    @Published var pipViewEnabled = false
    @Published var scaleType: UIView.ContentMode?
    @Published var text: String?
    @Published var color: Color = Color.black
}

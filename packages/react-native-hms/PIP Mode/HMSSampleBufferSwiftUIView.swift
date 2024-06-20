//
//  HMSSampleBufferSwiftUIView.swift
//  react-native-hms
//
//  Created by Yogesh Singh on 20/06/24.
//

import SwiftUI
import HMSSDK

@available(iOS 15.0, *)
public struct HMSSampleBufferSwiftUIView: UIViewRepresentable {
    weak var track: HMSVideoTrack?
    var contentMode: UIView.ContentMode
    var preferredSize: CGSize?

    @ObservedObject var model: HMSPipModel

    public func makeUIView(context: UIViewRepresentableContext<HMSSampleBufferSwiftUIView>) -> HMSSampleBufferDisplayView {

        let sampleBufferView = HMSSampleBufferDisplayView(frame: .zero)
        sampleBufferView.track = track

        if let preferredSize = preferredSize {
            sampleBufferView.preferredSize = preferredSize
        }
        sampleBufferView.contentMode = contentMode
        sampleBufferView.isEnabled = true

        return sampleBufferView
    }

    public func updateUIView(_ sampleBufferView: HMSSampleBufferDisplayView, context: UIViewRepresentableContext<HMSSampleBufferSwiftUIView>) {

        if track != sampleBufferView.track {
            sampleBufferView.track = track
        }
        sampleBufferView.isEnabled = model.pipViewEnabled
    }

    public static func dismantleUIView(_ uiView: HMSSampleBufferDisplayView, coordinator: ()) {
        uiView.isEnabled = false
        uiView.track = nil
    }
}

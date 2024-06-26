//
//  HMSPipView.swift
//  react-native-hms
//
//  Created by Yogesh Singh on 21/06/24.
//

import SwiftUI
import HMSSDK

@available(iOS 15.0, *)
struct HMSPipView: View {

    @ObservedObject var model: HMSPipModel

    var body: some View {
        if model.pipViewEnabled, let track = model.track {
            GeometryReader { geo in
                HMSSampleBufferSwiftUIView(
                    track: track,
                    contentMode: model.scaleType ?? .scaleAspectFill,
                    preferredSize: geo.size,
                    model: model
                )
                .frame(width: geo.size.width, height: geo.size.height)
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(model.color)
        }
    }
}

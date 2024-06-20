//
//  HMSPipView.swift
//  react-native-hms
//
//  Created by Yogesh Singh on 20/06/24.
//

import SwiftUI
import HMSSDK

@available(iOS 15.0, *)
struct HMSPipView: View {

    @ObservedObject var model: HMSPipModel

    var body: some View {
        if model.pipViewEnabled {
            VStack {
                if let track = model.track, !(model.track?.isMute() ?? true) {
                    GeometryReader { geo in
                        if let contentMode = model.scaleType {
                            HMSSampleBufferSwiftUIView(track: track, contentMode: contentMode, preferredSize: geo.size, model: model)
                                .frame(width: geo.size.width, height: geo.size.height)
                        } else {
                            HMSSampleBufferSwiftUIView(track: track, contentMode: .scaleAspectFill, preferredSize: geo.size, model: model)
                                .frame(width: geo.size.width, height: geo.size.height)
                        }
                    }
                } else if let text = model.text {
                    Text(text)
                }
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(model.color)
        }
    }
}

//
//  Dynamic.swift
//  RNExample
//
//  Created by Jatin Nagar on 18/12/23.
//

import UIKit
import Foundation
import Lottie

@objc class Dynamic: NSObject {

  @objc func createAnimationView(rootView: UIView, lottieName: String) -> LottieAnimationView {
    let animationView = LottieAnimationView(name: lottieName)
    animationView.frame = rootView.frame
    animationView.center = rootView.center
    animationView.backgroundColor = UIColor.white
    return animationView
  }

  @objc func play(animationView: LottieAnimationView) {
    animationView.play(
      completion: { (_) in
        RNSplashScreen.setAnimationFinished(true)
      }
    )
  }
}

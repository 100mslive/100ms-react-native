package com.reactnativehmssdk

import android.annotation.SuppressLint
import android.content.Context
import android.view.LayoutInflater
import android.widget.FrameLayout
import com.facebook.react.bridge.ReactContext

@SuppressLint("ViewConstructor")
class HMSTrackStatsView(context: ReactContext) : FrameLayout(context) {
  init {
    val layoutInflater = getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
    layoutInflater.inflate(R.layout.track_stats_view, this)
  }
}

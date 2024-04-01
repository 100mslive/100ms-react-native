package com.reactnativehmssdk

import androidx.lifecycle.LiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.asLiveData
import kotlinx.coroutines.Dispatchers

class RTCStatViewModel(rtcStatUseCase: RTCStatUseCase) : ViewModel() {
  val rtcStatLiveData: LiveData<Int> = rtcStatUseCase.rtcStats.asLiveData(Dispatchers.Default)
}

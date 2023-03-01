package com.reactnativehmssdk

import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.WritableMap

object HMSEventDelayer {
  private const val delayMS: Long = 50
  private val loopHandler = Handler(Looper.getMainLooper())
  private val emitEventTask = object : Runnable {
    override fun run() {
      val eventData = dequeue()
      if (eventData !== null) {
        emitterFunction(eventData.first, eventData.second)
        loopHandler.postDelayed(this, delayMS)
      }
    }
  }
  private var lastEventEmittedAt: Long = System.currentTimeMillis()
  private var dataQueue = mutableListOf<Pair<String, WritableMap>>()
  private lateinit var emitterFunction: (event:String, data: WritableMap) -> Unit

  private fun dequeue(): Pair<String, WritableMap>? {
    if (dataQueue.size <= 0) {
      return null
    }
    return dataQueue.removeFirst()
  }

  private fun enqueue(data: Pair<String, WritableMap>): Boolean {
    return dataQueue.add(data)
  }

  private fun coolDownComplete(): Boolean {
    return (System.currentTimeMillis() - lastEventEmittedAt) > delayMS
  }

  private fun startTimer() {
    loopHandler.postDelayed(emitEventTask, delayMS)
  }

  // TODO: `stopTimer` function can be used to when user leaves room or removed from room
  private fun stopTimer() {
    loopHandler.removeCallbacks(emitEventTask)
  }

  fun emitWithDelay(event: String, data: WritableMap) {
    val isEventQueueEmpty = dataQueue.isEmpty()

    val isCoolDownComplete = this.coolDownComplete()

    // If queue is empty and cool down time is complete
    // We can emit event without any delay
    if (isEventQueueEmpty && isCoolDownComplete) {
      emitterFunction(event, data)
      lastEventEmittedAt = System.currentTimeMillis()
      return
    }

    // If we can't emit event without delay i.e. queue is not empty or cool down is not complete
    // add event to queue
    this.enqueue(Pair(event, data))

    // If queue was empty and cool down is not complete
    // then we need to start timer to emit event after certain delay
    if (isEventQueueEmpty && !isCoolDownComplete) {
      startTimer()
    }
  }

  fun setEmitterFunction(fn: (String, WritableMap) -> Unit) {
    emitterFunction = fn
  }
}

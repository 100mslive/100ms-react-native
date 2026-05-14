package com.reactnativehmssdk

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

/**
 * HmssdkPackage — Phase 1 / 1C-2 of the New Architecture migration.
 *
 * Converted from `ReactPackage` to `BaseReactPackage` so that under New
 * Architecture, modules are instantiated lazily via `getModule(name)` —
 * matching how TurboModules are registered. `getReactModuleInfoProvider()`
 * advertises which modules this package owns.
 *
 * The same package class works under both arches; the active source set
 * (oldarch or newarch) determines which `HMSManager` class is on the
 * classpath. View managers are still registered eagerly via
 * `createViewManagers()` — Fabric component-view migration for them
 * lives in 1C-3 (HMSSDKViewManager) and 1C-4 (HMSHLSPlayerManager).
 */
class HmssdkPackage : BaseReactPackage() {
  override fun getModule(
    name: String,
    reactContext: ReactApplicationContext,
  ): NativeModule? =
    when (name) {
      HMSManagerImpl.REACT_CLASS -> HMSManager(reactContext)
      else -> null
    }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider =
    ReactModuleInfoProvider {
      mapOf(
        HMSManagerImpl.REACT_CLASS to
          ReactModuleInfo(
            HMSManagerImpl.REACT_CLASS, // name
            "com.reactnativehmssdk.HMSManager", // className (the wrapper, set per source set)
            false, // canOverrideExistingModule
            false, // needsEagerInit
            false, // hasConstants (deprecated, ignored under New Arch)
            false, // isCxxModule
            BuildConfig.IS_NEW_ARCHITECTURE_ENABLED, // isTurboModule
          ),
      )
    }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
    listOf<ViewManager<*, *>>(HMSSDKViewManager(), HMSHLSPlayerManager())
}

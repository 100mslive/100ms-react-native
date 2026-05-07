//
//  HMSHLSPlayerComponentView.mm
//
//  Fabric component view for `<HMSHLSPlayer />` — the native HLS player.
//
//  Phase 1 / 1B group 3 of the New Architecture migration. Sibling to
//  `HMSViewComponentView.mm` (1B group 2) — same architecture pattern,
//  bigger surface (3 props + 13 imperative commands + 3 events).
//
//  Architecture overview:
//    - `HMSHLSPlayerComponentView` (this file) is the Fabric wrapper:
//      conforms to the generated `RCTHMSHLSPlayerViewProtocol`,
//      hosts the existing Swift `HMSHLSPlayer` UIView, dispatches
//      props / commands / events between Fabric and the Swift view.
//    - The Swift class itself is unchanged — same player logic, same
//      event-block props (`onDataReturned`, `onHmsHlsPlaybackEvent`,
//      `onHmsHlsStatsEvent`).
//
//  Event-emission pattern (Pattern A — block-prop interception):
//    - The Swift `HMSHLSPlayer` UIView already exposes
//      `@objc var on*: RCTDirectEventBlock?` for each event.
//    - In `initWithFrame:`, we set each block to a translator block
//      that converts the NSDictionary payload into the typed C++
//      struct expected by the generated Fabric event emitter.
//    - Same pattern as `HMSViewComponentView.mm`. Industry standard
//      for migrating Swift-based RN libraries to Fabric without
//      modifying Swift code.
//
//  Note about the spec's `onHlsPlayerCuesEvent`:
//    - The spec at src/specs/HMSHLSPlayerNativeComponent.ts declares
//      4 events. Today's iOS Swift class fires only 3 of them — cue
//      events are dispatched as part of `onHmsHlsPlaybackEvent` with
//      `event: 'ON_PLAYBACK_CUE_EVENT'`. We do NOT wire a separate
//      `onHlsPlayerCuesEvent` translator here.
//    - Behavior is preserved from old arch: cues continue arriving via
//      the playback event stream. JS handlers branch on `event` field.
//    - When/if iOS gains a separate cue-emission path, add the fourth
//      block-intercept here.
//

#ifdef RCT_NEW_ARCH_ENABLED

#import <React/RCTViewComponentView.h>
#import <React/RCTConversions.h>

#import <react/renderer/components/RNHmsSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNHmsSpec/EventEmitters.h>
#import <react/renderer/components/RNHmsSpec/Props.h>
#import <react/renderer/components/RNHmsSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

// Auto-generated Swift bridging header.
#import "react_native_hms-Swift.h"

using namespace facebook::react;

@interface HMSHLSPlayerComponentView : RCTViewComponentView <RCTHMSHLSPlayerViewProtocol>
@end

@implementation HMSHLSPlayerComponentView {
  // The Swift UIView that hosts the AVPlayerViewController and runs
  // the HLS playback. Owned and hosted as our `contentView`.
  HMSHLSPlayer *_view;
}

#pragma mark - Component descriptor registration

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<HMSHLSPlayerComponentDescriptor>();
}

#pragma mark - View lifecycle

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const HMSHLSPlayerProps>();
    _props = defaultProps;

    // Instantiate the Swift HMSHLSPlayer view. It owns its own
    // AVPlayerViewController, attaches to the SDK via HMSManager.shared
    // (set in Phase 0), and emits events through its block props.
    _view = [[HMSHLSPlayer alloc] init];
    self.contentView = _view;

    // Pattern A — block-prop interception for each of the 3 event
    // blocks the Swift class exposes. Each block converts the
    // NSDictionary payload into the typed C++ struct expected by
    // the generated Fabric event emitter.
    [self wireEventInterceptors];
  }
  return self;
}

#pragma mark - Event interception (Pattern A)

- (void)wireEventInterceptors {
  __weak __typeof(self) weakSelf = self;

  // ─────────────────────────────────────────────────────────────────────
  // onDataReturned — request-response for the 3 commands that need
  // async results: areClosedCaptionSupported, isClosedCaptionEnabled,
  // getPlayerDurationDetails. Matched to in-flight JS promises by
  // `requestId`.
  // ─────────────────────────────────────────────────────────────────────
  _view.onDataReturned = ^(NSDictionary *body) {
    __strong __typeof(weakSelf) strongSelf = weakSelf;
    if (!strongSelf || !strongSelf->_eventEmitter) {
      return;
    }
    auto emitter = std::dynamic_pointer_cast<HMSHLSPlayerEventEmitter const>(
        strongSelf->_eventEmitter);
    if (!emitter) {
      return;
    }
    HMSHLSPlayerEventEmitter::OnDataReturned event = {};
    if (body[@"requestId"]) {
      event.requestId = [body[@"requestId"] intValue];
    }
    // Swift packages the result/error under @"data" today; pass
    // straight through as a JSON-stringified blob (Phase 1 Object-typed
    // convention — Phase 2 will narrow).
    if (body[@"data"]) {
      NSData *jsonData =
          [NSJSONSerialization dataWithJSONObject:body[@"data"]
                                          options:0
                                            error:nil];
      if (jsonData) {
        NSString *jsonString = [[NSString alloc] initWithData:jsonData
                                                     encoding:NSUTF8StringEncoding];
        if (jsonString) {
          event.result = [jsonString UTF8String];
        }
      }
    }
    emitter->onDataReturned(event);
  };

  // ─────────────────────────────────────────────────────────────────────
  // onHmsHlsPlaybackEvent — playback state changes, cues, failures,
  // resolution changes. Swift emits a `{event, data}` shape; we pack
  // `data` as a stringified JSON blob per the Phase 1 convention.
  // ─────────────────────────────────────────────────────────────────────
  _view.onHmsHlsPlaybackEvent = ^(NSDictionary *body) {
    __strong __typeof(weakSelf) strongSelf = weakSelf;
    if (!strongSelf || !strongSelf->_eventEmitter) {
      return;
    }
    auto emitter = std::dynamic_pointer_cast<HMSHLSPlayerEventEmitter const>(
        strongSelf->_eventEmitter);
    if (!emitter) {
      return;
    }
    HMSHLSPlayerEventEmitter::OnHmsHlsPlaybackEvent event = {};
    if ([body[@"event"] isKindOfClass:[NSString class]]) {
      event.event = [body[@"event"] UTF8String];
    }
    if (body[@"data"]) {
      NSData *jsonData =
          [NSJSONSerialization dataWithJSONObject:body[@"data"]
                                          options:0
                                            error:nil];
      if (jsonData) {
        NSString *jsonString = [[NSString alloc] initWithData:jsonData
                                                     encoding:NSUTF8StringEncoding];
        if (jsonString) {
          event.data = [jsonString UTF8String];
        }
      }
    }
    emitter->onHmsHlsPlaybackEvent(event);
  };

  // ─────────────────────────────────────────────────────────────────────
  // onHmsHlsStatsEvent — bandwidth, dropped frames, bitrate, etc.
  // Fired periodically when `enableStats=true`.
  // ─────────────────────────────────────────────────────────────────────
  _view.onHmsHlsStatsEvent = ^(NSDictionary *body) {
    __strong __typeof(weakSelf) strongSelf = weakSelf;
    if (!strongSelf || !strongSelf->_eventEmitter) {
      return;
    }
    auto emitter = std::dynamic_pointer_cast<HMSHLSPlayerEventEmitter const>(
        strongSelf->_eventEmitter);
    if (!emitter) {
      return;
    }
    HMSHLSPlayerEventEmitter::OnHmsHlsStatsEvent event = {};
    if ([body[@"event"] isKindOfClass:[NSString class]]) {
      event.event = [body[@"event"] UTF8String];
    }
    if (body[@"data"]) {
      NSData *jsonData =
          [NSJSONSerialization dataWithJSONObject:body[@"data"]
                                          options:0
                                            error:nil];
      if (jsonData) {
        NSString *jsonString = [[NSString alloc] initWithData:jsonData
                                                     encoding:NSUTF8StringEncoding];
        if (jsonString) {
          event.data = [jsonString UTF8String];
        }
      }
    }
    emitter->onHmsHlsStatsEvent(event);
  };
}

#pragma mark - Prop dispatch

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps {
  const auto &oldViewProps =
      *std::static_pointer_cast<HMSHLSPlayerProps const>(_props);
  const auto &newViewProps =
      *std::static_pointer_cast<HMSHLSPlayerProps const>(props);

  // url (string) — setting this triggers Swift's `play(url)` via didSet
  if (oldViewProps.url != newViewProps.url) {
    _view.url = RCTNSStringFromString(newViewProps.url);
  }

  // enableStats (bool) — toggles the Swift class's stats timer
  if (oldViewProps.enableStats != newViewProps.enableStats) {
    _view.enableStats = newViewProps.enableStats;
  }

  // enableControls (bool) — toggles AVPlayerViewController's controls UI
  if (oldViewProps.enableControls != newViewProps.enableControls) {
    _view.enableControls = newViewProps.enableControls;
  }

  [super updateProps:props oldProps:oldProps];
}

#pragma mark - Imperative commands

// Generic command dispatcher. The `RCTHMSHLSPlayerHandleCommand` helper
// is generated by Codegen and dispatches to the typed methods below
// based on the command name from the JS spec.
- (void)handleCommand:(NSString const *)commandName args:(NSArray const *)args {
  RCTHMSHLSPlayerHandleCommand(self, commandName, args);
}

// 13 commands matching src/specs/HMSHLSPlayerNativeComponent.ts.
// Each forwards directly to the corresponding method on the Swift
// `HMSHLSPlayer` UIView.

- (void)play:(NSString *)url {
  // Spec convention: empty string means "use the URL prop"
  [_view play:url.length > 0 ? url : nil];
}

- (void)stop {
  [_view stop];
}

- (void)pause {
  [_view pause];
}

- (void)resume {
  [_view resume];
}

- (void)seekToLivePosition {
  [_view seekToLivePosition];
}

- (void)seekForward:(double)seconds {
  [_view seekForward:seconds];
}

- (void)seekBackward:(double)seconds {
  [_view seekBackward:seconds];
}

- (void)setVolume:(NSInteger)level {
  [_view setVolume:(int)level];
}

- (void)areClosedCaptionSupported:(NSInteger)requestId {
  [_view areClosedCaptionSupportedWithRequestId:(NSUInteger)requestId];
}

- (void)isClosedCaptionEnabled:(NSInteger)requestId {
  [_view isClosedCaptionEnabledWithRequestId:(NSUInteger)requestId];
}

- (void)enableClosedCaption {
  [_view enableClosedCaption];
}

- (void)disableClosedCaption {
  [_view disableClosedCaption];
}

- (void)getPlayerDurationDetails:(NSInteger)requestId {
  [_view getPlayerDurationDetailsWithRequestId:(NSUInteger)requestId];
}

@end

#pragma mark - Plugin registration

// Public C function that the Fabric component-views plugin registry
// calls (via RCTFabricComponentsPlugins) to register this class as
// the implementation of `<HMSHLSPlayer />`.
Class<RCTComponentViewProtocol> HMSHLSPlayerCls(void) {
  return HMSHLSPlayerComponentView.class;
}

#endif  // RCT_NEW_ARCH_ENABLED

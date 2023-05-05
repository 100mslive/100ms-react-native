/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

// $FlowFixMe - EventEmitter Type Safety
import EventEmitter from './_EventEmitter';

export default EventEmitter;
export { default as EmitterSubscription } from './_EmitterSubscription';

export interface EventSubscription {
  remove(): void;
}

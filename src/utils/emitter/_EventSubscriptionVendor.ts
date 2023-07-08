import type { EventSubscription } from './_EventSubscription';

/**
 * EventSubscriptionVendor stores a set of EventSubscriptions that are
 * subscribed to a particular event type.
 */
export class EventSubscriptionVendor {
  _subscriptionsForType: Record<string, EventSubscription[] | null | undefined>;
  _currentSubscription: EventSubscription | null | undefined;

  constructor() {
    this._subscriptionsForType = {};
    this._currentSubscription = null;
  }

  /**
   * Adds a subscription keyed by an event type.
   *
   * @param {string} eventType
   * @param {EventSubscription} subscription
   */
  addSubscription(
    eventType: string,
    subscription: EventSubscription
  ): EventSubscription {
    if (subscription.subscriber !== this) {
      console.warn('The subscriber of the subscription is incorrectly set.'); // TODO: throw error or use logger?
    }
    if (!this._subscriptionsForType[eventType]) {
      this._subscriptionsForType[eventType] = [];
    }
    const eventSubscriptions = this._subscriptionsForType[
      eventType
    ] as EventSubscription[];
    const key = eventSubscriptions.length;
    eventSubscriptions.push(subscription);
    subscription.eventType = eventType;
    subscription.key = key;
    return subscription;
  }

  /**
   * Removes a bulk set of the subscriptions.
   *
   * @param {?string} eventType - Optional name of the event type whose
   *   registered supscriptions to remove, if null or undefined remove all subscriptions.
   */
  removeAllSubscriptions(eventType: string | undefined | null) {
    if (eventType === undefined || eventType === null) {
      this._subscriptionsForType = {};
    } else {
      delete this._subscriptionsForType[eventType];
    }
  }

  /**
   * Removes a specific subscription. Instead of calling this function, call
   * `subscription.remove()` directly.
   *
   * @param {object} subscription
   */
  removeSubscription(subscription: EventSubscription) {
    const eventType = subscription.eventType;
    const key = subscription.key;

    const subscriptionsForType = this._subscriptionsForType[eventType];
    if (subscriptionsForType) {
      delete subscriptionsForType[key];
    }
  }

  /**
   * Returns the array of subscriptions that are currently registered for the
   * given event type.
   *
   * Note: This array can be potentially sparse as subscriptions are deleted
   * from it when they are removed.
   *
   * TODO: This returns a nullable array. wat?
   *
   * @param {string} eventType
   * @returns {?array}
   */
  getSubscriptionsForType(
    eventType: string
  ): EventSubscription[] | null | undefined {
    return this._subscriptionsForType[eventType];
  }
}

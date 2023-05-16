import type { EventSubscriptionVendor } from './_EventSubscriptionVendor';

/**
 * EventSubscription represents a subscription to a particular event. It can
 * remove its own subscription.
 */
export class EventSubscription {
  // @ts-ignore this value is assigned after creating instance of class
  eventType: string;
  // @ts-ignore this value is assigned after creating instance of class
  key: number;
  subscriber: EventSubscriptionVendor;

  /**
   * @param {EventSubscriptionVendor} subscriber the subscriber that controls
   *   this subscription.
   */
  constructor(subscriber: EventSubscriptionVendor) {
    this.subscriber = subscriber;
  }

  /**
   * Removes this subscription from the subscriber that controls it.
   */
  remove() {
    this.subscriber.removeSubscription(this);
  }
}

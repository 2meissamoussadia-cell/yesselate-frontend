/**
 * Store en mémoire des abonnements push (remplacer par DB en prod).
 */

export type PushSubscriptionPayload = {
  endpoint: string;
  keys: { auth: string; p256dh: string };
  expirationTime?: number | null;
};

const subscriptions = new Map<string, PushSubscriptionPayload>();

export function addSubscription(sub: PushSubscriptionPayload): void {
  subscriptions.set(sub.endpoint, sub);
}

export function removeSubscription(endpoint: string): void {
  subscriptions.delete(endpoint);
}

export function getAllSubscriptions(): PushSubscriptionPayload[] {
  return Array.from(subscriptions.values());
}

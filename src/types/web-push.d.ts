/**
 * Module declaration for web-push (optional dependency).
 */
declare module 'web-push' {
  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void;

  export function sendNotification(
    subscription: { endpoint: string; keys: { auth: string; p256dh: string } },
    payload: string,
    options?: { TTL?: number }
  ): Promise<unknown>;
}

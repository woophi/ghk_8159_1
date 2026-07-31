export type LandingEventName =
  | 'e013_landing_impression'
  | 'e013_transfer_click'
  | 'e013_scroll_depth'
  | 'e013_mock_row_view'
  | 'e013_amount_edit_open'
  | 'e013_amount_edit_confirm'
  | 'e013_amount_edit_cancel'
  | 'e013_thankyou_impression'
  | 'e013_thankyou_close'
  | 'e013_landing_exit';

type EventPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: 'event', eventName: string, payload?: EventPayload) => void;
    ym?: (counterId: number, method: 'reachGoal', eventName: string, payload?: EventPayload) => void;
  }
}

export const trackEvent = (eventName: LandingEventName, payload: EventPayload = {}) => {
  const cleanPayload = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: eventName, ...cleanPayload });
  window.gtag?.('event', eventName, cleanPayload);
  window.ym?.(96171108, 'reachGoal', eventName, cleanPayload);
};

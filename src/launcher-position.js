const POPUP_WIDTH = 450;
const POPUP_HEIGHT = 680;
const POPUP_MARGIN = 20;
const POPUP_TOP_OFFSET = 60;

export const popupSize = { width: POPUP_WIDTH, height: POPUP_HEIGHT };

export function getPopupPosition(sourceWindow, screenInfo = globalThis.screen) {
  const hasWindowBounds = Number.isFinite(sourceWindow?.left)
    && Number.isFinite(sourceWindow?.top)
    && Number.isFinite(sourceWindow?.width)
    && Number.isFinite(sourceWindow?.height);
  if (hasWindowBounds) {
    return {
      left: Math.round(sourceWindow.left + Math.max(0, sourceWindow.width - POPUP_WIDTH - POPUP_MARGIN)),
      top: Math.round(sourceWindow.top + Math.max(0, Math.min(POPUP_TOP_OFFSET, sourceWindow.height - POPUP_HEIGHT))),
    };
  }

  return {
    left: Math.round((screenInfo?.availLeft ?? 0) + (screenInfo?.availWidth ?? POPUP_WIDTH) - POPUP_WIDTH - POPUP_MARGIN),
    top: Math.round((screenInfo?.availTop ?? 0) + POPUP_TOP_OFFSET),
  };
}

export function isConverterUrl(candidate, converterUrl) {
  return candidate === converterUrl || candidate?.startsWith(`${converterUrl}?`);
}

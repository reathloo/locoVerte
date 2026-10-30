import { locale, t } from './i18n.js';
import { getPopupPosition, isConverterUrl, popupSize } from './launcher-position.js';

(async () => {
  document.documentElement.lang = locale;
  document.title = t('appName');
  const status = document.querySelector('#status');
  status.textContent = t('opening');

  try {
    const api = globalThis.browser ?? globalThis.chrome;
    const url = api.runtime.getURL('index.html');
    const [activeTab] = await api.tabs.query({ active: true, currentWindow: true });
    const sourceTab = Number.isInteger(activeTab?.id) && /^https?:/.test(activeTab.url || '') ? activeTab.id : null;
    const windows = await api.windows.getAll({ populate: true });
    const sourceWindow = windows.find((item) => item.id === activeTab?.windowId);
    const position = getPopupPosition(sourceWindow);
    const existing = windows.find((item) => item.tabs?.some((tab) => isConverterUrl(tab.url, url)));
    if (existing) {
      await api.windows.update(existing.id, { ...position, focused: true });
      if (sourceTab) await api.runtime.sendMessage({ type: 'locoVerteSourceTab', tabId: sourceTab });
    } else {
      await api.windows.create({
        url: sourceTab ? `${url}?sourceTab=${sourceTab}` : url,
        type: 'popup',
        ...popupSize,
        ...position,
      });
    }
    window.close();
  } catch (error) {
    status.textContent = t('openingFailed');
    console.error('Local Converter:', error);
  }
})();

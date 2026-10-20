import { applyStaticTranslations, getLanguagePreference, locale, setLanguagePreference, t } from './i18n.js';

const themeKey = 'locoVerte.theme';

function getTheme() {
  try {
    const value = localStorage.getItem(themeKey);
    return value === 'dark' || value === 'light' ? value : 'auto';
  } catch { return 'auto'; }
}

function setTheme(value) {
  try {
    if (value === 'auto') localStorage.removeItem(themeKey);
    else localStorage.setItem(themeKey, value);
  } catch { return false; }
  if (value === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = value;
  return true;
}

export function initPreferences(onLanguageChange, onError) {
  const languageNames = { en: 'English', de: 'Deutsch', es: 'Español', fr: 'Français' };
  const menus = [
    { name: 'language', get: getLanguagePreference, set: setLanguagePreference, label: () => t('languageButton', { language: languageNames[locale] }), error: 'languageSaveError' },
    { name: 'theme', get: getTheme, set: setTheme, label: () => t('themeButton', { theme: t(`${getTheme()}Theme`) }), error: 'themeSaveError' },
  ].map((menu) => ({ ...menu, button: document.querySelector(`#${menu.name}-button`), panel: document.querySelector(`#${menu.name}-menu`) }));

  function close(menu, focus = false) {
    menu.panel.hidden = true;
    menu.button.setAttribute('aria-expanded', 'false');
    if (focus) menu.button.focus();
  }
  function refresh() {
    applyStaticTranslations();
    document.querySelector('#language-current').textContent = locale.toUpperCase();
    for (const menu of menus) {
      menu.button.title = menu.label();
      menu.button.setAttribute('aria-label', menu.label());
      for (const option of menu.panel.querySelectorAll('button')) {
        option.setAttribute('aria-pressed', String(option.dataset[menu.name] === menu.get()));
      }
    }
  }
  for (const menu of menus) {
    menu.button.addEventListener('click', () => {
      const opening = menu.panel.hidden;
      menus.forEach((item) => close(item));
      menu.panel.hidden = !opening;
      menu.button.setAttribute('aria-expanded', String(opening));
      if (opening) menu.panel.querySelector('[aria-pressed="true"]')?.focus();
    });
    menu.panel.addEventListener('click', (event) => {
      const option = event.target.closest('button');
      if (!option) return;
      if (!menu.set(option.dataset[menu.name])) return onError(t(menu.error));
      close(menu, true);
      refresh();
      if (menu.name === 'language') onLanguageChange();
    });
  }
  document.addEventListener('click', (event) => {
    for (const menu of menus) if (!menu.button.parentElement.contains(event.target)) close(menu);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') for (const menu of menus) if (!menu.panel.hidden) close(menu, true);
  });
  refresh();
}

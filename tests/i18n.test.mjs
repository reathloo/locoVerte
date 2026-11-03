import assert from 'node:assert/strict';
import test from 'node:test';

import { messages } from '../src/i18n.js';

const placeholders = (value) => [...String(value).matchAll(/\{([^}]+)\}/g)]
  .map((match) => match[1])
  .sort();

test('all translations have the same keys and placeholders as English', () => {
  const englishKeys = Object.keys(messages.en).sort();
  for (const locale of ['de', 'es', 'fr']) {
    assert.deepEqual(Object.keys(messages[locale]).sort(), englishKeys, `${locale} keys differ`);
    for (const key of englishKeys) {
      assert.deepEqual(placeholders(messages[locale][key]), placeholders(messages.en[key]), `${locale}.${key} placeholders differ`);
    }
  }
});

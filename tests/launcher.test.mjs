import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getPopupPosition, isConverterUrl } from '../src/launcher-position.js';

test('popup follows a browser window on a monitor left of the primary display', () => {
  assert.deepEqual(
    getPopupPosition({ left: -1920, top: 0, width: 1920, height: 1080 }),
    { left: -470, top: 60 },
  );
});

test('popup follows a browser window on a monitor right of the primary display', () => {
  assert.deepEqual(
    getPopupPosition({ left: 1920, top: 30, width: 1600, height: 900 }),
    { left: 3050, top: 90 },
  );
});

test('popup stays within a small source window where possible', () => {
  assert.deepEqual(
    getPopupPosition({ left: 100, top: 50, width: 400, height: 600 }),
    { left: 100, top: 50 },
  );
});

test('existing converter window is found when its source tab is in the query string', () => {
  const url = 'chrome-extension://test/index.html';
  assert.equal(isConverterUrl(`${url}?sourceTab=42`, url), true);
  assert.equal(isConverterUrl('chrome-extension://test/launcher.html', url), false);
});

export function ensureUint8ArrayToHex() {
  if (Uint8Array.prototype.toHex) return;
  Object.defineProperty(Uint8Array.prototype, 'toHex', {
    configurable: true,
    writable: true,
    value() {
      let result = '';
      for (const byte of this) result += byte.toString(16).padStart(2, '0');
      return result;
    },
  });
}

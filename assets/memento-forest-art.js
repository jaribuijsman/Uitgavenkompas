/* Memento PIN backgrounds: six original pixel-art scenes. Weather overlays are separate. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MementoForestArt = api;
})(globalThis, () => {
  'use strict';
  const scenes = Object.freeze({
    ochtendmist: Object.freeze({ name: 'Ochtendmist', src: './assets/pin-forests/ochtendmist.webp' }),
    zonnestralen: Object.freeze({ name: 'Zonnestralen', src: './assets/pin-forests/zonnestralen.webp' }),
    schemermeer: Object.freeze({ name: 'Schemermeer', src: './assets/pin-forests/schemermeer.webp' }),
    bosruines: Object.freeze({ name: 'Bosruïnes', src: './assets/pin-forests/bosruines.webp' }),
    maanmeer: Object.freeze({ name: 'Maanmeer', src: './assets/pin-forests/maanmeer.webp' }),
    herfstbrug: Object.freeze({ name: 'Herfstbrug', src: './assets/pin-forests/herfstbrug.webp' })
  });
  const clock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', hourCycle: 'h23' });
  function hour(date = new Date()) { return Number(clock.format(date)); }
  function sceneForHour(date = new Date()) {
    const h = hour(date);
    if (h >= 5 && h < 12) return ['ochtendmist', 'zonnestralen', 'bosruines'][(h - 5) % 3];
    if (h >= 12 && h < 18) return ['zonnestralen', 'bosruines', 'ochtendmist'][(h - 12) % 3];
    if (h >= 18 && h < 22) return ['herfstbrug', 'schemermeer'][(h - 18) % 2];
    return ['maanmeer', 'schemermeer'][h >= 22 ? (h - 22) % 2 : h % 2];
  }
  function asset(id) { return scenes[id]?.src || scenes.ochtendmist.src; }
  return Object.freeze({ scenes, hour, sceneForHour, asset });
});

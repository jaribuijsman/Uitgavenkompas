/* Memento PIN forest rotation: dayparts and assets, no browser required. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const art = require('../assets/memento-forest-art.js');
const root = path.join(__dirname, '..');
const expected = ['ochtendmist','zonnestralen','schemermeer','bosruines','maanmeer','herfstbrug'];
assert.deepEqual(Object.keys(art.scenes), expected);
for (const id of expected) {
  assert.match(art.asset(id), /^\.\/assets\/pin-forests\/[a-z]+\.webp$/);
  assert.ok(art.scenes[id].name);
}
const atAmsterdamHour = hour => new Date(Date.UTC(2026, 9, 27, (hour + 23) % 24, 30));
for (let h = 0; h < 24; h++) {
  const date = atAmsterdamHour(h);
  assert.equal(art.hour(date), h);
  assert.ok(expected.includes(art.sceneForHour(date)));
}
for (const [h, id] of [[5,'ochtendmist'],[6,'zonnestralen'],[7,'bosruines'],[12,'zonnestralen'],[13,'bosruines'],[14,'ochtendmist'],[18,'herfstbrug'],[19,'schemermeer'],[22,'maanmeer'],[23,'schemermeer'],[0,'maanmeer'],[1,'schemermeer']]) {
  assert.equal(art.sceneForHour(atAmsterdamHour(h)), id, 'hour '+h);
}
assert.equal(art.hour(new Date('2026-07-01T10:00:00Z')), 12, 'Amsterdam summer time');
const lock = fs.readFileSync(path.join(root, 'assets/memento-forest-lock.js'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
assert.match(lock, /sceneForHour/);
assert.match(lock, /memento_forest_choice_v1/);
assert.match(lock, /memento-weather-update/);
assert.match(lock, /requestAnimationFrame\(paint\)/);
for (const id of expected) assert.ok(sw.includes('pin-forests/'+id+'.webp'), id+' not cached');
console.log('PIN forest regression: six images, hourly Amsterdam rotation and weather/worker wiring OK');

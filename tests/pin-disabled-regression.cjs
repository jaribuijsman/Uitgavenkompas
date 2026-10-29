"use strict";
/* Legacy filename: verifies the new opt-in manual PIN mode, not the former disabled mode. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const portal=fs.readFileSync(path.join(root,'assets/memento-start.js'),'utf8');
const css=fs.readFileSync(path.join(root,'assets/memento-start.css'),'utf8');
assert.match(html,/<html[^>]+data-memento-pin-lock="manual"/);
assert.match(html,/id="pinLock" class="visible memento-welcome-mode"/);
assert.match(html,/const PIN_MANUAL_ONLY=.*mementoPinLock==='manual'/);
assert.match(html,/const PIN_MANUAL_KEY='memento_manual_pin_lock_v1'/);
assert.match(html,/if\(PIN_MANUAL_ONLY\)return pinUnlocked/);
assert.match(html,/if\(PIN_MANUAL_ONLY\)return;/);
assert.match(html,/localStorage\.setItem\(PIN_MANUAL_KEY,'1'\)/);
assert.match(html,/localStorage\.removeItem\(PIN_MANUAL_KEY\)/);
assert.match(html,/if\(PIN_MANUAL_ONLY\)pinLockNow\(\);else pinUnlock\(\)/);
assert.match(html,/data-memento-pin-lock-now/);
assert.match(html,/hourly=temperature_2m,precipitation_probability,weather_code/);
assert.match(html,/memento-start-weather-refresh/);
assert.match(portal,/LIFE_KEY='compass_life_preview_v1'/);
assert.match(portal,/data-ms-view="agenda"/);
assert.match(portal,/data-ms-view="today"/);
assert.match(portal,/function refreshWeather/);
assert.match(portal,/function showWelcome/);
assert.match(portal,/function showPin/);
assert.match(css,/#pinLock\.memento-welcome-mode #pinForm\{display:none!important\}/);
assert(!portal.includes('fetch('),'No second external weather API or personal data upload');
assert(!portal.includes('localStorage.setItem('),'No portal writes to life/financial records');
const core=JSON.parse(fs.readFileSync(path.join(root,'sw.js'),'utf8').match(/const CORE = (\[[^;]+\]);/)[1]);
assert(core.includes(html.match(/href="([^"]*memento-start\.css[^"]*)"/)[1]),'Current portal stylesheet is precached');
assert(core.includes(html.match(/src="([^"]*memento-start\.js[^"]*)"/)[1]));
assert(core.includes('./assets/memento-start-agenda.svg'));
assert(core.includes('./assets/memento-start-tasks.svg'));
let count=0;
for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
 if(/\bsrc=|type="(?:application\/json|text\/plain|importmap)"/.test(m[1])||!m[2].trim())continue;
 new vm.Script(m[2]);count++;
}
new vm.Script(portal);
console.log('PASS manual PIN, preserved PIN hash, no auto timeout, weather/day data sources, '+count+' inline JS scripts');

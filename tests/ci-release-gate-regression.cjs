'use strict';
const assert = require('node:assert/strict');
const cp = require('node:child_process');
const {verifyJobs} = require('./ci-release-gate.cjs');
const {planFor} = require('./ci-plan.cjs');
let count = 0;
function jobs(plan) {
 return {plan: {result: 'success', outputs: {tier: plan.tier, groups: JSON.stringify(plan.groups), upgrade: String(plan.upgrade)}}, core: {result: plan.tier === 'none' ? 'skipped' : 'success'}, browser: {result: plan.groups.length ? 'success' : 'skipped'}, upgrade: {result: plan.upgrade ? 'success' : 'skipped'}};
}
for (const [name, plan] of [
 ['docs', planFor(['docs/TECHNISCHE_ROADMAP.md'])],
 ['CSS', planFor(['assets/memento-knowledge.css'])],
 ['medium', planFor(['assets/memento-calendar-ui.js'])],
 ['high', planFor(['assets/memento-life-app.js'])],
 ['workflow', planFor(['.github/workflows/app-review.yml'])],
 ['selected suite', planFor(['tests/taken-v4-browser.cjs'])],
 ['verified postmerge', planFor(['assets/memento-life-app.js'], () => null, false, true)],
 ['unverified postmerge', planFor(['assets/memento-life-app.js'])]
]) {
 const valid = jobs(plan); assert(verifyJobs(valid), name); count++;
 for (const job of ['plan', 'core', 'browser', 'upgrade']) {
  for (const bad of ['failure', 'cancelled', 'timed_out', 'missing', valid[job].result === 'success' ? 'skipped' : 'success']) {
   const changed = structuredClone(valid);
   if (bad === 'missing') delete changed[job]; else changed[job].result = bad;
   assert.throws(() => verifyJobs(changed), undefined, name + ': ' + job + '/' + bad); count++;
  }
 }
}
const docs = jobs(planFor(['docs/README.md']));
for (const outputs of [{}, {...docs.plan.outputs, tier: 'unknown'}, {...docs.plan.outputs, groups: ''}, {...docs.plan.outputs, groups: '{}'}, {...docs.plan.outputs, groups: '[null]'}, {...docs.plan.outputs, groups: '["x","x"]'}, {...docs.plan.outputs, upgrade: ''}, {...docs.plan.outputs, upgrade: 'true'}, {...docs.plan.outputs, groups: '["interface-smoke"]'}]) {
 assert.throws(() => verifyJobs({...docs, plan: {...docs.plan, outputs}})); count++;
}
for (const input of ['', '{', '{}']) {
 const result = cp.spawnSync(process.execPath, [require.resolve('./ci-release-gate.cjs')], {env: {...process.env, MEMENTO_GATE_RESULTS: input}, encoding: 'utf8'});
 assert.notEqual(result.status, 0); count++;
}
const fs = require('node:fs');
const workflow = fs.readFileSync(require('node:path').join(__dirname, '../.github/workflows/app-review.yml'), 'utf8');
const prTrigger = workflow.split('  pull_request:')[1].split('  push:')[0];
assert(!prTrigger.includes('paths:'), 'Every PR must report the required status, including docs-only');
assert(workflow.includes('name: Memento release gate'));
assert(workflow.includes('run: node tests/ci-release-gate.cjs'));
assert(workflow.includes('node tests/ci-release-gate-regression.cjs'));
for (const file of ['tests/ci-release-gate.cjs', 'tests/ci-release-gate-regression.cjs']) assert.equal(planFor([file]).tier, 'high');
console.log('PASS release gate: ' + count + ' coverage/failure/CLI cases and workflow trigger contract');

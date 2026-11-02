'use strict';
// Require the coverage selected by the planner; a skipped required job is not evidence.
function verifyJobs(jobs) {
 if (!jobs || jobs.plan?.result !== 'success') throw Error('Coverage plan did not succeed');
 const {tier, groups: encodedGroups, upgrade} = jobs.plan.outputs || {};
 if (!['none', 'low', 'medium', 'high'].includes(tier)) throw Error('Missing or invalid risk tier');
 if (!['true', 'false'].includes(upgrade)) throw Error('Missing or invalid upgrade selection');
 let groups;
 try { groups = JSON.parse(encodedGroups); } catch { throw Error('Missing or invalid browser selection'); }
 if (!Array.isArray(groups) || groups.some(group => typeof group !== 'string' || !group) || new Set(groups).size !== groups.length) throw Error('Invalid browser groups');
 if (tier === 'none' && (groups.length || upgrade !== 'false')) throw Error('Inconsistent documentation plan');
 const expected = {core: tier === 'none' ? 'skipped' : 'success', browser: groups.length ? 'success' : 'skipped', upgrade: upgrade === 'true' ? 'success' : 'skipped'};
 for (const [name, result] of Object.entries(expected)) {
  if (jobs[name]?.result !== result) throw Error(name + ' must be ' + result + ', received ' + (jobs[name]?.result || 'missing'));
 }
 return true;
}
if (require.main === module) {
 try { verifyJobs(JSON.parse(process.env.MEMENTO_GATE_RESULTS)); console.log('All selected Memento checks passed'); }
 catch (error) { console.error('Memento CI blocked: ' + error.message); process.exitCode = 1; }
}
module.exports = {verifyJobs};

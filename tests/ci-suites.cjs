"use strict";
// Shared by the planner and runner. Only registered current journeys may launch.
const FULL=["interface-layout","interface-feature","interface-acceptance","interface-visual","life-full","data-full"];
const suitesByGroup={
 "interface-layout":["layout-completion-browser","visual-layout-browser","patches-001-002-004-browser","day-swipe-browser"],
 // The legacy masterplan browser journey depends on removed V1 Notes navigation; its finance/day contracts remain in app-review and day-v3.
 "interface-feature":["memento-start-browser","calendar-header-browser","agenda-plan-browser","day-v3-browser"],
 "interface-acceptance":["release-acceptance-browser"],
 // Full-matrix Kenniscentrum journey belongs to life-full; narrow changes retain life-knowledge.
 "interface-visual":["glass-rendering-browser","illustrative-icons-browser","visual-browser"],
 // V1-only browser contracts (old folder always expanded, textarea #kc-body, V1 cover DOM) are not run against V2. The real V2 workspace journey replaces them; domain and safety/core suites remain.
 "life-full":["grocery-import-browser","followup-browser","taken-v4-browser","sortable-visibility-browser","global-search-browser","memento-category-browser","knowledge-workspace-browser","ai-hub-browser","journal-selfcare-browser","memento-assistant-browser","fitness-browser"],
 "data-full":["app-review-browser","storage-safety-browser","recovery-browser"],
 "interface-smoke":["visual-browser"],
 "interface-layout-smoke":["visual-layout-browser"],
 "interface-calendar":["calendar-header-browser"],
 "interface-day":["day-v3-browser"],
 "interface-start":["memento-start-browser"],
 "life-knowledge":["knowledge-workspace-browser"],
 "life-fitness":["quickfit-browser","fitness-browser"],
 "life-assistant":["memento-assistant-browser"],
 "data-finance":["app-review-browser"],
 "data-storage":["storage-safety-browser"]
};

// These historical browser entrypoints target retired Knowledge UI. Changes to
// them require current full coverage; never revive them as direct CI journeys.
const retiredSuites=new Set(["masterplan-browser","knowledge-v2-browser","knowledge-covers-browser","notes-direction-c-browser","journal-upgrade-browser"]);
function suitesForGroup(group){
 if(typeof group!=="string")throw Error("Unknown CI group: "+group);
 if(group.startsWith("test-")){
  const suite=group.slice(5);
  if(!Object.values(suitesByGroup).some(suites=>suites.includes(suite)))throw Error("Unknown direct browser suite: "+suite);
  return [suite];
 }
 if(!Object.hasOwn(suitesByGroup,group))throw Error("Unknown CI group: "+group);
 return [...suitesByGroup[group]];
}
module.exports={FULL,suitesByGroup,retiredSuites,suitesForGroup};

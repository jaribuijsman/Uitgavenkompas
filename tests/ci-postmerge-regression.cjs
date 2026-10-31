'use strict';
const assert=require('node:assert/strict');
const {verifyEvidence}=require('./ci-postmerge.cjs');
const a='a'.repeat(40),b='b'.repeat(40),c='c'.repeat(40),d='d'.repeat(40);
const pr={state:'closed',merged_at:'2026-10-31T15:10:25Z',merge_commit_sha:a,base:{ref:'main',sha:b},head:{sha:c}};
const run={head_sha:c,event:'pull_request',status:'completed',conclusion:'success',name:'Memento complete glass review',path:'jaribuijsman/Uitgavenkompas/.github/workflows/app-review.yml',updated_at:'2026-10-31T15:09:00Z'};
const squash={mergeSha:a,parents:[b],mergeTree:d,headTree:d,pr,runs:[run]};
const normal={...squash,parents:[b,c]};
assert(verifyEvidence(squash),'identical squash tree must use one smoke');
assert(verifyEvidence(normal),'identical two-parent PR tree must use one smoke');
const invalid=[
 {...squash,mergeTree:c}, {...squash,headTree:c},
 {...squash,parents:[]}, {...squash,parents:[b,c,d]}, {...squash,parents:[d]},
 {...normal,parents:[b,d]},
 {...squash,pr:{...pr,base:{ref:'main',sha:d}}},
 {...squash,pr:{...pr,base:{ref:'staging',sha:b}}},
 {...squash,pr:{...pr,head:{sha:d}}},
 {...squash,pr:{...pr,state:'open'}}, {...squash,pr:{...pr,merged_at:null}},
 {...squash,pr:{...pr,merge_commit_sha:d}},
 {...squash,runs:[]}, {...squash,runs:[{...run,conclusion:'failure'}]},
 {...squash,runs:[{...run,event:'push'}]},
 {...squash,runs:[{...run,name:'Other workflow'}]},
 {...squash,runs:[{...run,path:'other.yml'}]},
 {...squash,runs:[{...run,updated_at:'2026-10-31T15:15:00Z'}]},
 {...squash,runs:[{...run,head_sha:d}]},
 {...squash,runs:[{...run,updated_at:'bad timestamp'}]},
 {...squash,runs:[{...run,status:'in_progress'}]}
];
for(const candidate of invalid)assert.equal(verifyEvidence(candidate),false,'unproven PR/commit must run normal checks');
console.log('PASS '+(invalid.length+2)+' verified-postmerge evidence cases (squash + merge + negatives)');

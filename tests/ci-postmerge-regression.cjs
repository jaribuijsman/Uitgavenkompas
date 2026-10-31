'use strict';
const assert=require('node:assert/strict');
const {verifyEvidence}=require('./ci-postmerge.cjs');
const mergeSha='a'.repeat(40),secondParent='b'.repeat(40);
const pr={state:'closed',merged_at:'2026-10-31T15:10:25Z',merge_commit_sha:mergeSha,base:{ref:'main'},head:{sha:secondParent}};
const run={head_sha:secondParent,event:'pull_request',status:'completed',conclusion:'success',name:'Memento complete glass review',path:'jaribuijsman/Uitgavenkompas/.github/workflows/app-review.yml',updated_at:'2026-10-31T15:09:00Z'};
const input={mergeSha,secondParent,treeEqual:true,prs:[pr],runs:[run]};
assert(verifyEvidence(input),'verified merge must use one smoke');
const invalid=[
 {...input,treeEqual:false}, {...input,prs:[]}, {...input,runs:[]},
 {...input,prs:[{...pr,head:{sha:'c'.repeat(40)}}]},
 {...input,prs:[{...pr,merge_commit_sha:'c'.repeat(40)}]},
 {...input,prs:[{...pr,base:{ref:'staging'}}]},
 {...input,runs:[{...run,conclusion:'failure'}]},
 {...input,runs:[{...run,event:'push'}]},
 {...input,runs:[{...run,name:'Other workflow'}]},
 {...input,runs:[{...run,path:'different.yml'}]},
 {...input,runs:[{...run,updated_at:'2026-10-31T15:15:00Z'}]},
 {...input,runs:[{...run,head_sha:'c'.repeat(40)}]},
];
for(const candidate of invalid)assert.equal(verifyEvidence(candidate),false,'incomplete evidence must trigger full checks');
console.log('PASS 13 verified-postmerge evidence cases');

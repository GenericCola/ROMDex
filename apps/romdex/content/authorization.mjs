import {requireThat,isHash} from './contracts.mjs';
// In-process capability for an explicitly opened local document. It cannot be
// reconstructed from imported JSON and grants no YouTrack transport authority.
const localDocuments=new WeakMap();
export function localDocumentAuthority(workspace){const capability=Object.freeze({localDocument:true});localDocuments.set(capability,workspace);return capability;}
export const CONTENT_WORKSPACE='content:npcdex-1e267c45-75ae-48a9-b173-5ca3132bb121';
export function acceptedMigration(value){
 requireThat(value?.format==='ROMDexU20EMigrationAcceptance/1'&&value.approvedBy==='Human User'&&value.answer==='Approve Preview and Continue U20E','Explicit Human Migration Acceptance Is Required.');
 requireThat(value.instance==='https://thegobindsingh.youtrack.cloud'&&value.projectId==='0-2'&&value.ownerId==='2-2'&&value.revision===73&&value.recordCount===211&&value.u20fAuthorized===false,'The Accepted Migration Boundary Differs.');
 requireThat(isHash(value.sourceSHA256)&&isHash(value.sourceHead)&&typeof value.approvedAt==='string'&&Number.isFinite(Date.parse(value.approvedAt)),'The Accepted Source Pins Are Missing.');
 requireThat(value.regions?.['new-bark-town']==='Johto'&&value.regions?.['route-29']==='Johto'&&value.regions?.['cherrygrove-city']==='Johto','The Accepted Region Decisions Differ.');return value;
}
export function workspaceAllowed(workspace,authorization){if(authorization&&localDocuments.get(authorization)===workspace)return true;if(typeof workspace==='string'&&workspace.startsWith('fixture:'))return true;acceptedMigration(authorization);requireThat(workspace===CONTENT_WORKSPACE,'Unapproved Live Content Workspace.');return true;}

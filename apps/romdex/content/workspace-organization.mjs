import '../public/shared-ui/workspace-organization.js';
import {requireThat} from './contracts.mjs';
export function saveWorkspaceOrganization(previous,input,ids){
 const current=globalThis.romdexWorkspaceOrganization.reconcile(previous,ids);
 requireThat(input&&Object.keys(input).every(k=>['expectedRevision','organization'].includes(k))&&input.expectedRevision===current.revision,'Local Map Organization Changed. Refresh Before Moving Maps.');
 const value=structuredClone(input.organization);globalThis.romdexWorkspaceOrganization.validate(value,ids);requireThat(value.revision===current.revision,'Local Map Organization Revision Differs.');value.revision++;return value;
}

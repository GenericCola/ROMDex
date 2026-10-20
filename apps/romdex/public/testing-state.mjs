// Only the desktop service projects private, confirmed testing obligations here.
// Neither a native Done value nor an imported RDX testing claim is a decision.
export function testingItems(items,indicators={}){return items.map(item=>indicators[item.id]?.pending?{...item,needsHumanTesting:true}:item);}
export function guardTestingCompletion(id,patch,indicators={}){
 if(indicators[id]?.pending&&[patch?.state,patch?.assignedState].some(v=>['Done','Fixed','Complete'].includes(v)))throw Object.assign(Error('Human Testing Is Outstanding. Review the Accepted Result and Record the Tested Build Before Completing This Task.'),{code:'TESTING_REQUIRED'});
}

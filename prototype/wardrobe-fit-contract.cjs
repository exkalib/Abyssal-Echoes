// Geometric/occlusion assertions ONLY. Human image review remains independent.
const assert=require('node:assert/strict');
function assertWearableFitContacts(audit,item,nodes){
 const label=item.id+' '+item.sex;
 assert.ok(audit&&Array.isArray(audit.contacts),label+' needs contact audit data');
 const contacts=audit.contacts.filter(contact=>contact.item===item.id);
 assert.ok(contacts.length,label+' has measured contacts for the equipped item');
 const allowed=['grip','seam','socket','hover'];
 for(const contact of contacts){
  assert.ok(allowed.includes(contact.kind),label+' uses a defined contact kind');
  for(const key of ['anchor','actual'])assert.ok(Array.isArray(contact[key])&&contact[key].length===2&&contact[key].every(Number.isFinite),label+' '+key+' is a measured 2D point');
  const maximum=contact.kind==='grip'?.8:contact.kind==='seam'?1.5:2;
  assert.ok(Number.isFinite(contact.tolerance)&&contact.tolerance>0&&contact.tolerance<=maximum,label+' contact tolerance cannot hide a displaced item');
  // Points use portrait percentages, as do production fitting transforms.
  const error=Math.hypot(contact.actual[0]-contact.anchor[0],contact.actual[1]-contact.anchor[1]);
  assert.ok(error<=contact.tolerance+1e-6,label+' '+contact.kind+' error '+error.toFixed(3)+' exceeds '+contact.tolerance);
  if(contact.layerKey)assert.ok(nodes.some(node=>node.key===contact.layerKey),label+' audited contact belongs to a mounted layer');
 }
 if(['weapon','offhand'].includes(item.slot)){
  const grips=contacts.filter(contact=>contact.kind==='grip');assert.ok(grips.length,label+' requires a grip, not a sling or decorative placement');
  assert.ok(grips.every(contact=>contact.occluded===true),label+' requires an explicit hand/object occlusion relationship');
  const body=nodes.filter(node=>node.slot===item.slot),hands=nodes.filter(node=>node.slot==='grip');
  const occupied=grips.some(contact=>contact.occlusion==='authored-in-sprite');
  assert.ok(body.length&&(hands.length||occupied),label+' mounts the equipment and a real grip layer');
  const behindShield=grips.some(contact=>contact.occlusion==='behind-shield');
  if(occupied){
   assert.equal(item.slot,'weapon',label+' occupied-grip sample is a main weapon');
   assert.equal(body.length,1,label+' only one authored weapon/hand sprite');
   assert.equal(hands.length,0,label+' occupied grip cannot be covered by a separate fist');
   assert.equal(body[0].integratedGrip,true,label+' occupied grip must be a mounted integrated asset');
   assert.ok(grips.every(contact=>contact.layerKey===body[0].key&&contact.anatomy==='palm-handle-fingers'),label+' physical contact belongs to the same authored layer');
  }else if(grips.some(contact=>contact.occlusion==='occupied-hilt')){
   assert.equal(item.slot,'weapon',label+' occupied hilt belongs to a main weapon');
   assert.equal(hands.length,1,label+' uses one occupied grip, not a second empty fist');
   assert.equal(hands[0].occupiedHilt,true,label+' requires an authored palm-handle-fingers sprite');
   assert.ok(grips.every(contact=>contact.anatomy==='palm-handle-fingers'),label+' records actual occupied-hilt anatomy');
   assert.ok(Number(hands[0].zIndex)>Math.max(...body.map(node=>Number(node.zIndex))),label+' occupied grip must render in front of the held object');
  }else if(behindShield){
   assert.equal(item.slot,'offhand',label+' cannot hide weapon grip errors behind a shield rule');
   assert.ok(hands.some(hand=>Number.isFinite(Number(hand.zIndex))&&Number(hand.zIndex)>1&&Number(hand.zIndex)<Math.min(...body.map(node=>Number(node.zIndex)))),label+' shield hand must be in front of the body but behind the shield face');
  }else assert.ok(hands.some(hand=>Number.isFinite(Number(hand.zIndex))&&Number(hand.zIndex)>Math.max(...body.map(node=>Number(node.zIndex)))),label+' fingers must render in front of the held object');
 }else if(item.slot==='module')assert.ok(contacts.some(contact=>['socket','hover'].includes(contact.kind)),label+' uses a slot or an explicit hover mount');
 else assert.ok(contacts.some(contact=>['seam','socket'].includes(contact.kind)),label+' uses body seams or a mounting socket');
 return {contactCount:contacts.length,geometry:'passed',visualFit:'pending-human-review'};
}
module.exports={assertWearableFitContacts};

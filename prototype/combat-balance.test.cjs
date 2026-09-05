const assert=require('node:assert/strict');
const {simulation,configure,runFight,runMatrix,STAGES,ROLES}=require('./combat-balance.cjs');
const sim=simulation(),rows=runMatrix(64);
assert.equal(rows.length,Object.keys(sim.a.ENEMIES).length*ROLES.length,'every enemy must be exercised by all three routes');
for(const row of rows){
  const label=row.role+' / '+row.enemy;
  assert.equal(row.stalled,0,label+' must never deadlock on resources or regeneration');
  assert.ok(row.wins>=row.seeds*(row.boss?.9:1),label+' prepared survival budget');
  assert.ok(row.maxTurns<=(row.boss?36:12),label+' interaction length must stay bounded');
  assert.ok(row.turns>=(row.boss?3:1),label+' must preserve at least a basic encounter');
  assert.ok(row.maxAmmo<=40&&row.maxCells<=48,label+' ammunition must fit four standard batches');
  for(const key of ['turns','minHpPct','damageTaken','shieldAbsorbed','healing','stamina','ammo','cells','medkits','potions'])assert.ok(Number.isFinite(row[key])&&row[key]>=0,label+' finite nonnegative '+key);
}
for(const stage of STAGES){
  assert.equal(stage.bossLevel||stage.level,sim.a.COMBAT_ERAS[stage.era].bossLevel,'in-game preparation guidance must agree with the benchmark');
  for(const role of ROLES){const s=configure(sim.a,stage,role);assert.equal(sim.a.careerEquipmentStatus().ok,true);for(const id of Object.values(s.player.equip).filter(Boolean))assert.ok(sim.a.ITEMS[id],id+' exists');for(const id of stage.genes){const gene=sim.a.GENE_NODES.find(g=>g.id===id);assert.ok(!gene.gate?.playthrough,'first-cycle benchmark cannot borrow reincarnation genes');assert.ok(sim.a.geneGateChecks(gene).every(c=>c.ok),id+' must meet real level, kill, technology and story requirements');}}
}
for(const role of ROLES){
  const a=runFight(sim,STAGES[6],role,'gateCustodian',9001),b=runFight(sim,STAGES[6],role,'gateCustodian',9001);
  assert.deepEqual(a,b,'same seed and build must reproduce the actual fight');
  assert.ok(a.shieldAbsorbed+a.damageTaken>100,'late boss must still damage a completed build');
  assert.ok(Object.keys(a.actions).some(k=>['kineticReprisal','overloadVolley','riftExecution'].includes(k)),'late rotation must use the route finisher');
}
// A recovery item spends a combat turn and enemy reply, not a free inventory use.
const early=runFight(sim,{...STAGES[0],bossLevel:5},'infiltrator','riftMatriarch',9001);
assert.ok(early.medkits>0);assert.equal(early.turns,Object.values(early.actions).reduce((sum,n)=>sum+n,0));
assert.ok(early.damageTaken>early.hpLost,'healing must not erase received damage in the ledger');
console.log('Combat balance: '+rows.length+' enemy/route pairs × 64 seeds, real turns, damage and supplies passed.');

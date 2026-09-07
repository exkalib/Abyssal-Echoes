const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {profiles,markupForWeapon}=require('./wardrobe-weapon-effects.js');
const {WEARABLE_GRIPS}=require('./wardrobe-grips.js');
const {WEAPON_POSE_IDS}=require('./wardrobe-weapon-poses.js');
const project=([x,y])=>[x*100,(25+y*100)/1.5];
const early=['crowbar','knife','blade','blade_general_1','blade_general_2','pistol','rifle','firearm_general_1','firearm_general_2','sever'];
assert.equal(Object.keys(profiles).length,14);
assert.equal(new Set([...early,...Object.keys(profiles)]).size,Object.values(WEAPON_POSE_IDS).flat().length,'all weapons have an explicit powered or unpowered decision');
for(const id of early){assert.equal(profiles[id],undefined);assert.equal(markupForWeapon(id,project),'','ordinary weapons do not grow magic particles');}
for(const [id,p]of Object.entries(profiles)){
 assert.ok(WEARABLE_GRIPS[id]);assert.ok(/^#[0-9a-f]{6}$/i.test(p.color));assert.ok(p.level>=1&&p.level<=3);
 assert.ok(p.particles>0&&p.particles<=8,'bounded mobile particle count');
 for(const point of p.traces.flatMap(t=>t.points).concat(p.cores.map(c=>c.slice(0,2))))assert.ok(point.length===2&&point.every(n=>n>=0&&n<=1),'lights stay in native source coordinates');
 const svg=markupForWeapon(id,project);assert.equal(svg,markupForWeapon(id,project),'state refresh is deterministic');
 assert.equal((svg.match(/class="weapon-fx-particle"/g)||[]).length,p.particles);
 assert.ok(!svg.includes('NaN')&&!svg.includes('Infinity'));
}
const source=fs.readFileSync(path.join(__dirname,'wardrobe-weapon-effects.js'),'utf8'),css=fs.readFileSync(path.join(__dirname,'ui-system.css'),'utf8');
const game=fs.readFileSync(path.join(__dirname,'game.js'),'utf8');
assert.match(game,/if\(id==='gravLance'\)return 'assets\/weapon-poses-v11\/weapon-gravLance.webp/,'inertia rifle thumbnail cannot remain an old staff');
assert.ok(!/setInterval\(|requestAnimationFrame\(|fetch\(/.test(source),'no idle JS work/network loop');
assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/wardrobe-fx-paused/);
assert.match(css,/\[data-fx-quality="off"\] \.wearable-weapon-fx\{display:none\}/);
assert.match(css,/\[data-fx-quality="low"\]/);
assert.match(source,/svg\.dataset\.fxItem!==spec\.item/,'same weapon keeps its animated nodes');
console.log('Weapon effects: 10 unpowered + 14 source-anchored powered weapons; bounded deterministic particles, motion/quality controls and no idle JS loop passed.');

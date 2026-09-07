// Uses the real game fixture. No player storage or copied combat implementation.
const assert=require('node:assert/strict');
module.exports=({a,reset,sandbox})=>{
  function fight(playerSpeed=100,enemySpeed=10,extra={}){
    const s=reset();s.tutorial.complete=true;s.meta.mult.attr=1e6;s.player.hp=1e8;s.player.stamina=100;
    s.masteries.speedMastery=playerSpeed-10;s.masteries.rangeMastery=20;
    sandbox.Math.random=()=>.99;
    a.startCombat('beast',{hp:1e9,maxHp:1e9,atk:1,def:1,distNow:1,spd:enemySpeed,range:1,...extra});
    assert.equal(a.baseSpd(),playerSpeed);return s;
  }
  for(const [p,e] of [[10,10],[100,10],[25,10],[10,25],[10,100],[1000000,10]]){
    const s=fight(p,e),c=s.combat;
    assert.equal(c.enemyTurns||0,Math.max(0,Math.ceil(e/p-1-1e-9)),'速度决定首个行动者，同刻玩家优先');
    for(let n=1;n<=100;n++){
      a.catchBreath();
      assert.equal(c.enemyTurns||0,Math.max(0,Math.ceil((n+1)*e/p-1-1e-9)),`速度 ${p}:${e} 第 ${n} 次行动无随机连动、无整数比截断`);
    }
    assert.equal(c.playerTurns,100);
  }
  {
    const s=fight(),c=s.combat;assert.match(a.combatTempoText(c),/10 次/);
    a.playerAttack();assert.equal(c.enemyTurns||0,0);assert.equal(c.playerTurns,1);
    a.combatItem('missing');assert.equal(c.playerTurns,1,'无效操作不推进时间');
    c.distNow=2;a.approach();assert.equal(c.playerTurns,2);assert.equal(c.enemyTurns||0,0);
    s.inv.ration=1;s.player.stamina=50;a.combatItem('ration');assert.equal(c.playerTurns,3);assert.equal(c.enemyTurns||0,0);
    c.empTurns=2;c.interruptTurns=1;
    for(let i=0;i<7;i++)a.catchBreath();
    assert.equal(c.enemyTurns,1);assert.equal(c.interruptTurns,0);assert.equal(c.empTurns,2,'玩家连动不提前扣瘫痪');
    for(let i=0;i<10;i++)a.catchBreath();
    assert.equal(c.enemyTurns,2);assert.equal(c.empTurns,1);
    const saved=JSON.parse(JSON.stringify(s));a.setState(saved);a.catchBreath();
    assert.equal(saved.combat.enemyTurns,2,'重载保留行动条的小数余量');
  }
  {
    const s=fight(),c=s.combat;s.player.hp=1;s.inv.medkit=1;
    a.combatItem('medkit');assert.equal(c.playerTurns,1);assert.equal(s.inv.medkit,0);assert.ok(s.player.hp>1);assert.equal(c.enemyTurns||0,0,'急救消耗行动，但不强制低速敌人插队');
  }
  {
    const s=fight(),c=s.combat;c.distNow=1000;const before=c.enemyActionProgress;a.playerAttack();
    assert.equal(c.enemyActionProgress,before,'超射程不推进回合');assert.equal(c.playerTurns,0);
    delete c.enemyActionProgress;a.catchBreath();assert.ok(Number.isFinite(c.enemyActionProgress),'旧战斗存档安全延续');
  }
  {
    const s=reset();s.tutorial.complete=true;s.player.hp=1;s.player.location='layer1';sandbox.Math.random=()=>.99;
    a.startCombat('beast',{spd:100,distNow:1,atk:100});
    assert.equal(s.combat,null);assert.equal(s.screen,'death','高速敌人首轮击杀后不再继续结算');
  }
  {
    const s=fight(100,10,{hp:1,maxHp:1});sandbox.Math.random=()=>0;a.playerAttack();
    assert.equal(s.combat,null,'击杀后不再追加敌人行动');
  }
  {
    const s=reset();s.inv.masteryManual=1000;
    assert.ok(a.useMasteryManual('rangeMastery',1000));assert.equal(s.masteries.rangeMastery,1000);assert.equal(s.inv.masteryManual,0);
    assert.equal(a.atkRange(),1001,'徒手也可以无限成长');
    for(const id of ['knife','pistol']){s.player.equip.weapon=id;assert.equal(a.atkRange(),a.ITEMS[id].range+1000);}
    for(const skill of Object.values(a.SKILLS).filter(x=>x.type==='active')){
      const improved=a.skillRange(skill);s.masteries.rangeMastery=0;const base=a.skillRange(skill);s.masteries.rangeMastery=1000;
      assert.equal(improved,base===Infinity?Infinity:base+1000,'包括固定距离、近战和盾击技能，且不重复叠加');
    }
    const ordinary=reset();assert.equal(a.atkRange(),1,'未学习精通不改变基础距离');
    ordinary.meta.techs.echo_7=1;assert.equal(a.atkRange(),2,'原科技加成仍生效');
  }
  reset();console.log('Combat tempo: initiative, 1:1 / 10:1 / fractional / slower / extreme ratios, control timing, saves, death and uncapped universal range passed.');
};

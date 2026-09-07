/* Localized, bounded equipment energy. No game state or portrait-layer mutation. */
(function(root,factory){
  const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
  else Object.assign(root,api);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const WARDROBE_FX_STAGE={};
  // Explicit five-stage equipment routes; legacy IDs retain their real stage.
  const routes={
    body:['vest','power','nanoSuit','starShell','exoShell'],
    legs:['fieldGreaves','legs_specialist_2','legs_specialist_3','phaseGreaves','legs_specialist_5'],
    feet:['boots','magboots','gravityBoots','feet_specialist_4','feet_specialist_5'],
    back:['back_specialist_1','capacitorPack','gravRig','back_specialist_4','back_specialist_5'],
    module:['module_specialist_1','module_specialist_2','module_specialist_3','module_specialist_4','module_specialist_5'],
    head:['helmet','scope','quantumVisor','head_specialist_4','head_specialist_5'],
    implant:['implant_specialist_1','lsChip','implant_specialist_3','neuralMesh','implant_specialist_5'],
    shield:['riotShield','eshieldUnit','shield_specialist_3','phaseShield','citadelShield']
  };
  for(const [family,ids]of Object.entries(routes))ids.forEach((id,i)=>{
    const slot=family==='shield'?'offhand':family;
    WARDROBE_FX_STAGE[id]={slot,stage:i+1};WARDROBE_FX_STAGE[family+'_general_'+(i+1)]={slot,stage:i+1};
  });
  for(const [id,slot,stage]of [['warden','body',2],['miningHarness','legs',1],['neuralFilter','implant',2],['critCore','module',2],['dodgeMod','module',2],['penMod','module',2],['echoMemory','module',4],['timeLagModule','module',4],['starterAssaultModule','module',0],['starterSurveyModule','module',0]])WARDROBE_FX_STAGE[id]={slot,stage};
  Object.freeze(WARDROBE_FX_STAGE);
  const WARDROBE_FX_BUDGET={high:40,low:16,off:0};

  // Same object-fit:contain and physical-pixel transform as the mounted rig.
  // A normalized source point is not a screen coordinate, even after rotation.
  function wardrobeFxPoint(spec,point){
    if(!spec?.art||!point)return null;
    const ratio=spec.art.width/spec.art.height,w=Math.min(1,1.5*ratio),h=Math.min(1,1/(1.5*ratio));
    const p=[((1-w)/2+point[0]*w)*100,((1-h)/2+point[1]*h)*100];
    if(spec.matrix){const[a,b,c,d]=spec.matrix;return [spec.x+a*p[0]+c*p[1]*1.5,spec.y+b*p[0]/1.5+d*p[1]];}
    const o=spec.pivotPoint||[50,spec.origin==='50% 100%'?100:0],r=(spec.rotation||0)*Math.PI/180;
    const x=(p[0]-o[0])*spec.sx,y=(p[1]-o[1])*spec.sy*1.5;
    return [o[0]+spec.x+x*Math.cos(r)-y*Math.sin(r),o[1]+spec.y+(x*Math.sin(r)+y*Math.cos(r))/1.5];
  }
  function local(spec,x,y){const b=spec.art.bounds||[0,0,1,1];return [b[0]+b[2]*x,b[1]+b[3]*y];}
  function pointSpec(spec,point,kind,stage,index=0){
    const back=kind==='wing'||kind==='back-vent',p=wardrobeFxPoint(spec,point);
    // Raised outer wing rails can be above the collar while still behind the
    // body; the face exclusion applies to the central face, not all that Y row.
    if(!p||p.some(n=>!Number.isFinite(n))||p[0]<0||p[0]>100||p[1]<(kind==='sensor'?2:back?8:19)||p[1]>(kind==='thrust'?99:98)||(back&&p[1]<19&&p[0]>40&&p[0]<60))return null;
    return {key:kind+'-'+index,item:spec.item,slot:spec.slot,specKey:spec.key,sourcePoint:point,point:p,kind,stage,z:kind==='wing'||kind==='back-vent'?0:({body:7,legs:5,feet:6,module:29,head:27,implant:29,offhand:25}[spec.slot]),tone:spec.art.fxTone||(/echoMemory|timeLagModule/.test(spec.item)?'anomaly':'energy')};
  }
  function wardrobeEffectsPlan({equipment={},specs=[],quality='high'}={}){
    if(quality==='off')return [];
    const effects=[];
    // Weapons and hands/cuffs/grips have dedicated source-anchored renderers
    // at the same successful-update hook. Never duplicate their emitters here.
    for(const slot of ['body','legs','feet','module','back','head','implant','offhand']){
      const id=equipment[slot],tier=WARDROBE_FX_STAGE[id];if(!tier||tier.slot!==slot||tier.stage<3)continue;
      const stage=tier.stage,parts=specs.filter(s=>s.item===id&&s.slot===slot&&s.art&&!s.key.endsWith('-rear'));
      const spec=parts.find(s=>slot==='legs'?s.key==='legs-trousers-2':true);if(!spec)continue;
      const anchors=spec.fxAnchors||spec.art.fxAnchors||{};
      const push=(s,p,kind,i)=>{const effect=pointSpec(s,p,kind,stage,i);if(effect)effects.push({...effect,item:id,slot});};
      if(slot==='body')push(spec,anchors.core||local(spec,.5,.36),'core',0);
      if(slot==='legs'){
        const knees=anchors.knees||spec.art.knees?.map(([x,y])=>[x/spec.art.width,y/spec.art.height]);
        (knees||[]).forEach((p,i)=>push(spec,p,'leg',i));
      }
      if(slot==='feet')parts.forEach((foot,i)=>push(foot,foot.fxAnchors?.vents?.[0]||local(foot,foot.half==='right'?.78:.22,.82),'thrust',i));
      if(slot==='module')push(spec,anchors.orbit||local(spec,.5,.5),'orbit',0);
      if(slot==='head')push(spec,anchors.sensor||local(spec,.84,.37),'sensor',0);
      if(slot==='implant')push(spec,anchors.chip||local(spec,.5,.5),'chip',0);
      if(slot==='offhand')push(spec,anchors.core||local(spec,.5,.43),'shield',0);
      if(slot==='back'){
        // Stage 3 is a small pack vent. Stage 4/5 traces actual outer wing rails.
        if(stage===3){(anchors.vents||[local(spec,.12,.66),local(spec,.88,.66)]).forEach((p,i)=>push(spec,p,'back-vent',i));}
        else for(const [i,side]of ['Left','Right'].entries()){
          const sourceRail=anchors.wingRails?.[i];
          const root=sourceRail?.[0]||anchors['wing'+side]||local(spec,i?.72:.28,.54),tip=sourceRail?.at(-1)||anchors.wingTips?.[i]||local(spec,i?.98:.02,.18);
          const effect=pointSpec(spec,root,'wing',stage,i),end=wardrobeFxPoint(spec,tip);
          if(effect&&end&&end.every(Number.isFinite)&&end[0]>=0&&end[0]<=100){
            effect.end=end;effect.sourceEnd=tip;effect.sourceRail=sourceRail||[root,tip];
            effect.rail=effect.sourceRail.map(p=>wardrobeFxPoint(spec,p));effects.push(effect);
          }
        }
      }
    }
    const budget=WARDROBE_FX_BUDGET[quality]??WARDROBE_FX_BUDGET.high;
    const plan=effects.slice(0,budget).map(effect=>({...effect,count:1}));let remaining=budget-plan.length;
    for(let round=1;round<4&&remaining>0;round++)for(const effect of plan){
      if(remaining>0&&quality!=='low'&&effect.stage>3&&round<(effect.stage===5?4:3)){effect.count++;remaining--;}
    }
    return plan;
  }

  const records=new Map();let intersection,mutations,observedDocument;
  function removeNodes(record){for(const node of record.nodes.values())node.remove();record.nodes.clear();record.key='';}
  function clearWardrobeEffects(host){const record=records.get(host);if(!record)return;removeNodes(record);intersection?.unobserve(host);records.delete(host);}
  function visible(record){
    const host=record.host;return host.isConnected&&!host.ownerDocument.hidden&&record.inView&&host.getClientRects().length>0&&!host.closest('[hidden]')&&host.ownerDocument.defaultView.getComputedStyle(host).visibility!=='hidden';
  }
  function create(doc,tag,className){const node=doc.createElement(tag);node.className=className;return node;}
  function buildEffect(doc,effect,quality){
    const node=create(doc,'span','wardrobe-fx');node.dataset.wearFx=effect.item+':'+effect.key;node.dataset.fxKind=effect.kind;node.dataset.fxStage=effect.stage;node.dataset.fxQuality=quality;node.dataset.fxTone=effect.tone;
    node.setAttribute('aria-hidden','true');node.style.zIndex=effect.z;node.style.setProperty('--fx-x',effect.point[0]+'%');node.style.setProperty('--fx-y',effect.point[1]+'%');
    node.style.setProperty('--fx-duration',(effect.stage===5?2.8:effect.stage===4?3.6:5.2)+'s');
    if(effect.kind==='wing'){
      const ns='http://www.w3.org/2000/svg',svg=doc.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 100 150');
      // Both the trace and moving particles use the same measured source rail;
      // never draw a generic arc through the empty air between mechanical vanes.
      const d=effect.rail.map(([x,y],i)=>(i?'L ':'M ')+x+' '+y*1.5).join(' ');
      const path=doc.createElementNS(ns,'path');path.setAttribute('d',d);path.setAttribute('class','fx-wing-trace');svg.appendChild(path);
      for(let i=0;i<effect.count;i++){
        const dot=doc.createElementNS(ns,'circle');dot.setAttribute('class','fx-wing-particle');dot.setAttribute('cx',0);dot.setAttribute('cy',0);dot.setAttribute('r',effect.stage===5?'.38':'.28');
        dot.style.offsetPath='path("'+d+'")';dot.style.offsetRotate='0deg';dot.style.setProperty('--fx-delay',(-i*1.2)+'s');svg.appendChild(dot);
      }
      node.appendChild(svg);
    }else{
      const emitter=create(doc,'span','fx-emitter fx-'+effect.kind);emitter.appendChild(create(doc,'i','fx-source'));
      for(let i=0;i<effect.count;i++){const mote=create(doc,'i','fx-mote');mote.style.setProperty('--fx-delay',(-i*1.1)+'s');mote.style.setProperty('--fx-index',i);emitter.appendChild(mote);}
      node.appendChild(emitter);
    }
    return node;
  }
  function reconcile(record){
    if(!record.host.isConnected){clearWardrobeEffects(record.host);return;}
    const quality=record.options.quality||record.host.closest('[data-fx-quality]')?.dataset.fxQuality||'high';
    if(!visible(record)||quality==='off'){removeNodes(record);return;}
    const plan=wardrobeEffectsPlan({...record.options,quality}),key=JSON.stringify([quality,plan]);if(record.key===key)return;
    const keep=new Set();
    for(const effect of plan){const id=effect.item+':'+effect.key;keep.add(id);const old=record.nodes.get(id),signature=JSON.stringify([quality,effect]);
      if(old?._fxSignature===signature)continue;const node=buildEffect(record.host.ownerDocument,effect,quality);node._fxSignature=signature;old?.remove();record.nodes.set(id,node);record.host.appendChild(node);
    }
    for(const[id,node]of record.nodes)if(!keep.has(id)){node.remove();record.nodes.delete(id);}record.key=key;
  }
  function observe(doc){
    if(observedDocument)return;observedDocument=doc;const view=doc.defaultView;
    if(view.IntersectionObserver)intersection=new view.IntersectionObserver(entries=>{for(const entry of entries){const record=records.get(entry.target);if(record){record.inView=entry.isIntersecting;reconcile(record);}}},{threshold:0});
    // A single observer releases detached portraits and handles quality/hidden
    // ancestors. CSS owns time; there is no timer or animation frame loop.
    mutations=new view.MutationObserver(()=>{for(const record of records.values())reconcile(record);});
    mutations.observe(doc.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','style','class','data-fx-quality']});
    doc.addEventListener('visibilitychange',()=>{for(const record of records.values())reconcile(record);});
  }
  function syncWardrobeEffects(host,options={}){
    if(!host?.ownerDocument)return;observe(host.ownerDocument);let record=records.get(host);
    if(!record){record={host,options,nodes:new Map(),key:'',inView:true};records.set(host,record);intersection?.observe(host);}else record.options=options;
    reconcile(record);return record.nodes.size;
  }
  return {syncWardrobeEffects,clearWardrobeEffects,wardrobeEffectsPlan,wardrobeFxPoint,WARDROBE_FX_STAGE,WARDROBE_FX_BUDGET};
});

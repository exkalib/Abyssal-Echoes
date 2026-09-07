/* Source-anchored emissive parts, not an outline around the whole weapon.
 * Early scrap/iron/steel items deliberately have no powered idle effect.
 * CSS-only motion: no frame loop, timers, random re-emission or network work.
 */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.WEARABLE_WEAPON_EFFECTS=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const trace=(points,width=.005)=>({points,width});
  // Points are measured on the complete native source, before object-fit and
  // the hand-specific weapon matrix. Only existing luminous slots are lit.
  const profiles={
    eblade:{kind:'arc',color:'#39caff',level:2,
      traces:[trace([[.50,.28],[.50,.93]],.014)],cores:[[.50,.252,.018]],particles:5},
    plasmaSaber:{kind:'plasma',color:'#ff922b',level:3,
      traces:[trace([[.498,.325],[.502,.44],[.511,.56],[.534,.69],[.571,.815],[.630,.932]],.011)],cores:[[.466,.282,.009]],particles:7},
    phaseBlade:{kind:'phase',color:'#b97aff',level:3,
      traces:[trace([[.464,.44],[.455,.60],[.490,.70],[.510,.81],[.496,.93]],.007)],cores:[[.500,.352,.013]],particles:7},
    voidBlade:{kind:'void',color:'#48e9f5',level:3,
      traces:[trace([[.487,.325],[.503,.395],[.517,.464],[.482,.551],[.499,.618],[.518,.688],[.500,.775],[.500,.852],[.516,.914],[.50,.966]],.007),trace([[.447,.275],[.50,.287],[.553,.275]],.008)],cores:[[.50,.275,.009]],particles:8},
    blade_general_3:{kind:'arc',color:'#40bfff',level:1,
      traces:[trace([[.506,.406],[.506,.506]],.007)],cores:[[.502,.278,.017]],particles:2},
    blade_general_4:{kind:'phase',color:'#bd80ff',level:2,
      traces:[trace([[.351,.365],[.488,.514],[.642,.688],[.837,.918]],.006)],cores:[[.283,.257,.014]],particles:5},
    blade_general_5:{kind:'reactor',color:'#51edff',level:3,
      traces:[trace([[.500,.329],[.500,.831]],.006)],cores:[[.500,.245,.018],[.500,.296,.005]],particles:6},
    firearm_general_3:{kind:'arc',color:'#38b9ff',level:1,
      traces:[trace([[.383,.315],[.383,.35]],.012),trace([[.383,.403],[.383,.441]],.012)],cores:[],particles:2},
    firearm_general_4:{kind:'phase',color:'#b26dff',level:2,
      traces:[trace([[.342,.35],[.342,.53]],.008),trace([[.342,.59],[.342,.735]],.008)],cores:[[.339,.368,.009]],particles:5},
    firearm_general_5:{kind:'reactor',color:'#4cecff',level:3,
      traces:[trace([[.352,.375],[.352,.635]],.012)],cores:[[.352,.353,.012]],particles:6},
    plasmaRifle:{kind:'arc',color:'#32c2ff',level:3,
      traces:[trace([[.491,.605],[.491,.618]],.016),trace([[.491,.661],[.491,.772]],.018),trace([[.491,.799],[.491,.818]],.014),trace([[.494,.876],[.494,.94]],.008)],cores:[[.493,.912,.011]],particles:7},
    swarmRifle:{kind:'bio',color:'#ff5144',level:3,
      traces:[trace([[.468,.444],[.478,.455],[.466,.468],[.479,.482],[.469,.496]],.004),trace([[.465,.913],[.465,.965]],.007)],cores:[[.478,.153,.009],[.516,.278,.008],[.464,.453,.009],[.485,.658,.009],[.474,.965,.010]],particles:6},
    vacuumCarbine:{kind:'vacuum',color:'#60edff',level:2,
      traces:[trace([[.513,.437],[.513,.461]],.012),trace([[.47,.682],[.47,.792]],.006),trace([[.498,.663],[.498,.797]],.006),trace([[.469,.836],[.469,.887]],.006),trace([[.497,.836],[.497,.887]],.008)],cores:[[.499,.854,.006]],particles:5},
    gravLance:{kind:'gravity',color:'#63f0fa',level:3,
      traces:[trace([[.436,.405],[.491,.405]],.009),trace([[.539,.405],[.630,.405]],.012),trace([[.676,.407],[.725,.407]],.012),trace([[.772,.415],[.796,.415]],.009)],cores:[],particles:8}
  };
  const round=n=>Number(n.toFixed(4));
  function markupForWeapon(id,project){
    const profile=profiles[id];if(!profile)return '';
    // SVG viewBox is the physical 100 × 150 portrait plane. That keeps light
    // circles circular through both landscape and portrait source fitting.
    const p=point=>{const [x,y]=project(point);return [round(x),round(y*1.5)]};
    const sourceWidth=Math.hypot(...p([1,0]).map((n,i)=>n-p([0,0])[i]));
    const width=t=>round(t.width*sourceWidth),data=t=>t.points.map((point,i)=>(i?'L':'M')+p(point).join(' ')).join(' ');
    const paths=(className,multiplier)=>profile.traces.map(t=>'<path class="'+className+'" d="'+data(t)+'" stroke-width="'+round(width(t)*multiplier)+'"/>').join('');
    const core=profile.cores.map(([x,y,r])=>{const point=p([x,y]);return '<circle cx="'+point[0]+'" cy="'+point[1]+'" r="'+round(r*sourceWidth)+'"/>'}).join('');
    const anchors=profile.traces.flatMap(t=>t.points).concat(profile.cores.map(c=>c.slice(0,2)));
    const particles=Array.from({length:profile.particles},(_,i)=>{
      const a=anchors[(i*3+1)%anchors.length],b=anchors[(i*3+2)%anchors.length],t=.18+(i%3)*.24;
      // Each speck begins on a lit part; interpolating only within a short
      // segment avoids emissions drifting out of an unrelated receiver.
      const source=Math.hypot(a[0]-b[0],a[1]-b[1])<.16?a.map((n,k)=>n+(b[k]-n)*t):a;
      const space=id.startsWith('firearm_')?2:1,at=p(source),dx=(i%2?1:-1)*(2.3+(i%3)*.9)*space,dy=(-3.6-(i%4)*1.1)*space;
      return '<circle class="weapon-fx-particle" cx="'+at[0]+'" cy="'+at[1]+'" r="'+round((.45+(i%3)*.08)*space)+'" style="--fx-dx:'+dx+'px;--fx-dy:'+dy+'px;--fx-delay:'+(-i*.59)+'s;--fx-life:'+(2.8+(i%3)*.45)+'s"/>';
    }).join('');
    let arc='';
    if(profile.kind==='arc')arc=profile.traces.map((t,index)=>{
      const first=p(t.points[0]),last=p(t.points.at(-1));
      const points=Array.from({length:7},(_,i)=>[round(first[0]+(last[0]-first[0])*i/6+(i&&i!==6?(i%2?.6:-.6):0)),round(first[1]+(last[1]-first[1])*i/6)]);
      return '<path class="weapon-fx-arc" d="'+points.map((point,i)=>(i?'L':'M')+point.join(' ')).join(' ')+'" style="animation-delay:'+(-index*.7)+'s"/>';
    }).join('');
    return '<g class="weapon-fx-halo">'+paths('',4.5)+core+'</g><g class="weapon-fx-emission">'+paths('weapon-fx-core',1)+core+'</g>'+paths('weapon-fx-flow',.48)+arc+'<g class="weapon-fx-sparks">'+particles+'</g>';
  }
  const boundDocuments=new WeakSet();
  function update(host,spec,layer,project){
    let svg=host.querySelector(':scope > .wearable-weapon-fx');
    const profile=spec&&profiles[spec.item];
    if(!profile||!layer){svg?.remove();return;}
    const doc=host.ownerDocument;
    if(!boundDocuments.has(doc)){
      boundDocuments.add(doc);
      const visibility=()=>doc.documentElement.classList.toggle('wardrobe-fx-paused',doc.hidden);
      doc.addEventListener('visibilitychange',visibility);visibility();
    }
    if(!svg){svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('wearable-weapon-fx');svg.setAttribute('viewBox','0 0 100 150');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');host.appendChild(svg);}
    // Inventory quantity/state refreshes keep the same nodes and animation
    // timeline. Only switching the actual weapon changes its effect artwork.
    if(svg.dataset.fxItem!==spec.item){svg.innerHTML=markupForWeapon(spec.item,project);svg.dataset.fxItem=spec.item;}
    svg.dataset.fxKind=profile.kind;svg.dataset.fxLevel=profile.level;
    svg.style.setProperty('--weapon-fx-color',profile.color);
    svg.style.transform=layer.style.transform;svg.style.transformOrigin=layer.style.transformOrigin;
    svg.style.zIndex=layer.style.zIndex;
    // Same-z order must remain after a newly mounted weapon; hands are z=22.
    if(layer.compareDocumentPosition(svg)&2)host.appendChild(svg);
  }
  return {profiles,markupForWeapon,update};
});

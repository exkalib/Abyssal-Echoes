/* The hand material owns its energy, in every pose and with mixed equipment.
 * Every source point is authored on the actual glove/cuff artwork. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.WEARABLE_HAND_EFFECTS=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const profiles={
    nanoWeaveGloves:{stage:3,color:'#46d7f5',kind:'field'},
    hands_general_3:{stage:3,color:'#40d8ed',kind:'field'},
    phaseGrip:{stage:4,color:'#5be3ff',kind:'phase'},
    hands_general_4:{stage:4,color:'#b998f8',kind:'phase'},
    hands_specialist_5:{stage:5,color:'#48dbff',kind:'reactor'},
    hands_general_5:{stage:5,color:'#65edff',kind:'crystal'}
  };
  function plan(specs){
    return specs.filter(s=>['hands','cuff','grip'].includes(s.slot)&&s.handFx?.length&&profiles[s.handItem||s.item])
      .map(spec=>({spec,item:spec.handItem||spec.item,profile:profiles[spec.handItem||spec.item]}));
  }
  function markup(effect,project){
    const {spec,profile}=effect;
    const p=point=>{const [x,y]=project(point);return [x,y*1.5];};
    return spec.handFx.map((point,i)=>{
      const [x,y]=p(point),radius=point[2]||.7;
      const diamond=`M ${x} ${y-radius} L ${x+radius*.7} ${y} L ${x} ${y+radius} L ${x-radius*.7} ${y} Z`;
      // At most two source-local particles per mounted part, not per finger.
      const particle=i<2&&profile.stage>3?`<circle class="hand-fx-particle" cx="${x}" cy="${y}" r=".38" style="--hand-dx:${i%2?1.7:-1.7}px;--hand-dy:-3px;animation-delay:${-i*1.9}s"/>`:'';
      return `<g class="hand-fx-emitter"><path class="hand-fx-halo" d="${diamond}"/><path class="hand-fx-core" d="${diamond}"/></g>${particle}`;
    }).join('');
  }
  const bound=new WeakSet();
  function update(host,specs,project){
    const doc=host.ownerDocument;
    if(!bound.has(doc)){bound.add(doc);const sync=()=>doc.documentElement.classList.toggle('wardrobe-fx-paused',doc.hidden);doc.addEventListener('visibilitychange',sync);sync();}
    const keep=new Set();
    for(const effect of plan(specs)){
      const {spec,item,profile}=effect,layer=host.querySelector('[data-wear-key="'+spec.key+'"]');if(!layer)continue;
      keep.add(spec.key);let svg=host.querySelector('[data-hand-fx="'+spec.key+'"]');
      if(!svg){svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('wearable-hand-fx');svg.dataset.handFx=spec.key;svg.setAttribute('viewBox','0 0 100 150');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');host.appendChild(svg);}
      const signature=JSON.stringify([item,spec.src,spec.handFx]);
      if(svg._handSignature!==signature){svg.innerHTML=markup(effect,point=>project(spec,point));svg._handSignature=signature;}
      svg.dataset.fxItem=item;svg.dataset.fxStage=profile.stage;svg.dataset.fxKind=profile.kind;
      svg.style.setProperty('--hand-fx-color',profile.color);svg.style.setProperty('--hand-fx-period',profile.stage===3?'5.2s':profile.stage===4?'4.2s':'3.6s');
      svg.style.transform=layer.style.transform;svg.style.transformOrigin=layer.style.transformOrigin;
      svg.style.zIndex=layer.style.zIndex;svg.style.clipPath=layer.style.clipPath;
      if(layer.compareDocumentPosition(svg)&2)host.appendChild(svg);
    }
    for(const node of host.querySelectorAll(':scope > .wearable-hand-fx'))if(!keep.has(node.dataset.handFx))node.remove();
  }
  return {profiles,plan,markup,update};
});

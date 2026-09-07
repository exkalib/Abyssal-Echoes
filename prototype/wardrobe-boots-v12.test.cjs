// Six admitted V12 boot pairs. Independent authored-source markers guard against
// a bounds-only swap, back rim pasted over trousers, or imaginary screen FX.
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {WEARABLE_FIT_V2:fit}=require('./wardrobe-fit.js');
const {wearableSpecification,wearableTransformPoint}=require('./wardrobe.js');
const {wardrobeEffectsPlan}=require('./wardrobe-fx.js');
const samples={"gravityBoots":{"rear":[[310,529],[703.9,529.91]],"ankles":[[310,614],[703.9,614.81]],"vents":[[399,836],[621,834]],"front":[[[198,550],[220,574],[258,594],[301,619],[340,644],[375,660],[397,638],[420,565]],[[594.64,565.87],[617.49,638.78],[639.34,660.75],[674.11,644.77],[712.84,619.8],[755.55,594.83],[793.3,574.86],[815.15,550.88]]],"oldBodyAnchor":{"male":[[36.1998016,84.64],[63.7998408,84.64]],"female":[[36.198931200000004,84.92],[63.7996248,84.92]]}},"feet_specialist_4":{"rear":[[509.93,135.82],[1017.47,135.82]],"ankles":[[504.04,177.92],[1023.38,177.92]],"vents":[[594,728],[933,727]],"front":[[[386.29,162.41],[406.9,175.7],[431.92,189.74],[464.3,197.12],[501.1,198.6],[538.63,194.91],[570.27,183.09],[597.5,161.67]],[[929.67,161.67],[956.97,183.09],[988.7,194.91],[1026.33,198.6],[1063.22,197.12],[1095.69,189.74],[1120.78,175.7],[1141.44,162.41]]],"oldBodyAnchor":{"male":[[36.1999808,84.32000000000001],[63.8010192,84.32000000000001]],"female":[[36.1997056,84.6],[63.800294400000006,84.6]]}},"feet_specialist_5":{"rear":[[482,64],[1050.24,64]],"ankles":[[476,88],[1056.27,88]],"vents":[[641,423],[891,425]],"front":[[[324,50],[371,76],[418,95],[464,106],[516,99],[563,78],[610,48]],[[921.48,48],[968.76,78],[1016.04,99],[1068.34,106],[1114.62,95],[1161.89,76],[1209.17,50]]],"oldBodyAnchor":{"male":[[36.200257,84.24],[63.799743,84.24]],"female":[[36.200968,84.52000000000001],[63.799032,84.52000000000001]]}},"feet_general_3":{"rear":[[325,124],[928.44,124.94]],"ankles":[[330,171],[923.43,171.9]],"vents":[[496,522],[758,523]],"front":[[[186,151],[216,178],[242,191],[281,198],[330,201],[365,194],[400,178],[434,151]],[[819.22,151.92],[853.29,178.89],[888.36,194.88],[923.43,201.87],[972.53,198.88],[1011.61,191.88],[1037.66,178.89],[1067.72,151.92]]],"oldBodyAnchor":{"male":[[36.200379,84.24],[63.7996519,84.24]],"female":[[36.1998844,84.52000000000001],[63.7991465,84.52000000000001]]}},"feet_general_4":{"rear":[[501,42],[1019.68,41.97]],"ankles":[[502,132],[1018.68,131.88]],"vents":[[655,928],[866,927]],"front":[[[350,72],[388,102],[427,133],[467,160],[504,173],[543,167],[590,150],[625,115],[655,74]],[[866.69,73.94],[896.49,114.9],[931.26,149.86],[977.95,166.85],[1016.7,172.84],[1053.45,159.85],[1093.19,132.88],[1131.93,101.91],[1169.68,71.94]]],"oldBodyAnchor":{"male":[[36.2008414,84.32000000000001],[63.8000598,84.32000000000001]],"female":[[36.199926,84.6],[63.800345,84.6]]}},"feet_general_5":{"rear":[[317,92],[934.83,92]],"ankles":[[311,135],[940.85,135]],"vents":[[493,871],[758,872]],"front":[[[181,110],[208,134],[250,146],[308,150],[365,174],[410,201],[446,184],[476,147]],[[775.21,147],[805.33,184],[841.47,201],[886.64,174],[943.87,150],[1002.09,146],[1044.26,134],[1071.36,110]]],"oldBodyAnchor":{"male":[[36.2004327,84.16],[63.79918,84.16]],"female":[[36.201175,84.44],[63.799516,84.44]]}}};
const near=(a,b,msg,epsilon=1e-7)=>assert.ok(Math.abs(a-b)<epsilon,msg+': '+a+' vs '+b);
function sourcePlane(art,[x,y]){const ratio=art.width/art.height,w=Math.min(1,1.5*ratio),h=Math.min(1,1/(1.5*ratio));return[((1-w)/2+x/art.width*w)*100,((1-h)/2+y/art.height*h)*100];}
function polygon(spec){return spec.clip.slice(8,-1).split(',').map(p=>p.trim().split(/\s+/).map(parseFloat));}
function inside(poly,[x,y]){let n=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const[a,b]=poly[i],[c,d]=poly[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)n=!n;}return n;}
(async()=>{
 const sharp=process.argv.includes('--pixels')?require(process.env.SHARP_MODULE||'sharp'):null;
 for(const[id,entry]of Object.entries(samples)){
  const original=fit[id];assert.equal(original.icon,'../wearables-v12/boots-'+id);let decoded;
  if(sharp)decoded=await sharp(path.join(__dirname,'assets/wearables-v12/boots-'+id+'.webp')).raw().toBuffer({resolveWithObject:true});
  for(const sex of ['male','female']){
   const specs=wearableSpecification(sex,{feet:id}),front=specs.filter(s=>s.slot==='feet'&&s.z===5),rear=specs.filter(s=>s.slot==='feet'&&s.z===0);
   assert.equal(front.length,2);assert.equal(rear.length,2);
   for(let side=0;side<2;side++){
    const s=front[side],p=s.art;
    assert.ok(s.src.endsWith('/wearables-v12/boots-'+id+'.webp'));assert.ok(fs.existsSync(path.join(__dirname,s.src)));
    assert.equal(rear[side].src,s.src);near(s.sx,s.sy,id+' preserves physical source proportions');
    const point=wearableTransformPoint(s,[entry.ankles[side][0]/p.width,entry.ankles[side][1]/p.height]);
    point.forEach((v,i)=>near(v,entry.oldBodyAnchor[sex][side][i],id+' true source ankle remains on original body'));
    assert.equal(inside(polygon(s),sourcePlane(p,entry.rear[side])),false,id+' black rear cuff must not be in front layer');
    const curves=entry.front[side],center=curves[Math.floor(curves.length/2)];
    assert.equal(inside(polygon(s),sourcePlane(p,[center[0],center[1]+4])),true,id+' authored front lip stays above trousers');
    const fx=wardrobeEffectsPlan({equipment:{feet:id},specs}).find(e=>e.specKey===s.key);
    assert.ok(fx,id+' each independently equipped boot has its own source emitter');
    assert.deepEqual(fx.sourcePoint,entry.vents[side].map((v,i)=>v/(i?p.height:p.width)));
    assert.equal(fx.tone,id==='feet_general_4'?'anomaly':'energy');
    if(decoded){
     const {data,info}=decoded;assert.deepEqual([info.width,info.height,info.channels],[p.width,p.height,4]);
     const alpha=([x,y])=>data[(Math.round(y)*p.width+Math.round(x))*4+3];
     for(const a of [entry.rear[side],entry.ankles[side],entry.vents[side]])assert.ok(alpha(a)>240,id+' marker must lie on actual boot');
     const [ex,ey]=entry.vents[side],offset=(ey*p.width+ex)*4,[red,green,blue]=data.slice(offset,offset+3);
     assert.ok(id==='feet_general_4'?blue>210&&red>145&&blue-green>25:green>180&&blue>200&&Math.min(green,blue)-red>50,id+' emitter must be on the authored lit cyan/violet vent, not generic black equipment');
     let lowest=-Infinity;for(let y=0;y<p.height;y++)for(let x=side?Math.ceil(p.width/2):0;x<(side?p.width:Math.floor(p.width/2));x++){
      const a=data[(y*p.width+x)*4+3];if(!x||!y||x===p.width-1||y===p.height-1)assert.equal(a,0,id+' full boot cannot touch canvas border');
      if(a<128)continue;lowest=Math.max(lowest,wearableTransformPoint(s,[x/p.width,y/p.height])[1]);
     }
     near(lowest,98.8,id+' real opaque boot sole remains on original floor',.001);
    }
   }
  }
 }
 console.log('V12 boots: six unique paired assets × two bodies; true source ankles, physical scale, rear/front lip separation, source emitters and anomaly tone'+(sharp?', actual RGBA border and sole checks':'')+' passed.');
})().catch(e=>{console.error(e);process.exitCode=1});

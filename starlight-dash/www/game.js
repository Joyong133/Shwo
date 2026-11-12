(()=>{var _a=[{id:"lumi",name:"\uB8E8\uBBF8",title:"\uBCC4\uBE5B \uBC30\uB2EC\uBD80",price:0,perk:"\uADE0\uD615 \uC7A1\uD78C \uAE30\uBCF8 \uB7EC\uB108"},{id:"koko",name:"\uCF54\uCF54",title:"\uC232\uC758 \uC5EC\uC6B0",price:1500,perk:"\uC790\uC11D \uBC94\uC704 +40%"},{id:"bolt",name:"\uBCFC\uD2B8",title:"\uC218\uB9AC \uB85C\uBD07",price:4e3,perk:"\uBCF4\uD638\uB9C9\uC744 \uB450\uB978 \uCC44 \uCD9C\uBC1C"},{id:"kage",name:"\uCE74\uAC8C",title:"\uADF8\uB9BC\uC790 \uB2CC\uC790",price:8e3,perk:"\uC810\uC218 \uBC30\uC728 +1"},{id:"nova",name:"\uB178\uBC14",title:"\uC6B0\uC8FC \uBE44\uD589\uC0AC",price:15e3,perk:"\uBD80\uC2A4\uD130 \uC9C0\uC18D \uC2DC\uAC04 +40%"},{id:"draco",name:"\uB4DC\uB77C\uCF54",title:"\uAF2C\uB9C8 \uC6A9",price:3e4,perk:"\uB9E4 \uD310 \uBB34\uB8CC \uBD80\uD65C 1\uD68C"}],fn={magnet:{name:"\uC790\uC11D",color:"#ff4f7b",icon:"magnet"},shield:{name:"\uBCF4\uD638\uB9C9",color:"#3fb8ff",icon:"shield"},boost:{name:"\uBD80\uC2A4\uD130",color:"#ff9a2e",icon:"bolt"},double:{name:"\uB354\uBE14 \uCF54\uC778",color:"#3ddc97",icon:"x2"}},os=[{id:"magnet",name:"\uC790\uC11D",icon:"magnet",color:"#ff4f7b",desc:"\uC8FC\uBCC0\uC758 \uBCC4 \uCF54\uC778\uC744 \uB04C\uC5B4\uB2F9\uAE41\uB2C8\uB2E4",base:8,per:2,unit:"\uCD08",costs:[300,700,1500,3e3,6e3]},{id:"shield",name:"\uBCF4\uD638\uB9C9",icon:"shield",color:"#3fb8ff",desc:"\uC7A5\uC560\uBB3C \uCDA9\uB3CC\uC744 \uD55C \uBC88 \uB9C9\uC544 \uC90D\uB2C8\uB2E4",base:10,per:3,unit:"\uCD08",costs:[300,700,1500,3e3,6e3]},{id:"boost",name:"\uBD80\uC2A4\uD130",icon:"bolt",color:"#ff9a2e",desc:"\uBB34\uC801 \uC0C1\uD0DC\uB85C \uBE60\uB974\uAC8C \uC9C8\uC8FC\uD569\uB2C8\uB2E4",base:4,per:1,unit:"\uCD08",costs:[400,900,1800,3600,7e3]},{id:"double",name:"\uB354\uBE14 \uCF54\uC778",icon:"x2",color:"#3ddc97",desc:"\uBCC4 \uCF54\uC778\uC744 \uB450 \uBC30\uB85C \uC5BB\uC2B5\uB2C8\uB2E4",base:10,per:3,unit:"\uCD08",costs:[300,700,1500,3e3,6e3]},{id:"mult",name:"\uC810\uC218 \uBC30\uC728",icon:"star",color:"#ffd23f",desc:"\uAE30\uBCF8 \uC810\uC218 \uBC30\uC728\uC774 \uC62C\uB77C\uAC11\uB2C8\uB2E4",base:1,per:1,unit:"\uBC30",costs:[1e3,2500,5e3,1e4,2e4]}],va=[{id:"revive",name:"\uBD80\uD65C\uC758 \uBCC4",icon:"heart",color:"#ff5d73",desc:"\uC4F0\uB7EC\uC9C4 \uC790\uB9AC\uC5D0\uC11C \uB2E4\uC2DC \uC77C\uC5B4\uB098 \uB2EC\uB9BD\uB2C8\uB2E4",price:800},{id:"headstart",name:"\uC2A4\uD0C0\uD2B8 \uB300\uC2DC",icon:"rocket",color:"#b388ff",desc:"\uCD9C\uBC1C\uD558\uC790\uB9C8\uC790 600m\uB97C \uB2E8\uC228\uC5D0 \uC9C8\uC8FC\uD569\uB2C8\uB2E4",price:500}];function cs(i,t){return i.base+i.per*t}var ya=[{id:"coins_run",scope:"run",stat:"coins",text:i=>`\uD55C \uD310\uC5D0 \uBCC4 \uCF54\uC778 ${i}\uAC1C \uBAA8\uC73C\uAE30`,base:60,step:40,reward:300},{id:"dist_run",scope:"run",stat:"dist",text:i=>`\uD55C \uD310\uC5D0 ${i}m \uB2EC\uB9AC\uAE30`,base:600,step:400,reward:300},{id:"score_run",scope:"run",stat:"score",text:i=>`\uD55C \uD310\uC5D0 ${i.toLocaleString()}\uC810 \uC5BB\uAE30`,base:2e3,step:2e3,reward:350},{id:"biomes_run",scope:"run",stat:"biomes",text:i=>`\uD55C \uD310\uC5D0 \uC9C0\uD615 ${i}\uACF3 \uC9C0\uB098\uAE30`,base:2,step:1,max:6,reward:400},{id:"dist_total",scope:"total",stat:"dist",text:i=>`\uB204\uC801 ${i.toLocaleString()}m \uB2EC\uB9AC\uAE30`,base:2e3,step:1500,reward:400},{id:"coins_total",scope:"total",stat:"coins",text:i=>`\uBCC4 \uCF54\uC778 \uB204\uC801 ${i}\uAC1C \uBAA8\uC73C\uAE30`,base:250,step:150,reward:350},{id:"jumps",scope:"total",stat:"jumps",text:i=>`\uC810\uD504 ${i}\uBC88 \uD558\uAE30`,base:30,step:20,reward:250},{id:"slides",scope:"total",stat:"slides",text:i=>`\uC2AC\uB77C\uC774\uB4DC ${i}\uBC88 \uD558\uAE30`,base:20,step:15,reward:250},{id:"powerups",scope:"total",stat:"powerups",text:i=>`\uD30C\uC6CC\uC5C5 ${i}\uAC1C \uD68D\uB4DD\uD558\uAE30`,base:4,step:3,reward:300},{id:"turns",scope:"total",stat:"turns",text:i=>`\uCF54\uB108 ${i}\uBC88 \uB3CC\uAE30`,base:12,step:8,reward:250}];function Fs(i){return ya.find(t=>t.id===i)}function Ma(i,t){let e=i.base+i.step*t;return i.max?Math.min(i.max,e):e}function ba(i,t){return Math.round(i.reward*(1+.4*t)/10)*10}var Ac="starlight-dash-save-v1";function Bs(){return{v:1,coins:0,best:0,bestDist:0,totalDist:0,runs:0,char:"lumi",owned:{lumi:!0},up:{magnet:0,shield:0,boost:0,double:0,mult:0},items:{revive:0,headstart:0},settings:{sfx:!0,music:!0,vibrate:!0,cheat:!1},missions:[],tiers:{},hints:{jump:0,slide:0,lane:0,turn:0}}}function Rc(){return typeof window!="undefined"&&window.AndroidBridge?window.AndroidBridge:null}var ks=class{constructor(){this.data=Bs(),this.load()}load(){let t=null;try{let e=Rc();e&&e.load&&(t=e.load())}catch(e){}if(!t)try{t=localStorage.getItem(Ac)}catch(e){}if(t)try{let e=JSON.parse(t),n=Bs();this.data={...n,...e,owned:{...n.owned,...e.owned||{}},up:{...n.up,...e.up||{}},items:{...n.items,...e.items||{}},settings:{...n.settings,...e.settings||{}},tiers:{...e.tiers||{}},hints:{...n.hints,...e.hints||{}},missions:Array.isArray(e.missions)?e.missions.filter(s=>s&&Fs(s.id)):[]}}catch(e){this.data=Bs()}this.fillMissions()}commit(){let t=JSON.stringify(this.data);try{let e=Rc();e&&e.save&&e.save(t)}catch(e){}try{localStorage.setItem(Ac,t)}catch(e){}}reset(){let t=this.data.settings;this.data=Bs(),this.data.settings={...t,cheat:!1},this.fillMissions(),this.commit()}fillMissions(){let t=this.data,e=0;for(;t.missions.length<3&&e++<50;){let n=ya.filter(r=>!t.missions.some(a=>a.id===r.id));if(!n.length)break;let s=n[Math.floor(Math.random()*n.length)];t.missions.push({id:s.id,progress:0})}}missionView(){return this.data.missions.map(t=>{let e=Fs(t.id),n=this.data.tiers[t.id]||0,s=Ma(e,n);return{id:t.id,text:e.text(s),target:s,progress:Math.min(s,Math.floor(t.progress)),reward:ba(e,n),scope:e.scope}})}applyRun(t){let e=this.data,n=[];for(let s of e.missions.slice()){let r=Fs(s.id),a=e.tiers[s.id]||0,o=Ma(r,a),c=t[r.stat]||0;if(r.scope==="run"?s.progress=Math.max(s.progress,c):s.progress+=c,s.progress>=o){let l=ba(r,a);n.push({text:r.text(o),reward:l}),e.coins+=l,e.tiers[s.id]=a+1,e.missions.splice(e.missions.indexOf(s),1)}else r.scope==="run"&&(s.progress=Math.max(s.progress,c))}return this.fillMissions(),n}};var pn=i=>440*Math.pow(2,(i-69)/12),zs=class{constructor(){this.ctx=null,this.sfxOn=!0,this.musicOn=!0,this.musicMode="off",this.step=0,this.nextTime=0,this.timer=null,this.coinStreak=0,this.lastCoin=0}unlock(){if(!this.ctx){let t=window.AudioContext||window.webkitAudioContext;if(!t)return;this.ctx=new t,this.master=this.ctx.createGain(),this.master.gain.value=.9,this.master.connect(this.ctx.destination),this.sfxBus=this.ctx.createGain(),this.sfxBus.gain.value=.55,this.sfxBus.connect(this.master),this.musicBus=this.ctx.createGain(),this.musicBus.gain.value=0;let e=this.ctx.createBiquadFilter();e.type="lowpass",e.frequency.value=2600,this.musicBus.connect(e),e.connect(this.master);let n=this.ctx.sampleRate;this.noiseBuf=this.ctx.createBuffer(1,n,this.ctx.sampleRate);let s=this.noiseBuf.getChannelData(0);for(let r=0;r<n;r++)s[r]=Math.random()*2-1;this.timer=setInterval(()=>this.schedule(),60)}this.ctx.state==="suspended"&&this.ctx.resume()}suspend(){this.ctx&&this.ctx.state==="running"&&this.ctx.suspend()}resume(){this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume()}tone(t,e,n,{type:s="sine",vol:r=.3,to:a=0,at:o=0,attack:c=.005}={}){let l=this.ctx;if(!l)return;let h=l.currentTime+o,u=l.createOscillator(),d=l.createGain();u.type=s,u.frequency.setValueAtTime(e,h),a&&u.frequency.exponentialRampToValueAtTime(a,h+n),d.gain.setValueAtTime(1e-4,h),d.gain.linearRampToValueAtTime(r,h+c),d.gain.exponentialRampToValueAtTime(1e-4,h+n),u.connect(d),d.connect(t),u.start(h),u.stop(h+n+.02)}noise(t,e,{vol:n=.3,freq:s=1200,to:r=0,q:a=1,type:o="bandpass",at:c=0}={}){let l=this.ctx;if(!l)return;let h=l.currentTime+c,u=l.createBufferSource();u.buffer=this.noiseBuf,u.loop=!0;let d=l.createBiquadFilter();d.type=o,d.Q.value=a,d.frequency.setValueAtTime(s,h),r&&d.frequency.exponentialRampToValueAtTime(r,h+e);let p=l.createGain();p.gain.setValueAtTime(n,h),p.gain.exponentialRampToValueAtTime(1e-4,h+e),u.connect(d),d.connect(p),p.connect(t),u.start(h),u.stop(h+e+.02)}sfx(t){if(!this.ctx||!this.sfxOn)return;let e=this.sfxBus;switch(t){case"coin":{let n=this.ctx.currentTime;this.coinStreak=n-this.lastCoin<.5?Math.min(this.coinStreak+1,9):0,this.lastCoin=n;let s=pn(84+[0,2,4,7,9,12,14,16,19,21][this.coinStreak]);this.tone(e,s,.09,{type:"triangle",vol:.22}),this.tone(e,s*1.5,.12,{type:"sine",vol:.16,at:.04});break}case"jump":this.tone(e,280,.2,{type:"sine",vol:.25,to:640});break;case"slide":this.noise(e,.28,{vol:.22,freq:2400,to:500,q:.8});break;case"lane":this.tone(e,520,.05,{type:"triangle",vol:.1,to:700});break;case"turn":this.noise(e,.25,{vol:.2,freq:500,to:2600,q:1.2});break;case"land":this.tone(e,120,.08,{type:"sine",vol:.2,to:60});break;case"crash":this.noise(e,.45,{vol:.5,freq:900,to:120,q:.6,type:"lowpass"}),this.tone(e,150,.4,{type:"sawtooth",vol:.3,to:40});break;case"fall":this.tone(e,620,.7,{type:"sine",vol:.3,to:70});break;case"smash":this.noise(e,.2,{vol:.35,freq:1500,to:300,q:.7}),this.tone(e,200,.12,{type:"square",vol:.12,to:90});break;case"power":[72,76,79,84].forEach((n,s)=>this.tone(e,pn(n),.16,{type:"triangle",vol:.22,at:s*.06}));break;case"shieldbreak":this.tone(e,1200,.3,{type:"triangle",vol:.25,to:300}),this.noise(e,.25,{vol:.2,freq:4e3,q:2});break;case"boost":this.noise(e,.7,{vol:.3,freq:300,to:3200,q:1.5}),this.tone(e,180,.6,{type:"sawtooth",vol:.15,to:720});break;case"click":this.tone(e,660,.06,{type:"triangle",vol:.16});break;case"buy":[79,84,88,91].forEach((n,s)=>this.tone(e,pn(n),.14,{type:"triangle",vol:.2,at:s*.05}));break;case"deny":this.tone(e,160,.18,{type:"square",vol:.14,to:110});break;case"revive":[60,67,72,79].forEach((n,s)=>this.tone(e,pn(n),.25,{type:"sine",vol:.25,at:s*.08}));break;case"record":[72,76,79,84,79,84,88].forEach((n,s)=>this.tone(e,pn(n),.2,{type:"triangle",vol:.22,at:s*.09}));break;case"mission":[76,79,84].forEach((n,s)=>this.tone(e,pn(n),.22,{type:"triangle",vol:.2,at:s*.1}));break;case"go":this.tone(e,880,.3,{type:"triangle",vol:.22});break;default:break}}setMusic(t){if(this.musicMode=t,!this.ctx)return;let e=!this.musicOn||t==="off"?0:t==="menu"?.2:.3;this.musicBus.gain.setTargetAtTime(e,this.ctx.currentTime,.25)}refresh(){this.setMusic(this.musicMode)}schedule(){let t=this.ctx;if(!t||t.state!=="running")return;if(!this.musicOn||this.musicMode==="off"){this.nextTime=0;return}let e=60/124/4;this.nextTime<t.currentTime&&(this.nextTime=t.currentTime+.05);let n=[{bass:41,notes:[65,69,72,77]},{bass:43,notes:[67,71,74,79]},{bass:45,notes:[69,72,76,81]},{bass:40,notes:[67,71,76,79]}],s=[0,1,2,1,3,2,1,2,0,1,2,3,2,1,2,1];for(;this.nextTime<t.currentTime+.22;){let r=this.step%64,a=n[(r>>4)%4],o=r%16,c=this.nextTime-t.currentTime,l=this.musicMode==="run";(l||o%2===0)&&this.tone(this.musicBus,pn(a.notes[s[o]]),e*1.7,{type:"triangle",vol:l?.16:.13,at:c}),(o%4===0||l&&o%4===2)&&this.tone(this.musicBus,pn(a.bass),e*2.2,{type:"sawtooth",vol:.16,at:c,attack:.01}),l&&(o%8===0&&this.tone(this.musicBus,120,.12,{type:"sine",vol:.5,to:45,at:c}),o%8===4&&this.noise(this.musicBus,.1,{vol:.22,freq:1800,q:.8,at:c}),o%2===0&&this.noise(this.musicBus,.03,{vol:.08,freq:7e3,q:1,type:"highpass",at:c})),r%32===28&&this.tone(this.musicBus,pn(a.notes[3]+12),e*3,{type:"sine",vol:.1,at:c}),this.nextTime+=e,this.step++}}};function Kn(i,t=!0){if(t)try{window.AndroidBridge&&window.AndroidBridge.vibrate?window.AndroidBridge.vibrate(i):navigator.vibrate&&navigator.vibrate(i)}catch(e){}}function hu(i,t,e,n){let s="";for(let r=0;r<10;r++){let a=-Math.PI/2+r*Math.PI/5,o=r%2?n:e;s+=(r?"L":"M")+(i+Math.cos(a)*o).toFixed(2)+" "+(t+Math.sin(a)*o).toFixed(2)}return s+"Z"}function uu(){let i="";for(let e=0;e<32;e++){let n=e/32*Math.PI*2-Math.PI/32,s=e%4<2?10:7.6;i+=(e?"L":"M")+(12+Math.cos(n)*s).toFixed(2)+" "+(12+Math.sin(n)*s).toFixed(2)}return i+"Z M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Z"}var Cc={star:hu(12,12.6,10.4,4.5),magnet:"M4 3h5v9a3 3 0 0 0 6 0V3h5v9a8 8 0 0 1-16 0zM4 3h5v3H4zM15 3h5v3h-5z",shield:"M12 2l8.5 3v6.2c0 5-3.5 9.2-8.5 10.8C7 20.4 3.5 16.2 3.5 11.2V5z",bolt:"M13.5 1.5L4 14h6.2L8.8 22.5 20 9.5h-6.6z",heart:"M12 21L3.3 11.6A5.3 5.3 0 0 1 12 6.2a5.3 5.3 0 0 1 8.7 5.4z",rocket:"M12 1.5c3.2 2.6 4.8 6.2 4.8 10.2l2.7 3.2v4.3l-4.2-2.1H8.7l-4.2 2.1v-4.3l2.7-3.2c0-4 1.6-7.6 4.8-10.2zM10 19h4l-2 3.5z",pause:"M6 4h4.5v16H6zM13.5 4H18v16h-4.5z",play:"M7 3.5l13.5 8.5L7 20.5z",gear:uu(),bag:"M5.5 8h13L20 21.5H4zM8.5 8V6.5a3.5 3.5 0 0 1 7 0V8h-2V6.5a1.5 1.5 0 0 0-3 0V8z",user:"M12 2.5a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4zM3 21.5c0-4.6 4-7.3 9-7.3s9 2.7 9 7.3z",flag:"M5 2h2.4v20H5zM8.5 3H20l-3.2 4.6L20 12.2H8.5z",lock:"M6.8 10V7.2a5.2 5.2 0 0 1 10.4 0V10H19v11.5H5V10zM9.3 10h5.4V7.2a2.7 2.7 0 0 0-5.4 0z",check:"M3.5 12.6l2.6-2.6 3.7 3.7 8.1-8.1 2.6 2.6L9.8 18.9z",close:"M4.6 6.7l2.1-2.1L12 9.9l5.3-5.3 2.1 2.1L14.1 12l5.3 5.3-2.1 2.1L12 14.1l-5.3 5.3-2.1-2.1L9.9 12z",home:"M12 2.5l10 8.8h-2.8v9.7h-5.4v-6.3h-3.6V21H4.8v-9.7H2z",retry:"M12 4.2V1l5.2 4.3L12 9.6V6.4a5.8 5.8 0 1 0 5.8 5.8h2.2A8 8 0 1 1 12 4.2z",sound:"M3 9h4.2L12.5 4.5v15L7.2 15H3zM15 8.2a5 5 0 0 1 0 7.6zM17.2 4.6a9.6 9.6 0 0 1 0 14.8l-1.3-1.6a7.4 7.4 0 0 0 0-11.6z",music:"M9 4.2l11-2.4v13.4a3.2 3.2 0 1 1-2.2-3V6.3L11.2 7.7v9.5a3.2 3.2 0 1 1-2.2-3z",vibrate:"M8 3.5h8v17H8zM4 8h2.2v8H4zM17.8 8H20v8h-2.2zM0.8 10h1.8v4H0.8zM21.4 10h1.8v4h-1.8z",arrow:"M2.5 12L12 2.5v5.7h9.5v7.6H12v5.7z",trophy:"M7 2.5h10V5h3.5v2.5c0 2.6-1.8 4.6-4.2 5a5 5 0 0 1-3 2.3V18h3.2v3.5h-9V18h3.2v-3.2a5 5 0 0 1-3-2.3c-2.4-.4-4.2-2.4-4.2-5V5H7zM5.6 7v.5c0 1.2.6 2.2 1.4 2.7V7zM17 7v3.2c.8-.5 1.4-1.5 1.4-2.7V7z",cheat:"M12 1.8l2.2 4.3 4.8-1 -1 4.8 4.3 2.1-4.3 2.2 1 4.8-4.8-1L12 22.2l-2.2-4.2-4.8 1 1-4.8L1.7 12 6 9.9l-1-4.8 4.8 1z"};function It(i,t=""){return i==="x2"?`<span class="ico ico-x2 ${t}">\xD72</span>`:`<svg class="ico ${t}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="${Cc[i]}"/></svg>`}function Pc(i,t,e,n,s,r){i.save(),i.fillStyle=r,t==="x2"?(i.font=`900 ${Math.round(s*.78)}px system-ui, sans-serif`,i.textAlign="center",i.textBaseline="middle",i.fillText("\xD72",e,n+s*.03)):(i.translate(e-s/2,n-s/2),i.scale(s/24,s/24),i.fill(new Path2D(Cc[t]),"evenodd")),i.restore()}var Me=i=>Math.floor(i).toLocaleString("en-US"),du={lumi:"#2f9bff",koko:"#f08a2c",bolt:"#4fc3c9",kage:"#5b6bd6",nova:"#dfe5ee",draco:"#4fbf6a"},fu=[["magnet","magnet",fn.magnet.color],["shield","shield",fn.shield.color],["boost","bolt",fn.boost.color],["double","x2",fn.double.color],["head","rocket","#b388ff"]],pu="1.0.1",Hs=class{constructor(t,e,n){this.root=t,this.save=e,this.sound=n,this.game=null,this.sheetName=null,this.tab="up",this.preview=null,this.modalKind=null,this.cache={},this.timers={},t.innerHTML=`
      <div id="hud" class="layer hidden">
        <div class="hud-top">
          <div class="hud-score"><b id="hScore">0</b><span><i id="hDist">0</i>m<em id="hMult"></em></span></div>
          <div class="hud-right">
            <div class="pill coin">${It("star")}<b id="hCoins">0</b></div>
            <button class="icon-btn" data-act="pause" aria-label="\uC77C\uC2DC\uC815\uC9C0">${It("pause")}</button>
          </div>
        </div>
        <div class="fx-list" id="hFx">
          ${fu.map(([s,r,a])=>`<div class="fx hidden" data-fx="${s}" style="--c:${a}">${It(r)}<span><i></i></span></div>`).join("")}
        </div>
        <div class="cheat-badge hidden" id="hCheat">${It("cheat")} \uCE58\uD2B8 \uBAA8\uB4DC</div>
        <button class="head-btn hidden" id="hHead" data-act="headstart">${It("rocket")}<span>\uC2A4\uD0C0\uD2B8 \uB300\uC2DC</span><b id="hHeadN"></b></button>
        <div class="hint hidden" id="hint"><div class="hint-arrows"></div><p></p></div>
      </div>
      <div id="home" class="layer hidden">
        <div class="topbar">
          <div class="pill coin">${It("star")}<b data-bind="coins">0</b></div>
          <button class="icon-btn" data-act="open" data-arg="settings" aria-label="\uC124\uC815">${It("gear")}</button>
        </div>
        <div class="logo">
          <div class="logo-mark">${It("star")}</div>
          <h1>\uBCC4\uBE5B \uC9C8\uC8FC</h1>
          <p>STARLIGHT DASH</p>
        </div>
        <div class="home-bottom">
          <div class="best">${It("trophy")}<span>\uCD5C\uACE0 \uAE30\uB85D</span><b data-bind="best">0</b></div>
          <button class="btn primary big" data-act="play">${It("play")}<span>\uB2EC\uB9AC\uAE30</span></button>
          <div class="row3">
            <button class="btn tile" data-act="open" data-arg="shop">${It("bag")}<span>\uC0C1\uC810</span></button>
            <button class="btn tile" data-act="open" data-arg="chars">${It("user")}<span>\uCE90\uB9AD\uD130</span></button>
            <button class="btn tile" data-act="open" data-arg="missions">${It("flag")}<span>\uBBF8\uC158</span></button>
          </div>
          <button class="cheat-row" data-act="toggle" data-arg="cheat">
            <span class="cheat-ico">${It("cheat")}</span>
            <span class="cheat-txt"><b>\uCE58\uD2B8 \uBAA8\uB4DC</b><small>\uC4F0\uB7EC\uC9C0\uC9C0 \uC54A\uACE0 \uB05D\uC5C6\uC774 \uB2EC\uB824\uC694</small></span>
            <span class="switch" data-switch="cheat"></span>
          </button>
        </div>
      </div>
      <div id="banner" class="banner"></div>
      <div id="count" class="count hidden"></div>
      <div id="sheet" class="sheet hidden">
        <div class="sheet-head">
          <div class="sheet-title" id="sheetTitle"></div>
          <div class="pill coin small">${It("star")}<b data-bind="coins">0</b></div>
          <button class="icon-btn" data-act="close" aria-label="\uB2EB\uAE30">${It("close")}</button>
        </div>
        <div class="tabs hidden" id="tabs">
          <button data-act="tab" data-arg="up">\uAC15\uD654</button>
          <button data-act="tab" data-arg="items">\uC544\uC774\uD15C</button>
          <button data-act="tab" data-arg="chars">\uCE90\uB9AD\uD130</button>
        </div>
        <div class="sheet-body" id="sheetBody"></div>
      </div>
      <div id="modal" class="modal hidden"><div class="card" id="modalCard"></div></div>
      <div id="toast" class="toast"></div>
      <div id="fade" class="fade"></div>`,this.el={};for(let s of["hud","home","sheet","modal","modalCard","sheetBody","sheetTitle","tabs","banner","count","toast","fade","hScore","hDist","hMult","hCoins","hCheat","hHead","hHeadN","hint"])this.el[s]=t.querySelector("#"+s);this.fxEls={};for(let s of t.querySelectorAll("[data-fx]"))this.fxEls[s.dataset.fx]={el:s,bar:s.querySelector("i"),on:!1,w:-1};t.addEventListener("click",s=>{let r=s.target.closest("[data-act]");!r||!t.contains(r)||(this.sound.unlock(),this.act(r.dataset.act,r.dataset.arg))}),this.refresh()}attach(t){this.game=t}show(t,e){t.classList.toggle("hidden",!e)}refresh(){let t=this.save.data;for(let e of this.root.querySelectorAll('[data-bind="coins"]'))e.textContent=Me(t.coins);for(let e of this.root.querySelectorAll('[data-bind="best"]'))e.textContent=Me(t.best);for(let e of this.root.querySelectorAll("[data-switch]"))e.classList.toggle("on",!!t.settings[e.dataset.switch])}toast(t){let e=this.el.toast;e.textContent=t,e.classList.add("on"),clearTimeout(this.timers.toast),this.timers.toast=setTimeout(()=>e.classList.remove("on"),1600)}banner(t){let e=this.el.banner;e.textContent=t,e.classList.remove("on"),e.offsetWidth,e.classList.add("on")}hint(t,e){let n=this.el.hint,s=t==="both"?["left","right"]:[t];n.querySelector(".hint-arrows").innerHTML=s.map(r=>`<span class="arrow ${r}">${It("arrow")}</span>`).join(""),n.querySelector("p").textContent=e,this.show(n,!0),clearTimeout(this.timers.hint),this.timers.hint=setTimeout(()=>this.show(n,!1),1300)}fadeThen(t){let e=this.el.fade;e.classList.add("on"),setTimeout(()=>{t(),requestAnimationFrame(()=>e.classList.remove("on"))},200)}countdown(t){this.closeModal();let e=this.el.count,n=3;this.show(e,!0);let s=()=>{if(n===0){this.show(e,!1),t();return}e.textContent=n,e.classList.remove("pop"),e.offsetWidth,e.classList.add("pop"),this.sound.sfx("click"),n--,this.timers.count=setTimeout(s,420)};s()}showHome(){this.closeModal(),this.closeSheet(!0),this.show(this.el.hud,!1),this.show(this.el.home,!0),this.refresh()}showHUD(t){this.closeModal(),this.closeSheet(!0),this.show(this.el.home,!1),this.show(this.el.hud,!0),this.show(this.el.hint,!1),t||(this.cache={})}updateHUD(t,e){let n=this.cache,s=this.el,r=Math.floor(t.score),a=Math.floor(t.dist);n.score!==r&&(n.score=r,s.hScore.textContent=Me(r)),n.dist!==a&&(n.dist=a,s.hDist.textContent=Me(a)),n.coins!==t.coins&&(n.coins=t.coins,s.hCoins.textContent=Me(t.coins));let o=e.mult;n.mult!==o&&(n.mult=o,s.hMult.textContent=o>1?` \xB7 \xD7${o}`:"");let c=e.cheat;n.cheat!==c&&(n.cheat=c,this.show(s.hCheat,c));for(let h in this.fxEls){let u=this.fxEls[h],d=h==="head"?t.headstart/600:t.fx[h]/t.fxMax[h],p=d>0;if(p!==u.on&&(u.on=p,this.show(u.el,p)),p){let g=Math.round(d*100);g!==u.w&&(u.w=g,u.bar.style.width=g+"%")}}let l=t.headOffer>0&&this.save.data.items.headstart>0;n.head!==l&&(n.head=l,this.show(s.hHead,l),l&&(s.hHeadN.textContent="\xD7"+this.save.data.items.headstart))}openSheet(t){this.sheetName=t,t==="shop"&&(this.tab="up"),t==="chars"&&(this.sheetName="shop",this.tab="chars"),this.preview=this.save.data.char,this.show(this.el.sheet,!0),this.el.home.classList.add("dim"),this.renderSheet()}closeSheet(t){this.sheetName&&(this.sheetName=null,this.show(this.el.sheet,!1),this.el.home.classList.remove("dim"),this.game&&!t&&(this.game.setCharacter(this.save.data.char),this.game.setCamMode("home")))}renderSheet(){let t=this.save.data,e=this.sheetName,n=this.el,s={shop:"\uC0C1\uC810",missions:"\uBBF8\uC158",settings:"\uC124\uC815"};n.sheetTitle.textContent=s[e],this.show(n.tabs,e==="shop"),n.sheet.classList.toggle("short",e==="shop"&&this.tab==="chars");let r="";if(e==="shop"){for(let a of n.tabs.children)a.classList.toggle("on",a.dataset.arg===this.tab);if(this.game){let a=this.tab==="chars";this.game.setCamMode(a?"show":"home"),this.game.setCharacter(a?this.preview:t.char)}this.tab==="up"?r=os.map(a=>{let o=t.up[a.id]||0,c=o>=a.costs.length,l=cs(a,o),h=cs(a,o+1),u=a.costs[o];return`<div class="row">
            <div class="ri" style="--c:${a.color}">${It(a.icon)}</div>
            <div class="rm">
              <div class="rt">${a.name}<span class="tag">Lv.${o}</span></div>
              <div class="rd">${a.desc}</div>
              <div class="rv">${c?`${l}${a.unit} \xB7 \uCD5C\uB300 \uB2E8\uACC4`:`${l}${a.unit} \u2192 <b>${h}${a.unit}</b>`}</div>
              <div class="pips">${a.costs.map((d,p)=>`<i class="${p<o?"on":""}"></i>`).join("")}</div>
            </div>
            ${c?`<div class="done">${It("check")}</div>`:`<button class="buy ${t.coins>=u?"":"poor"}" data-act="buy-up" data-arg="${a.id}">${It("star")}${Me(u)}</button>`}
          </div>`}).join(""):this.tab==="items"?r=va.map(a=>`<div class="row">
            <div class="ri" style="--c:${a.color}">${It(a.icon)}</div>
            <div class="rm">
              <div class="rt">${a.name}<span class="tag">\uBCF4\uC720 ${t.items[a.id]||0}\uAC1C</span></div>
              <div class="rd">${a.desc}</div>
            </div>
            <button class="buy ${t.coins>=a.price?"":"poor"}" data-act="buy-item" data-arg="${a.id}">${It("star")}${Me(a.price)}</button>
          </div>`).join("")+'<p class="note">\uBD80\uD65C\uC758 \uBCC4\uC740 \uC4F0\uB7EC\uC84C\uC744 \uB54C, \uC2A4\uD0C0\uD2B8 \uB300\uC2DC\uB294 \uCD9C\uBC1C \uC9C1\uD6C4 \uD654\uBA74 \uC544\uB798 \uBC84\uD2BC\uC73C\uB85C \uC0AC\uC6A9\uD569\uB2C8\uB2E4.</p>':r=_a.map(a=>{let o=!!t.owned[a.id],l=t.char===a.id?`<div class="done using">${It("check")}<span>\uC0AC\uC6A9 \uC911</span></div>`:o?`<button class="buy own" data-act="pick" data-arg="${a.id}">\uC120\uD0DD</button>`:`<button class="buy ${t.coins>=a.price?"":"poor"}" data-act="buy-char" data-arg="${a.id}">${It("star")}${Me(a.price)}</button>`;return`<div class="row char ${this.preview===a.id?"viewing":""}" data-act="preview" data-arg="${a.id}">
            <div class="ri round" style="--c:${du[a.id]}">${It(o?"user":"lock")}</div>
            <div class="rm">
              <div class="rt">${a.name}<span class="tag">${a.title}</span></div>
              <div class="rd">${a.perk}</div>
            </div>
            ${l}
          </div>`}).join("")}else if(e==="missions")r=this.save.missionView().map(a=>`<div class="row">
          <div class="ri" style="--c:#b388ff">${It("flag")}</div>
          <div class="rm">
            <div class="rt">${a.text}</div>
            <div class="bar"><i style="width:${Math.round(a.progress/a.target*100)}%"></i></div>
            <div class="rd">${Me(a.progress)} / ${Me(a.target)}${a.scope==="run"?" \xB7 \uD55C \uD310 \uCD5C\uACE0":""}</div>
          </div>
          <div class="reward">${It("star")}${Me(a.reward)}</div>
        </div>`).join("")+'<p class="note">\uBBF8\uC158\uC744 \uB2EC\uC131\uD558\uBA74 \uB2EC\uB9AC\uAE30\uAC00 \uB05D\uB0A0 \uB54C \uBCF4\uC0C1\uC744 \uBC1B\uACE0 \uC0C8 \uBBF8\uC158\uC774 \uB098\uD0C0\uB0A9\uB2C8\uB2E4. \uCE58\uD2B8 \uBAA8\uB4DC\uB85C \uB2EC\uB9B0 \uD310\uC740 \uBBF8\uC158\uC5D0 \uBC18\uC601\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.</p>';else if(e==="settings"){let a=(o,c,l,h)=>`<button class="row toggle" data-act="toggle" data-arg="${o}">
          <div class="ri" style="--c:#5b6bd6">${It(c)}</div>
          <div class="rm"><div class="rt">${l}</div>${h?`<div class="rd">${h}</div>`:""}</div>
          <span class="switch ${t.settings[o]?"on":""}" data-switch="${o}"></span>
        </button>`;r=a("sfx","sound","\uD6A8\uACFC\uC74C")+a("music","music","\uBC30\uACBD \uC74C\uC545")+a("vibrate","vibrate","\uC9C4\uB3D9")+a("cheat","cheat","\uCE58\uD2B8 \uBAA8\uB4DC","\uC4F0\uB7EC\uC9C0\uC9C0 \uC54A\uACE0 \uB05D\uC5C6\uC774 \uB2EC\uB9BD\uB2C8\uB2E4. \uCF54\uC778\uC740 \uC313\uC774\uC9C0\uB9CC \uCD5C\uACE0 \uAE30\uB85D\uACFC \uBBF8\uC158\uC5D0\uB294 \uBC18\uC601\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.")+`<div class="help">
            <h3>\uC870\uC791\uBC95</h3>
            <ul>
              <li><span class="arrow left">${It("arrow")}</span><span class="arrow right">${It("arrow")}</span> \uC88C\uC6B0 \uC2A4\uC640\uC774\uD504 \u2014 \uCC28\uC120 \uBC14\uAFB8\uAE30, \uCF54\uB108\uC5D0\uC11C\uB294 \uBC29\uD5A5 \uC804\uD658</li>
              <li><span class="arrow up">${It("arrow")}</span> \uC704\uB85C \uC2A4\uC640\uC774\uD504 \u2014 \uC810\uD504</li>
              <li><span class="arrow down">${It("arrow")}</span> \uC544\uB798\uB85C \uC2A4\uC640\uC774\uD504 \u2014 \uC2AC\uB77C\uC774\uB4DC (\uACF5\uC911\uC5D0\uC11C\uB294 \uBE60\uB974\uAC8C \uCC29\uC9C0)</li>
            </ul>
          </div>
          <button class="btn ghost danger" data-act="reset">\uC800\uC7A5 \uB370\uC774\uD130 \uCD08\uAE30\uD654</button>
          <p class="note">\uBCC4\uBE5B \uC9C8\uC8FC v${pu}</p>`}n.sheetBody.innerHTML=r,this.refresh()}buy(t,e){let n=this.save.data;return n.coins<t?(this.sound.sfx("deny"),this.toast(`\uBCC4 \uCF54\uC778\uC774 ${Me(t-n.coins)}\uAC1C \uBD80\uC871\uD574\uC694`),!1):(n.coins-=t,e(n),this.save.commit(),this.sound.sfx("buy"),Kn(25,n.settings.vibrate),!0)}openModal(t,e){this.modalKind=t,this.el.modalCard.innerHTML=e,this.el.modalCard.className="card "+t,this.show(this.el.modal,!0)}closeModal(){clearTimeout(this.timers.revive),clearTimeout(this.timers.count),this.show(this.el.count,!1),this.modalKind&&(this.modalKind=null,this.show(this.el.modal,!1))}showPause(){let t=this.save.data,e=(n,s,r)=>`<button class="mini-toggle ${t.settings[n]?"on":""}" data-act="toggle" data-arg="${n}">${It(s)}<span>${r}</span></button>`;this.openModal("pause",`
      <h2>\uC77C\uC2DC\uC815\uC9C0</h2>
      <div class="mini-toggles">${e("sfx","sound","\uD6A8\uACFC\uC74C")}${e("music","music","\uC74C\uC545")}${e("cheat","cheat","\uCE58\uD2B8")}</div>
      <button class="btn primary" data-act="resume">${It("play")}<span>\uACC4\uC18D \uB2EC\uB9AC\uAE30</span></button>
      <button class="btn" data-act="restart">${It("retry")}<span>\uCC98\uC74C\uBD80\uD130 \uB2E4\uC2DC</span></button>
      <button class="btn ghost" data-act="quit">${It("flag")}<span>\uADF8\uB9CC\uD558\uACE0 \uC815\uC0B0\uD558\uAE30</span></button>`)}showRevive(t,e,n){this.onRevive=e,this.onGiveUp=n,this.openModal("revive",`
      <div class="big-ico heart">${It("heart")}</div>
      <h2>\uB2E4\uC2DC \uC77C\uC5B4\uB0A0\uAE4C\uC694?</h2>
      <p class="sub">${t.free?"\uB4DC\uB77C\uCF54\uC758 \uBB34\uB8CC \uBD80\uD65C\uC744 \uC4F8 \uC218 \uC788\uC5B4\uC694":`\uBD80\uD65C\uC758 \uBCC4 ${t.count}\uAC1C \uBCF4\uC720`}</p>
      <div class="bar timer"><i></i></div>
      <button class="btn primary" data-act="revive">${It("heart")}<span>${t.free?"\uBB34\uB8CC\uB85C \uBD80\uD65C":"\uBD80\uD65C\uC758 \uBCC4 \uC0AC\uC6A9"}</span></button>
      <button class="btn ghost" data-act="giveup">\uAD1C\uCC2E\uC544\uC694</button>`),this.timers.revive=setTimeout(()=>{this.modalKind==="revive"&&this.act("giveup")},5e3)}showResult(t){this.show(this.el.hud,!1);let e=t.missions.map(n=>`<li>${It("check")}<span>${n.text}</span><b>${It("star")}+${Me(n.reward)}</b></li>`).join("");this.openModal("result",`
      <div class="ribbon ${t.record?"rec":""}">${t.record?"\uC2E0\uAE30\uB85D!":t.cheated?"\uCE58\uD2B8 \uBAA8\uB4DC \uB2EC\uB9AC\uAE30":"\uB2EC\uB9AC\uAE30 \uB05D!"}</div>
      <div class="score"><span>\uC810\uC218</span><b>${Me(t.score)}</b></div>
      <div class="stats">
        <div><span>\uAC70\uB9AC</span><b>${Me(t.dist)}m</b></div>
        <div><span>\uBCC4 \uCF54\uC778</span><b class="gold">${It("star")}+${Me(t.coins)}</b></div>
        <div><span>\uCD5C\uACE0 \uAE30\uB85D</span><b>${Me(t.best)}</b></div>
      </div>
      ${e?`<ul class="mdone">${e}</ul>`:""}
      ${t.cheated?'<p class="sub">\uCE58\uD2B8 \uBAA8\uB4DC \uAE30\uB85D\uC740 \uCD5C\uACE0 \uC810\uC218\uC640 \uBBF8\uC158\uC5D0 \uBC18\uC601\uB418\uC9C0 \uC54A\uC544\uC694.</p>':""}
      <button class="btn primary" data-act="again">${It("retry")}<span>\uB2E4\uC2DC \uB2EC\uB9AC\uAE30</span></button>
      <div class="row2">
        <button class="btn" data-act="result-shop">${It("bag")}<span>\uC0C1\uC810</span></button>
        <button class="btn" data-act="home">${It("home")}<span>\uD648</span></button>
      </div>`),this.refresh()}confirm(t,e,n){this.onConfirm=n,this.openModal("confirm",`
      <h2>\uD655\uC778</h2>
      <p class="sub">${t}</p>
      <button class="btn danger" data-act="confirm-yes">${e}</button>
      <button class="btn ghost" data-act="confirm-no">\uCDE8\uC18C</button>`)}act(t,e){let n=this.game,s=this.save.data,r=this.sound;switch(t){case"play":r.sfx("click"),this.fadeThen(()=>n.startRun());break;case"open":r.sfx("click"),this.openSheet(e);break;case"close":r.sfx("click"),this.closeSheet();break;case"tab":r.sfx("click"),this.tab=e,this.preview=s.char,this.renderSheet();break;case"toggle":{s.settings[e]=!s.settings[e],this.save.commit(),r.sfxOn=s.settings.sfx,r.musicOn=s.settings.music,r.refresh(),r.sfx("click"),e==="cheat"&&this.toast(s.settings.cheat?"\uCE58\uD2B8 \uBAA8\uB4DC \uCF1C\uC9D0 \u2014 \uB05D\uC5C6\uC774 \uB2EC\uB824\uC694!":"\uCE58\uD2B8 \uBAA8\uB4DC \uAEBC\uC9D0"),e==="vibrate"&&Kn(40,s.settings.vibrate),this.modalKind==="pause"&&this.showPause(),this.sheetName==="settings"&&this.renderSheet(),this.refresh();break}case"buy-up":{let a=os.find(c=>c.id===e),o=s.up[e]||0;o<a.costs.length&&this.buy(a.costs[o],c=>{c.up[e]=o+1})&&(this.toast(`${a.name} Lv.${o+1}`),this.renderSheet());break}case"buy-item":{let a=va.find(o=>o.id===e);this.buy(a.price,o=>{o.items[e]=(o.items[e]||0)+1})&&(this.toast(`${a.name} +1`),this.renderSheet());break}case"preview":this.preview=e,this.renderSheet();break;case"pick":s.char=e,this.preview=e,this.save.commit(),r.sfx("power"),this.renderSheet();break;case"buy-char":{let a=_a.find(o=>o.id===e);this.preview=e,this.buy(a.price,o=>{o.owned[e]=!0,o.char=e})&&this.toast(`${a.name} \uD569\uB958!`),this.renderSheet();break}case"reset":this.confirm("\uCF54\uC778, \uAC15\uD654, \uCE90\uB9AD\uD130, \uAE30\uB85D\uC774 \uBAA8\uB450 \uC9C0\uC6CC\uC9D1\uB2C8\uB2E4.","\uBAA8\uB450 \uC9C0\uC6B0\uAE30",()=>{this.save.reset(),r.sfxOn=!0,r.musicOn=!0,n.enterHome(),this.toast("\uCD08\uAE30\uD654\uD588\uC5B4\uC694")});break;case"confirm-yes":{let a=this.onConfirm;this.closeModal(),a&&a();break}case"confirm-no":this.closeModal();break;case"pause":n.pause();break;case"resume":r.sfx("click"),n.resume();break;case"restart":r.sfx("click"),this.fadeThen(()=>{this.closeModal(),n.restart()});break;case"quit":r.sfx("click"),this.closeModal(),n.quitRun();break;case"revive":{let a=this.onRevive;this.closeModal(),a&&a();break}case"giveup":{let a=this.onGiveUp;this.closeModal(),a&&a();break}case"again":r.sfx("click"),this.fadeThen(()=>{this.closeModal(),n.startRun()});break;case"home":r.sfx("click"),this.fadeThen(()=>{this.closeModal(),n.enterHome()});break;case"result-shop":r.sfx("click"),this.fadeThen(()=>{this.closeModal(),n.enterHome(),this.openSheet("shop")});break;case"headstart":n.useHeadstart();break;default:break}}back(){let t=this.game;return this.modalKind==="confirm"?(this.closeModal(),"ok"):this.sheetName?(this.closeSheet(),"ok"):t.state==="play"?(t.pause(),"ok"):t.state==="paused"?(t.resume(),"ok"):t.state==="revive"?(this.act("giveup"),"ok"):t.state==="over"?(this.act("home"),"ok"):t.state==="dying"?"ok":"exit"}};var mu=0,Lc=1,gu=2;var uh=1,xu=2,yn=3,Hn=0,Pe=1,bn=2,Bn=0,Gi=1,vr=2,Ic=3,Dc=4,_u=5,ri=100,vu=101,yu=102,Uc=103,Nc=104,Mu=200,bu=201,Su=202,wu=203,oo=204,co=205,Eu=206,Tu=207,Au=208,Ru=209,Cu=210,Pu=211,Lu=212,Iu=213,Du=214,Uu=0,Nu=1,Ou=2,yr=3,Fu=4,Bu=5,ku=6,zu=7,sc=0,Hu=1,Vu=2,kn=0,Gu=1,Wu=2,Xu=3,qu=4,Yu=5,$u=6,Zu=7;var dh=300,qi=301,Yi=302,lo=303,ho=304,sa=306,uo=1e3,en=1001,fo=1002,be=1003,Oc=1004;var ls=1005;var Oe=1006,Sa=1007;var oi=1008;var zn=1009,Ju=1010,Ku=1011,rc=1012,fh=1013,Fn=1014,cn=1015,Ss=1016,ph=1017,mh=1018,li=1020,ju=1021,nn=1023,Qu=1024,td=1025,hi=1026,$i=1027,gh=1028,xh=1029,ed=1030,_h=1031,vh=1033,wa=33776,Ea=33777,Ta=33778,Aa=33779,Fc=35840,Bc=35841,kc=35842,zc=35843,yh=36196,Hc=37492,Vc=37496,Gc=37808,Wc=37809,Xc=37810,qc=37811,Yc=37812,$c=37813,Zc=37814,Jc=37815,Kc=37816,jc=37817,Qc=37818,tl=37819,el=37820,nl=37821,Ra=36492,il=36494,sl=36495,nd=36283,rl=36284,al=36285,ol=36286;var Mr=2300,br=2301,Ca=2302,cl=2400,ll=2401,hl=2402;var id=3200,sd=3201,Mh=0,rd=1,On="",Fe="srgb",Wn="srgb-linear",ac="display-p3",ra="display-p3-linear",Sr="linear",ne="srgb",wr="rec709",Er="p3";var vi=7680;var ul=519,ad=512,od=513,cd=514,bh=515,ld=516,hd=517,ud=518,dd=519,po=35044,aa=35048;var dl="300 es",mo=1035,Sn=2e3,Tr=2001,Vn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;let n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;let s=this._listeners[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;let n=this._listeners[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}},Te=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Pa=Math.PI/180,go=180/Math.PI;function wn(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Te[i&255]+Te[i>>8&255]+Te[i>>16&255]+Te[i>>24&255]+"-"+Te[t&255]+Te[t>>8&255]+"-"+Te[t>>16&15|64]+Te[t>>24&255]+"-"+Te[e&63|128]+Te[e>>8&255]+"-"+Te[e>>16&255]+Te[e>>24&255]+Te[n&255]+Te[n>>8&255]+Te[n>>16&255]+Te[n>>24&255]).toLowerCase()}function Re(i,t,e){return Math.max(t,Math.min(e,i))}function fd(i,t){return(i%t+t)%t}function La(i,t,e){return(1-e)*i+e*t}function fl(i){return(i&i-1)===0&&i!==0}function xo(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function ln(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Jt(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var nt=class i{constructor(t=0,e=0){i.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Re(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ht=class i{constructor(t,e,n,s,r,a,o,c,l){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,c,l)}set(t,e,n,s,r,a,o,c,l){let h=this.elements;return h[0]=t,h[1]=s,h[2]=o,h[3]=e,h[4]=r,h[5]=c,h[6]=n,h[7]=a,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],c=n[6],l=n[1],h=n[4],u=n[7],d=n[2],p=n[5],g=n[8],_=s[0],f=s[3],m=s[6],M=s[1],x=s[4],b=s[7],C=s[2],A=s[5],w=s[8];return r[0]=a*_+o*M+c*C,r[3]=a*f+o*x+c*A,r[6]=a*m+o*b+c*w,r[1]=l*_+h*M+u*C,r[4]=l*f+h*x+u*A,r[7]=l*m+h*b+u*w,r[2]=d*_+p*M+g*C,r[5]=d*f+p*x+g*A,r[8]=d*m+p*b+g*w,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],c=t[6],l=t[7],h=t[8];return e*a*h-e*o*l-n*r*h+n*o*c+s*r*l-s*a*c}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],c=t[6],l=t[7],h=t[8],u=h*a-o*l,d=o*c-h*r,p=l*r-a*c,g=e*u+n*d+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return t[0]=u*_,t[1]=(s*l-h*n)*_,t[2]=(o*n-s*a)*_,t[3]=d*_,t[4]=(h*e-s*c)*_,t[5]=(s*r-o*e)*_,t[6]=p*_,t[7]=(n*c-l*e)*_,t[8]=(a*e-n*r)*_,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){let c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*a+l*o)+a+t,-s*l,s*c,-s*(-l*a+c*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(Ia.makeScale(t,e)),this}rotate(t){return this.premultiply(Ia.makeRotation(-t)),this}translate(t,e){return this.premultiply(Ia.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Ia=new Ht;function Sh(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Ar(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function pd(){let i=Ar("canvas");return i.style.display="block",i}var pl={};function wh(i){i in pl||(pl[i]=!0,console.warn(i))}var ml=new Ht().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),gl=new Ht().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Vs={[Wn]:{transfer:Sr,primaries:wr,toReference:i=>i,fromReference:i=>i},[Fe]:{transfer:ne,primaries:wr,toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[ra]:{transfer:Sr,primaries:Er,toReference:i=>i.applyMatrix3(gl),fromReference:i=>i.applyMatrix3(ml)},[ac]:{transfer:ne,primaries:Er,toReference:i=>i.convertSRGBToLinear().applyMatrix3(gl),fromReference:i=>i.applyMatrix3(ml).convertLinearToSRGB()}},md=new Set([Wn,ra]),Kt={enabled:!0,_workingColorSpace:Wn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!md.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,t,e){if(this.enabled===!1||t===e||!t||!e)return i;let n=Vs[t].toReference,s=Vs[e].fromReference;return s(n(i))},fromWorkingColorSpace:function(i,t){return this.convert(i,this._workingColorSpace,t)},toWorkingColorSpace:function(i,t){return this.convert(i,t,this._workingColorSpace)},getPrimaries:function(i){return Vs[i].primaries},getTransfer:function(i){return i===On?Sr:Vs[i].transfer}};function Wi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Da(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var yi,Rr=class{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement=="undefined")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{yi===void 0&&(yi=Ar("canvas")),yi.width=t.width,yi.height=t.height;let n=yi.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=yi}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement!="undefined"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&t instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&t instanceof ImageBitmap){let e=Ar("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Wi(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Wi(e[n]/255)*255):e[n]=Wi(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},gd=0,Cr=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:gd++}),this.uuid=wn(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Ua(s[a].image)):r.push(Ua(s[a]))}else r=Ua(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function Ua(i){return typeof HTMLImageElement!="undefined"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&i instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&i instanceof ImageBitmap?Rr.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var xd=0,Be=class i extends Vn{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=en,s=en,r=Oe,a=oi,o=nn,c=zn,l=i.DEFAULT_ANISOTROPY,h=On){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:xd++}),this.uuid=wn(),this.name="",this.source=new Cr(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new nt(0,0),this.repeat=new nt(1,1),this.center=new nt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ht,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==dh)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case uo:t.x=t.x-Math.floor(t.x);break;case en:t.x=t.x<0?0:1;break;case fo:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case uo:t.y=t.y-Math.floor(t.y);break;case en:t.y=t.y<0?0:1;break;case fo:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}};Be.DEFAULT_IMAGE=null;Be.DEFAULT_MAPPING=dh;Be.DEFAULT_ANISOTROPY=1;var ve=class i{constructor(t=0,e=0,n=0,s=1){i.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,c=t.elements,l=c[0],h=c[4],u=c[8],d=c[1],p=c[5],g=c[9],_=c[2],f=c[6],m=c[10];if(Math.abs(h-d)<.01&&Math.abs(u-_)<.01&&Math.abs(g-f)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+_)<.1&&Math.abs(g+f)<.1&&Math.abs(l+p+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let x=(l+1)/2,b=(p+1)/2,C=(m+1)/2,A=(h+d)/4,w=(u+_)/4,P=(g+f)/4;return x>b&&x>C?x<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(x),s=A/n,r=w/n):b>C?b<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(b),n=A/s,r=P/s):C<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(C),n=w/r,s=P/r),this.set(n,s,r,e),this}let M=Math.sqrt((f-g)*(f-g)+(u-_)*(u-_)+(d-h)*(d-h));return Math.abs(M)<.001&&(M=1),this.x=(f-g)/M,this.y=(u-_)/M,this.z=(d-h)/M,this.w=Math.acos((l+p+m-1)/2),this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},_o=class extends Vn{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new ve(0,0,t,e),this.scissorTest=!1,this.viewport=new ve(0,0,t,e);let s={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Oe,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0,count:1},n);let r=new Be(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];let a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,s=t.textures.length;n<s;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;let e=Object.assign({},t.texture.image);return this.texture.source=new Cr(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},En=class extends _o{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},Pr=class extends Be{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=be,this.minFilter=be,this.wrapR=en,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var vo=class extends Be{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=be,this.minFilter=be,this.wrapR=en,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ze=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let c=n[s+0],l=n[s+1],h=n[s+2],u=n[s+3],d=r[a+0],p=r[a+1],g=r[a+2],_=r[a+3];if(o===0){t[e+0]=c,t[e+1]=l,t[e+2]=h,t[e+3]=u;return}if(o===1){t[e+0]=d,t[e+1]=p,t[e+2]=g,t[e+3]=_;return}if(u!==_||c!==d||l!==p||h!==g){let f=1-o,m=c*d+l*p+h*g+u*_,M=m>=0?1:-1,x=1-m*m;if(x>Number.EPSILON){let C=Math.sqrt(x),A=Math.atan2(C,m*M);f=Math.sin(f*A)/C,o=Math.sin(o*A)/C}let b=o*M;if(c=c*f+d*b,l=l*f+p*b,h=h*f+g*b,u=u*f+_*b,f===1-o){let C=1/Math.sqrt(c*c+l*l+h*h+u*u);c*=C,l*=C,h*=C,u*=C}}t[e]=c,t[e+1]=l,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,s,r,a){let o=n[s],c=n[s+1],l=n[s+2],h=n[s+3],u=r[a],d=r[a+1],p=r[a+2],g=r[a+3];return t[e]=o*g+h*u+c*p-l*d,t[e+1]=c*g+h*d+l*u-o*p,t[e+2]=l*g+h*p+o*d-c*u,t[e+3]=h*g-o*u-c*d-l*p,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,c=Math.sin,l=o(n/2),h=o(s/2),u=o(r/2),d=c(n/2),p=c(s/2),g=c(r/2);switch(a){case"XYZ":this._x=d*h*u+l*p*g,this._y=l*p*u-d*h*g,this._z=l*h*g+d*p*u,this._w=l*h*u-d*p*g;break;case"YXZ":this._x=d*h*u+l*p*g,this._y=l*p*u-d*h*g,this._z=l*h*g-d*p*u,this._w=l*h*u+d*p*g;break;case"ZXY":this._x=d*h*u-l*p*g,this._y=l*p*u+d*h*g,this._z=l*h*g+d*p*u,this._w=l*h*u-d*p*g;break;case"ZYX":this._x=d*h*u-l*p*g,this._y=l*p*u+d*h*g,this._z=l*h*g-d*p*u,this._w=l*h*u+d*p*g;break;case"YZX":this._x=d*h*u+l*p*g,this._y=l*p*u+d*h*g,this._z=l*h*g-d*p*u,this._w=l*h*u-d*p*g;break;case"XZY":this._x=d*h*u-l*p*g,this._y=l*p*u-d*h*g,this._z=l*h*g+d*p*u,this._w=l*h*u+d*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],c=e[9],l=e[2],h=e[6],u=e[10],d=n+o+u;if(d>0){let p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(h-c)*p,this._y=(r-l)*p,this._z=(a-s)*p}else if(n>o&&n>u){let p=2*Math.sqrt(1+n-o-u);this._w=(h-c)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+l)/p}else if(o>u){let p=2*Math.sqrt(1+o-n-u);this._w=(r-l)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(c+h)/p}else{let p=2*Math.sqrt(1+u-n-o);this._w=(a-s)/p,this._x=(r+l)/p,this._y=(c+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Re(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,c=e._y,l=e._z,h=e._w;return this._x=n*h+a*o+s*l-r*c,this._y=s*h+a*c+r*o-n*l,this._z=r*h+a*l+n*c-s*o,this._w=a*h-n*o-s*c-r*l,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);let n=this._x,s=this._y,r=this._z,a=this._w,o=a*t._w+n*t._x+s*t._y+r*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;let c=1-o*o;if(c<=Number.EPSILON){let p=1-e;return this._w=p*a+e*this._w,this._x=p*n+e*this._x,this._y=p*s+e*this._y,this._z=p*r+e*this._z,this.normalize(),this}let l=Math.sqrt(c),h=Math.atan2(l,o),u=Math.sin((1-e)*h)/l,d=Math.sin(e*h)/l;return this._w=a*u+this._w*d,this._x=n*u+this._x*d,this._y=s*u+this._y*d,this._z=r*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},L=class i{constructor(t=0,e=0,n=0){i.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(xl.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(xl.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,c=t.w,l=2*(a*s-o*n),h=2*(o*e-r*s),u=2*(r*n-a*e);return this.x=e+c*l+a*u-o*h,this.y=n+c*h+o*l-r*u,this.z=s+c*u+r*h-a*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,c=e.z;return this.x=s*c-r*o,this.y=r*a-n*c,this.z=n*o-s*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Na.copy(this).projectOnVector(t),this.sub(Na)}reflect(t){return this.sub(Na.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Re(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Na=new L,xl=new Ze,Tn=class{constructor(t=new L(1/0,1/0,1/0),e=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(je.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(je.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=je.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,je):je.fromBufferAttribute(r,a),je.applyMatrix4(t.matrixWorld),this.expandByPoint(je);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Gs.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Gs.copy(n.boundingBox)),Gs.applyMatrix4(t.matrixWorld),this.union(Gs)}let s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return!(t.x<this.min.x||t.x>this.max.x||t.y<this.min.y||t.y>this.max.y||t.z<this.min.z||t.z>this.max.z)}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return!(t.max.x<this.min.x||t.min.x>this.max.x||t.max.y<this.min.y||t.min.y>this.max.y||t.max.z<this.min.z||t.min.z>this.max.z)}intersectsSphere(t){return this.clampPoint(t.center,je),je.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(hs),Ws.subVectors(this.max,hs),Mi.subVectors(t.a,hs),bi.subVectors(t.b,hs),Si.subVectors(t.c,hs),Pn.subVectors(bi,Mi),Ln.subVectors(Si,bi),jn.subVectors(Mi,Si);let e=[0,-Pn.z,Pn.y,0,-Ln.z,Ln.y,0,-jn.z,jn.y,Pn.z,0,-Pn.x,Ln.z,0,-Ln.x,jn.z,0,-jn.x,-Pn.y,Pn.x,0,-Ln.y,Ln.x,0,-jn.y,jn.x,0];return!Oa(e,Mi,bi,Si,Ws)||(e=[1,0,0,0,1,0,0,0,1],!Oa(e,Mi,bi,Si,Ws))?!1:(Xs.crossVectors(Pn,Ln),e=[Xs.x,Xs.y,Xs.z],Oa(e,Mi,bi,Si,Ws))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,je).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(je).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(mn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),mn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),mn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),mn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),mn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),mn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),mn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),mn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(mn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}},mn=[new L,new L,new L,new L,new L,new L,new L,new L],je=new L,Gs=new Tn,Mi=new L,bi=new L,Si=new L,Pn=new L,Ln=new L,jn=new L,hs=new L,Ws=new L,Xs=new L,Qn=new L;function Oa(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Qn.fromArray(i,r);let o=s.x*Math.abs(Qn.x)+s.y*Math.abs(Qn.y)+s.z*Math.abs(Qn.z),c=t.dot(Qn),l=e.dot(Qn),h=n.dot(Qn);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>o)return!1}return!0}var _d=new Tn,us=new L,Fa=new L,Gn=class{constructor(t=new L,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):_d.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;us.subVectors(t,this.center);let e=us.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(us,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Fa.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(us.copy(t.center).add(Fa)),this.expandByPoint(us.copy(t.center).sub(Fa))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}},gn=new L,Ba=new L,qs=new L,In=new L,ka=new L,Ys=new L,za=new L,Lr=class{constructor(t=new L,e=new L(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,gn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=gn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(gn.copy(this.origin).addScaledVector(this.direction,e),gn.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Ba.copy(t).add(e).multiplyScalar(.5),qs.copy(e).sub(t).normalize(),In.copy(this.origin).sub(Ba);let r=t.distanceTo(e)*.5,a=-this.direction.dot(qs),o=In.dot(this.direction),c=-In.dot(qs),l=In.lengthSq(),h=Math.abs(1-a*a),u,d,p,g;if(h>0)if(u=a*c-o,d=a*o-c,g=r*h,u>=0)if(d>=-g)if(d<=g){let _=1/h;u*=_,d*=_,p=u*(u+a*d+2*o)+d*(a*u+d+2*c)+l}else d=r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*c)+l;else d=-r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*c)+l;else d<=-g?(u=Math.max(0,-(-a*r+o)),d=u>0?-r:Math.min(Math.max(-r,-c),r),p=-u*u+d*(d+2*c)+l):d<=g?(u=0,d=Math.min(Math.max(-r,-c),r),p=d*(d+2*c)+l):(u=Math.max(0,-(a*r+o)),d=u>0?r:Math.min(Math.max(-r,-c),r),p=-u*u+d*(d+2*c)+l);else d=a>0?-r:r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Ba).addScaledVector(qs,d),p}intersectSphere(t,e){gn.subVectors(t.center,this.origin);let n=gn.dot(this.direction),s=gn.dot(gn)-n*n,r=t.radius*t.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,e):this.at(o,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,c,l=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return l>=0?(n=(t.min.x-d.x)*l,s=(t.max.x-d.x)*l):(n=(t.max.x-d.x)*l,s=(t.min.x-d.x)*l),h>=0?(r=(t.min.y-d.y)*h,a=(t.max.y-d.y)*h):(r=(t.max.y-d.y)*h,a=(t.min.y-d.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(t.min.z-d.z)*u,c=(t.max.z-d.z)*u):(o=(t.max.z-d.z)*u,c=(t.min.z-d.z)*u),n>c||o>s)||((o>n||n!==n)&&(n=o),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,gn)!==null}intersectTriangle(t,e,n,s,r){ka.subVectors(e,t),Ys.subVectors(n,t),za.crossVectors(ka,Ys);let a=this.direction.dot(za),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;In.subVectors(this.origin,t);let c=o*this.direction.dot(Ys.crossVectors(In,Ys));if(c<0)return null;let l=o*this.direction.dot(ka.cross(In));if(l<0||c+l>a)return null;let h=-o*In.dot(za);return h<0?null:this.at(h/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Zt=class i{constructor(t,e,n,s,r,a,o,c,l,h,u,d,p,g,_,f){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,c,l,h,u,d,p,g,_,f)}set(t,e,n,s,r,a,o,c,l,h,u,d,p,g,_,f){let m=this.elements;return m[0]=t,m[4]=e,m[8]=n,m[12]=s,m[1]=r,m[5]=a,m[9]=o,m[13]=c,m[2]=l,m[6]=h,m[10]=u,m[14]=d,m[3]=p,m[7]=g,m[11]=_,m[15]=f,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){let e=this.elements,n=t.elements,s=1/wi.setFromMatrixColumn(t,0).length(),r=1/wi.setFromMatrixColumn(t,1).length(),a=1/wi.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(s),l=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){let d=a*h,p=a*u,g=o*h,_=o*u;e[0]=c*h,e[4]=-c*u,e[8]=l,e[1]=p+g*l,e[5]=d-_*l,e[9]=-o*c,e[2]=_-d*l,e[6]=g+p*l,e[10]=a*c}else if(t.order==="YXZ"){let d=c*h,p=c*u,g=l*h,_=l*u;e[0]=d+_*o,e[4]=g*o-p,e[8]=a*l,e[1]=a*u,e[5]=a*h,e[9]=-o,e[2]=p*o-g,e[6]=_+d*o,e[10]=a*c}else if(t.order==="ZXY"){let d=c*h,p=c*u,g=l*h,_=l*u;e[0]=d-_*o,e[4]=-a*u,e[8]=g+p*o,e[1]=p+g*o,e[5]=a*h,e[9]=_-d*o,e[2]=-a*l,e[6]=o,e[10]=a*c}else if(t.order==="ZYX"){let d=a*h,p=a*u,g=o*h,_=o*u;e[0]=c*h,e[4]=g*l-p,e[8]=d*l+_,e[1]=c*u,e[5]=_*l+d,e[9]=p*l-g,e[2]=-l,e[6]=o*c,e[10]=a*c}else if(t.order==="YZX"){let d=a*c,p=a*l,g=o*c,_=o*l;e[0]=c*h,e[4]=_-d*u,e[8]=g*u+p,e[1]=u,e[5]=a*h,e[9]=-o*h,e[2]=-l*h,e[6]=p*u+g,e[10]=d-_*u}else if(t.order==="XZY"){let d=a*c,p=a*l,g=o*c,_=o*l;e[0]=c*h,e[4]=-u,e[8]=l*h,e[1]=d*u+_,e[5]=a*h,e[9]=p*u-g,e[2]=g*u-p,e[6]=o*h,e[10]=_*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(vd,t,yd)}lookAt(t,e,n){let s=this.elements;return Ge.subVectors(t,e),Ge.lengthSq()===0&&(Ge.z=1),Ge.normalize(),Dn.crossVectors(n,Ge),Dn.lengthSq()===0&&(Math.abs(n.z)===1?Ge.x+=1e-4:Ge.z+=1e-4,Ge.normalize(),Dn.crossVectors(n,Ge)),Dn.normalize(),$s.crossVectors(Ge,Dn),s[0]=Dn.x,s[4]=$s.x,s[8]=Ge.x,s[1]=Dn.y,s[5]=$s.y,s[9]=Ge.y,s[2]=Dn.z,s[6]=$s.z,s[10]=Ge.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],c=n[8],l=n[12],h=n[1],u=n[5],d=n[9],p=n[13],g=n[2],_=n[6],f=n[10],m=n[14],M=n[3],x=n[7],b=n[11],C=n[15],A=s[0],w=s[4],P=s[8],N=s[12],v=s[1],T=s[5],W=s[9],J=s[13],I=s[2],G=s[6],z=s[10],Z=s[14],q=s[3],Y=s[7],it=s[11],et=s[15];return r[0]=a*A+o*v+c*I+l*q,r[4]=a*w+o*T+c*G+l*Y,r[8]=a*P+o*W+c*z+l*it,r[12]=a*N+o*J+c*Z+l*et,r[1]=h*A+u*v+d*I+p*q,r[5]=h*w+u*T+d*G+p*Y,r[9]=h*P+u*W+d*z+p*it,r[13]=h*N+u*J+d*Z+p*et,r[2]=g*A+_*v+f*I+m*q,r[6]=g*w+_*T+f*G+m*Y,r[10]=g*P+_*W+f*z+m*it,r[14]=g*N+_*J+f*Z+m*et,r[3]=M*A+x*v+b*I+C*q,r[7]=M*w+x*T+b*G+C*Y,r[11]=M*P+x*W+b*z+C*it,r[15]=M*N+x*J+b*Z+C*et,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],c=t[9],l=t[13],h=t[2],u=t[6],d=t[10],p=t[14],g=t[3],_=t[7],f=t[11],m=t[15];return g*(+r*c*u-s*l*u-r*o*d+n*l*d+s*o*p-n*c*p)+_*(+e*c*p-e*l*d+r*a*d-s*a*p+s*l*h-r*c*h)+f*(+e*l*u-e*o*p-r*a*u+n*a*p+r*o*h-n*l*h)+m*(-s*o*h-e*c*u+e*o*d+s*a*u-n*a*d+n*c*h)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],c=t[6],l=t[7],h=t[8],u=t[9],d=t[10],p=t[11],g=t[12],_=t[13],f=t[14],m=t[15],M=u*f*l-_*d*l+_*c*p-o*f*p-u*c*m+o*d*m,x=g*d*l-h*f*l-g*c*p+a*f*p+h*c*m-a*d*m,b=h*_*l-g*u*l+g*o*p-a*_*p-h*o*m+a*u*m,C=g*u*c-h*_*c-g*o*d+a*_*d+h*o*f-a*u*f,A=e*M+n*x+s*b+r*C;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let w=1/A;return t[0]=M*w,t[1]=(_*d*r-u*f*r-_*s*p+n*f*p+u*s*m-n*d*m)*w,t[2]=(o*f*r-_*c*r+_*s*l-n*f*l-o*s*m+n*c*m)*w,t[3]=(u*c*r-o*d*r-u*s*l+n*d*l+o*s*p-n*c*p)*w,t[4]=x*w,t[5]=(h*f*r-g*d*r+g*s*p-e*f*p-h*s*m+e*d*m)*w,t[6]=(g*c*r-a*f*r-g*s*l+e*f*l+a*s*m-e*c*m)*w,t[7]=(a*d*r-h*c*r+h*s*l-e*d*l-a*s*p+e*c*p)*w,t[8]=b*w,t[9]=(g*u*r-h*_*r-g*n*p+e*_*p+h*n*m-e*u*m)*w,t[10]=(a*_*r-g*o*r+g*n*l-e*_*l-a*n*m+e*o*m)*w,t[11]=(h*o*r-a*u*r-h*n*l+e*u*l+a*n*p-e*o*p)*w,t[12]=C*w,t[13]=(h*_*s-g*u*s+g*n*d-e*_*d-h*n*f+e*u*f)*w,t[14]=(g*o*s-a*_*s-g*n*c+e*_*c+a*n*f-e*o*f)*w,t[15]=(a*u*s-h*o*s+h*n*c-e*u*c-a*n*d+e*o*d)*w,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,c=t.z,l=r*a,h=r*o;return this.set(l*a+n,l*o-s*c,l*c+s*o,0,l*o+s*c,h*o+n,h*c-s*a,0,l*c-s*o,h*c+s*a,r*c*c+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,a=e._y,o=e._z,c=e._w,l=r+r,h=a+a,u=o+o,d=r*l,p=r*h,g=r*u,_=a*h,f=a*u,m=o*u,M=c*l,x=c*h,b=c*u,C=n.x,A=n.y,w=n.z;return s[0]=(1-(_+m))*C,s[1]=(p+b)*C,s[2]=(g-x)*C,s[3]=0,s[4]=(p-b)*A,s[5]=(1-(d+m))*A,s[6]=(f+M)*A,s[7]=0,s[8]=(g+x)*w,s[9]=(f-M)*w,s[10]=(1-(d+_))*w,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements,r=wi.set(s[0],s[1],s[2]).length(),a=wi.set(s[4],s[5],s[6]).length(),o=wi.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],Qe.copy(this);let l=1/r,h=1/a,u=1/o;return Qe.elements[0]*=l,Qe.elements[1]*=l,Qe.elements[2]*=l,Qe.elements[4]*=h,Qe.elements[5]*=h,Qe.elements[6]*=h,Qe.elements[8]*=u,Qe.elements[9]*=u,Qe.elements[10]*=u,e.setFromRotationMatrix(Qe),n.x=r,n.y=a,n.z=o,this}makePerspective(t,e,n,s,r,a,o=Sn){let c=this.elements,l=2*r/(e-t),h=2*r/(n-s),u=(e+t)/(e-t),d=(n+s)/(n-s),p,g;if(o===Sn)p=-(a+r)/(a-r),g=-2*a*r/(a-r);else if(o===Tr)p=-a/(a-r),g=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=l,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=h,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=g,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=Sn){let c=this.elements,l=1/(e-t),h=1/(n-s),u=1/(a-r),d=(e+t)*l,p=(n+s)*h,g,_;if(o===Sn)g=(a+r)*u,_=-2*u;else if(o===Tr)g=r*u,_=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=2*l,c[4]=0,c[8]=0,c[12]=-d,c[1]=0,c[5]=2*h,c[9]=0,c[13]=-p,c[2]=0,c[6]=0,c[10]=_,c[14]=-g,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},wi=new L,Qe=new Zt,vd=new L(0,0,0),yd=new L(1,1,1),Dn=new L,$s=new L,Ge=new L,_l=new Zt,vl=new Ze,ke=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],a=s[4],o=s[8],c=s[1],l=s[5],h=s[9],u=s[2],d=s[6],p=s[10];switch(e){case"XYZ":this._y=Math.asin(Re(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Re(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Re(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Re(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(Re(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-Re(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return _l.makeRotationFromQuaternion(t),this.setFromRotationMatrix(_l,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return vl.setFromEuler(this),this.setFromQuaternion(vl,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};ke.DEFAULT_ORDER="XYZ";var Ir=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},Md=0,yl=new L,Ei=new Ze,xn=new Zt,Zs=new L,ds=new L,bd=new L,Sd=new Ze,Ml=new L(1,0,0),bl=new L(0,1,0),Sl=new L(0,0,1),wd={type:"added"},Ed={type:"removed"},Ha={type:"childadded",child:null},Va={type:"childremoved",child:null},Se=class i extends Vn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Md++}),this.uuid=wn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new L,e=new ke,n=new Ze,s=new L(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Zt},normalMatrix:{value:new Ht}}),this.matrix=new Zt,this.matrixWorld=new Zt,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ir,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Ei.setFromAxisAngle(t,e),this.quaternion.multiply(Ei),this}rotateOnWorldAxis(t,e){return Ei.setFromAxisAngle(t,e),this.quaternion.premultiply(Ei),this}rotateX(t){return this.rotateOnAxis(Ml,t)}rotateY(t){return this.rotateOnAxis(bl,t)}rotateZ(t){return this.rotateOnAxis(Sl,t)}translateOnAxis(t,e){return yl.copy(t).applyQuaternion(this.quaternion),this.position.add(yl.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Ml,t)}translateY(t){return this.translateOnAxis(bl,t)}translateZ(t){return this.translateOnAxis(Sl,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(xn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Zs.copy(t):Zs.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),ds.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?xn.lookAt(ds,Zs,this.up):xn.lookAt(Zs,ds,this.up),this.quaternion.setFromRotationMatrix(xn),s&&(xn.extractRotation(s.matrixWorld),Ei.setFromRotationMatrix(xn),this.quaternion.premultiply(Ei.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.parent!==null&&t.parent.remove(t),t.parent=this,this.children.push(t),t.dispatchEvent(wd),Ha.child=t,this.dispatchEvent(Ha),Ha.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Ed),Va.child=t,this.dispatchEvent(Va),Va.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),xn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),xn.multiply(t.parent.matrixWorld)),t.applyMatrix4(xn),this.add(t),t.updateWorldMatrix(!1,!0),this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ds,t,bd),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ds,Sd,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++){let r=e[n];(r.matrixWorldAutoUpdate===!0||t===!0)&&r.updateMatrixWorld(t)}}updateWorldMatrix(t,e){let n=this.parent;if(t===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),e===!0){let s=this.children;for(let r=0,a=s.length;r<a;r++){let o=s[r];o.matrixWorldAutoUpdate===!0&&o.updateWorldMatrix(!1,!0)}}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),s.maxGeometryCount=this._maxGeometryCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){let u=c[l];r(t.shapes,u)}else r(t.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(r(t.materials,this.material[c]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];s.animations.push(r(t.animations,c))}}if(e){let o=a(t.geometries),c=a(t.materials),l=a(t.textures),h=a(t.images),u=a(t.shapes),d=a(t.skeletons),p=a(t.animations),g=a(t.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){let c=[];for(let l in o){let h=o[l];delete h.metadata,c.push(h)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}};Se.DEFAULT_UP=new L(0,1,0);Se.DEFAULT_MATRIX_AUTO_UPDATE=!0;Se.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var tn=new L,_n=new L,Ga=new L,vn=new L,Ti=new L,Ai=new L,wl=new L,Wa=new L,Xa=new L,qa=new L,ci=class i{constructor(t=new L,e=new L,n=new L){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),tn.subVectors(t,e),s.cross(tn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){tn.subVectors(s,e),_n.subVectors(n,e),Ga.subVectors(t,e);let a=tn.dot(tn),o=tn.dot(_n),c=tn.dot(Ga),l=_n.dot(_n),h=_n.dot(Ga),u=a*l-o*o;if(u===0)return r.set(0,0,0),null;let d=1/u,p=(l*c-o*h)*d,g=(a*h-o*c)*d;return r.set(1-p-g,g,p)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,vn)===null?!1:vn.x>=0&&vn.y>=0&&vn.x+vn.y<=1}static getInterpolation(t,e,n,s,r,a,o,c){return this.getBarycoord(t,e,n,s,vn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,vn.x),c.addScaledVector(a,vn.y),c.addScaledVector(o,vn.z),c)}static isFrontFacing(t,e,n,s){return tn.subVectors(n,e),_n.subVectors(t,e),tn.cross(_n).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return tn.subVectors(this.c,this.b),_n.subVectors(this.a,this.b),tn.cross(_n).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,a,o;Ti.subVectors(s,n),Ai.subVectors(r,n),Wa.subVectors(t,n);let c=Ti.dot(Wa),l=Ai.dot(Wa);if(c<=0&&l<=0)return e.copy(n);Xa.subVectors(t,s);let h=Ti.dot(Xa),u=Ai.dot(Xa);if(h>=0&&u<=h)return e.copy(s);let d=c*u-h*l;if(d<=0&&c>=0&&h<=0)return a=c/(c-h),e.copy(n).addScaledVector(Ti,a);qa.subVectors(t,r);let p=Ti.dot(qa),g=Ai.dot(qa);if(g>=0&&p<=g)return e.copy(r);let _=p*l-c*g;if(_<=0&&l>=0&&g<=0)return o=l/(l-g),e.copy(n).addScaledVector(Ai,o);let f=h*g-p*u;if(f<=0&&u-h>=0&&p-g>=0)return wl.subVectors(r,s),o=(u-h)/(u-h+(p-g)),e.copy(s).addScaledVector(wl,o);let m=1/(f+_+d);return a=_*m,o=d*m,e.copy(n).addScaledVector(Ti,a).addScaledVector(Ai,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Eh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Un={h:0,s:0,l:0},Js={h:0,s:0,l:0};function Ya(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var Et=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Fe){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Kt.toWorkingColorSpace(this,e),this}setRGB(t,e,n,s=Kt.workingColorSpace){return this.r=t,this.g=e,this.b=n,Kt.toWorkingColorSpace(this,s),this}setHSL(t,e,n,s=Kt.workingColorSpace){if(t=fd(t,1),e=Re(e,0,1),n=Re(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=Ya(a,r,t+1/3),this.g=Ya(a,r,t),this.b=Ya(a,r,t-1/3)}return Kt.toWorkingColorSpace(this,s),this}setStyle(t,e=Fe){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Fe){let n=Eh[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Wi(t.r),this.g=Wi(t.g),this.b=Wi(t.b),this}copyLinearToSRGB(t){return this.r=Da(t.r),this.g=Da(t.g),this.b=Da(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Fe){return Kt.fromWorkingColorSpace(Ae.copy(this),t),Math.round(Re(Ae.r*255,0,255))*65536+Math.round(Re(Ae.g*255,0,255))*256+Math.round(Re(Ae.b*255,0,255))}getHexString(t=Fe){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Kt.workingColorSpace){Kt.fromWorkingColorSpace(Ae.copy(this),e);let n=Ae.r,s=Ae.g,r=Ae.b,a=Math.max(n,s,r),o=Math.min(n,s,r),c,l,h=(o+a)/2;if(o===a)c=0,l=0;else{let u=a-o;switch(l=h<=.5?u/(a+o):u/(2-a-o),a){case n:c=(s-r)/u+(s<r?6:0);break;case s:c=(r-n)/u+2;break;case r:c=(n-s)/u+4;break}c/=6}return t.h=c,t.s=l,t.l=h,t}getRGB(t,e=Kt.workingColorSpace){return Kt.fromWorkingColorSpace(Ae.copy(this),e),t.r=Ae.r,t.g=Ae.g,t.b=Ae.b,t}getStyle(t=Fe){Kt.fromWorkingColorSpace(Ae.copy(this),t);let e=Ae.r,n=Ae.g,s=Ae.b;return t!==Fe?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Un),this.setHSL(Un.h+t,Un.s+e,Un.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Un),t.getHSL(Js);let n=La(Un.h,Js.h,e),s=La(Un.s,Js.s,e),r=La(Un.l,Js.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ae=new Et;Et.NAMES=Eh;var Td=0,An=class extends Vn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Td++}),this.uuid=wn(),this.name="",this.type="Material",this.blending=Gi,this.side=Hn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=oo,this.blendDst=co,this.blendEquation=ri,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Et(0,0,0),this.blendAlpha=0,this.depthFunc=yr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ul,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=vi,this.stencilZFail=vi,this.stencilZPass=vi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Gi&&(n.blending=this.blending),this.side!==Hn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==oo&&(n.blendSrc=this.blendSrc),this.blendDst!==co&&(n.blendDst=this.blendDst),this.blendEquation!==ri&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==yr&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==ul&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==vi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==vi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==vi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let c=r[o];delete c.metadata,a.push(c)}return a}if(e){let r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},ze=class extends An{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Et(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ke,this.combine=sc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}};var he=new L,Ks=new nt,ue=class{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=po,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=cn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}get updateRange(){return wh("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Ks.fromBufferAttribute(this,e),Ks.applyMatrix3(t),this.setXY(e,Ks.x,Ks.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)he.fromBufferAttribute(this,e),he.applyMatrix3(t),this.setXYZ(e,he.x,he.y,he.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)he.fromBufferAttribute(this,e),he.applyMatrix4(t),this.setXYZ(e,he.x,he.y,he.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)he.fromBufferAttribute(this,e),he.applyNormalMatrix(t),this.setXYZ(e,he.x,he.y,he.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)he.fromBufferAttribute(this,e),he.transformDirection(t),this.setXYZ(e,he.x,he.y,he.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=ln(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Jt(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=ln(e,this.array)),e}setX(t,e){return this.normalized&&(e=Jt(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=ln(e,this.array)),e}setY(t,e){return this.normalized&&(e=Jt(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=ln(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Jt(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=ln(e,this.array)),e}setW(t,e){return this.normalized&&(e=Jt(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=Jt(e,this.array),n=Jt(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=Jt(e,this.array),n=Jt(n,this.array),s=Jt(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=Jt(e,this.array),n=Jt(n,this.array),s=Jt(s,this.array),r=Jt(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==po&&(t.usage=this.usage),t}};var Dr=class extends ue{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var Ur=class extends ue{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var ee=class extends ue{constructor(t,e,n){super(new Float32Array(t),e,n)}},Ad=0,$e=new Zt,$a=new Se,Ri=new L,We=new Tn,fs=new Tn,_e=new L,de=class i extends Vn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Ad++}),this.uuid=wn(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Sh(t)?Ur:Dr)(t,1):this.index=t,this}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Ht().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return $e.makeRotationFromQuaternion(t),this.applyMatrix4($e),this}rotateX(t){return $e.makeRotationX(t),this.applyMatrix4($e),this}rotateY(t){return $e.makeRotationY(t),this.applyMatrix4($e),this}rotateZ(t){return $e.makeRotationZ(t),this.applyMatrix4($e),this}translate(t,e,n){return $e.makeTranslation(t,e,n),this.applyMatrix4($e),this}scale(t,e,n){return $e.makeScale(t,e,n),this.applyMatrix4($e),this}lookAt(t){return $a.lookAt(t),$a.updateMatrix(),this.applyMatrix4($a.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ri).negate(),this.translate(Ri.x,Ri.y,Ri.z),this}setFromPoints(t){let e=[];for(let n=0,s=t.length;n<s;n++){let r=t[n];e.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new ee(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Tn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];We.setFromBufferAttribute(r),this.morphTargetsRelative?(_e.addVectors(this.boundingBox.min,We.min),this.boundingBox.expandByPoint(_e),_e.addVectors(this.boundingBox.max,We.max),this.boundingBox.expandByPoint(_e)):(this.boundingBox.expandByPoint(We.min),this.boundingBox.expandByPoint(We.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Gn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(t){let n=this.boundingSphere.center;if(We.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];fs.setFromBufferAttribute(o),this.morphTargetsRelative?(_e.addVectors(We.min,fs.min),We.expandByPoint(_e),_e.addVectors(We.max,fs.max),We.expandByPoint(_e)):(We.expandByPoint(fs.min),We.expandByPoint(fs.max))}We.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)_e.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(_e));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],c=this.morphTargetsRelative;for(let l=0,h=o.count;l<h;l++)_e.fromBufferAttribute(o,l),c&&(Ri.fromBufferAttribute(t,l),_e.add(Ri)),s=Math.max(s,n.distanceToSquared(_e))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new ue(new Float32Array(4*n.count),4));let a=this.getAttribute("tangent"),o=[],c=[];for(let P=0;P<n.count;P++)o[P]=new L,c[P]=new L;let l=new L,h=new L,u=new L,d=new nt,p=new nt,g=new nt,_=new L,f=new L;function m(P,N,v){l.fromBufferAttribute(n,P),h.fromBufferAttribute(n,N),u.fromBufferAttribute(n,v),d.fromBufferAttribute(r,P),p.fromBufferAttribute(r,N),g.fromBufferAttribute(r,v),h.sub(l),u.sub(l),p.sub(d),g.sub(d);let T=1/(p.x*g.y-g.x*p.y);isFinite(T)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(u,-p.y).multiplyScalar(T),f.copy(u).multiplyScalar(p.x).addScaledVector(h,-g.x).multiplyScalar(T),o[P].add(_),o[N].add(_),o[v].add(_),c[P].add(f),c[N].add(f),c[v].add(f))}let M=this.groups;M.length===0&&(M=[{start:0,count:t.count}]);for(let P=0,N=M.length;P<N;++P){let v=M[P],T=v.start,W=v.count;for(let J=T,I=T+W;J<I;J+=3)m(t.getX(J+0),t.getX(J+1),t.getX(J+2))}let x=new L,b=new L,C=new L,A=new L;function w(P){C.fromBufferAttribute(s,P),A.copy(C);let N=o[P];x.copy(N),x.sub(C.multiplyScalar(C.dot(N))).normalize(),b.crossVectors(A,N);let T=b.dot(c[P])<0?-1:1;a.setXYZW(P,x.x,x.y,x.z,T)}for(let P=0,N=M.length;P<N;++P){let v=M[P],T=v.start,W=v.count;for(let J=T,I=T+W;J<I;J+=3)w(t.getX(J+0)),w(t.getX(J+1)),w(t.getX(J+2))}}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new ue(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,p=n.count;d<p;d++)n.setXYZ(d,0,0,0);let s=new L,r=new L,a=new L,o=new L,c=new L,l=new L,h=new L,u=new L;if(t)for(let d=0,p=t.count;d<p;d+=3){let g=t.getX(d+0),_=t.getX(d+1),f=t.getX(d+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,_),a.fromBufferAttribute(e,f),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),o.fromBufferAttribute(n,g),c.fromBufferAttribute(n,_),l.fromBufferAttribute(n,f),o.add(h),c.add(h),l.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(_,c.x,c.y,c.z),n.setXYZ(f,l.x,l.y,l.z)}else for(let d=0,p=e.count;d<p;d+=3)s.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),a.fromBufferAttribute(e,d+2),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)_e.fromBufferAttribute(t,e),_e.normalize(),t.setXYZ(e,_e.x,_e.y,_e.z)}toNonIndexed(){function t(o,c){let l=o.array,h=o.itemSize,u=o.normalized,d=new l.constructor(c.length*h),p=0,g=0;for(let _=0,f=c.length;_<f;_++){o.isInterleavedBufferAttribute?p=c[_]*o.data.stride+o.offset:p=c[_]*h;for(let m=0;m<h;m++)d[g++]=l[p++]}return new ue(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let o in s){let c=s[o],l=t(c,n);e.setAttribute(o,l)}let r=this.morphAttributes;for(let o in r){let c=[],l=r[o];for(let h=0,u=l.length;h<u;h++){let d=l[h],p=t(d,n);c.push(p)}e.morphAttributes[o]=c}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let l=a[o];e.addGroup(l.start,l.count,l.materialIndex)}return e}toJSON(){let t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(t[l]=c[l]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let c in n){let l=n[c];t.data.attributes[c]=l.toJSON(t.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],h=[];for(let u=0,d=l.length;u<d;u++){let p=l[u];h.push(p.toJSON(t.data))}h.length>0&&(s[c]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone(e));let s=t.attributes;for(let l in s){let h=s[l];this.setAttribute(l,h.clone(e))}let r=t.morphAttributes;for(let l in r){let h=[],u=r[l];for(let d=0,p=u.length;d<p;d++)h.push(u[d].clone(e));this.morphAttributes[l]=h}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let l=0,h=a.length;l<h;l++){let u=a[l];this.addGroup(u.start,u.count,u.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},El=new Zt,ti=new Lr,js=new Gn,Tl=new L,Ci=new L,Pi=new L,Li=new L,Za=new L,Qs=new L,tr=new nt,er=new nt,nr=new nt,Al=new L,Rl=new L,Cl=new L,ir=new L,sr=new L,jt=class extends Se{constructor(t=new de,e=new ze){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(r&&o){Qs.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let h=o[c],u=r[c];h!==0&&(Za.fromBufferAttribute(u,t),a?Qs.addScaledVector(Za,h):Qs.addScaledVector(Za.sub(e),h))}e.add(Qs)}return e}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),js.copy(n.boundingSphere),js.applyMatrix4(r),ti.copy(t.ray).recast(t.near),!(js.containsPoint(ti.origin)===!1&&(ti.intersectSphere(js,Tl)===null||ti.origin.distanceToSquared(Tl)>(t.far-t.near)**2))&&(El.copy(r).invert(),ti.copy(t.ray).applyMatrix4(El),!(n.boundingBox!==null&&ti.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,ti)))}_computeIntersections(t,e,n){let s,r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,_=d.length;g<_;g++){let f=d[g],m=a[f.materialIndex],M=Math.max(f.start,p.start),x=Math.min(o.count,Math.min(f.start+f.count,p.start+p.count));for(let b=M,C=x;b<C;b+=3){let A=o.getX(b),w=o.getX(b+1),P=o.getX(b+2);s=rr(this,m,t,n,l,h,u,A,w,P),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=f.materialIndex,e.push(s))}}else{let g=Math.max(0,p.start),_=Math.min(o.count,p.start+p.count);for(let f=g,m=_;f<m;f+=3){let M=o.getX(f),x=o.getX(f+1),b=o.getX(f+2);s=rr(this,a,t,n,l,h,u,M,x,b),s&&(s.faceIndex=Math.floor(f/3),e.push(s))}}else if(c!==void 0)if(Array.isArray(a))for(let g=0,_=d.length;g<_;g++){let f=d[g],m=a[f.materialIndex],M=Math.max(f.start,p.start),x=Math.min(c.count,Math.min(f.start+f.count,p.start+p.count));for(let b=M,C=x;b<C;b+=3){let A=b,w=b+1,P=b+2;s=rr(this,m,t,n,l,h,u,A,w,P),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=f.materialIndex,e.push(s))}}else{let g=Math.max(0,p.start),_=Math.min(c.count,p.start+p.count);for(let f=g,m=_;f<m;f+=3){let M=f,x=f+1,b=f+2;s=rr(this,a,t,n,l,h,u,M,x,b),s&&(s.faceIndex=Math.floor(f/3),e.push(s))}}}};function Rd(i,t,e,n,s,r,a,o){let c;if(t.side===Pe?c=n.intersectTriangle(a,r,s,!0,o):c=n.intersectTriangle(s,r,a,t.side===Hn,o),c===null)return null;sr.copy(o),sr.applyMatrix4(i.matrixWorld);let l=e.ray.origin.distanceTo(sr);return l<e.near||l>e.far?null:{distance:l,point:sr.clone(),object:i}}function rr(i,t,e,n,s,r,a,o,c,l){i.getVertexPosition(o,Ci),i.getVertexPosition(c,Pi),i.getVertexPosition(l,Li);let h=Rd(i,t,e,n,Ci,Pi,Li,ir);if(h){s&&(tr.fromBufferAttribute(s,o),er.fromBufferAttribute(s,c),nr.fromBufferAttribute(s,l),h.uv=ci.getInterpolation(ir,Ci,Pi,Li,tr,er,nr,new nt)),r&&(tr.fromBufferAttribute(r,o),er.fromBufferAttribute(r,c),nr.fromBufferAttribute(r,l),h.uv1=ci.getInterpolation(ir,Ci,Pi,Li,tr,er,nr,new nt)),a&&(Al.fromBufferAttribute(a,o),Rl.fromBufferAttribute(a,c),Cl.fromBufferAttribute(a,l),h.normal=ci.getInterpolation(ir,Ci,Pi,Li,Al,Rl,Cl,new L),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:c,c:l,normal:new L,materialIndex:0};ci.getNormal(Ci,Pi,Li,u.normal),h.face=u}return h}var Rn=class i extends de{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let c=[],l=[],h=[],u=[],d=0,p=0;g("z","y","x",-1,-1,n,e,t,a,r,0),g("z","y","x",1,-1,n,e,-t,a,r,1),g("x","z","y",1,1,t,n,e,s,a,2),g("x","z","y",1,-1,t,n,-e,s,a,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new ee(l,3)),this.setAttribute("normal",new ee(h,3)),this.setAttribute("uv",new ee(u,2));function g(_,f,m,M,x,b,C,A,w,P,N){let v=b/w,T=C/P,W=b/2,J=C/2,I=A/2,G=w+1,z=P+1,Z=0,q=0,Y=new L;for(let it=0;it<z;it++){let et=it*T-J;for(let xt=0;xt<G;xt++){let Dt=xt*v-W;Y[_]=Dt*M,Y[f]=et*x,Y[m]=I,l.push(Y.x,Y.y,Y.z),Y[_]=0,Y[f]=0,Y[m]=A>0?1:-1,h.push(Y.x,Y.y,Y.z),u.push(xt/w),u.push(1-it/P),Z+=1}}for(let it=0;it<P;it++)for(let et=0;et<w;et++){let xt=d+et+G*it,Dt=d+et+G*(it+1),H=d+(et+1)+G*(it+1),Q=d+(et+1)+G*it;c.push(xt,Dt,Q),c.push(Dt,H,Q),q+=6}o.addGroup(p,q,N),p+=q,d+=Z}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function Zi(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function De(i){let t={};for(let e=0;e<i.length;e++){let n=Zi(i[e]);for(let s in n)t[s]=n[s]}return t}function Cd(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Th(i){return i.getRenderTarget()===null?i.outputColorSpace:Kt.workingColorSpace}var Pd={clone:Zi,merge:De},Ld=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Id=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Je=class extends An{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ld,this.fragmentShader=Id,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Zi(t.uniforms),this.uniformsGroups=Cd(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}},Nr=class extends Se{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Zt,this.projectionMatrix=new Zt,this.projectionMatrixInverse=new Zt,this.coordinateSystem=Sn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Nn=new L,Pl=new nt,Ll=new nt,Ue=class extends Nr{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=go*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Pa*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return go*2*Math.atan(Math.tan(Pa*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Nn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Nn.x,Nn.y).multiplyScalar(-t/Nn.z),Nn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Nn.x,Nn.y).multiplyScalar(-t/Nn.z)}getViewSize(t,e){return this.getViewBounds(t,Pl,Ll),e.subVectors(Ll,Pl)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Pa*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,l=a.fullHeight;r+=a.offsetX*s/c,e-=a.offsetY*n/l,s*=a.width/c,n*=a.height/l}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},Ii=-90,Di=1,yo=class extends Se{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Ue(Ii,Di,t,e);s.layers=this.layers,this.add(s);let r=new Ue(Ii,Di,t,e);r.layers=this.layers,this.add(r);let a=new Ue(Ii,Di,t,e);a.layers=this.layers,this.add(a);let o=new Ue(Ii,Di,t,e);o.layers=this.layers,this.add(o);let c=new Ue(Ii,Di,t,e);c.layers=this.layers,this.add(c);let l=new Ue(Ii,Di,t,e);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,c]=e;for(let l of e)this.remove(l);if(t===Sn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===Tr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let l of e)this.add(l),l.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,c,l,h]=this.children,u=t.getRenderTarget(),d=t.getActiveCubeFace(),p=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,a),t.setRenderTarget(n,2,s),t.render(e,o),t.setRenderTarget(n,3,s),t.render(e,c),t.setRenderTarget(n,4,s),t.render(e,l),n.texture.generateMipmaps=_,t.setRenderTarget(n,5,s),t.render(e,h),t.setRenderTarget(u,d,p),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},Or=class extends Be{constructor(t,e,n,s,r,a,o,c,l,h){t=t!==void 0?t:[],e=e!==void 0?e:qi,super(t,e,n,s,r,a,o,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Mo=class extends En{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new Or(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:Oe}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Rn(5,5,5),r=new Je({name:"CubemapFromEquirect",uniforms:Zi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Pe,blending:Bn});r.uniforms.tEquirect.value=e;let a=new jt(s,r),o=e.minFilter;return e.minFilter===oi&&(e.minFilter=Oe),new yo(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e,n,s){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}},Ja=new L,Dd=new L,Ud=new Ht,Mn=class{constructor(t=new L(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=Ja.subVectors(n,e).cross(Dd.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){let n=t.delta(Ja),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Ud.getNormalMatrix(t),s=this.coplanarPoint(Ja).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},ei=new Gn,ar=new L,ws=class{constructor(t=new Mn,e=new Mn,n=new Mn,s=new Mn,r=new Mn,a=new Mn){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Sn){let n=this.planes,s=t.elements,r=s[0],a=s[1],o=s[2],c=s[3],l=s[4],h=s[5],u=s[6],d=s[7],p=s[8],g=s[9],_=s[10],f=s[11],m=s[12],M=s[13],x=s[14],b=s[15];if(n[0].setComponents(c-r,d-l,f-p,b-m).normalize(),n[1].setComponents(c+r,d+l,f+p,b+m).normalize(),n[2].setComponents(c+a,d+h,f+g,b+M).normalize(),n[3].setComponents(c-a,d-h,f-g,b-M).normalize(),n[4].setComponents(c-o,d-u,f-_,b-x).normalize(),e===Sn)n[5].setComponents(c+o,d+u,f+_,b+x).normalize();else if(e===Tr)n[5].setComponents(o,u,_,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),ei.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),ei.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(ei)}intersectsSprite(t){return ei.center.set(0,0,0),ei.radius=.7071067811865476,ei.applyMatrix4(t.matrixWorld),this.intersectsSphere(ei)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(ar.x=s.normal.x>0?t.max.x:t.min.x,ar.y=s.normal.y>0?t.max.y:t.min.y,ar.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(ar)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function Ah(){let i=null,t=!1,e=null,n=null;function s(r,a){e(r,a),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Nd(i,t){let e=t.isWebGL2,n=new WeakMap;function s(l,h){let u=l.array,d=l.usage,p=u.byteLength,g=i.createBuffer();i.bindBuffer(h,g),i.bufferData(h,u,d),l.onUploadCallback();let _;if(u instanceof Float32Array)_=i.FLOAT;else if(u instanceof Uint16Array)if(l.isFloat16BufferAttribute)if(e)_=i.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else _=i.UNSIGNED_SHORT;else if(u instanceof Int16Array)_=i.SHORT;else if(u instanceof Uint32Array)_=i.UNSIGNED_INT;else if(u instanceof Int32Array)_=i.INT;else if(u instanceof Int8Array)_=i.BYTE;else if(u instanceof Uint8Array)_=i.UNSIGNED_BYTE;else if(u instanceof Uint8ClampedArray)_=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:g,type:_,bytesPerElement:u.BYTES_PER_ELEMENT,version:l.version,size:p}}function r(l,h,u){let d=h.array,p=h._updateRange,g=h.updateRanges;if(i.bindBuffer(u,l),p.count===-1&&g.length===0&&i.bufferSubData(u,0,d),g.length!==0){for(let _=0,f=g.length;_<f;_++){let m=g[_];e?i.bufferSubData(u,m.start*d.BYTES_PER_ELEMENT,d,m.start,m.count):i.bufferSubData(u,m.start*d.BYTES_PER_ELEMENT,d.subarray(m.start,m.start+m.count))}h.clearUpdateRanges()}p.count!==-1&&(e?i.bufferSubData(u,p.offset*d.BYTES_PER_ELEMENT,d,p.offset,p.count):i.bufferSubData(u,p.offset*d.BYTES_PER_ELEMENT,d.subarray(p.offset,p.offset+p.count)),p.count=-1),h.onUploadCallback()}function a(l){return l.isInterleavedBufferAttribute&&(l=l.data),n.get(l)}function o(l){l.isInterleavedBufferAttribute&&(l=l.data);let h=n.get(l);h&&(i.deleteBuffer(h.buffer),n.delete(l))}function c(l,h){if(l.isGLBufferAttribute){let d=n.get(l);(!d||d.version<l.version)&&n.set(l,{buffer:l.buffer,type:l.type,bytesPerElement:l.elementSize,version:l.version});return}l.isInterleavedBufferAttribute&&(l=l.data);let u=n.get(l);if(u===void 0)n.set(l,s(l,h));else if(u.version<l.version){if(u.size!==l.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(u.buffer,l,h),u.version=l.version}}return{get:a,remove:o,update:c}}var Ji=class i extends de{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,a=e/2,o=Math.floor(n),c=Math.floor(s),l=o+1,h=c+1,u=t/o,d=e/c,p=[],g=[],_=[],f=[];for(let m=0;m<h;m++){let M=m*d-a;for(let x=0;x<l;x++){let b=x*u-r;g.push(b,-M,0),_.push(0,0,1),f.push(x/o),f.push(1-m/c)}}for(let m=0;m<c;m++)for(let M=0;M<o;M++){let x=M+l*m,b=M+l*(m+1),C=M+1+l*(m+1),A=M+1+l*m;p.push(x,b,A),p.push(b,C,A)}this.setIndex(p),this.setAttribute("position",new ee(g,3)),this.setAttribute("normal",new ee(_,3)),this.setAttribute("uv",new ee(f,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}},Od=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Fd=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Bd=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,kd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,zd=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Hd=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Vd=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Gd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Wd=`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Xd=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,qd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Yd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,$d=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Zd=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Jd=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Kd=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,jd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Qd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,tf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,ef=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,nf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,sf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,rf=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,af=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,of=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,cf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,lf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,hf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,uf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,df=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,ff="gl_FragColor = linearToOutputTexel( gl_FragColor );",pf=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,mf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,gf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,xf=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,_f=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,vf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,yf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Mf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,bf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Sf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,wf=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Ef=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,Tf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Af=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Rf=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Cf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Pf=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Lf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,If=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Df=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Uf=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Nf=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Of=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Ff=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Bf=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,kf=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,zf=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Hf=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Vf=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,Gf=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,Wf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Xf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,qf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Yf=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,$f=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Zf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Jf=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[MORPHTARGETS_COUNT];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Kf=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,jf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,Qf=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
	#endif
	#ifdef MORPHTARGETS_TEXTURE
		#ifndef USE_INSTANCING_MORPH
			uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		#endif
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,tp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,ep=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,np=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,ip=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,sp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,rp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,ap=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,op=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,cp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,lp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,hp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,up=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,dp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,fp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,pp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,mp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,gp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,xp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,_p=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,vp=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,yp=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Mp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,bp=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Sp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,wp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Ep=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Tp=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Ap=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Rp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Cp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Pp=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	float startCompression = 0.8 - 0.04;
	float desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min(color.r, min(color.g, color.b));
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max(color.r, max(color.g, color.b));
	if (peak < startCompression) return color;
	float d = 1. - startCompression;
	float newPeak = 1. - d * d / (peak + d - startCompression);
	color *= newPeak / peak;
	float g = 1. - 1. / (desaturation * (peak - newPeak) + 1.);
	return mix(color, vec3(1, 1, 1), g);
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Lp=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Ip=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Dp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Up=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Np=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Op=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Fp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Bp=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,kp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,zp=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Hp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Vp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Gp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Wp=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,Xp=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,qp=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Yp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,$p=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Zp=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Jp=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Kp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,jp=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Qp=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,tm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,em=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,nm=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,im=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,sm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,rm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,am=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,om=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,cm=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,lm=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,hm=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,um=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,dm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,fm=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,pm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,mm=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,gm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,zt={alphahash_fragment:Od,alphahash_pars_fragment:Fd,alphamap_fragment:Bd,alphamap_pars_fragment:kd,alphatest_fragment:zd,alphatest_pars_fragment:Hd,aomap_fragment:Vd,aomap_pars_fragment:Gd,batching_pars_vertex:Wd,batching_vertex:Xd,begin_vertex:qd,beginnormal_vertex:Yd,bsdfs:$d,iridescence_fragment:Zd,bumpmap_pars_fragment:Jd,clipping_planes_fragment:Kd,clipping_planes_pars_fragment:jd,clipping_planes_pars_vertex:Qd,clipping_planes_vertex:tf,color_fragment:ef,color_pars_fragment:nf,color_pars_vertex:sf,color_vertex:rf,common:af,cube_uv_reflection_fragment:of,defaultnormal_vertex:cf,displacementmap_pars_vertex:lf,displacementmap_vertex:hf,emissivemap_fragment:uf,emissivemap_pars_fragment:df,colorspace_fragment:ff,colorspace_pars_fragment:pf,envmap_fragment:mf,envmap_common_pars_fragment:gf,envmap_pars_fragment:xf,envmap_pars_vertex:_f,envmap_physical_pars_fragment:Pf,envmap_vertex:vf,fog_vertex:yf,fog_pars_vertex:Mf,fog_fragment:bf,fog_pars_fragment:Sf,gradientmap_pars_fragment:wf,lightmap_fragment:Ef,lightmap_pars_fragment:Tf,lights_lambert_fragment:Af,lights_lambert_pars_fragment:Rf,lights_pars_begin:Cf,lights_toon_fragment:Lf,lights_toon_pars_fragment:If,lights_phong_fragment:Df,lights_phong_pars_fragment:Uf,lights_physical_fragment:Nf,lights_physical_pars_fragment:Of,lights_fragment_begin:Ff,lights_fragment_maps:Bf,lights_fragment_end:kf,logdepthbuf_fragment:zf,logdepthbuf_pars_fragment:Hf,logdepthbuf_pars_vertex:Vf,logdepthbuf_vertex:Gf,map_fragment:Wf,map_pars_fragment:Xf,map_particle_fragment:qf,map_particle_pars_fragment:Yf,metalnessmap_fragment:$f,metalnessmap_pars_fragment:Zf,morphinstance_vertex:Jf,morphcolor_vertex:Kf,morphnormal_vertex:jf,morphtarget_pars_vertex:Qf,morphtarget_vertex:tp,normal_fragment_begin:ep,normal_fragment_maps:np,normal_pars_fragment:ip,normal_pars_vertex:sp,normal_vertex:rp,normalmap_pars_fragment:ap,clearcoat_normal_fragment_begin:op,clearcoat_normal_fragment_maps:cp,clearcoat_pars_fragment:lp,iridescence_pars_fragment:hp,opaque_fragment:up,packing:dp,premultiplied_alpha_fragment:fp,project_vertex:pp,dithering_fragment:mp,dithering_pars_fragment:gp,roughnessmap_fragment:xp,roughnessmap_pars_fragment:_p,shadowmap_pars_fragment:vp,shadowmap_pars_vertex:yp,shadowmap_vertex:Mp,shadowmask_pars_fragment:bp,skinbase_vertex:Sp,skinning_pars_vertex:wp,skinning_vertex:Ep,skinnormal_vertex:Tp,specularmap_fragment:Ap,specularmap_pars_fragment:Rp,tonemapping_fragment:Cp,tonemapping_pars_fragment:Pp,transmission_fragment:Lp,transmission_pars_fragment:Ip,uv_pars_fragment:Dp,uv_pars_vertex:Up,uv_vertex:Np,worldpos_vertex:Op,background_vert:Fp,background_frag:Bp,backgroundCube_vert:kp,backgroundCube_frag:zp,cube_vert:Hp,cube_frag:Vp,depth_vert:Gp,depth_frag:Wp,distanceRGBA_vert:Xp,distanceRGBA_frag:qp,equirect_vert:Yp,equirect_frag:$p,linedashed_vert:Zp,linedashed_frag:Jp,meshbasic_vert:Kp,meshbasic_frag:jp,meshlambert_vert:Qp,meshlambert_frag:tm,meshmatcap_vert:em,meshmatcap_frag:nm,meshnormal_vert:im,meshnormal_frag:sm,meshphong_vert:rm,meshphong_frag:am,meshphysical_vert:om,meshphysical_frag:cm,meshtoon_vert:lm,meshtoon_frag:hm,points_vert:um,points_frag:dm,shadow_vert:fm,shadow_frag:pm,sprite_vert:mm,sprite_frag:gm},lt={common:{diffuse:{value:new Et(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ht},alphaMap:{value:null},alphaMapTransform:{value:new Ht},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ht}},envmap:{envMap:{value:null},envMapRotation:{value:new Ht},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ht}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ht}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ht},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ht},normalScale:{value:new nt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ht},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ht}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ht}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ht}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Et(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Et(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ht},alphaTest:{value:0},uvTransform:{value:new Ht}},sprite:{diffuse:{value:new Et(16777215)},opacity:{value:1},center:{value:new nt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ht},alphaMap:{value:null},alphaMapTransform:{value:new Ht},alphaTest:{value:0}}},on={basic:{uniforms:De([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.fog]),vertexShader:zt.meshbasic_vert,fragmentShader:zt.meshbasic_frag},lambert:{uniforms:De([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,lt.lights,{emissive:{value:new Et(0)}}]),vertexShader:zt.meshlambert_vert,fragmentShader:zt.meshlambert_frag},phong:{uniforms:De([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,lt.lights,{emissive:{value:new Et(0)},specular:{value:new Et(1118481)},shininess:{value:30}}]),vertexShader:zt.meshphong_vert,fragmentShader:zt.meshphong_frag},standard:{uniforms:De([lt.common,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.roughnessmap,lt.metalnessmap,lt.fog,lt.lights,{emissive:{value:new Et(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:zt.meshphysical_vert,fragmentShader:zt.meshphysical_frag},toon:{uniforms:De([lt.common,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.gradientmap,lt.fog,lt.lights,{emissive:{value:new Et(0)}}]),vertexShader:zt.meshtoon_vert,fragmentShader:zt.meshtoon_frag},matcap:{uniforms:De([lt.common,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,{matcap:{value:null}}]),vertexShader:zt.meshmatcap_vert,fragmentShader:zt.meshmatcap_frag},points:{uniforms:De([lt.points,lt.fog]),vertexShader:zt.points_vert,fragmentShader:zt.points_frag},dashed:{uniforms:De([lt.common,lt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:zt.linedashed_vert,fragmentShader:zt.linedashed_frag},depth:{uniforms:De([lt.common,lt.displacementmap]),vertexShader:zt.depth_vert,fragmentShader:zt.depth_frag},normal:{uniforms:De([lt.common,lt.bumpmap,lt.normalmap,lt.displacementmap,{opacity:{value:1}}]),vertexShader:zt.meshnormal_vert,fragmentShader:zt.meshnormal_frag},sprite:{uniforms:De([lt.sprite,lt.fog]),vertexShader:zt.sprite_vert,fragmentShader:zt.sprite_frag},background:{uniforms:{uvTransform:{value:new Ht},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:zt.background_vert,fragmentShader:zt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ht}},vertexShader:zt.backgroundCube_vert,fragmentShader:zt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:zt.cube_vert,fragmentShader:zt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:zt.equirect_vert,fragmentShader:zt.equirect_frag},distanceRGBA:{uniforms:De([lt.common,lt.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:zt.distanceRGBA_vert,fragmentShader:zt.distanceRGBA_frag},shadow:{uniforms:De([lt.lights,lt.fog,{color:{value:new Et(0)},opacity:{value:1}}]),vertexShader:zt.shadow_vert,fragmentShader:zt.shadow_frag}};on.physical={uniforms:De([on.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ht},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ht},clearcoatNormalScale:{value:new nt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ht},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ht},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ht},sheen:{value:0},sheenColor:{value:new Et(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ht},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ht},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ht},transmissionSamplerSize:{value:new nt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ht},attenuationDistance:{value:0},attenuationColor:{value:new Et(0)},specularColor:{value:new Et(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ht},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ht},anisotropyVector:{value:new nt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ht}}]),vertexShader:zt.meshphysical_vert,fragmentShader:zt.meshphysical_frag};var or={r:0,b:0,g:0},ni=new ke,xm=new Zt;function _m(i,t,e,n,s,r,a){let o=new Et(0),c=r===!0?0:1,l,h,u=null,d=0,p=null;function g(f,m){let M=!1,x=m.isScene===!0?m.background:null;x&&x.isTexture&&(x=(m.backgroundBlurriness>0?e:t).get(x)),x===null?_(o,c):x&&x.isColor&&(_(x,1),M=!0);let b=i.xr.getEnvironmentBlendMode();b==="additive"?n.buffers.color.setClear(0,0,0,1,a):b==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||M)&&i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil),x&&(x.isCubeTexture||x.mapping===sa)?(h===void 0&&(h=new jt(new Rn(1,1,1),new Je({name:"BackgroundCubeMaterial",uniforms:Zi(on.backgroundCube.uniforms),vertexShader:on.backgroundCube.vertexShader,fragmentShader:on.backgroundCube.fragmentShader,side:Pe,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(C,A,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),ni.copy(m.backgroundRotation),ni.x*=-1,ni.y*=-1,ni.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(ni.y*=-1,ni.z*=-1),h.material.uniforms.envMap.value=x,h.material.uniforms.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=m.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(xm.makeRotationFromEuler(ni)),h.material.toneMapped=Kt.getTransfer(x.colorSpace)!==ne,(u!==x||d!==x.version||p!==i.toneMapping)&&(h.material.needsUpdate=!0,u=x,d=x.version,p=i.toneMapping),h.layers.enableAll(),f.unshift(h,h.geometry,h.material,0,0,null)):x&&x.isTexture&&(l===void 0&&(l=new jt(new Ji(2,2),new Je({name:"BackgroundMaterial",uniforms:Zi(on.background.uniforms),vertexShader:on.background.vertexShader,fragmentShader:on.background.fragmentShader,side:Hn,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(l)),l.material.uniforms.t2D.value=x,l.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,l.material.toneMapped=Kt.getTransfer(x.colorSpace)!==ne,x.matrixAutoUpdate===!0&&x.updateMatrix(),l.material.uniforms.uvTransform.value.copy(x.matrix),(u!==x||d!==x.version||p!==i.toneMapping)&&(l.material.needsUpdate=!0,u=x,d=x.version,p=i.toneMapping),l.layers.enableAll(),f.unshift(l,l.geometry,l.material,0,0,null))}function _(f,m){f.getRGB(or,Th(i)),n.buffers.color.setClear(or.r,or.g,or.b,m,a)}return{getClearColor:function(){return o},setClearColor:function(f,m=1){o.set(f),c=m,_(o,c)},getClearAlpha:function(){return c},setClearAlpha:function(f){c=f,_(o,c)},render:g}}function vm(i,t,e,n){let s=i.getParameter(i.MAX_VERTEX_ATTRIBS),r=n.isWebGL2?null:t.get("OES_vertex_array_object"),a=n.isWebGL2||r!==null,o={},c=f(null),l=c,h=!1;function u(I,G,z,Z,q){let Y=!1;if(a){let it=_(Z,z,G);l!==it&&(l=it,p(l.object)),Y=m(I,Z,z,q),Y&&M(I,Z,z,q)}else{let it=G.wireframe===!0;(l.geometry!==Z.id||l.program!==z.id||l.wireframe!==it)&&(l.geometry=Z.id,l.program=z.id,l.wireframe=it,Y=!0)}q!==null&&e.update(q,i.ELEMENT_ARRAY_BUFFER),(Y||h)&&(h=!1,P(I,G,z,Z),q!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(q).buffer))}function d(){return n.isWebGL2?i.createVertexArray():r.createVertexArrayOES()}function p(I){return n.isWebGL2?i.bindVertexArray(I):r.bindVertexArrayOES(I)}function g(I){return n.isWebGL2?i.deleteVertexArray(I):r.deleteVertexArrayOES(I)}function _(I,G,z){let Z=z.wireframe===!0,q=o[I.id];q===void 0&&(q={},o[I.id]=q);let Y=q[G.id];Y===void 0&&(Y={},q[G.id]=Y);let it=Y[Z];return it===void 0&&(it=f(d()),Y[Z]=it),it}function f(I){let G=[],z=[],Z=[];for(let q=0;q<s;q++)G[q]=0,z[q]=0,Z[q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:G,enabledAttributes:z,attributeDivisors:Z,object:I,attributes:{},index:null}}function m(I,G,z,Z){let q=l.attributes,Y=G.attributes,it=0,et=z.getAttributes();for(let xt in et)if(et[xt].location>=0){let H=q[xt],Q=Y[xt];if(Q===void 0&&(xt==="instanceMatrix"&&I.instanceMatrix&&(Q=I.instanceMatrix),xt==="instanceColor"&&I.instanceColor&&(Q=I.instanceColor)),H===void 0||H.attribute!==Q||Q&&H.data!==Q.data)return!0;it++}return l.attributesNum!==it||l.index!==Z}function M(I,G,z,Z){let q={},Y=G.attributes,it=0,et=z.getAttributes();for(let xt in et)if(et[xt].location>=0){let H=Y[xt];H===void 0&&(xt==="instanceMatrix"&&I.instanceMatrix&&(H=I.instanceMatrix),xt==="instanceColor"&&I.instanceColor&&(H=I.instanceColor));let Q={};Q.attribute=H,H&&H.data&&(Q.data=H.data),q[xt]=Q,it++}l.attributes=q,l.attributesNum=it,l.index=Z}function x(){let I=l.newAttributes;for(let G=0,z=I.length;G<z;G++)I[G]=0}function b(I){C(I,0)}function C(I,G){let z=l.newAttributes,Z=l.enabledAttributes,q=l.attributeDivisors;z[I]=1,Z[I]===0&&(i.enableVertexAttribArray(I),Z[I]=1),q[I]!==G&&((n.isWebGL2?i:t.get("ANGLE_instanced_arrays"))[n.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](I,G),q[I]=G)}function A(){let I=l.newAttributes,G=l.enabledAttributes;for(let z=0,Z=G.length;z<Z;z++)G[z]!==I[z]&&(i.disableVertexAttribArray(z),G[z]=0)}function w(I,G,z,Z,q,Y,it){it===!0?i.vertexAttribIPointer(I,G,z,q,Y):i.vertexAttribPointer(I,G,z,Z,q,Y)}function P(I,G,z,Z){if(n.isWebGL2===!1&&(I.isInstancedMesh||Z.isInstancedBufferGeometry)&&t.get("ANGLE_instanced_arrays")===null)return;x();let q=Z.attributes,Y=z.getAttributes(),it=G.defaultAttributeValues;for(let et in Y){let xt=Y[et];if(xt.location>=0){let Dt=q[et];if(Dt===void 0&&(et==="instanceMatrix"&&I.instanceMatrix&&(Dt=I.instanceMatrix),et==="instanceColor"&&I.instanceColor&&(Dt=I.instanceColor)),Dt!==void 0){let H=Dt.normalized,Q=Dt.itemSize,pt=e.get(Dt);if(pt===void 0)continue;let Tt=pt.buffer,Mt=pt.type,vt=pt.bytesPerElement,Vt=n.isWebGL2===!0&&(Mt===i.INT||Mt===i.UNSIGNED_INT||Dt.gpuType===fh);if(Dt.isInterleavedBufferAttribute){let At=Dt.data,R=At.stride,at=Dt.offset;if(At.isInstancedInterleavedBuffer){for(let $=0;$<xt.locationSize;$++)C(xt.location+$,At.meshPerAttribute);I.isInstancedMesh!==!0&&Z._maxInstanceCount===void 0&&(Z._maxInstanceCount=At.meshPerAttribute*At.count)}else for(let $=0;$<xt.locationSize;$++)b(xt.location+$);i.bindBuffer(i.ARRAY_BUFFER,Tt);for(let $=0;$<xt.locationSize;$++)w(xt.location+$,Q/xt.locationSize,Mt,H,R*vt,(at+Q/xt.locationSize*$)*vt,Vt)}else{if(Dt.isInstancedBufferAttribute){for(let At=0;At<xt.locationSize;At++)C(xt.location+At,Dt.meshPerAttribute);I.isInstancedMesh!==!0&&Z._maxInstanceCount===void 0&&(Z._maxInstanceCount=Dt.meshPerAttribute*Dt.count)}else for(let At=0;At<xt.locationSize;At++)b(xt.location+At);i.bindBuffer(i.ARRAY_BUFFER,Tt);for(let At=0;At<xt.locationSize;At++)w(xt.location+At,Q/xt.locationSize,Mt,H,Q*vt,Q/xt.locationSize*At*vt,Vt)}}else if(it!==void 0){let H=it[et];if(H!==void 0)switch(H.length){case 2:i.vertexAttrib2fv(xt.location,H);break;case 3:i.vertexAttrib3fv(xt.location,H);break;case 4:i.vertexAttrib4fv(xt.location,H);break;default:i.vertexAttrib1fv(xt.location,H)}}}}A()}function N(){W();for(let I in o){let G=o[I];for(let z in G){let Z=G[z];for(let q in Z)g(Z[q].object),delete Z[q];delete G[z]}delete o[I]}}function v(I){if(o[I.id]===void 0)return;let G=o[I.id];for(let z in G){let Z=G[z];for(let q in Z)g(Z[q].object),delete Z[q];delete G[z]}delete o[I.id]}function T(I){for(let G in o){let z=o[G];if(z[I.id]===void 0)continue;let Z=z[I.id];for(let q in Z)g(Z[q].object),delete Z[q];delete z[I.id]}}function W(){J(),h=!0,l!==c&&(l=c,p(l.object))}function J(){c.geometry=null,c.program=null,c.wireframe=!1}return{setup:u,reset:W,resetDefaultState:J,dispose:N,releaseStatesOfGeometry:v,releaseStatesOfProgram:T,initAttributes:x,enableAttribute:b,disableUnusedAttributes:A}}function ym(i,t,e,n){let s=n.isWebGL2,r;function a(h){r=h}function o(h,u){i.drawArrays(r,h,u),e.update(u,r,1)}function c(h,u,d){if(d===0)return;let p,g;if(s)p=i,g="drawArraysInstanced";else if(p=t.get("ANGLE_instanced_arrays"),g="drawArraysInstancedANGLE",p===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}p[g](r,h,u,d),e.update(u,r,d)}function l(h,u,d){if(d===0)return;let p=t.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<d;g++)this.render(h[g],u[g]);else{p.multiDrawArraysWEBGL(r,h,0,u,0,d);let g=0;for(let _=0;_<d;_++)g+=u[_];e.update(g,r,1)}}this.setMode=a,this.render=o,this.renderInstances=c,this.renderMultiDraw=l}function Mm(i,t,e){let n;function s(){if(n!==void 0)return n;if(t.has("EXT_texture_filter_anisotropic")===!0){let w=t.get("EXT_texture_filter_anisotropic");n=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function r(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let a=typeof WebGL2RenderingContext!="undefined"&&i.constructor.name==="WebGL2RenderingContext",o=e.precision!==void 0?e.precision:"highp",c=r(o);c!==o&&(console.warn("THREE.WebGLRenderer:",o,"not supported, using",c,"instead."),o=c);let l=a||t.has("WEBGL_draw_buffers"),h=e.logarithmicDepthBuffer===!0,u=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),d=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),p=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),_=i.getParameter(i.MAX_VERTEX_ATTRIBS),f=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),m=i.getParameter(i.MAX_VARYING_VECTORS),M=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),x=d>0,b=a||t.has("OES_texture_float"),C=x&&b,A=a?i.getParameter(i.MAX_SAMPLES):0;return{isWebGL2:a,drawBuffers:l,getMaxAnisotropy:s,getMaxPrecision:r,precision:o,logarithmicDepthBuffer:h,maxTextures:u,maxVertexTextures:d,maxTextureSize:p,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:f,maxVaryings:m,maxFragmentUniforms:M,vertexTextures:x,floatFragmentTextures:b,floatVertexTextures:C,maxSamples:A}}function bm(i){let t=this,e=null,n=0,s=!1,r=!1,a=new Mn,o=new Ht,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let p=u.length!==0||d||n!==0||s;return s=d,n=u.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){e=h(u,d,0)},this.setState=function(u,d,p){let g=u.clippingPlanes,_=u.clipIntersection,f=u.clipShadows,m=i.get(u);if(!s||g===null||g.length===0||r&&!f)r?h(null):l();else{let M=r?0:n,x=M*4,b=m.clippingState||null;c.value=b,b=h(g,d,x,p);for(let C=0;C!==x;++C)b[C]=e[C];m.clippingState=b,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=M}};function l(){c.value!==e&&(c.value=e,c.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,d,p,g){let _=u!==null?u.length:0,f=null;if(_!==0){if(f=c.value,g!==!0||f===null){let m=p+_*4,M=d.matrixWorldInverse;o.getNormalMatrix(M),(f===null||f.length<m)&&(f=new Float32Array(m));for(let x=0,b=p;x!==_;++x,b+=4)a.copy(u[x]).applyMatrix4(M,o),a.normal.toArray(f,b),f[b+3]=a.constant}c.value=f,c.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,f}}function Sm(i){let t=new WeakMap;function e(a,o){return o===lo?a.mapping=qi:o===ho&&(a.mapping=Yi),a}function n(a){if(a&&a.isTexture){let o=a.mapping;if(o===lo||o===ho)if(t.has(a)){let c=t.get(a).texture;return e(c,a.mapping)}else{let c=a.image;if(c&&c.height>0){let l=new Mo(c.height);return l.fromEquirectangularTexture(i,a),t.set(a,l),a.addEventListener("dispose",s),e(l.texture,a.mapping)}else return null}}return a}function s(a){let o=a.target;o.removeEventListener("dispose",s);let c=t.get(o);c!==void 0&&(t.delete(o),c.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}var Fr=class extends Nr{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,a=n+t,o=s+e,c=s-e;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,a=r+l*this.view.width,o-=h*this.view.offsetY,c=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},zi=4,Il=[.125,.215,.35,.446,.526,.582],ai=20,Ka=new Fr,Dl=new Et,ja=null,Qa=0,to=0,si=(1+Math.sqrt(5))/2,Ui=1/si,Ul=[new L(1,1,1),new L(-1,1,1),new L(1,1,-1),new L(-1,1,-1),new L(0,si,Ui),new L(0,si,-Ui),new L(Ui,0,si),new L(-Ui,0,si),new L(si,Ui,0),new L(-si,Ui,0)],Br=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100){ja=this._renderer.getRenderTarget(),Qa=this._renderer.getActiveCubeFace(),to=this._renderer.getActiveMipmapLevel(),this._setSize(256);let r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,s,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Fl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ol(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(ja,Qa,to),t.scissorTest=!1,cr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===qi||t.mapping===Yi?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),ja=this._renderer.getRenderTarget(),Qa=this._renderer.getActiveCubeFace(),to=this._renderer.getActiveMipmapLevel();let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Oe,minFilter:Oe,generateMipmaps:!1,type:Ss,format:nn,colorSpace:Wn,depthBuffer:!1},s=Nl(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Nl(t,e,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=wm(r)),this._blurMaterial=Em(r,t,e)}return s}_compileMaterial(t){let e=new jt(this._lodPlanes[0],t);this._renderer.compile(e,Ka)}_sceneToCubeUV(t,e,n,s){let o=new Ue(90,1,e,n),c=[1,-1,1,1,1,1],l=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,d=h.toneMapping;h.getClearColor(Dl),h.toneMapping=kn,h.autoClear=!1;let p=new ze({name:"PMREM.Background",side:Pe,depthWrite:!1,depthTest:!1}),g=new jt(new Rn,p),_=!1,f=t.background;f?f.isColor&&(p.color.copy(f),t.background=null,_=!0):(p.color.copy(Dl),_=!0);for(let m=0;m<6;m++){let M=m%3;M===0?(o.up.set(0,c[m],0),o.lookAt(l[m],0,0)):M===1?(o.up.set(0,0,c[m]),o.lookAt(0,l[m],0)):(o.up.set(0,c[m],0),o.lookAt(0,0,l[m]));let x=this._cubeSize;cr(s,M*x,m>2?x:0,x,x),h.setRenderTarget(s),_&&h.render(g,o),h.render(t,o)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=d,h.autoClear=u,t.background=f}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===qi||t.mapping===Yi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Fl()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ol());let r=s?this._cubemapMaterial:this._equirectMaterial,a=new jt(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=t;let c=this._cubeSize;cr(e,0,0,3*c,2*c),n.setRenderTarget(e),n.render(a,Ka)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;for(let s=1;s<this._lodPlanes.length;s++){let r=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=Ul[(s-1)%Ul.length];this._blur(t,s-1,s,r,a)}e.autoClear=n}_blur(t,e,n,s,r){let a=this._pingPongRenderTarget;this._halfBlur(t,a,e,n,s,"latitudinal",r),this._halfBlur(a,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,a,o){let c=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,u=new jt(this._lodPlanes[s],l),d=l.uniforms,p=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*ai-1),_=r/g,f=isFinite(r)?1+Math.floor(h*_):ai;f>ai&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${f} samples when the maximum is set to ${ai}`);let m=[],M=0;for(let w=0;w<ai;++w){let P=w/_,N=Math.exp(-P*P/2);m.push(N),w===0?M+=N:w<f&&(M+=2*N)}for(let w=0;w<m.length;w++)m[w]=m[w]/M;d.envMap.value=t.texture,d.samples.value=f,d.weights.value=m,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);let{_lodMax:x}=this;d.dTheta.value=g,d.mipInt.value=x-n;let b=this._sizeLods[s],C=3*b*(s>x-zi?s-x+zi:0),A=4*(this._cubeSize-b);cr(e,C,A,3*b,2*b),c.setRenderTarget(e),c.render(u,Ka)}};function wm(i){let t=[],e=[],n=[],s=i,r=i-zi+1+Il.length;for(let a=0;a<r;a++){let o=Math.pow(2,s);e.push(o);let c=1/o;a>i-zi?c=Il[a-i+zi-1]:a===0&&(c=0),n.push(c);let l=1/(o-2),h=-l,u=1+l,d=[h,h,u,h,u,u,h,h,u,u,h,u],p=6,g=6,_=3,f=2,m=1,M=new Float32Array(_*g*p),x=new Float32Array(f*g*p),b=new Float32Array(m*g*p);for(let A=0;A<p;A++){let w=A%3*2/3-1,P=A>2?0:-1,N=[w,P,0,w+2/3,P,0,w+2/3,P+1,0,w,P,0,w+2/3,P+1,0,w,P+1,0];M.set(N,_*g*A),x.set(d,f*g*A);let v=[A,A,A,A,A,A];b.set(v,m*g*A)}let C=new de;C.setAttribute("position",new ue(M,_)),C.setAttribute("uv",new ue(x,f)),C.setAttribute("faceIndex",new ue(b,m)),t.push(C),s>zi&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function Nl(i,t,e){let n=new En(i,t,e);return n.texture.mapping=sa,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function cr(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function Em(i,t,e){let n=new Float32Array(ai),s=new L(0,1,0);return new Je({name:"SphericalGaussianBlur",defines:{n:ai,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:oc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Bn,depthTest:!1,depthWrite:!1})}function Ol(){return new Je({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:oc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Bn,depthTest:!1,depthWrite:!1})}function Fl(){return new Je({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:oc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Bn,depthTest:!1,depthWrite:!1})}function oc(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Tm(i){let t=new WeakMap,e=null;function n(o){if(o&&o.isTexture){let c=o.mapping,l=c===lo||c===ho,h=c===qi||c===Yi;if(l||h)if(o.isRenderTargetTexture&&o.needsPMREMUpdate===!0){o.needsPMREMUpdate=!1;let u=t.get(o);return e===null&&(e=new Br(i)),u=l?e.fromEquirectangular(o,u):e.fromCubemap(o,u),t.set(o,u),u.texture}else{if(t.has(o))return t.get(o).texture;{let u=o.image;if(l&&u&&u.height>0||h&&u&&s(u)){e===null&&(e=new Br(i));let d=l?e.fromEquirectangular(o):e.fromCubemap(o);return t.set(o,d),o.addEventListener("dispose",r),d.texture}else return null}}}return o}function s(o){let c=0,l=6;for(let h=0;h<l;h++)o[h]!==void 0&&c++;return c===l}function r(o){let c=o.target;c.removeEventListener("dispose",r);let l=t.get(c);l!==void 0&&(t.delete(c),l.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:a}}function Am(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(n){n.isWebGL2?(e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance")):(e("WEBGL_depth_texture"),e("OES_texture_float"),e("OES_texture_half_float"),e("OES_texture_half_float_linear"),e("OES_standard_derivatives"),e("OES_element_index_uint"),e("OES_vertex_array_object"),e("ANGLE_instanced_arrays")),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture")},get:function(n){let s=e(n);return s===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function Rm(i,t,e,n){let s={},r=new WeakMap;function a(u){let d=u.target;d.index!==null&&t.remove(d.index);for(let g in d.attributes)t.remove(d.attributes[g]);for(let g in d.morphAttributes){let _=d.morphAttributes[g];for(let f=0,m=_.length;f<m;f++)t.remove(_[f])}d.removeEventListener("dispose",a),delete s[d.id];let p=r.get(d);p&&(t.remove(p),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function o(u,d){return s[d.id]===!0||(d.addEventListener("dispose",a),s[d.id]=!0,e.memory.geometries++),d}function c(u){let d=u.attributes;for(let g in d)t.update(d[g],i.ARRAY_BUFFER);let p=u.morphAttributes;for(let g in p){let _=p[g];for(let f=0,m=_.length;f<m;f++)t.update(_[f],i.ARRAY_BUFFER)}}function l(u){let d=[],p=u.index,g=u.attributes.position,_=0;if(p!==null){let M=p.array;_=p.version;for(let x=0,b=M.length;x<b;x+=3){let C=M[x+0],A=M[x+1],w=M[x+2];d.push(C,A,A,w,w,C)}}else if(g!==void 0){let M=g.array;_=g.version;for(let x=0,b=M.length/3-1;x<b;x+=3){let C=x+0,A=x+1,w=x+2;d.push(C,A,A,w,w,C)}}else return;let f=new(Sh(d)?Ur:Dr)(d,1);f.version=_;let m=r.get(u);m&&t.remove(m),r.set(u,f)}function h(u){let d=r.get(u);if(d){let p=u.index;p!==null&&d.version<p.version&&l(u)}else l(u);return r.get(u)}return{get:o,update:c,getWireframeAttribute:h}}function Cm(i,t,e,n){let s=n.isWebGL2,r;function a(p){r=p}let o,c;function l(p){o=p.type,c=p.bytesPerElement}function h(p,g){i.drawElements(r,g,o,p*c),e.update(g,r,1)}function u(p,g,_){if(_===0)return;let f,m;if(s)f=i,m="drawElementsInstanced";else if(f=t.get("ANGLE_instanced_arrays"),m="drawElementsInstancedANGLE",f===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}f[m](r,g,o,p*c,_),e.update(g,r,_)}function d(p,g,_){if(_===0)return;let f=t.get("WEBGL_multi_draw");if(f===null)for(let m=0;m<_;m++)this.render(p[m]/c,g[m]);else{f.multiDrawElementsWEBGL(r,g,0,o,p,0,_);let m=0;for(let M=0;M<_;M++)m+=g[M];e.update(m,r,1)}}this.setMode=a,this.setIndex=l,this.render=h,this.renderInstances=u,this.renderMultiDraw=d}function Pm(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Lm(i,t){return i[0]-t[0]}function Im(i,t){return Math.abs(t[1])-Math.abs(i[1])}function Dm(i,t,e){let n={},s=new Float32Array(8),r=new WeakMap,a=new ve,o=[];for(let l=0;l<8;l++)o[l]=[l,0];function c(l,h,u){let d=l.morphTargetInfluences;if(t.isWebGL2===!0){let p=h.morphAttributes.position||h.morphAttributes.normal||h.morphAttributes.color,g=p!==void 0?p.length:0,_=r.get(h);if(_===void 0||_.count!==g){let W=function(){v.dispose(),r.delete(h),h.removeEventListener("dispose",W)};_!==void 0&&_.texture.dispose();let f=h.morphAttributes.position!==void 0,m=h.morphAttributes.normal!==void 0,M=h.morphAttributes.color!==void 0,x=h.morphAttributes.position||[],b=h.morphAttributes.normal||[],C=h.morphAttributes.color||[],A=0;f===!0&&(A=1),m===!0&&(A=2),M===!0&&(A=3);let w=h.attributes.position.count*A,P=1;w>t.maxTextureSize&&(P=Math.ceil(w/t.maxTextureSize),w=t.maxTextureSize);let N=new Float32Array(w*P*4*g),v=new Pr(N,w,P,g);v.type=cn,v.needsUpdate=!0;let T=A*4;for(let J=0;J<g;J++){let I=x[J],G=b[J],z=C[J],Z=w*P*4*J;for(let q=0;q<I.count;q++){let Y=q*T;f===!0&&(a.fromBufferAttribute(I,q),N[Z+Y+0]=a.x,N[Z+Y+1]=a.y,N[Z+Y+2]=a.z,N[Z+Y+3]=0),m===!0&&(a.fromBufferAttribute(G,q),N[Z+Y+4]=a.x,N[Z+Y+5]=a.y,N[Z+Y+6]=a.z,N[Z+Y+7]=0),M===!0&&(a.fromBufferAttribute(z,q),N[Z+Y+8]=a.x,N[Z+Y+9]=a.y,N[Z+Y+10]=a.z,N[Z+Y+11]=z.itemSize===4?a.w:1)}}_={count:g,texture:v,size:new nt(w,P)},r.set(h,_),h.addEventListener("dispose",W)}if(l.isInstancedMesh===!0&&l.morphTexture!==null)u.getUniforms().setValue(i,"morphTexture",l.morphTexture,e);else{let f=0;for(let M=0;M<d.length;M++)f+=d[M];let m=h.morphTargetsRelative?1:1-f;u.getUniforms().setValue(i,"morphTargetBaseInfluence",m),u.getUniforms().setValue(i,"morphTargetInfluences",d)}u.getUniforms().setValue(i,"morphTargetsTexture",_.texture,e),u.getUniforms().setValue(i,"morphTargetsTextureSize",_.size)}else{let p=d===void 0?0:d.length,g=n[h.id];if(g===void 0||g.length!==p){g=[];for(let x=0;x<p;x++)g[x]=[x,0];n[h.id]=g}for(let x=0;x<p;x++){let b=g[x];b[0]=x,b[1]=d[x]}g.sort(Im);for(let x=0;x<8;x++)x<p&&g[x][1]?(o[x][0]=g[x][0],o[x][1]=g[x][1]):(o[x][0]=Number.MAX_SAFE_INTEGER,o[x][1]=0);o.sort(Lm);let _=h.morphAttributes.position,f=h.morphAttributes.normal,m=0;for(let x=0;x<8;x++){let b=o[x],C=b[0],A=b[1];C!==Number.MAX_SAFE_INTEGER&&A?(_&&h.getAttribute("morphTarget"+x)!==_[C]&&h.setAttribute("morphTarget"+x,_[C]),f&&h.getAttribute("morphNormal"+x)!==f[C]&&h.setAttribute("morphNormal"+x,f[C]),s[x]=A,m+=A):(_&&h.hasAttribute("morphTarget"+x)===!0&&h.deleteAttribute("morphTarget"+x),f&&h.hasAttribute("morphNormal"+x)===!0&&h.deleteAttribute("morphNormal"+x),s[x]=0)}let M=h.morphTargetsRelative?1:1-m;u.getUniforms().setValue(i,"morphTargetBaseInfluence",M),u.getUniforms().setValue(i,"morphTargetInfluences",s)}}return{update:c}}function Um(i,t,e,n){let s=new WeakMap;function r(c){let l=n.render.frame,h=c.geometry,u=t.get(c,h);if(s.get(u)!==l&&(t.update(u),s.set(u,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",o)===!1&&c.addEventListener("dispose",o),s.get(c)!==l&&(e.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,i.ARRAY_BUFFER),s.set(c,l))),c.isSkinnedMesh){let d=c.skeleton;s.get(d)!==l&&(d.update(),s.set(d,l))}return u}function a(){s=new WeakMap}function o(c){let l=c.target;l.removeEventListener("dispose",o),e.remove(l.instanceMatrix),l.instanceColor!==null&&e.remove(l.instanceColor)}return{update:r,dispose:a}}var kr=class extends Be{constructor(t,e,n,s,r,a,o,c,l,h){if(h=h!==void 0?h:hi,h!==hi&&h!==$i)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===hi&&(n=Fn),n===void 0&&h===$i&&(n=li),super(null,s,r,a,o,c,h,n,l),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=o!==void 0?o:be,this.minFilter=c!==void 0?c:be,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}},Rh=new Be,Ch=new kr(1,1);Ch.compareFunction=bh;var Ph=new Pr,Lh=new vo,Ih=new Or,Bl=[],kl=[],zl=new Float32Array(16),Hl=new Float32Array(9),Vl=new Float32Array(4);function ns(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=Bl[s];if(r===void 0&&(r=new Float32Array(s),Bl[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function fe(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function pe(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function oa(i,t){let e=kl[t];e===void 0&&(e=new Int32Array(t),kl[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function Nm(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Om(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(fe(e,t))return;i.uniform2fv(this.addr,t),pe(e,t)}}function Fm(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(fe(e,t))return;i.uniform3fv(this.addr,t),pe(e,t)}}function Bm(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(fe(e,t))return;i.uniform4fv(this.addr,t),pe(e,t)}}function km(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(fe(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),pe(e,t)}else{if(fe(e,n))return;Vl.set(n),i.uniformMatrix2fv(this.addr,!1,Vl),pe(e,n)}}function zm(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(fe(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),pe(e,t)}else{if(fe(e,n))return;Hl.set(n),i.uniformMatrix3fv(this.addr,!1,Hl),pe(e,n)}}function Hm(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(fe(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),pe(e,t)}else{if(fe(e,n))return;zl.set(n),i.uniformMatrix4fv(this.addr,!1,zl),pe(e,n)}}function Vm(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function Gm(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(fe(e,t))return;i.uniform2iv(this.addr,t),pe(e,t)}}function Wm(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(fe(e,t))return;i.uniform3iv(this.addr,t),pe(e,t)}}function Xm(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(fe(e,t))return;i.uniform4iv(this.addr,t),pe(e,t)}}function qm(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function Ym(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(fe(e,t))return;i.uniform2uiv(this.addr,t),pe(e,t)}}function $m(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(fe(e,t))return;i.uniform3uiv(this.addr,t),pe(e,t)}}function Zm(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(fe(e,t))return;i.uniform4uiv(this.addr,t),pe(e,t)}}function Jm(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r=this.type===i.SAMPLER_2D_SHADOW?Ch:Rh;e.setTexture2D(t||r,s)}function Km(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||Lh,s)}function jm(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Ih,s)}function Qm(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Ph,s)}function t0(i){switch(i){case 5126:return Nm;case 35664:return Om;case 35665:return Fm;case 35666:return Bm;case 35674:return km;case 35675:return zm;case 35676:return Hm;case 5124:case 35670:return Vm;case 35667:case 35671:return Gm;case 35668:case 35672:return Wm;case 35669:case 35673:return Xm;case 5125:return qm;case 36294:return Ym;case 36295:return $m;case 36296:return Zm;case 35678:case 36198:case 36298:case 36306:case 35682:return Jm;case 35679:case 36299:case 36307:return Km;case 35680:case 36300:case 36308:case 36293:return jm;case 36289:case 36303:case 36311:case 36292:return Qm}}function e0(i,t){i.uniform1fv(this.addr,t)}function n0(i,t){let e=ns(t,this.size,2);i.uniform2fv(this.addr,e)}function i0(i,t){let e=ns(t,this.size,3);i.uniform3fv(this.addr,e)}function s0(i,t){let e=ns(t,this.size,4);i.uniform4fv(this.addr,e)}function r0(i,t){let e=ns(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function a0(i,t){let e=ns(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function o0(i,t){let e=ns(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function c0(i,t){i.uniform1iv(this.addr,t)}function l0(i,t){i.uniform2iv(this.addr,t)}function h0(i,t){i.uniform3iv(this.addr,t)}function u0(i,t){i.uniform4iv(this.addr,t)}function d0(i,t){i.uniform1uiv(this.addr,t)}function f0(i,t){i.uniform2uiv(this.addr,t)}function p0(i,t){i.uniform3uiv(this.addr,t)}function m0(i,t){i.uniform4uiv(this.addr,t)}function g0(i,t,e){let n=this.cache,s=t.length,r=oa(e,s);fe(n,r)||(i.uniform1iv(this.addr,r),pe(n,r));for(let a=0;a!==s;++a)e.setTexture2D(t[a]||Rh,r[a])}function x0(i,t,e){let n=this.cache,s=t.length,r=oa(e,s);fe(n,r)||(i.uniform1iv(this.addr,r),pe(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||Lh,r[a])}function _0(i,t,e){let n=this.cache,s=t.length,r=oa(e,s);fe(n,r)||(i.uniform1iv(this.addr,r),pe(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||Ih,r[a])}function v0(i,t,e){let n=this.cache,s=t.length,r=oa(e,s);fe(n,r)||(i.uniform1iv(this.addr,r),pe(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||Ph,r[a])}function y0(i){switch(i){case 5126:return e0;case 35664:return n0;case 35665:return i0;case 35666:return s0;case 35674:return r0;case 35675:return a0;case 35676:return o0;case 5124:case 35670:return c0;case 35667:case 35671:return l0;case 35668:case 35672:return h0;case 35669:case 35673:return u0;case 5125:return d0;case 36294:return f0;case 36295:return p0;case 36296:return m0;case 35678:case 36198:case 36298:case 36306:case 35682:return g0;case 35679:case 36299:case 36307:return x0;case 35680:case 36300:case 36308:case 36293:return _0;case 36289:case 36303:case 36311:case 36292:return v0}}var bo=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=t0(e.type)}},So=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=y0(e.type)}},wo=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(t,e[o.id],n)}}},eo=/(\w+)(\])?(\[|\.)?/g;function Gl(i,t){i.seq.push(t),i.map[t.id]=t}function M0(i,t,e){let n=i.name,s=n.length;for(eo.lastIndex=0;;){let r=eo.exec(n),a=eo.lastIndex,o=r[1],c=r[2]==="]",l=r[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===s){Gl(e,l===void 0?new bo(o,i,t):new So(o,i,t));break}else{let u=e.map[o];u===void 0&&(u=new wo(o),Gl(e,u)),e=u}}}var Xi=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=t.getActiveUniform(e,s),a=t.getUniformLocation(e,r.name);M0(r,a,this)}}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){let o=e[r],c=n[o.id];c.needsUpdate!==!1&&o.setValue(t,c.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let a=t[s];a.id in e&&n.push(a)}return n}};function Wl(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var b0=37297,S0=0;function w0(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}function E0(i){let t=Kt.getPrimaries(Kt.workingColorSpace),e=Kt.getPrimaries(i),n;switch(t===e?n="":t===Er&&e===wr?n="LinearDisplayP3ToLinearSRGB":t===wr&&e===Er&&(n="LinearSRGBToLinearDisplayP3"),i){case Wn:case ra:return[n,"LinearTransferOETF"];case Fe:case ac:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function Xl(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";let r=/ERROR: 0:(\d+)/.exec(s);if(r){let a=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+w0(i.getShaderSource(t),a)}else return s}function T0(i,t){let e=E0(t);return`vec4 ${i}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`}function A0(i,t){let e;switch(t){case Gu:e="Linear";break;case Wu:e="Reinhard";break;case Xu:e="OptimizedCineon";break;case qu:e="ACESFilmic";break;case $u:e="AgX";break;case Zu:e="Neutral";break;case Yu:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}function R0(i){return[i.extensionDerivatives||i.envMapCubeUVHeight||i.bumpMap||i.normalMapTangentSpace||i.clearcoatNormalMap||i.flatShading||i.alphaToCoverage||i.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(i.extensionFragDepth||i.logarithmicDepthBuffer)&&i.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",i.extensionDrawBuffers&&i.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(i.extensionShaderTextureLOD||i.envMap||i.transmission)&&i.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(Hi).join(`
`)}function C0(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Hi).join(`
`)}function P0(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function L0(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function Hi(i){return i!==""}function ql(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Yl(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var I0=/^[ \t]*#include +<([\w\d./]+)>/gm;function Eo(i){return i.replace(I0,U0)}var D0=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function U0(i,t){let e=zt[t];if(e===void 0){let n=D0.get(t);if(n!==void 0)e=zt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return Eo(e)}var N0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function $l(i){return i.replace(N0,O0)}function O0(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Zl(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	`;return i.isWebGL2&&(t+=`precision ${i.precision} sampler3D;
		precision ${i.precision} sampler2DArray;
		precision ${i.precision} sampler2DShadow;
		precision ${i.precision} samplerCubeShadow;
		precision ${i.precision} sampler2DArrayShadow;
		precision ${i.precision} isampler2D;
		precision ${i.precision} isampler3D;
		precision ${i.precision} isamplerCube;
		precision ${i.precision} isampler2DArray;
		precision ${i.precision} usampler2D;
		precision ${i.precision} usampler3D;
		precision ${i.precision} usamplerCube;
		precision ${i.precision} usampler2DArray;
		`),i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function F0(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===uh?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===xu?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===yn&&(t="SHADOWMAP_TYPE_VSM"),t}function B0(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case qi:case Yi:t="ENVMAP_TYPE_CUBE";break;case sa:t="ENVMAP_TYPE_CUBE_UV";break}return t}function k0(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Yi:t="ENVMAP_MODE_REFRACTION";break}return t}function z0(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case sc:t="ENVMAP_BLENDING_MULTIPLY";break;case Hu:t="ENVMAP_BLENDING_MIX";break;case Vu:t="ENVMAP_BLENDING_ADD";break}return t}function H0(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function V0(i,t,e,n){let s=i.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,c=F0(e),l=B0(e),h=k0(e),u=z0(e),d=H0(e),p=e.isWebGL2?"":R0(e),g=C0(e),_=P0(r),f=s.createProgram(),m,M,x=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_].filter(Hi).join(`
`),m.length>0&&(m+=`
`),M=[p,"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_].filter(Hi).join(`
`),M.length>0&&(M+=`
`)):(m=[Zl(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors&&e.isWebGL2?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.useLegacyLights?"#define LEGACY_LIGHTS":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.logarithmicDepthBuffer&&e.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Hi).join(`
`),M=[p,Zl(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+l:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.useLegacyLights?"#define LEGACY_LIGHTS":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.logarithmicDepthBuffer&&e.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==kn?"#define TONE_MAPPING":"",e.toneMapping!==kn?zt.tonemapping_pars_fragment:"",e.toneMapping!==kn?A0("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",zt.colorspace_pars_fragment,T0("linearToOutputTexel",e.outputColorSpace),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Hi).join(`
`)),a=Eo(a),a=ql(a,e),a=Yl(a,e),o=Eo(o),o=ql(o,e),o=Yl(o,e),a=$l(a),o=$l(o),e.isWebGL2&&e.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,m=[g,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,M=["precision mediump sampler2DArray;","#define varying in",e.glslVersion===dl?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===dl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+M);let b=x+m+a,C=x+M+o,A=Wl(s,s.VERTEX_SHADER,b),w=Wl(s,s.FRAGMENT_SHADER,C);s.attachShader(f,A),s.attachShader(f,w),e.index0AttributeName!==void 0?s.bindAttribLocation(f,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(f,0,"position"),s.linkProgram(f);function P(W){if(i.debug.checkShaderErrors){let J=s.getProgramInfoLog(f).trim(),I=s.getShaderInfoLog(A).trim(),G=s.getShaderInfoLog(w).trim(),z=!0,Z=!0;if(s.getProgramParameter(f,s.LINK_STATUS)===!1)if(z=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,f,A,w);else{let q=Xl(s,A,"vertex"),Y=Xl(s,w,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(f,s.VALIDATE_STATUS)+`

Material Name: `+W.name+`
Material Type: `+W.type+`

Program Info Log: `+J+`
`+q+`
`+Y)}else J!==""?console.warn("THREE.WebGLProgram: Program Info Log:",J):(I===""||G==="")&&(Z=!1);Z&&(W.diagnostics={runnable:z,programLog:J,vertexShader:{log:I,prefix:m},fragmentShader:{log:G,prefix:M}})}s.deleteShader(A),s.deleteShader(w),N=new Xi(s,f),v=L0(s,f)}let N;this.getUniforms=function(){return N===void 0&&P(this),N};let v;this.getAttributes=function(){return v===void 0&&P(this),v};let T=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return T===!1&&(T=s.getProgramParameter(f,b0)),T},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(f),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=S0++,this.cacheKey=t,this.usedTimes=1,this.program=f,this.vertexShader=A,this.fragmentShader=w,this}var G0=0,To=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){let e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(t);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new Ao(t),e.set(t,n)),n}},Ao=class{constructor(t){this.id=G0++,this.code=t,this.usedTimes=0}};function W0(i,t,e,n,s,r,a){let o=new Ir,c=new To,l=new Set,h=[],u=s.isWebGL2,d=s.logarithmicDepthBuffer,p=s.vertexTextures,g=s.precision,_={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function f(v){return l.add(v),v===0?"uv":`uv${v}`}function m(v,T,W,J,I){let G=J.fog,z=I.geometry,Z=v.isMeshStandardMaterial?J.environment:null,q=(v.isMeshStandardMaterial?e:t).get(v.envMap||Z),Y=q&&q.mapping===sa?q.image.height:null,it=_[v.type];v.precision!==null&&(g=s.getMaxPrecision(v.precision),g!==v.precision&&console.warn("THREE.WebGLProgram.getParameters:",v.precision,"not supported, using",g,"instead."));let et=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,xt=et!==void 0?et.length:0,Dt=0;z.morphAttributes.position!==void 0&&(Dt=1),z.morphAttributes.normal!==void 0&&(Dt=2),z.morphAttributes.color!==void 0&&(Dt=3);let H,Q,pt,Tt;if(it){let Qt=on[it];H=Qt.vertexShader,Q=Qt.fragmentShader}else H=v.vertexShader,Q=v.fragmentShader,c.update(v),pt=c.getVertexShaderID(v),Tt=c.getFragmentShaderID(v);let Mt=i.getRenderTarget(),vt=I.isInstancedMesh===!0,Vt=I.isBatchedMesh===!0,At=!!v.map,R=!!v.matcap,at=!!q,$=!!v.aoMap,st=!!v.lightMap,K=!!v.bumpMap,_t=!!v.normalMap,ft=!!v.displacementMap,yt=!!v.emissiveMap,Wt=!!v.metalnessMap,E=!!v.roughnessMap,y=v.anisotropy>0,V=v.clearcoat>0,X=v.iridescence>0,tt=v.sheen>0,j=v.transmission>0,Ut=y&&!!v.anisotropyMap,Ct=V&&!!v.clearcoatMap,ct=V&&!!v.clearcoatNormalMap,ht=V&&!!v.clearcoatRoughnessMap,Nt=X&&!!v.iridescenceMap,rt=X&&!!v.iridescenceThicknessMap,le=tt&&!!v.sheenColorMap,Xt=tt&&!!v.sheenRoughnessMap,Rt=!!v.specularMap,bt=!!v.specularColorMap,St=!!v.specularIntensityMap,$t=j&&!!v.transmissionMap,Ft=j&&!!v.thicknessMap,ie=!!v.gradientMap,D=!!v.alphaMap,ut=v.alphaTest>0,F=!!v.alphaHash,ot=!!v.extensions,dt=kn;v.toneMapped&&(Mt===null||Mt.isXRRenderTarget===!0)&&(dt=i.toneMapping);let qt={isWebGL2:u,shaderID:it,shaderType:v.type,shaderName:v.name,vertexShader:H,fragmentShader:Q,defines:v.defines,customVertexShaderID:pt,customFragmentShaderID:Tt,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:g,batching:Vt,instancing:vt,instancingColor:vt&&I.instanceColor!==null,instancingMorph:vt&&I.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:Mt===null?i.outputColorSpace:Mt.isXRRenderTarget===!0?Mt.texture.colorSpace:Wn,alphaToCoverage:!!v.alphaToCoverage,map:At,matcap:R,envMap:at,envMapMode:at&&q.mapping,envMapCubeUVHeight:Y,aoMap:$,lightMap:st,bumpMap:K,normalMap:_t,displacementMap:p&&ft,emissiveMap:yt,normalMapObjectSpace:_t&&v.normalMapType===rd,normalMapTangentSpace:_t&&v.normalMapType===Mh,metalnessMap:Wt,roughnessMap:E,anisotropy:y,anisotropyMap:Ut,clearcoat:V,clearcoatMap:Ct,clearcoatNormalMap:ct,clearcoatRoughnessMap:ht,iridescence:X,iridescenceMap:Nt,iridescenceThicknessMap:rt,sheen:tt,sheenColorMap:le,sheenRoughnessMap:Xt,specularMap:Rt,specularColorMap:bt,specularIntensityMap:St,transmission:j,transmissionMap:$t,thicknessMap:Ft,gradientMap:ie,opaque:v.transparent===!1&&v.blending===Gi&&v.alphaToCoverage===!1,alphaMap:D,alphaTest:ut,alphaHash:F,combine:v.combine,mapUv:At&&f(v.map.channel),aoMapUv:$&&f(v.aoMap.channel),lightMapUv:st&&f(v.lightMap.channel),bumpMapUv:K&&f(v.bumpMap.channel),normalMapUv:_t&&f(v.normalMap.channel),displacementMapUv:ft&&f(v.displacementMap.channel),emissiveMapUv:yt&&f(v.emissiveMap.channel),metalnessMapUv:Wt&&f(v.metalnessMap.channel),roughnessMapUv:E&&f(v.roughnessMap.channel),anisotropyMapUv:Ut&&f(v.anisotropyMap.channel),clearcoatMapUv:Ct&&f(v.clearcoatMap.channel),clearcoatNormalMapUv:ct&&f(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ht&&f(v.clearcoatRoughnessMap.channel),iridescenceMapUv:Nt&&f(v.iridescenceMap.channel),iridescenceThicknessMapUv:rt&&f(v.iridescenceThicknessMap.channel),sheenColorMapUv:le&&f(v.sheenColorMap.channel),sheenRoughnessMapUv:Xt&&f(v.sheenRoughnessMap.channel),specularMapUv:Rt&&f(v.specularMap.channel),specularColorMapUv:bt&&f(v.specularColorMap.channel),specularIntensityMapUv:St&&f(v.specularIntensityMap.channel),transmissionMapUv:$t&&f(v.transmissionMap.channel),thicknessMapUv:Ft&&f(v.thicknessMap.channel),alphaMapUv:D&&f(v.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(_t||y),vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,pointsUvs:I.isPoints===!0&&!!z.attributes.uv&&(At||D),fog:!!G,useFog:v.fog===!0,fogExp2:!!G&&G.isFogExp2,flatShading:v.flatShading===!0,sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:d,skinning:I.isSkinnedMesh===!0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:xt,morphTextureStride:Dt,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:v.dithering,shadowMapEnabled:i.shadowMap.enabled&&W.length>0,shadowMapType:i.shadowMap.type,toneMapping:dt,useLegacyLights:i._useLegacyLights,decodeVideoTexture:At&&v.map.isVideoTexture===!0&&Kt.getTransfer(v.map.colorSpace)===ne,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===bn,flipSided:v.side===Pe,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionDerivatives:ot&&v.extensions.derivatives===!0,extensionFragDepth:ot&&v.extensions.fragDepth===!0,extensionDrawBuffers:ot&&v.extensions.drawBuffers===!0,extensionShaderTextureLOD:ot&&v.extensions.shaderTextureLOD===!0,extensionClipCullDistance:ot&&v.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:ot&&v.extensions.multiDraw===!0&&n.has("WEBGL_multi_draw"),rendererExtensionFragDepth:u||n.has("EXT_frag_depth"),rendererExtensionDrawBuffers:u||n.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:u||n.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return qt.vertexUv1s=l.has(1),qt.vertexUv2s=l.has(2),qt.vertexUv3s=l.has(3),l.clear(),qt}function M(v){let T=[];if(v.shaderID?T.push(v.shaderID):(T.push(v.customVertexShaderID),T.push(v.customFragmentShaderID)),v.defines!==void 0)for(let W in v.defines)T.push(W),T.push(v.defines[W]);return v.isRawShaderMaterial===!1&&(x(T,v),b(T,v),T.push(i.outputColorSpace)),T.push(v.customProgramCacheKey),T.join()}function x(v,T){v.push(T.precision),v.push(T.outputColorSpace),v.push(T.envMapMode),v.push(T.envMapCubeUVHeight),v.push(T.mapUv),v.push(T.alphaMapUv),v.push(T.lightMapUv),v.push(T.aoMapUv),v.push(T.bumpMapUv),v.push(T.normalMapUv),v.push(T.displacementMapUv),v.push(T.emissiveMapUv),v.push(T.metalnessMapUv),v.push(T.roughnessMapUv),v.push(T.anisotropyMapUv),v.push(T.clearcoatMapUv),v.push(T.clearcoatNormalMapUv),v.push(T.clearcoatRoughnessMapUv),v.push(T.iridescenceMapUv),v.push(T.iridescenceThicknessMapUv),v.push(T.sheenColorMapUv),v.push(T.sheenRoughnessMapUv),v.push(T.specularMapUv),v.push(T.specularColorMapUv),v.push(T.specularIntensityMapUv),v.push(T.transmissionMapUv),v.push(T.thicknessMapUv),v.push(T.combine),v.push(T.fogExp2),v.push(T.sizeAttenuation),v.push(T.morphTargetsCount),v.push(T.morphAttributeCount),v.push(T.numDirLights),v.push(T.numPointLights),v.push(T.numSpotLights),v.push(T.numSpotLightMaps),v.push(T.numHemiLights),v.push(T.numRectAreaLights),v.push(T.numDirLightShadows),v.push(T.numPointLightShadows),v.push(T.numSpotLightShadows),v.push(T.numSpotLightShadowsWithMaps),v.push(T.numLightProbes),v.push(T.shadowMapType),v.push(T.toneMapping),v.push(T.numClippingPlanes),v.push(T.numClipIntersection),v.push(T.depthPacking)}function b(v,T){o.disableAll(),T.isWebGL2&&o.enable(0),T.supportsVertexTextures&&o.enable(1),T.instancing&&o.enable(2),T.instancingColor&&o.enable(3),T.instancingMorph&&o.enable(4),T.matcap&&o.enable(5),T.envMap&&o.enable(6),T.normalMapObjectSpace&&o.enable(7),T.normalMapTangentSpace&&o.enable(8),T.clearcoat&&o.enable(9),T.iridescence&&o.enable(10),T.alphaTest&&o.enable(11),T.vertexColors&&o.enable(12),T.vertexAlphas&&o.enable(13),T.vertexUv1s&&o.enable(14),T.vertexUv2s&&o.enable(15),T.vertexUv3s&&o.enable(16),T.vertexTangents&&o.enable(17),T.anisotropy&&o.enable(18),T.alphaHash&&o.enable(19),T.batching&&o.enable(20),v.push(o.mask),o.disableAll(),T.fog&&o.enable(0),T.useFog&&o.enable(1),T.flatShading&&o.enable(2),T.logarithmicDepthBuffer&&o.enable(3),T.skinning&&o.enable(4),T.morphTargets&&o.enable(5),T.morphNormals&&o.enable(6),T.morphColors&&o.enable(7),T.premultipliedAlpha&&o.enable(8),T.shadowMapEnabled&&o.enable(9),T.useLegacyLights&&o.enable(10),T.doubleSided&&o.enable(11),T.flipSided&&o.enable(12),T.useDepthPacking&&o.enable(13),T.dithering&&o.enable(14),T.transmission&&o.enable(15),T.sheen&&o.enable(16),T.opaque&&o.enable(17),T.pointsUvs&&o.enable(18),T.decodeVideoTexture&&o.enable(19),T.alphaToCoverage&&o.enable(20),v.push(o.mask)}function C(v){let T=_[v.type],W;if(T){let J=on[T];W=Pd.clone(J.uniforms)}else W=v.uniforms;return W}function A(v,T){let W;for(let J=0,I=h.length;J<I;J++){let G=h[J];if(G.cacheKey===T){W=G,++W.usedTimes;break}}return W===void 0&&(W=new V0(i,T,v,r),h.push(W)),W}function w(v){if(--v.usedTimes===0){let T=h.indexOf(v);h[T]=h[h.length-1],h.pop(),v.destroy()}}function P(v){c.remove(v)}function N(){c.dispose()}return{getParameters:m,getProgramCacheKey:M,getUniforms:C,acquireProgram:A,releaseProgram:w,releaseShaderCache:P,programs:h,dispose:N}}function X0(){let i=new WeakMap;function t(r){let a=i.get(r);return a===void 0&&(a={},i.set(r,a)),a}function e(r){i.delete(r)}function n(r,a,o){i.get(r)[a]=o}function s(){i=new WeakMap}return{get:t,remove:e,update:n,dispose:s}}function q0(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function Jl(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function Kl(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(u,d,p,g,_,f){let m=i[t];return m===void 0?(m={id:u.id,object:u,geometry:d,material:p,groupOrder:g,renderOrder:u.renderOrder,z:_,group:f},i[t]=m):(m.id=u.id,m.object=u,m.geometry=d,m.material=p,m.groupOrder=g,m.renderOrder=u.renderOrder,m.z=_,m.group=f),t++,m}function o(u,d,p,g,_,f){let m=a(u,d,p,g,_,f);p.transmission>0?n.push(m):p.transparent===!0?s.push(m):e.push(m)}function c(u,d,p,g,_,f){let m=a(u,d,p,g,_,f);p.transmission>0?n.unshift(m):p.transparent===!0?s.unshift(m):e.unshift(m)}function l(u,d){e.length>1&&e.sort(u||q0),n.length>1&&n.sort(d||Jl),s.length>1&&s.sort(d||Jl)}function h(){for(let u=t,d=i.length;u<d;u++){let p=i[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:o,unshift:c,finish:h,sort:l}}function Y0(){let i=new WeakMap;function t(n,s){let r=i.get(n),a;return r===void 0?(a=new Kl,i.set(n,[a])):s>=r.length?(a=new Kl,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function $0(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new L,color:new Et};break;case"SpotLight":e={position:new L,direction:new L,color:new Et,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new L,color:new Et,distance:0,decay:0};break;case"HemisphereLight":e={direction:new L,skyColor:new Et,groundColor:new Et};break;case"RectAreaLight":e={color:new Et,position:new L,halfWidth:new L,halfHeight:new L};break}return i[t.id]=e,e}}}function Z0(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new nt};break;case"SpotLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new nt};break;case"PointLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new nt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var J0=0;function K0(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function j0(i,t){let e=new $0,n=Z0(),s={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)s.probe.push(new L);let r=new L,a=new Zt,o=new Zt;function c(h,u){let d=0,p=0,g=0;for(let W=0;W<9;W++)s.probe[W].set(0,0,0);let _=0,f=0,m=0,M=0,x=0,b=0,C=0,A=0,w=0,P=0,N=0;h.sort(K0);let v=u===!0?Math.PI:1;for(let W=0,J=h.length;W<J;W++){let I=h[W],G=I.color,z=I.intensity,Z=I.distance,q=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)d+=G.r*z*v,p+=G.g*z*v,g+=G.b*z*v;else if(I.isLightProbe){for(let Y=0;Y<9;Y++)s.probe[Y].addScaledVector(I.sh.coefficients[Y],z);N++}else if(I.isDirectionalLight){let Y=e.get(I);if(Y.color.copy(I.color).multiplyScalar(I.intensity*v),I.castShadow){let it=I.shadow,et=n.get(I);et.shadowBias=it.bias,et.shadowNormalBias=it.normalBias,et.shadowRadius=it.radius,et.shadowMapSize=it.mapSize,s.directionalShadow[_]=et,s.directionalShadowMap[_]=q,s.directionalShadowMatrix[_]=I.shadow.matrix,b++}s.directional[_]=Y,_++}else if(I.isSpotLight){let Y=e.get(I);Y.position.setFromMatrixPosition(I.matrixWorld),Y.color.copy(G).multiplyScalar(z*v),Y.distance=Z,Y.coneCos=Math.cos(I.angle),Y.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),Y.decay=I.decay,s.spot[m]=Y;let it=I.shadow;if(I.map&&(s.spotLightMap[w]=I.map,w++,it.updateMatrices(I),I.castShadow&&P++),s.spotLightMatrix[m]=it.matrix,I.castShadow){let et=n.get(I);et.shadowBias=it.bias,et.shadowNormalBias=it.normalBias,et.shadowRadius=it.radius,et.shadowMapSize=it.mapSize,s.spotShadow[m]=et,s.spotShadowMap[m]=q,A++}m++}else if(I.isRectAreaLight){let Y=e.get(I);Y.color.copy(G).multiplyScalar(z),Y.halfWidth.set(I.width*.5,0,0),Y.halfHeight.set(0,I.height*.5,0),s.rectArea[M]=Y,M++}else if(I.isPointLight){let Y=e.get(I);if(Y.color.copy(I.color).multiplyScalar(I.intensity*v),Y.distance=I.distance,Y.decay=I.decay,I.castShadow){let it=I.shadow,et=n.get(I);et.shadowBias=it.bias,et.shadowNormalBias=it.normalBias,et.shadowRadius=it.radius,et.shadowMapSize=it.mapSize,et.shadowCameraNear=it.camera.near,et.shadowCameraFar=it.camera.far,s.pointShadow[f]=et,s.pointShadowMap[f]=q,s.pointShadowMatrix[f]=I.shadow.matrix,C++}s.point[f]=Y,f++}else if(I.isHemisphereLight){let Y=e.get(I);Y.skyColor.copy(I.color).multiplyScalar(z*v),Y.groundColor.copy(I.groundColor).multiplyScalar(z*v),s.hemi[x]=Y,x++}}M>0&&(t.isWebGL2?i.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=lt.LTC_FLOAT_1,s.rectAreaLTC2=lt.LTC_FLOAT_2):(s.rectAreaLTC1=lt.LTC_HALF_1,s.rectAreaLTC2=lt.LTC_HALF_2):i.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=lt.LTC_FLOAT_1,s.rectAreaLTC2=lt.LTC_FLOAT_2):i.has("OES_texture_half_float_linear")===!0?(s.rectAreaLTC1=lt.LTC_HALF_1,s.rectAreaLTC2=lt.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),s.ambient[0]=d,s.ambient[1]=p,s.ambient[2]=g;let T=s.hash;(T.directionalLength!==_||T.pointLength!==f||T.spotLength!==m||T.rectAreaLength!==M||T.hemiLength!==x||T.numDirectionalShadows!==b||T.numPointShadows!==C||T.numSpotShadows!==A||T.numSpotMaps!==w||T.numLightProbes!==N)&&(s.directional.length=_,s.spot.length=m,s.rectArea.length=M,s.point.length=f,s.hemi.length=x,s.directionalShadow.length=b,s.directionalShadowMap.length=b,s.pointShadow.length=C,s.pointShadowMap.length=C,s.spotShadow.length=A,s.spotShadowMap.length=A,s.directionalShadowMatrix.length=b,s.pointShadowMatrix.length=C,s.spotLightMatrix.length=A+w-P,s.spotLightMap.length=w,s.numSpotLightShadowsWithMaps=P,s.numLightProbes=N,T.directionalLength=_,T.pointLength=f,T.spotLength=m,T.rectAreaLength=M,T.hemiLength=x,T.numDirectionalShadows=b,T.numPointShadows=C,T.numSpotShadows=A,T.numSpotMaps=w,T.numLightProbes=N,s.version=J0++)}function l(h,u){let d=0,p=0,g=0,_=0,f=0,m=u.matrixWorldInverse;for(let M=0,x=h.length;M<x;M++){let b=h[M];if(b.isDirectionalLight){let C=s.directional[d];C.direction.setFromMatrixPosition(b.matrixWorld),r.setFromMatrixPosition(b.target.matrixWorld),C.direction.sub(r),C.direction.transformDirection(m),d++}else if(b.isSpotLight){let C=s.spot[g];C.position.setFromMatrixPosition(b.matrixWorld),C.position.applyMatrix4(m),C.direction.setFromMatrixPosition(b.matrixWorld),r.setFromMatrixPosition(b.target.matrixWorld),C.direction.sub(r),C.direction.transformDirection(m),g++}else if(b.isRectAreaLight){let C=s.rectArea[_];C.position.setFromMatrixPosition(b.matrixWorld),C.position.applyMatrix4(m),o.identity(),a.copy(b.matrixWorld),a.premultiply(m),o.extractRotation(a),C.halfWidth.set(b.width*.5,0,0),C.halfHeight.set(0,b.height*.5,0),C.halfWidth.applyMatrix4(o),C.halfHeight.applyMatrix4(o),_++}else if(b.isPointLight){let C=s.point[p];C.position.setFromMatrixPosition(b.matrixWorld),C.position.applyMatrix4(m),p++}else if(b.isHemisphereLight){let C=s.hemi[f];C.direction.setFromMatrixPosition(b.matrixWorld),C.direction.transformDirection(m),f++}}}return{setup:c,setupView:l,state:s}}function jl(i,t){let e=new j0(i,t),n=[],s=[];function r(){n.length=0,s.length=0}function a(u){n.push(u)}function o(u){s.push(u)}function c(u){e.setup(n,u)}function l(u){e.setupView(n,u)}return{init:r,state:{lightsArray:n,shadowsArray:s,lights:e},setupLights:c,setupLightsView:l,pushLight:a,pushShadow:o}}function Q0(i,t){let e=new WeakMap;function n(r,a=0){let o=e.get(r),c;return o===void 0?(c=new jl(i,t),e.set(r,[c])):a>=o.length?(c=new jl(i,t),o.push(c)):c=o[a],c}function s(){e=new WeakMap}return{get:n,dispose:s}}var Ro=class extends An{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=id,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Co=class extends An{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}},tg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,eg=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function ng(i,t,e){let n=new ws,s=new nt,r=new nt,a=new ve,o=new Ro({depthPacking:sd}),c=new Co,l={},h=e.maxTextureSize,u={[Hn]:Pe,[Pe]:Hn,[bn]:bn},d=new Je({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new nt},radius:{value:4}},vertexShader:tg,fragmentShader:eg}),p=d.clone();p.defines.HORIZONTAL_PASS=1;let g=new de;g.setAttribute("position",new ue(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new jt(g,d),f=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=uh;let m=this.type;this.render=function(A,w,P){if(f.enabled===!1||f.autoUpdate===!1&&f.needsUpdate===!1||A.length===0)return;let N=i.getRenderTarget(),v=i.getActiveCubeFace(),T=i.getActiveMipmapLevel(),W=i.state;W.setBlending(Bn),W.buffers.color.setClear(1,1,1,1),W.buffers.depth.setTest(!0),W.setScissorTest(!1);let J=m!==yn&&this.type===yn,I=m===yn&&this.type!==yn;for(let G=0,z=A.length;G<z;G++){let Z=A[G],q=Z.shadow;if(q===void 0){console.warn("THREE.WebGLShadowMap:",Z,"has no shadow.");continue}if(q.autoUpdate===!1&&q.needsUpdate===!1)continue;s.copy(q.mapSize);let Y=q.getFrameExtents();if(s.multiply(Y),r.copy(q.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/Y.x),s.x=r.x*Y.x,q.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/Y.y),s.y=r.y*Y.y,q.mapSize.y=r.y)),q.map===null||J===!0||I===!0){let et=this.type!==yn?{minFilter:be,magFilter:be}:{};q.map!==null&&q.map.dispose(),q.map=new En(s.x,s.y,et),q.map.texture.name=Z.name+".shadowMap",q.camera.updateProjectionMatrix()}i.setRenderTarget(q.map),i.clear();let it=q.getViewportCount();for(let et=0;et<it;et++){let xt=q.getViewport(et);a.set(r.x*xt.x,r.y*xt.y,r.x*xt.z,r.y*xt.w),W.viewport(a),q.updateMatrices(Z,et),n=q.getFrustum(),b(w,P,q.camera,Z,this.type)}q.isPointLightShadow!==!0&&this.type===yn&&M(q,P),q.needsUpdate=!1}m=this.type,f.needsUpdate=!1,i.setRenderTarget(N,v,T)};function M(A,w){let P=t.update(_);d.defines.VSM_SAMPLES!==A.blurSamples&&(d.defines.VSM_SAMPLES=A.blurSamples,p.defines.VSM_SAMPLES=A.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new En(s.x,s.y)),d.uniforms.shadow_pass.value=A.map.texture,d.uniforms.resolution.value=A.mapSize,d.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(w,null,P,d,_,null),p.uniforms.shadow_pass.value=A.mapPass.texture,p.uniforms.resolution.value=A.mapSize,p.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(w,null,P,p,_,null)}function x(A,w,P,N){let v=null,T=P.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(T!==void 0)v=T;else if(v=P.isPointLight===!0?c:o,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0){let W=v.uuid,J=w.uuid,I=l[W];I===void 0&&(I={},l[W]=I);let G=I[J];G===void 0&&(G=v.clone(),I[J]=G,w.addEventListener("dispose",C)),v=G}if(v.visible=w.visible,v.wireframe=w.wireframe,N===yn?v.side=w.shadowSide!==null?w.shadowSide:w.side:v.side=w.shadowSide!==null?w.shadowSide:u[w.side],v.alphaMap=w.alphaMap,v.alphaTest=w.alphaTest,v.map=w.map,v.clipShadows=w.clipShadows,v.clippingPlanes=w.clippingPlanes,v.clipIntersection=w.clipIntersection,v.displacementMap=w.displacementMap,v.displacementScale=w.displacementScale,v.displacementBias=w.displacementBias,v.wireframeLinewidth=w.wireframeLinewidth,v.linewidth=w.linewidth,P.isPointLight===!0&&v.isMeshDistanceMaterial===!0){let W=i.properties.get(v);W.light=P}return v}function b(A,w,P,N,v){if(A.visible===!1)return;if(A.layers.test(w.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&v===yn)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse,A.matrixWorld);let J=t.update(A),I=A.material;if(Array.isArray(I)){let G=J.groups;for(let z=0,Z=G.length;z<Z;z++){let q=G[z],Y=I[q.materialIndex];if(Y&&Y.visible){let it=x(A,Y,N,v);A.onBeforeShadow(i,A,w,P,J,it,q),i.renderBufferDirect(P,null,J,it,A,q),A.onAfterShadow(i,A,w,P,J,it,q)}}}else if(I.visible){let G=x(A,I,N,v);A.onBeforeShadow(i,A,w,P,J,G,null),i.renderBufferDirect(P,null,J,G,A,null),A.onAfterShadow(i,A,w,P,J,G,null)}}let W=A.children;for(let J=0,I=W.length;J<I;J++)b(W[J],w,P,N,v)}function C(A){A.target.removeEventListener("dispose",C);for(let P in l){let N=l[P],v=A.target.uuid;v in N&&(N[v].dispose(),delete N[v])}}}function ig(i,t,e){let n=e.isWebGL2;function s(){let D=!1,ut=new ve,F=null,ot=new ve(0,0,0,0);return{setMask:function(dt){F!==dt&&!D&&(i.colorMask(dt,dt,dt,dt),F=dt)},setLocked:function(dt){D=dt},setClear:function(dt,qt,Qt,ye,qe){qe===!0&&(dt*=ye,qt*=ye,Qt*=ye),ut.set(dt,qt,Qt,ye),ot.equals(ut)===!1&&(i.clearColor(dt,qt,Qt,ye),ot.copy(ut))},reset:function(){D=!1,F=null,ot.set(-1,0,0,0)}}}function r(){let D=!1,ut=null,F=null,ot=null;return{setTest:function(dt){dt?vt(i.DEPTH_TEST):Vt(i.DEPTH_TEST)},setMask:function(dt){ut!==dt&&!D&&(i.depthMask(dt),ut=dt)},setFunc:function(dt){if(F!==dt){switch(dt){case Uu:i.depthFunc(i.NEVER);break;case Nu:i.depthFunc(i.ALWAYS);break;case Ou:i.depthFunc(i.LESS);break;case yr:i.depthFunc(i.LEQUAL);break;case Fu:i.depthFunc(i.EQUAL);break;case Bu:i.depthFunc(i.GEQUAL);break;case ku:i.depthFunc(i.GREATER);break;case zu:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}F=dt}},setLocked:function(dt){D=dt},setClear:function(dt){ot!==dt&&(i.clearDepth(dt),ot=dt)},reset:function(){D=!1,ut=null,F=null,ot=null}}}function a(){let D=!1,ut=null,F=null,ot=null,dt=null,qt=null,Qt=null,ye=null,qe=null;return{setTest:function(te){D||(te?vt(i.STENCIL_TEST):Vt(i.STENCIL_TEST))},setMask:function(te){ut!==te&&!D&&(i.stencilMask(te),ut=te)},setFunc:function(te,Le,an){(F!==te||ot!==Le||dt!==an)&&(i.stencilFunc(te,Le,an),F=te,ot=Le,dt=an)},setOp:function(te,Le,an){(qt!==te||Qt!==Le||ye!==an)&&(i.stencilOp(te,Le,an),qt=te,Qt=Le,ye=an)},setLocked:function(te){D=te},setClear:function(te){qe!==te&&(i.clearStencil(te),qe=te)},reset:function(){D=!1,ut=null,F=null,ot=null,dt=null,qt=null,Qt=null,ye=null,qe=null}}}let o=new s,c=new r,l=new a,h=new WeakMap,u=new WeakMap,d={},p={},g=new WeakMap,_=[],f=null,m=!1,M=null,x=null,b=null,C=null,A=null,w=null,P=null,N=new Et(0,0,0),v=0,T=!1,W=null,J=null,I=null,G=null,z=null,Z=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),q=!1,Y=0,it=i.getParameter(i.VERSION);it.indexOf("WebGL")!==-1?(Y=parseFloat(/^WebGL (\d)/.exec(it)[1]),q=Y>=1):it.indexOf("OpenGL ES")!==-1&&(Y=parseFloat(/^OpenGL ES (\d)/.exec(it)[1]),q=Y>=2);let et=null,xt={},Dt=i.getParameter(i.SCISSOR_BOX),H=i.getParameter(i.VIEWPORT),Q=new ve().fromArray(Dt),pt=new ve().fromArray(H);function Tt(D,ut,F,ot){let dt=new Uint8Array(4),qt=i.createTexture();i.bindTexture(D,qt),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Qt=0;Qt<F;Qt++)n&&(D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY)?i.texImage3D(ut,0,i.RGBA,1,1,ot,0,i.RGBA,i.UNSIGNED_BYTE,dt):i.texImage2D(ut+Qt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,dt);return qt}let Mt={};Mt[i.TEXTURE_2D]=Tt(i.TEXTURE_2D,i.TEXTURE_2D,1),Mt[i.TEXTURE_CUBE_MAP]=Tt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),n&&(Mt[i.TEXTURE_2D_ARRAY]=Tt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Mt[i.TEXTURE_3D]=Tt(i.TEXTURE_3D,i.TEXTURE_3D,1,1)),o.setClear(0,0,0,1),c.setClear(1),l.setClear(0),vt(i.DEPTH_TEST),c.setFunc(yr),ft(!1),yt(Lc),vt(i.CULL_FACE),K(Bn);function vt(D){d[D]!==!0&&(i.enable(D),d[D]=!0)}function Vt(D){d[D]!==!1&&(i.disable(D),d[D]=!1)}function At(D,ut){return p[D]!==ut?(i.bindFramebuffer(D,ut),p[D]=ut,n&&(D===i.DRAW_FRAMEBUFFER&&(p[i.FRAMEBUFFER]=ut),D===i.FRAMEBUFFER&&(p[i.DRAW_FRAMEBUFFER]=ut)),!0):!1}function R(D,ut){let F=_,ot=!1;if(D){F=g.get(ut),F===void 0&&(F=[],g.set(ut,F));let dt=D.textures;if(F.length!==dt.length||F[0]!==i.COLOR_ATTACHMENT0){for(let qt=0,Qt=dt.length;qt<Qt;qt++)F[qt]=i.COLOR_ATTACHMENT0+qt;F.length=dt.length,ot=!0}}else F[0]!==i.BACK&&(F[0]=i.BACK,ot=!0);if(ot)if(e.isWebGL2)i.drawBuffers(F);else if(t.has("WEBGL_draw_buffers")===!0)t.get("WEBGL_draw_buffers").drawBuffersWEBGL(F);else throw new Error("THREE.WebGLState: Usage of gl.drawBuffers() require WebGL2 or WEBGL_draw_buffers extension")}function at(D){return f!==D?(i.useProgram(D),f=D,!0):!1}let $={[ri]:i.FUNC_ADD,[vu]:i.FUNC_SUBTRACT,[yu]:i.FUNC_REVERSE_SUBTRACT};if(n)$[Uc]=i.MIN,$[Nc]=i.MAX;else{let D=t.get("EXT_blend_minmax");D!==null&&($[Uc]=D.MIN_EXT,$[Nc]=D.MAX_EXT)}let st={[Mu]:i.ZERO,[bu]:i.ONE,[Su]:i.SRC_COLOR,[oo]:i.SRC_ALPHA,[Cu]:i.SRC_ALPHA_SATURATE,[Au]:i.DST_COLOR,[Eu]:i.DST_ALPHA,[wu]:i.ONE_MINUS_SRC_COLOR,[co]:i.ONE_MINUS_SRC_ALPHA,[Ru]:i.ONE_MINUS_DST_COLOR,[Tu]:i.ONE_MINUS_DST_ALPHA,[Pu]:i.CONSTANT_COLOR,[Lu]:i.ONE_MINUS_CONSTANT_COLOR,[Iu]:i.CONSTANT_ALPHA,[Du]:i.ONE_MINUS_CONSTANT_ALPHA};function K(D,ut,F,ot,dt,qt,Qt,ye,qe,te){if(D===Bn){m===!0&&(Vt(i.BLEND),m=!1);return}if(m===!1&&(vt(i.BLEND),m=!0),D!==_u){if(D!==M||te!==T){if((x!==ri||A!==ri)&&(i.blendEquation(i.FUNC_ADD),x=ri,A=ri),te)switch(D){case Gi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case vr:i.blendFunc(i.ONE,i.ONE);break;case Ic:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Dc:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}else switch(D){case Gi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case vr:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Ic:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Dc:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}b=null,C=null,w=null,P=null,N.set(0,0,0),v=0,M=D,T=te}return}dt=dt||ut,qt=qt||F,Qt=Qt||ot,(ut!==x||dt!==A)&&(i.blendEquationSeparate($[ut],$[dt]),x=ut,A=dt),(F!==b||ot!==C||qt!==w||Qt!==P)&&(i.blendFuncSeparate(st[F],st[ot],st[qt],st[Qt]),b=F,C=ot,w=qt,P=Qt),(ye.equals(N)===!1||qe!==v)&&(i.blendColor(ye.r,ye.g,ye.b,qe),N.copy(ye),v=qe),M=D,T=!1}function _t(D,ut){D.side===bn?Vt(i.CULL_FACE):vt(i.CULL_FACE);let F=D.side===Pe;ut&&(F=!F),ft(F),D.blending===Gi&&D.transparent===!1?K(Bn):K(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),c.setFunc(D.depthFunc),c.setTest(D.depthTest),c.setMask(D.depthWrite),o.setMask(D.colorWrite);let ot=D.stencilWrite;l.setTest(ot),ot&&(l.setMask(D.stencilWriteMask),l.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),l.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),E(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?vt(i.SAMPLE_ALPHA_TO_COVERAGE):Vt(i.SAMPLE_ALPHA_TO_COVERAGE)}function ft(D){W!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),W=D)}function yt(D){D!==mu?(vt(i.CULL_FACE),D!==J&&(D===Lc?i.cullFace(i.BACK):D===gu?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Vt(i.CULL_FACE),J=D}function Wt(D){D!==I&&(q&&i.lineWidth(D),I=D)}function E(D,ut,F){D?(vt(i.POLYGON_OFFSET_FILL),(G!==ut||z!==F)&&(i.polygonOffset(ut,F),G=ut,z=F)):Vt(i.POLYGON_OFFSET_FILL)}function y(D){D?vt(i.SCISSOR_TEST):Vt(i.SCISSOR_TEST)}function V(D){D===void 0&&(D=i.TEXTURE0+Z-1),et!==D&&(i.activeTexture(D),et=D)}function X(D,ut,F){F===void 0&&(et===null?F=i.TEXTURE0+Z-1:F=et);let ot=xt[F];ot===void 0&&(ot={type:void 0,texture:void 0},xt[F]=ot),(ot.type!==D||ot.texture!==ut)&&(et!==F&&(i.activeTexture(F),et=F),i.bindTexture(D,ut||Mt[D]),ot.type=D,ot.texture=ut)}function tt(){let D=xt[et];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function j(){try{i.compressedTexImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Ut(){try{i.compressedTexImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Ct(){try{i.texSubImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ct(){try{i.texSubImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ht(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Nt(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function rt(){try{i.texStorage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function le(){try{i.texStorage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Xt(){try{i.texImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Rt(){try{i.texImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function bt(D){Q.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),Q.copy(D))}function St(D){pt.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),pt.copy(D))}function $t(D,ut){let F=u.get(ut);F===void 0&&(F=new WeakMap,u.set(ut,F));let ot=F.get(D);ot===void 0&&(ot=i.getUniformBlockIndex(ut,D.name),F.set(D,ot))}function Ft(D,ut){let ot=u.get(ut).get(D);h.get(ut)!==ot&&(i.uniformBlockBinding(ut,ot,D.__bindingPointIndex),h.set(ut,ot))}function ie(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),n===!0&&(i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null)),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),d={},et=null,xt={},p={},g=new WeakMap,_=[],f=null,m=!1,M=null,x=null,b=null,C=null,A=null,w=null,P=null,N=new Et(0,0,0),v=0,T=!1,W=null,J=null,I=null,G=null,z=null,Q.set(0,0,i.canvas.width,i.canvas.height),pt.set(0,0,i.canvas.width,i.canvas.height),o.reset(),c.reset(),l.reset()}return{buffers:{color:o,depth:c,stencil:l},enable:vt,disable:Vt,bindFramebuffer:At,drawBuffers:R,useProgram:at,setBlending:K,setMaterial:_t,setFlipSided:ft,setCullFace:yt,setLineWidth:Wt,setPolygonOffset:E,setScissorTest:y,activeTexture:V,bindTexture:X,unbindTexture:tt,compressedTexImage2D:j,compressedTexImage3D:Ut,texImage2D:Xt,texImage3D:Rt,updateUBOMapping:$t,uniformBlockBinding:Ft,texStorage2D:rt,texStorage3D:le,texSubImage2D:Ct,texSubImage3D:ct,compressedTexSubImage2D:ht,compressedTexSubImage3D:Nt,scissor:bt,viewport:St,reset:ie}}function sg(i,t,e,n,s,r,a){let o=s.isWebGL2,c=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator=="undefined"?!1:/OculusBrowser/g.test(navigator.userAgent),h=new nt,u=new WeakMap,d,p=new WeakMap,g=!1;try{g=typeof OffscreenCanvas!="undefined"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch(E){}function _(E,y){return g?new OffscreenCanvas(E,y):Ar("canvas")}function f(E,y,V,X){let tt=1,j=Wt(E);if((j.width>X||j.height>X)&&(tt=X/Math.max(j.width,j.height)),tt<1||y===!0)if(typeof HTMLImageElement!="undefined"&&E instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&E instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&E instanceof ImageBitmap||typeof VideoFrame!="undefined"&&E instanceof VideoFrame){let Ut=y?xo:Math.floor,Ct=Ut(tt*j.width),ct=Ut(tt*j.height);d===void 0&&(d=_(Ct,ct));let ht=V?_(Ct,ct):d;return ht.width=Ct,ht.height=ct,ht.getContext("2d").drawImage(E,0,0,Ct,ct),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+Ct+"x"+ct+")."),ht}else return"data"in E&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),E;return E}function m(E){let y=Wt(E);return fl(y.width)&&fl(y.height)}function M(E){return o?!1:E.wrapS!==en||E.wrapT!==en||E.minFilter!==be&&E.minFilter!==Oe}function x(E,y){return E.generateMipmaps&&y&&E.minFilter!==be&&E.minFilter!==Oe}function b(E){i.generateMipmap(E)}function C(E,y,V,X,tt=!1){if(o===!1)return y;if(E!==null){if(i[E]!==void 0)return i[E];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+E+"'")}let j=y;if(y===i.RED&&(V===i.FLOAT&&(j=i.R32F),V===i.HALF_FLOAT&&(j=i.R16F),V===i.UNSIGNED_BYTE&&(j=i.R8)),y===i.RED_INTEGER&&(V===i.UNSIGNED_BYTE&&(j=i.R8UI),V===i.UNSIGNED_SHORT&&(j=i.R16UI),V===i.UNSIGNED_INT&&(j=i.R32UI),V===i.BYTE&&(j=i.R8I),V===i.SHORT&&(j=i.R16I),V===i.INT&&(j=i.R32I)),y===i.RG&&(V===i.FLOAT&&(j=i.RG32F),V===i.HALF_FLOAT&&(j=i.RG16F),V===i.UNSIGNED_BYTE&&(j=i.RG8)),y===i.RG_INTEGER&&(V===i.UNSIGNED_BYTE&&(j=i.RG8UI),V===i.UNSIGNED_SHORT&&(j=i.RG16UI),V===i.UNSIGNED_INT&&(j=i.RG32UI),V===i.BYTE&&(j=i.RG8I),V===i.SHORT&&(j=i.RG16I),V===i.INT&&(j=i.RG32I)),y===i.RGBA){let Ut=tt?Sr:Kt.getTransfer(X);V===i.FLOAT&&(j=i.RGBA32F),V===i.HALF_FLOAT&&(j=i.RGBA16F),V===i.UNSIGNED_BYTE&&(j=Ut===ne?i.SRGB8_ALPHA8:i.RGBA8),V===i.UNSIGNED_SHORT_4_4_4_4&&(j=i.RGBA4),V===i.UNSIGNED_SHORT_5_5_5_1&&(j=i.RGB5_A1)}return(j===i.R16F||j===i.R32F||j===i.RG16F||j===i.RG32F||j===i.RGBA16F||j===i.RGBA32F)&&t.get("EXT_color_buffer_float"),j}function A(E,y,V){return x(E,V)===!0||E.isFramebufferTexture&&E.minFilter!==be&&E.minFilter!==Oe?Math.log2(Math.max(y.width,y.height))+1:E.mipmaps!==void 0&&E.mipmaps.length>0?E.mipmaps.length:E.isCompressedTexture&&Array.isArray(E.image)?y.mipmaps.length:1}function w(E){return E===be||E===Oc||E===ls?i.NEAREST:i.LINEAR}function P(E){let y=E.target;y.removeEventListener("dispose",P),v(y),y.isVideoTexture&&u.delete(y)}function N(E){let y=E.target;y.removeEventListener("dispose",N),W(y)}function v(E){let y=n.get(E);if(y.__webglInit===void 0)return;let V=E.source,X=p.get(V);if(X){let tt=X[y.__cacheKey];tt.usedTimes--,tt.usedTimes===0&&T(E),Object.keys(X).length===0&&p.delete(V)}n.remove(E)}function T(E){let y=n.get(E);i.deleteTexture(y.__webglTexture);let V=E.source,X=p.get(V);delete X[y.__cacheKey],a.memory.textures--}function W(E){let y=n.get(E);if(E.depthTexture&&E.depthTexture.dispose(),E.isWebGLCubeRenderTarget)for(let X=0;X<6;X++){if(Array.isArray(y.__webglFramebuffer[X]))for(let tt=0;tt<y.__webglFramebuffer[X].length;tt++)i.deleteFramebuffer(y.__webglFramebuffer[X][tt]);else i.deleteFramebuffer(y.__webglFramebuffer[X]);y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer[X])}else{if(Array.isArray(y.__webglFramebuffer))for(let X=0;X<y.__webglFramebuffer.length;X++)i.deleteFramebuffer(y.__webglFramebuffer[X]);else i.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&i.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let X=0;X<y.__webglColorRenderbuffer.length;X++)y.__webglColorRenderbuffer[X]&&i.deleteRenderbuffer(y.__webglColorRenderbuffer[X]);y.__webglDepthRenderbuffer&&i.deleteRenderbuffer(y.__webglDepthRenderbuffer)}let V=E.textures;for(let X=0,tt=V.length;X<tt;X++){let j=n.get(V[X]);j.__webglTexture&&(i.deleteTexture(j.__webglTexture),a.memory.textures--),n.remove(V[X])}n.remove(E)}let J=0;function I(){J=0}function G(){let E=J;return E>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+E+" texture units while this GPU supports only "+s.maxTextures),J+=1,E}function z(E){let y=[];return y.push(E.wrapS),y.push(E.wrapT),y.push(E.wrapR||0),y.push(E.magFilter),y.push(E.minFilter),y.push(E.anisotropy),y.push(E.internalFormat),y.push(E.format),y.push(E.type),y.push(E.generateMipmaps),y.push(E.premultiplyAlpha),y.push(E.flipY),y.push(E.unpackAlignment),y.push(E.colorSpace),y.join()}function Z(E,y){let V=n.get(E);if(E.isVideoTexture&&ft(E),E.isRenderTargetTexture===!1&&E.version>0&&V.__version!==E.version){let X=E.image;if(X===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(X.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{pt(V,E,y);return}}e.bindTexture(i.TEXTURE_2D,V.__webglTexture,i.TEXTURE0+y)}function q(E,y){let V=n.get(E);if(E.version>0&&V.__version!==E.version){pt(V,E,y);return}e.bindTexture(i.TEXTURE_2D_ARRAY,V.__webglTexture,i.TEXTURE0+y)}function Y(E,y){let V=n.get(E);if(E.version>0&&V.__version!==E.version){pt(V,E,y);return}e.bindTexture(i.TEXTURE_3D,V.__webglTexture,i.TEXTURE0+y)}function it(E,y){let V=n.get(E);if(E.version>0&&V.__version!==E.version){Tt(V,E,y);return}e.bindTexture(i.TEXTURE_CUBE_MAP,V.__webglTexture,i.TEXTURE0+y)}let et={[uo]:i.REPEAT,[en]:i.CLAMP_TO_EDGE,[fo]:i.MIRRORED_REPEAT},xt={[be]:i.NEAREST,[Oc]:i.NEAREST_MIPMAP_NEAREST,[ls]:i.NEAREST_MIPMAP_LINEAR,[Oe]:i.LINEAR,[Sa]:i.LINEAR_MIPMAP_NEAREST,[oi]:i.LINEAR_MIPMAP_LINEAR},Dt={[ad]:i.NEVER,[dd]:i.ALWAYS,[od]:i.LESS,[bh]:i.LEQUAL,[cd]:i.EQUAL,[ud]:i.GEQUAL,[ld]:i.GREATER,[hd]:i.NOTEQUAL};function H(E,y,V){if(y.type===cn&&t.has("OES_texture_float_linear")===!1&&(y.magFilter===Oe||y.magFilter===Sa||y.magFilter===ls||y.magFilter===oi||y.minFilter===Oe||y.minFilter===Sa||y.minFilter===ls||y.minFilter===oi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),V?(i.texParameteri(E,i.TEXTURE_WRAP_S,et[y.wrapS]),i.texParameteri(E,i.TEXTURE_WRAP_T,et[y.wrapT]),(E===i.TEXTURE_3D||E===i.TEXTURE_2D_ARRAY)&&i.texParameteri(E,i.TEXTURE_WRAP_R,et[y.wrapR]),i.texParameteri(E,i.TEXTURE_MAG_FILTER,xt[y.magFilter]),i.texParameteri(E,i.TEXTURE_MIN_FILTER,xt[y.minFilter])):(i.texParameteri(E,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(E,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),(E===i.TEXTURE_3D||E===i.TEXTURE_2D_ARRAY)&&i.texParameteri(E,i.TEXTURE_WRAP_R,i.CLAMP_TO_EDGE),(y.wrapS!==en||y.wrapT!==en)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),i.texParameteri(E,i.TEXTURE_MAG_FILTER,w(y.magFilter)),i.texParameteri(E,i.TEXTURE_MIN_FILTER,w(y.minFilter)),y.minFilter!==be&&y.minFilter!==Oe&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),y.compareFunction&&(i.texParameteri(E,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(E,i.TEXTURE_COMPARE_FUNC,Dt[y.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===be||y.minFilter!==ls&&y.minFilter!==oi||y.type===cn&&t.has("OES_texture_float_linear")===!1||o===!1&&y.type===Ss&&t.has("OES_texture_half_float_linear")===!1)return;if(y.anisotropy>1||n.get(y).__currentAnisotropy){let X=t.get("EXT_texture_filter_anisotropic");i.texParameterf(E,X.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,s.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy}}}function Q(E,y){let V=!1;E.__webglInit===void 0&&(E.__webglInit=!0,y.addEventListener("dispose",P));let X=y.source,tt=p.get(X);tt===void 0&&(tt={},p.set(X,tt));let j=z(y);if(j!==E.__cacheKey){tt[j]===void 0&&(tt[j]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,V=!0),tt[j].usedTimes++;let Ut=tt[E.__cacheKey];Ut!==void 0&&(tt[E.__cacheKey].usedTimes--,Ut.usedTimes===0&&T(y)),E.__cacheKey=j,E.__webglTexture=tt[j].texture}return V}function pt(E,y,V){let X=i.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(X=i.TEXTURE_2D_ARRAY),y.isData3DTexture&&(X=i.TEXTURE_3D);let tt=Q(E,y),j=y.source;e.bindTexture(X,E.__webglTexture,i.TEXTURE0+V);let Ut=n.get(j);if(j.version!==Ut.__version||tt===!0){e.activeTexture(i.TEXTURE0+V);let Ct=Kt.getPrimaries(Kt.workingColorSpace),ct=y.colorSpace===On?null:Kt.getPrimaries(y.colorSpace),ht=y.colorSpace===On||Ct===ct?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ht);let Nt=M(y)&&m(y.image)===!1,rt=f(y.image,Nt,!1,s.maxTextureSize);rt=yt(y,rt);let le=m(rt)||o,Xt=r.convert(y.format,y.colorSpace),Rt=r.convert(y.type),bt=C(y.internalFormat,Xt,Rt,y.colorSpace,y.isVideoTexture);H(X,y,le);let St,$t=y.mipmaps,Ft=o&&y.isVideoTexture!==!0&&bt!==yh,ie=Ut.__version===void 0||tt===!0,D=j.dataReady,ut=A(y,rt,le);if(y.isDepthTexture)bt=i.DEPTH_COMPONENT,o?y.type===cn?bt=i.DEPTH_COMPONENT32F:y.type===Fn?bt=i.DEPTH_COMPONENT24:y.type===li?bt=i.DEPTH24_STENCIL8:bt=i.DEPTH_COMPONENT16:y.type===cn&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),y.format===hi&&bt===i.DEPTH_COMPONENT&&y.type!==rc&&y.type!==Fn&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),y.type=Fn,Rt=r.convert(y.type)),y.format===$i&&bt===i.DEPTH_COMPONENT&&(bt=i.DEPTH_STENCIL,y.type!==li&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),y.type=li,Rt=r.convert(y.type))),ie&&(Ft?e.texStorage2D(i.TEXTURE_2D,1,bt,rt.width,rt.height):e.texImage2D(i.TEXTURE_2D,0,bt,rt.width,rt.height,0,Xt,Rt,null));else if(y.isDataTexture)if($t.length>0&&le){Ft&&ie&&e.texStorage2D(i.TEXTURE_2D,ut,bt,$t[0].width,$t[0].height);for(let F=0,ot=$t.length;F<ot;F++)St=$t[F],Ft?D&&e.texSubImage2D(i.TEXTURE_2D,F,0,0,St.width,St.height,Xt,Rt,St.data):e.texImage2D(i.TEXTURE_2D,F,bt,St.width,St.height,0,Xt,Rt,St.data);y.generateMipmaps=!1}else Ft?(ie&&e.texStorage2D(i.TEXTURE_2D,ut,bt,rt.width,rt.height),D&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,rt.width,rt.height,Xt,Rt,rt.data)):e.texImage2D(i.TEXTURE_2D,0,bt,rt.width,rt.height,0,Xt,Rt,rt.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){Ft&&ie&&e.texStorage3D(i.TEXTURE_2D_ARRAY,ut,bt,$t[0].width,$t[0].height,rt.depth);for(let F=0,ot=$t.length;F<ot;F++)St=$t[F],y.format!==nn?Xt!==null?Ft?D&&e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,F,0,0,0,St.width,St.height,rt.depth,Xt,St.data,0,0):e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,F,bt,St.width,St.height,rt.depth,0,St.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ft?D&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,F,0,0,0,St.width,St.height,rt.depth,Xt,Rt,St.data):e.texImage3D(i.TEXTURE_2D_ARRAY,F,bt,St.width,St.height,rt.depth,0,Xt,Rt,St.data)}else{Ft&&ie&&e.texStorage2D(i.TEXTURE_2D,ut,bt,$t[0].width,$t[0].height);for(let F=0,ot=$t.length;F<ot;F++)St=$t[F],y.format!==nn?Xt!==null?Ft?D&&e.compressedTexSubImage2D(i.TEXTURE_2D,F,0,0,St.width,St.height,Xt,St.data):e.compressedTexImage2D(i.TEXTURE_2D,F,bt,St.width,St.height,0,St.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ft?D&&e.texSubImage2D(i.TEXTURE_2D,F,0,0,St.width,St.height,Xt,Rt,St.data):e.texImage2D(i.TEXTURE_2D,F,bt,St.width,St.height,0,Xt,Rt,St.data)}else if(y.isDataArrayTexture)Ft?(ie&&e.texStorage3D(i.TEXTURE_2D_ARRAY,ut,bt,rt.width,rt.height,rt.depth),D&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,rt.width,rt.height,rt.depth,Xt,Rt,rt.data)):e.texImage3D(i.TEXTURE_2D_ARRAY,0,bt,rt.width,rt.height,rt.depth,0,Xt,Rt,rt.data);else if(y.isData3DTexture)Ft?(ie&&e.texStorage3D(i.TEXTURE_3D,ut,bt,rt.width,rt.height,rt.depth),D&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,rt.width,rt.height,rt.depth,Xt,Rt,rt.data)):e.texImage3D(i.TEXTURE_3D,0,bt,rt.width,rt.height,rt.depth,0,Xt,Rt,rt.data);else if(y.isFramebufferTexture){if(ie)if(Ft)e.texStorage2D(i.TEXTURE_2D,ut,bt,rt.width,rt.height);else{let F=rt.width,ot=rt.height;for(let dt=0;dt<ut;dt++)e.texImage2D(i.TEXTURE_2D,dt,bt,F,ot,0,Xt,Rt,null),F>>=1,ot>>=1}}else if($t.length>0&&le){if(Ft&&ie){let F=Wt($t[0]);e.texStorage2D(i.TEXTURE_2D,ut,bt,F.width,F.height)}for(let F=0,ot=$t.length;F<ot;F++)St=$t[F],Ft?D&&e.texSubImage2D(i.TEXTURE_2D,F,0,0,Xt,Rt,St):e.texImage2D(i.TEXTURE_2D,F,bt,Xt,Rt,St);y.generateMipmaps=!1}else if(Ft){if(ie){let F=Wt(rt);e.texStorage2D(i.TEXTURE_2D,ut,bt,F.width,F.height)}D&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,Xt,Rt,rt)}else e.texImage2D(i.TEXTURE_2D,0,bt,Xt,Rt,rt);x(y,le)&&b(X),Ut.__version=j.version,y.onUpdate&&y.onUpdate(y)}E.__version=y.version}function Tt(E,y,V){if(y.image.length!==6)return;let X=Q(E,y),tt=y.source;e.bindTexture(i.TEXTURE_CUBE_MAP,E.__webglTexture,i.TEXTURE0+V);let j=n.get(tt);if(tt.version!==j.__version||X===!0){e.activeTexture(i.TEXTURE0+V);let Ut=Kt.getPrimaries(Kt.workingColorSpace),Ct=y.colorSpace===On?null:Kt.getPrimaries(y.colorSpace),ct=y.colorSpace===On||Ut===Ct?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ct);let ht=y.isCompressedTexture||y.image[0].isCompressedTexture,Nt=y.image[0]&&y.image[0].isDataTexture,rt=[];for(let F=0;F<6;F++)!ht&&!Nt?rt[F]=f(y.image[F],!1,!0,s.maxCubemapSize):rt[F]=Nt?y.image[F].image:y.image[F],rt[F]=yt(y,rt[F]);let le=rt[0],Xt=m(le)||o,Rt=r.convert(y.format,y.colorSpace),bt=r.convert(y.type),St=C(y.internalFormat,Rt,bt,y.colorSpace),$t=o&&y.isVideoTexture!==!0,Ft=j.__version===void 0||X===!0,ie=tt.dataReady,D=A(y,le,Xt);H(i.TEXTURE_CUBE_MAP,y,Xt);let ut;if(ht){$t&&Ft&&e.texStorage2D(i.TEXTURE_CUBE_MAP,D,St,le.width,le.height);for(let F=0;F<6;F++){ut=rt[F].mipmaps;for(let ot=0;ot<ut.length;ot++){let dt=ut[ot];y.format!==nn?Rt!==null?$t?ie&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,ot,0,0,dt.width,dt.height,Rt,dt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,ot,St,dt.width,dt.height,0,dt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):$t?ie&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,ot,0,0,dt.width,dt.height,Rt,bt,dt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,ot,St,dt.width,dt.height,0,Rt,bt,dt.data)}}}else{if(ut=y.mipmaps,$t&&Ft){ut.length>0&&D++;let F=Wt(rt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,D,St,F.width,F.height)}for(let F=0;F<6;F++)if(Nt){$t?ie&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,0,0,0,rt[F].width,rt[F].height,Rt,bt,rt[F].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,0,St,rt[F].width,rt[F].height,0,Rt,bt,rt[F].data);for(let ot=0;ot<ut.length;ot++){let qt=ut[ot].image[F].image;$t?ie&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,ot+1,0,0,qt.width,qt.height,Rt,bt,qt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,ot+1,St,qt.width,qt.height,0,Rt,bt,qt.data)}}else{$t?ie&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,0,0,0,Rt,bt,rt[F]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,0,St,Rt,bt,rt[F]);for(let ot=0;ot<ut.length;ot++){let dt=ut[ot];$t?ie&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,ot+1,0,0,Rt,bt,dt.image[F]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+F,ot+1,St,Rt,bt,dt.image[F])}}}x(y,Xt)&&b(i.TEXTURE_CUBE_MAP),j.__version=tt.version,y.onUpdate&&y.onUpdate(y)}E.__version=y.version}function Mt(E,y,V,X,tt,j){let Ut=r.convert(V.format,V.colorSpace),Ct=r.convert(V.type),ct=C(V.internalFormat,Ut,Ct,V.colorSpace);if(!n.get(y).__hasExternalTextures){let Nt=Math.max(1,y.width>>j),rt=Math.max(1,y.height>>j);tt===i.TEXTURE_3D||tt===i.TEXTURE_2D_ARRAY?e.texImage3D(tt,j,ct,Nt,rt,y.depth,0,Ut,Ct,null):e.texImage2D(tt,j,ct,Nt,rt,0,Ut,Ct,null)}e.bindFramebuffer(i.FRAMEBUFFER,E),_t(y)?c.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,X,tt,n.get(V).__webglTexture,0,K(y)):(tt===i.TEXTURE_2D||tt>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&tt<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,X,tt,n.get(V).__webglTexture,j),e.bindFramebuffer(i.FRAMEBUFFER,null)}function vt(E,y,V){if(i.bindRenderbuffer(i.RENDERBUFFER,E),y.depthBuffer&&!y.stencilBuffer){let X=o===!0?i.DEPTH_COMPONENT24:i.DEPTH_COMPONENT16;if(V||_t(y)){let tt=y.depthTexture;tt&&tt.isDepthTexture&&(tt.type===cn?X=i.DEPTH_COMPONENT32F:tt.type===Fn&&(X=i.DEPTH_COMPONENT24));let j=K(y);_t(y)?c.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,j,X,y.width,y.height):i.renderbufferStorageMultisample(i.RENDERBUFFER,j,X,y.width,y.height)}else i.renderbufferStorage(i.RENDERBUFFER,X,y.width,y.height);i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.RENDERBUFFER,E)}else if(y.depthBuffer&&y.stencilBuffer){let X=K(y);V&&_t(y)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,X,i.DEPTH24_STENCIL8,y.width,y.height):_t(y)?c.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,X,i.DEPTH24_STENCIL8,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,i.DEPTH_STENCIL,y.width,y.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.RENDERBUFFER,E)}else{let X=y.textures;for(let tt=0;tt<X.length;tt++){let j=X[tt],Ut=r.convert(j.format,j.colorSpace),Ct=r.convert(j.type),ct=C(j.internalFormat,Ut,Ct,j.colorSpace),ht=K(y);V&&_t(y)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,ht,ct,y.width,y.height):_t(y)?c.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ht,ct,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,ct,y.width,y.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Vt(E,y){if(y&&y.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,E),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(y.depthTexture).__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),Z(y.depthTexture,0);let X=n.get(y.depthTexture).__webglTexture,tt=K(y);if(y.depthTexture.format===hi)_t(y)?c.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,X,0,tt):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,X,0);else if(y.depthTexture.format===$i)_t(y)?c.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,X,0,tt):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,X,0);else throw new Error("Unknown depthTexture format")}function At(E){let y=n.get(E),V=E.isWebGLCubeRenderTarget===!0;if(E.depthTexture&&!y.__autoAllocateDepthBuffer){if(V)throw new Error("target.depthTexture not supported in Cube render targets");Vt(y.__webglFramebuffer,E)}else if(V){y.__webglDepthbuffer=[];for(let X=0;X<6;X++)e.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[X]),y.__webglDepthbuffer[X]=i.createRenderbuffer(),vt(y.__webglDepthbuffer[X],E,!1)}else e.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer=i.createRenderbuffer(),vt(y.__webglDepthbuffer,E,!1);e.bindFramebuffer(i.FRAMEBUFFER,null)}function R(E,y,V){let X=n.get(E);y!==void 0&&Mt(X.__webglFramebuffer,E,E.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),V!==void 0&&At(E)}function at(E){let y=E.texture,V=n.get(E),X=n.get(y);E.addEventListener("dispose",N);let tt=E.textures,j=E.isWebGLCubeRenderTarget===!0,Ut=tt.length>1,Ct=m(E)||o;if(Ut||(X.__webglTexture===void 0&&(X.__webglTexture=i.createTexture()),X.__version=y.version,a.memory.textures++),j){V.__webglFramebuffer=[];for(let ct=0;ct<6;ct++)if(o&&y.mipmaps&&y.mipmaps.length>0){V.__webglFramebuffer[ct]=[];for(let ht=0;ht<y.mipmaps.length;ht++)V.__webglFramebuffer[ct][ht]=i.createFramebuffer()}else V.__webglFramebuffer[ct]=i.createFramebuffer()}else{if(o&&y.mipmaps&&y.mipmaps.length>0){V.__webglFramebuffer=[];for(let ct=0;ct<y.mipmaps.length;ct++)V.__webglFramebuffer[ct]=i.createFramebuffer()}else V.__webglFramebuffer=i.createFramebuffer();if(Ut)if(s.drawBuffers)for(let ct=0,ht=tt.length;ct<ht;ct++){let Nt=n.get(tt[ct]);Nt.__webglTexture===void 0&&(Nt.__webglTexture=i.createTexture(),a.memory.textures++)}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(o&&E.samples>0&&_t(E)===!1){V.__webglMultisampledFramebuffer=i.createFramebuffer(),V.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,V.__webglMultisampledFramebuffer);for(let ct=0;ct<tt.length;ct++){let ht=tt[ct];V.__webglColorRenderbuffer[ct]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,V.__webglColorRenderbuffer[ct]);let Nt=r.convert(ht.format,ht.colorSpace),rt=r.convert(ht.type),le=C(ht.internalFormat,Nt,rt,ht.colorSpace,E.isXRRenderTarget===!0),Xt=K(E);i.renderbufferStorageMultisample(i.RENDERBUFFER,Xt,le,E.width,E.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ct,i.RENDERBUFFER,V.__webglColorRenderbuffer[ct])}i.bindRenderbuffer(i.RENDERBUFFER,null),E.depthBuffer&&(V.__webglDepthRenderbuffer=i.createRenderbuffer(),vt(V.__webglDepthRenderbuffer,E,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(j){e.bindTexture(i.TEXTURE_CUBE_MAP,X.__webglTexture),H(i.TEXTURE_CUBE_MAP,y,Ct);for(let ct=0;ct<6;ct++)if(o&&y.mipmaps&&y.mipmaps.length>0)for(let ht=0;ht<y.mipmaps.length;ht++)Mt(V.__webglFramebuffer[ct][ht],E,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,ht);else Mt(V.__webglFramebuffer[ct],E,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,0);x(y,Ct)&&b(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(Ut){for(let ct=0,ht=tt.length;ct<ht;ct++){let Nt=tt[ct],rt=n.get(Nt);e.bindTexture(i.TEXTURE_2D,rt.__webglTexture),H(i.TEXTURE_2D,Nt,Ct),Mt(V.__webglFramebuffer,E,Nt,i.COLOR_ATTACHMENT0+ct,i.TEXTURE_2D,0),x(Nt,Ct)&&b(i.TEXTURE_2D)}e.unbindTexture()}else{let ct=i.TEXTURE_2D;if((E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(o?ct=E.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),e.bindTexture(ct,X.__webglTexture),H(ct,y,Ct),o&&y.mipmaps&&y.mipmaps.length>0)for(let ht=0;ht<y.mipmaps.length;ht++)Mt(V.__webglFramebuffer[ht],E,y,i.COLOR_ATTACHMENT0,ct,ht);else Mt(V.__webglFramebuffer,E,y,i.COLOR_ATTACHMENT0,ct,0);x(y,Ct)&&b(ct),e.unbindTexture()}E.depthBuffer&&At(E)}function $(E){let y=m(E)||o,V=E.textures;for(let X=0,tt=V.length;X<tt;X++){let j=V[X];if(x(j,y)){let Ut=E.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,Ct=n.get(j).__webglTexture;e.bindTexture(Ut,Ct),b(Ut),e.unbindTexture()}}}function st(E){if(o&&E.samples>0&&_t(E)===!1){let y=E.textures,V=E.width,X=E.height,tt=i.COLOR_BUFFER_BIT,j=[],Ut=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Ct=n.get(E),ct=y.length>1;if(ct)for(let ht=0;ht<y.length;ht++)e.bindFramebuffer(i.FRAMEBUFFER,Ct.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ht,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,Ct.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ht,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,Ct.__webglMultisampledFramebuffer),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ct.__webglFramebuffer);for(let ht=0;ht<y.length;ht++){j.push(i.COLOR_ATTACHMENT0+ht),E.depthBuffer&&j.push(Ut);let Nt=Ct.__ignoreDepthValues!==void 0?Ct.__ignoreDepthValues:!1;if(Nt===!1&&(E.depthBuffer&&(tt|=i.DEPTH_BUFFER_BIT),E.stencilBuffer&&(tt|=i.STENCIL_BUFFER_BIT)),ct&&i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Ct.__webglColorRenderbuffer[ht]),Nt===!0&&(i.invalidateFramebuffer(i.READ_FRAMEBUFFER,[Ut]),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[Ut])),ct){let rt=n.get(y[ht]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,rt,0)}i.blitFramebuffer(0,0,V,X,0,0,V,X,tt,i.NEAREST),l&&i.invalidateFramebuffer(i.READ_FRAMEBUFFER,j)}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ct)for(let ht=0;ht<y.length;ht++){e.bindFramebuffer(i.FRAMEBUFFER,Ct.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ht,i.RENDERBUFFER,Ct.__webglColorRenderbuffer[ht]);let Nt=n.get(y[ht]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,Ct.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ht,i.TEXTURE_2D,Nt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ct.__webglMultisampledFramebuffer)}}function K(E){return Math.min(s.maxSamples,E.samples)}function _t(E){let y=n.get(E);return o&&E.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function ft(E){let y=a.render.frame;u.get(E)!==y&&(u.set(E,y),E.update())}function yt(E,y){let V=E.colorSpace,X=E.format,tt=E.type;return E.isCompressedTexture===!0||E.isVideoTexture===!0||E.format===mo||V!==Wn&&V!==On&&(Kt.getTransfer(V)===ne?o===!1?t.has("EXT_sRGB")===!0&&X===nn?(E.format=mo,E.minFilter=Oe,E.generateMipmaps=!1):y=Rr.sRGBToLinear(y):(X!==nn||tt!==zn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",V)),y}function Wt(E){return typeof HTMLImageElement!="undefined"&&E instanceof HTMLImageElement?(h.width=E.naturalWidth||E.width,h.height=E.naturalHeight||E.height):typeof VideoFrame!="undefined"&&E instanceof VideoFrame?(h.width=E.displayWidth,h.height=E.displayHeight):(h.width=E.width,h.height=E.height),h}this.allocateTextureUnit=G,this.resetTextureUnits=I,this.setTexture2D=Z,this.setTexture2DArray=q,this.setTexture3D=Y,this.setTextureCube=it,this.rebindTextures=R,this.setupRenderTarget=at,this.updateRenderTargetMipmap=$,this.updateMultisampleRenderTarget=st,this.setupDepthRenderbuffer=At,this.setupFrameBufferTexture=Mt,this.useMultisampledRTT=_t}function rg(i,t,e){let n=e.isWebGL2;function s(r,a=On){let o,c=Kt.getTransfer(a);if(r===zn)return i.UNSIGNED_BYTE;if(r===ph)return i.UNSIGNED_SHORT_4_4_4_4;if(r===mh)return i.UNSIGNED_SHORT_5_5_5_1;if(r===Ju)return i.BYTE;if(r===Ku)return i.SHORT;if(r===rc)return i.UNSIGNED_SHORT;if(r===fh)return i.INT;if(r===Fn)return i.UNSIGNED_INT;if(r===cn)return i.FLOAT;if(r===Ss)return n?i.HALF_FLOAT:(o=t.get("OES_texture_half_float"),o!==null?o.HALF_FLOAT_OES:null);if(r===ju)return i.ALPHA;if(r===nn)return i.RGBA;if(r===Qu)return i.LUMINANCE;if(r===td)return i.LUMINANCE_ALPHA;if(r===hi)return i.DEPTH_COMPONENT;if(r===$i)return i.DEPTH_STENCIL;if(r===mo)return o=t.get("EXT_sRGB"),o!==null?o.SRGB_ALPHA_EXT:null;if(r===gh)return i.RED;if(r===xh)return i.RED_INTEGER;if(r===ed)return i.RG;if(r===_h)return i.RG_INTEGER;if(r===vh)return i.RGBA_INTEGER;if(r===wa||r===Ea||r===Ta||r===Aa)if(c===ne)if(o=t.get("WEBGL_compressed_texture_s3tc_srgb"),o!==null){if(r===wa)return o.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===Ea)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===Ta)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===Aa)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(o=t.get("WEBGL_compressed_texture_s3tc"),o!==null){if(r===wa)return o.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===Ea)return o.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===Ta)return o.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===Aa)return o.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===Fc||r===Bc||r===kc||r===zc)if(o=t.get("WEBGL_compressed_texture_pvrtc"),o!==null){if(r===Fc)return o.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===Bc)return o.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===kc)return o.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===zc)return o.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===yh)return o=t.get("WEBGL_compressed_texture_etc1"),o!==null?o.COMPRESSED_RGB_ETC1_WEBGL:null;if(r===Hc||r===Vc)if(o=t.get("WEBGL_compressed_texture_etc"),o!==null){if(r===Hc)return c===ne?o.COMPRESSED_SRGB8_ETC2:o.COMPRESSED_RGB8_ETC2;if(r===Vc)return c===ne?o.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:o.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===Gc||r===Wc||r===Xc||r===qc||r===Yc||r===$c||r===Zc||r===Jc||r===Kc||r===jc||r===Qc||r===tl||r===el||r===nl)if(o=t.get("WEBGL_compressed_texture_astc"),o!==null){if(r===Gc)return c===ne?o.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:o.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===Wc)return c===ne?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:o.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===Xc)return c===ne?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:o.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===qc)return c===ne?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:o.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===Yc)return c===ne?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:o.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===$c)return c===ne?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:o.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===Zc)return c===ne?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:o.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===Jc)return c===ne?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:o.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===Kc)return c===ne?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:o.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===jc)return c===ne?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:o.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===Qc)return c===ne?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:o.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===tl)return c===ne?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:o.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===el)return c===ne?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:o.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===nl)return c===ne?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:o.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===Ra||r===il||r===sl)if(o=t.get("EXT_texture_compression_bptc"),o!==null){if(r===Ra)return c===ne?o.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:o.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===il)return o.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===sl)return o.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===nd||r===rl||r===al||r===ol)if(o=t.get("EXT_texture_compression_rgtc"),o!==null){if(r===Ra)return o.COMPRESSED_RED_RGTC1_EXT;if(r===rl)return o.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===al)return o.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===ol)return o.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===li?n?i.UNSIGNED_INT_24_8:(o=t.get("WEBGL_depth_texture"),o!==null?o.UNSIGNED_INT_24_8_WEBGL:null):i[r]!==void 0?i[r]:null}return{convert:s}}var Po=class extends Ue{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}},Ce=class extends Se{constructor(){super(),this.isGroup=!0,this.type="Group"}},ag={type:"move"},vs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ce,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ce,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ce,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null,o=this._targetRay,c=this._grip,l=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(l&&t.hand){a=!0;for(let _ of t.hand.values()){let f=e.getJointPose(_,n),m=this._getHandJoint(l,_);f!==null&&(m.matrix.fromArray(f.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=f.radius),m.visible=f!==null}let h=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],d=h.position.distanceTo(u.position),p=.02,g=.005;l.inputState.pinching&&d>p+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!l.inputState.pinching&&d<=p-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(ag)))}return o!==null&&(o.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new Ce;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},og=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,cg=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepthEXT = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepthEXT = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Lo=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){let s=new Be,r=t.properties.get(s);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}render(t,e){if(this.texture!==null){if(this.mesh===null){let n=e.cameras[0].viewport,s=new Je({extensions:{fragDepth:!0},vertexShader:og,fragmentShader:cg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new jt(new Ji(20,20),s)}t.render(this.mesh,e)}}reset(){this.texture=null,this.mesh=null}},Io=class extends Vn{constructor(t,e){super();let n=this,s=null,r=1,a=null,o="local-floor",c=1,l=null,h=null,u=null,d=null,p=null,g=null,_=new Lo,f=e.getContextAttributes(),m=null,M=null,x=[],b=[],C=new nt,A=null,w=new Ue;w.layers.enable(1),w.viewport=new ve;let P=new Ue;P.layers.enable(2),P.viewport=new ve;let N=[w,P],v=new Po;v.layers.enable(1),v.layers.enable(2);let T=null,W=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(H){let Q=x[H];return Q===void 0&&(Q=new vs,x[H]=Q),Q.getTargetRaySpace()},this.getControllerGrip=function(H){let Q=x[H];return Q===void 0&&(Q=new vs,x[H]=Q),Q.getGripSpace()},this.getHand=function(H){let Q=x[H];return Q===void 0&&(Q=new vs,x[H]=Q),Q.getHandSpace()};function J(H){let Q=b.indexOf(H.inputSource);if(Q===-1)return;let pt=x[Q];pt!==void 0&&(pt.update(H.inputSource,H.frame,l||a),pt.dispatchEvent({type:H.type,data:H.inputSource}))}function I(){s.removeEventListener("select",J),s.removeEventListener("selectstart",J),s.removeEventListener("selectend",J),s.removeEventListener("squeeze",J),s.removeEventListener("squeezestart",J),s.removeEventListener("squeezeend",J),s.removeEventListener("end",I),s.removeEventListener("inputsourceschange",G);for(let H=0;H<x.length;H++){let Q=b[H];Q!==null&&(b[H]=null,x[H].disconnect(Q))}T=null,W=null,_.reset(),t.setRenderTarget(m),p=null,d=null,u=null,s=null,M=null,Dt.stop(),n.isPresenting=!1,t.setPixelRatio(A),t.setSize(C.width,C.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(H){r=H,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(H){o=H,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(H){l=H},this.getBaseLayer=function(){return d!==null?d:p},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(H){if(s=H,s!==null){if(m=t.getRenderTarget(),s.addEventListener("select",J),s.addEventListener("selectstart",J),s.addEventListener("selectend",J),s.addEventListener("squeeze",J),s.addEventListener("squeezestart",J),s.addEventListener("squeezeend",J),s.addEventListener("end",I),s.addEventListener("inputsourceschange",G),f.xrCompatible!==!0&&await e.makeXRCompatible(),A=t.getPixelRatio(),t.getSize(C),s.renderState.layers===void 0||t.capabilities.isWebGL2===!1){let Q={antialias:s.renderState.layers===void 0?f.antialias:!0,alpha:!0,depth:f.depth,stencil:f.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,e,Q),s.updateRenderState({baseLayer:p}),t.setPixelRatio(1),t.setSize(p.framebufferWidth,p.framebufferHeight,!1),M=new En(p.framebufferWidth,p.framebufferHeight,{format:nn,type:zn,colorSpace:t.outputColorSpace,stencilBuffer:f.stencil})}else{let Q=null,pt=null,Tt=null;f.depth&&(Tt=f.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,Q=f.stencil?$i:hi,pt=f.stencil?li:Fn);let Mt={colorFormat:e.RGBA8,depthFormat:Tt,scaleFactor:r};u=new XRWebGLBinding(s,e),d=u.createProjectionLayer(Mt),s.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),M=new En(d.textureWidth,d.textureHeight,{format:nn,type:zn,depthTexture:new kr(d.textureWidth,d.textureHeight,pt,void 0,void 0,void 0,void 0,void 0,void 0,Q),stencilBuffer:f.stencil,colorSpace:t.outputColorSpace,samples:f.antialias?4:0});let vt=t.properties.get(M);vt.__ignoreDepthValues=d.ignoreDepthValues}M.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await s.requestReferenceSpace(o),Dt.setContext(s),Dt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode};function G(H){for(let Q=0;Q<H.removed.length;Q++){let pt=H.removed[Q],Tt=b.indexOf(pt);Tt>=0&&(b[Tt]=null,x[Tt].disconnect(pt))}for(let Q=0;Q<H.added.length;Q++){let pt=H.added[Q],Tt=b.indexOf(pt);if(Tt===-1){for(let vt=0;vt<x.length;vt++)if(vt>=b.length){b.push(pt),Tt=vt;break}else if(b[vt]===null){b[vt]=pt,Tt=vt;break}if(Tt===-1)break}let Mt=x[Tt];Mt&&Mt.connect(pt)}}let z=new L,Z=new L;function q(H,Q,pt){z.setFromMatrixPosition(Q.matrixWorld),Z.setFromMatrixPosition(pt.matrixWorld);let Tt=z.distanceTo(Z),Mt=Q.projectionMatrix.elements,vt=pt.projectionMatrix.elements,Vt=Mt[14]/(Mt[10]-1),At=Mt[14]/(Mt[10]+1),R=(Mt[9]+1)/Mt[5],at=(Mt[9]-1)/Mt[5],$=(Mt[8]-1)/Mt[0],st=(vt[8]+1)/vt[0],K=Vt*$,_t=Vt*st,ft=Tt/(-$+st),yt=ft*-$;Q.matrixWorld.decompose(H.position,H.quaternion,H.scale),H.translateX(yt),H.translateZ(ft),H.matrixWorld.compose(H.position,H.quaternion,H.scale),H.matrixWorldInverse.copy(H.matrixWorld).invert();let Wt=Vt+ft,E=At+ft,y=K-yt,V=_t+(Tt-yt),X=R*At/E*Wt,tt=at*At/E*Wt;H.projectionMatrix.makePerspective(y,V,X,tt,Wt,E),H.projectionMatrixInverse.copy(H.projectionMatrix).invert()}function Y(H,Q){Q===null?H.matrixWorld.copy(H.matrix):H.matrixWorld.multiplyMatrices(Q.matrixWorld,H.matrix),H.matrixWorldInverse.copy(H.matrixWorld).invert()}this.updateCamera=function(H){if(s===null)return;_.texture!==null&&(H.near=_.depthNear,H.far=_.depthFar),v.near=P.near=w.near=H.near,v.far=P.far=w.far=H.far,(T!==v.near||W!==v.far)&&(s.updateRenderState({depthNear:v.near,depthFar:v.far}),T=v.near,W=v.far,w.near=T,w.far=W,P.near=T,P.far=W,w.updateProjectionMatrix(),P.updateProjectionMatrix(),H.updateProjectionMatrix());let Q=H.parent,pt=v.cameras;Y(v,Q);for(let Tt=0;Tt<pt.length;Tt++)Y(pt[Tt],Q);pt.length===2?q(v,w,P):v.projectionMatrix.copy(w.projectionMatrix),it(H,v,Q)};function it(H,Q,pt){pt===null?H.matrix.copy(Q.matrixWorld):(H.matrix.copy(pt.matrixWorld),H.matrix.invert(),H.matrix.multiply(Q.matrixWorld)),H.matrix.decompose(H.position,H.quaternion,H.scale),H.updateMatrixWorld(!0),H.projectionMatrix.copy(Q.projectionMatrix),H.projectionMatrixInverse.copy(Q.projectionMatrixInverse),H.isPerspectiveCamera&&(H.fov=go*2*Math.atan(1/H.projectionMatrix.elements[5]),H.zoom=1)}this.getCamera=function(){return v},this.getFoveation=function(){if(!(d===null&&p===null))return c},this.setFoveation=function(H){c=H,d!==null&&(d.fixedFoveation=H),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=H)},this.hasDepthSensing=function(){return _.texture!==null};let et=null;function xt(H,Q){if(h=Q.getViewerPose(l||a),g=Q,h!==null){let pt=h.views;p!==null&&(t.setRenderTargetFramebuffer(M,p.framebuffer),t.setRenderTarget(M));let Tt=!1;pt.length!==v.cameras.length&&(v.cameras.length=0,Tt=!0);for(let vt=0;vt<pt.length;vt++){let Vt=pt[vt],At=null;if(p!==null)At=p.getViewport(Vt);else{let at=u.getViewSubImage(d,Vt);At=at.viewport,vt===0&&(t.setRenderTargetTextures(M,at.colorTexture,d.ignoreDepthValues?void 0:at.depthStencilTexture),t.setRenderTarget(M))}let R=N[vt];R===void 0&&(R=new Ue,R.layers.enable(vt),R.viewport=new ve,N[vt]=R),R.matrix.fromArray(Vt.transform.matrix),R.matrix.decompose(R.position,R.quaternion,R.scale),R.projectionMatrix.fromArray(Vt.projectionMatrix),R.projectionMatrixInverse.copy(R.projectionMatrix).invert(),R.viewport.set(At.x,At.y,At.width,At.height),vt===0&&(v.matrix.copy(R.matrix),v.matrix.decompose(v.position,v.quaternion,v.scale)),Tt===!0&&v.cameras.push(R)}let Mt=s.enabledFeatures;if(Mt&&Mt.includes("depth-sensing")){let vt=u.getDepthInformation(pt[0]);vt&&vt.isValid&&vt.texture&&_.init(t,vt,s.renderState)}}for(let pt=0;pt<x.length;pt++){let Tt=b[pt],Mt=x[pt];Tt!==null&&Mt!==void 0&&Mt.update(Tt,Q,l||a)}_.render(t,v),et&&et(H,Q),Q.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Q}),g=null}let Dt=new Ah;Dt.setAnimationLoop(xt),this.setAnimationLoop=function(H){et=H},this.dispose=function(){}}},ii=new ke,lg=new Zt;function hg(i,t){function e(f,m){f.matrixAutoUpdate===!0&&f.updateMatrix(),m.value.copy(f.matrix)}function n(f,m){m.color.getRGB(f.fogColor.value,Th(i)),m.isFog?(f.fogNear.value=m.near,f.fogFar.value=m.far):m.isFogExp2&&(f.fogDensity.value=m.density)}function s(f,m,M,x,b){m.isMeshBasicMaterial||m.isMeshLambertMaterial?r(f,m):m.isMeshToonMaterial?(r(f,m),u(f,m)):m.isMeshPhongMaterial?(r(f,m),h(f,m)):m.isMeshStandardMaterial?(r(f,m),d(f,m),m.isMeshPhysicalMaterial&&p(f,m,b)):m.isMeshMatcapMaterial?(r(f,m),g(f,m)):m.isMeshDepthMaterial?r(f,m):m.isMeshDistanceMaterial?(r(f,m),_(f,m)):m.isMeshNormalMaterial?r(f,m):m.isLineBasicMaterial?(a(f,m),m.isLineDashedMaterial&&o(f,m)):m.isPointsMaterial?c(f,m,M,x):m.isSpriteMaterial?l(f,m):m.isShadowMaterial?(f.color.value.copy(m.color),f.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(f,m){f.opacity.value=m.opacity,m.color&&f.diffuse.value.copy(m.color),m.emissive&&f.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(f.map.value=m.map,e(m.map,f.mapTransform)),m.alphaMap&&(f.alphaMap.value=m.alphaMap,e(m.alphaMap,f.alphaMapTransform)),m.bumpMap&&(f.bumpMap.value=m.bumpMap,e(m.bumpMap,f.bumpMapTransform),f.bumpScale.value=m.bumpScale,m.side===Pe&&(f.bumpScale.value*=-1)),m.normalMap&&(f.normalMap.value=m.normalMap,e(m.normalMap,f.normalMapTransform),f.normalScale.value.copy(m.normalScale),m.side===Pe&&f.normalScale.value.negate()),m.displacementMap&&(f.displacementMap.value=m.displacementMap,e(m.displacementMap,f.displacementMapTransform),f.displacementScale.value=m.displacementScale,f.displacementBias.value=m.displacementBias),m.emissiveMap&&(f.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,f.emissiveMapTransform)),m.specularMap&&(f.specularMap.value=m.specularMap,e(m.specularMap,f.specularMapTransform)),m.alphaTest>0&&(f.alphaTest.value=m.alphaTest);let M=t.get(m),x=M.envMap,b=M.envMapRotation;if(x&&(f.envMap.value=x,ii.copy(b),ii.x*=-1,ii.y*=-1,ii.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(ii.y*=-1,ii.z*=-1),f.envMapRotation.value.setFromMatrix4(lg.makeRotationFromEuler(ii)),f.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,f.reflectivity.value=m.reflectivity,f.ior.value=m.ior,f.refractionRatio.value=m.refractionRatio),m.lightMap){f.lightMap.value=m.lightMap;let C=i._useLegacyLights===!0?Math.PI:1;f.lightMapIntensity.value=m.lightMapIntensity*C,e(m.lightMap,f.lightMapTransform)}m.aoMap&&(f.aoMap.value=m.aoMap,f.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,f.aoMapTransform))}function a(f,m){f.diffuse.value.copy(m.color),f.opacity.value=m.opacity,m.map&&(f.map.value=m.map,e(m.map,f.mapTransform))}function o(f,m){f.dashSize.value=m.dashSize,f.totalSize.value=m.dashSize+m.gapSize,f.scale.value=m.scale}function c(f,m,M,x){f.diffuse.value.copy(m.color),f.opacity.value=m.opacity,f.size.value=m.size*M,f.scale.value=x*.5,m.map&&(f.map.value=m.map,e(m.map,f.uvTransform)),m.alphaMap&&(f.alphaMap.value=m.alphaMap,e(m.alphaMap,f.alphaMapTransform)),m.alphaTest>0&&(f.alphaTest.value=m.alphaTest)}function l(f,m){f.diffuse.value.copy(m.color),f.opacity.value=m.opacity,f.rotation.value=m.rotation,m.map&&(f.map.value=m.map,e(m.map,f.mapTransform)),m.alphaMap&&(f.alphaMap.value=m.alphaMap,e(m.alphaMap,f.alphaMapTransform)),m.alphaTest>0&&(f.alphaTest.value=m.alphaTest)}function h(f,m){f.specular.value.copy(m.specular),f.shininess.value=Math.max(m.shininess,1e-4)}function u(f,m){m.gradientMap&&(f.gradientMap.value=m.gradientMap)}function d(f,m){f.metalness.value=m.metalness,m.metalnessMap&&(f.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,f.metalnessMapTransform)),f.roughness.value=m.roughness,m.roughnessMap&&(f.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,f.roughnessMapTransform)),t.get(m).envMap&&(f.envMapIntensity.value=m.envMapIntensity)}function p(f,m,M){f.ior.value=m.ior,m.sheen>0&&(f.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),f.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(f.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,f.sheenColorMapTransform)),m.sheenRoughnessMap&&(f.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,f.sheenRoughnessMapTransform))),m.clearcoat>0&&(f.clearcoat.value=m.clearcoat,f.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(f.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,f.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(f.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,f.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(f.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,f.clearcoatNormalMapTransform),f.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Pe&&f.clearcoatNormalScale.value.negate())),m.iridescence>0&&(f.iridescence.value=m.iridescence,f.iridescenceIOR.value=m.iridescenceIOR,f.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],f.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(f.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,f.iridescenceMapTransform)),m.iridescenceThicknessMap&&(f.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,f.iridescenceThicknessMapTransform))),m.transmission>0&&(f.transmission.value=m.transmission,f.transmissionSamplerMap.value=M.texture,f.transmissionSamplerSize.value.set(M.width,M.height),m.transmissionMap&&(f.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,f.transmissionMapTransform)),f.thickness.value=m.thickness,m.thicknessMap&&(f.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,f.thicknessMapTransform)),f.attenuationDistance.value=m.attenuationDistance,f.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(f.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(f.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,f.anisotropyMapTransform))),f.specularIntensity.value=m.specularIntensity,f.specularColor.value.copy(m.specularColor),m.specularColorMap&&(f.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,f.specularColorMapTransform)),m.specularIntensityMap&&(f.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,f.specularIntensityMapTransform))}function g(f,m){m.matcap&&(f.matcap.value=m.matcap)}function _(f,m){let M=t.get(m).light;f.referencePosition.value.setFromMatrixPosition(M.matrixWorld),f.nearDistance.value=M.shadow.camera.near,f.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function ug(i,t,e,n){let s={},r={},a=[],o=e.isWebGL2?i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS):0;function c(M,x){let b=x.program;n.uniformBlockBinding(M,b)}function l(M,x){let b=s[M.id];b===void 0&&(g(M),b=h(M),s[M.id]=b,M.addEventListener("dispose",f));let C=x.program;n.updateUBOMapping(M,C);let A=t.render.frame;r[M.id]!==A&&(d(M),r[M.id]=A)}function h(M){let x=u();M.__bindingPointIndex=x;let b=i.createBuffer(),C=M.__size,A=M.usage;return i.bindBuffer(i.UNIFORM_BUFFER,b),i.bufferData(i.UNIFORM_BUFFER,C,A),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,x,b),b}function u(){for(let M=0;M<o;M++)if(a.indexOf(M)===-1)return a.push(M),M;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(M){let x=s[M.id],b=M.uniforms,C=M.__cache;i.bindBuffer(i.UNIFORM_BUFFER,x);for(let A=0,w=b.length;A<w;A++){let P=Array.isArray(b[A])?b[A]:[b[A]];for(let N=0,v=P.length;N<v;N++){let T=P[N];if(p(T,A,N,C)===!0){let W=T.__offset,J=Array.isArray(T.value)?T.value:[T.value],I=0;for(let G=0;G<J.length;G++){let z=J[G],Z=_(z);typeof z=="number"||typeof z=="boolean"?(T.__data[0]=z,i.bufferSubData(i.UNIFORM_BUFFER,W+I,T.__data)):z.isMatrix3?(T.__data[0]=z.elements[0],T.__data[1]=z.elements[1],T.__data[2]=z.elements[2],T.__data[3]=0,T.__data[4]=z.elements[3],T.__data[5]=z.elements[4],T.__data[6]=z.elements[5],T.__data[7]=0,T.__data[8]=z.elements[6],T.__data[9]=z.elements[7],T.__data[10]=z.elements[8],T.__data[11]=0):(z.toArray(T.__data,I),I+=Z.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,W,T.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(M,x,b,C){let A=M.value,w=x+"_"+b;if(C[w]===void 0)return typeof A=="number"||typeof A=="boolean"?C[w]=A:C[w]=A.clone(),!0;{let P=C[w];if(typeof A=="number"||typeof A=="boolean"){if(P!==A)return C[w]=A,!0}else if(P.equals(A)===!1)return P.copy(A),!0}return!1}function g(M){let x=M.uniforms,b=0,C=16;for(let w=0,P=x.length;w<P;w++){let N=Array.isArray(x[w])?x[w]:[x[w]];for(let v=0,T=N.length;v<T;v++){let W=N[v],J=Array.isArray(W.value)?W.value:[W.value];for(let I=0,G=J.length;I<G;I++){let z=J[I],Z=_(z),q=b%C;q!==0&&C-q<Z.boundary&&(b+=C-q),W.__data=new Float32Array(Z.storage/Float32Array.BYTES_PER_ELEMENT),W.__offset=b,b+=Z.storage}}}let A=b%C;return A>0&&(b+=C-A),M.__size=b,M.__cache={},this}function _(M){let x={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(x.boundary=4,x.storage=4):M.isVector2?(x.boundary=8,x.storage=8):M.isVector3||M.isColor?(x.boundary=16,x.storage=12):M.isVector4?(x.boundary=16,x.storage=16):M.isMatrix3?(x.boundary=48,x.storage=48):M.isMatrix4?(x.boundary=64,x.storage=64):M.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",M),x}function f(M){let x=M.target;x.removeEventListener("dispose",f);let b=a.indexOf(x.__bindingPointIndex);a.splice(b,1),i.deleteBuffer(s[x.id]),delete s[x.id],delete r[x.id]}function m(){for(let M in s)i.deleteBuffer(s[M]);a=[],s={},r={}}return{bind:c,update:l,dispose:m}}var Es=class{constructor(t={}){let{canvas:e=pd(),context:n=null,depth:s=!0,stencil:r=!0,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1}=t;this.isWebGLRenderer=!0;let d;n!==null?d=n.getContextAttributes().alpha:d=a;let p=new Uint32Array(4),g=new Int32Array(4),_=null,f=null,m=[],M=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Fe,this._useLegacyLights=!1,this.toneMapping=kn,this.toneMappingExposure=1;let x=this,b=!1,C=0,A=0,w=null,P=-1,N=null,v=new ve,T=new ve,W=null,J=new Et(0),I=0,G=e.width,z=e.height,Z=1,q=null,Y=null,it=new ve(0,0,G,z),et=new ve(0,0,G,z),xt=!1,Dt=new ws,H=!1,Q=!1,pt=null,Tt=new Zt,Mt=new nt,vt=new L,Vt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function At(){return w===null?Z:1}let R=n;function at(S,U){for(let B=0;B<S.length;B++){let k=S[B],O=e.getContext(k,U);if(O!==null)return O}return null}try{let S={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine","three.js r162"),e.addEventListener("webglcontextlost",ie,!1),e.addEventListener("webglcontextrestored",D,!1),e.addEventListener("webglcontextcreationerror",ut,!1),R===null){let U=["webgl2","webgl","experimental-webgl"];if(x.isWebGL1Renderer===!0&&U.shift(),R=at(U,S),R===null)throw at(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext!="undefined"&&R instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),R.getShaderPrecisionFormat===void 0&&(R.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(S){throw console.error("THREE.WebGLRenderer: "+S.message),S}let $,st,K,_t,ft,yt,Wt,E,y,V,X,tt,j,Ut,Ct,ct,ht,Nt,rt,le,Xt,Rt,bt,St;function $t(){$=new Am(R),st=new Mm(R,$,t),$.init(st),Rt=new rg(R,$,st),K=new ig(R,$,st),_t=new Pm(R),ft=new X0,yt=new sg(R,$,K,ft,st,Rt,_t),Wt=new Sm(x),E=new Tm(x),y=new Nd(R,st),bt=new vm(R,$,y,st),V=new Rm(R,y,_t,bt),X=new Um(R,V,y,_t),rt=new Dm(R,st,yt),ct=new bm(ft),tt=new W0(x,Wt,E,$,st,bt,ct),j=new hg(x,ft),Ut=new Y0,Ct=new Q0($,st),Nt=new _m(x,Wt,E,K,X,d,c),ht=new ng(x,X,st),St=new ug(R,_t,st,K),le=new ym(R,$,_t,st),Xt=new Cm(R,$,_t,st),_t.programs=tt.programs,x.capabilities=st,x.extensions=$,x.properties=ft,x.renderLists=Ut,x.shadowMap=ht,x.state=K,x.info=_t}$t();let Ft=new Io(x,R);this.xr=Ft,this.getContext=function(){return R},this.getContextAttributes=function(){return R.getContextAttributes()},this.forceContextLoss=function(){let S=$.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){let S=$.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return Z},this.setPixelRatio=function(S){S!==void 0&&(Z=S,this.setSize(G,z,!1))},this.getSize=function(S){return S.set(G,z)},this.setSize=function(S,U,B=!0){if(Ft.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}G=S,z=U,e.width=Math.floor(S*Z),e.height=Math.floor(U*Z),B===!0&&(e.style.width=S+"px",e.style.height=U+"px"),this.setViewport(0,0,S,U)},this.getDrawingBufferSize=function(S){return S.set(G*Z,z*Z).floor()},this.setDrawingBufferSize=function(S,U,B){G=S,z=U,Z=B,e.width=Math.floor(S*B),e.height=Math.floor(U*B),this.setViewport(0,0,S,U)},this.getCurrentViewport=function(S){return S.copy(v)},this.getViewport=function(S){return S.copy(it)},this.setViewport=function(S,U,B,k){S.isVector4?it.set(S.x,S.y,S.z,S.w):it.set(S,U,B,k),K.viewport(v.copy(it).multiplyScalar(Z).round())},this.getScissor=function(S){return S.copy(et)},this.setScissor=function(S,U,B,k){S.isVector4?et.set(S.x,S.y,S.z,S.w):et.set(S,U,B,k),K.scissor(T.copy(et).multiplyScalar(Z).round())},this.getScissorTest=function(){return xt},this.setScissorTest=function(S){K.setScissorTest(xt=S)},this.setOpaqueSort=function(S){q=S},this.setTransparentSort=function(S){Y=S},this.getClearColor=function(S){return S.copy(Nt.getClearColor())},this.setClearColor=function(){Nt.setClearColor.apply(Nt,arguments)},this.getClearAlpha=function(){return Nt.getClearAlpha()},this.setClearAlpha=function(){Nt.setClearAlpha.apply(Nt,arguments)},this.clear=function(S=!0,U=!0,B=!0){let k=0;if(S){let O=!1;if(w!==null){let mt=w.texture.format;O=mt===vh||mt===_h||mt===xh}if(O){let mt=w.texture.type,wt=mt===zn||mt===Fn||mt===rc||mt===li||mt===ph||mt===mh,Pt=Nt.getClearColor(),Lt=Nt.getClearAlpha(),Gt=Pt.r,Ot=Pt.g,Bt=Pt.b;wt?(p[0]=Gt,p[1]=Ot,p[2]=Bt,p[3]=Lt,R.clearBufferuiv(R.COLOR,0,p)):(g[0]=Gt,g[1]=Ot,g[2]=Bt,g[3]=Lt,R.clearBufferiv(R.COLOR,0,g))}else k|=R.COLOR_BUFFER_BIT}U&&(k|=R.DEPTH_BUFFER_BIT),B&&(k|=R.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),R.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",ie,!1),e.removeEventListener("webglcontextrestored",D,!1),e.removeEventListener("webglcontextcreationerror",ut,!1),Ut.dispose(),Ct.dispose(),ft.dispose(),Wt.dispose(),E.dispose(),X.dispose(),bt.dispose(),St.dispose(),tt.dispose(),Ft.dispose(),Ft.removeEventListener("sessionstart",qe),Ft.removeEventListener("sessionend",te),pt&&(pt.dispose(),pt=null),Le.stop()};function ie(S){S.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),b=!0}function D(){console.log("THREE.WebGLRenderer: Context Restored."),b=!1;let S=_t.autoReset,U=ht.enabled,B=ht.autoUpdate,k=ht.needsUpdate,O=ht.type;$t(),_t.autoReset=S,ht.enabled=U,ht.autoUpdate=B,ht.needsUpdate=k,ht.type=O}function ut(S){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function F(S){let U=S.target;U.removeEventListener("dispose",F),ot(U)}function ot(S){dt(S),ft.remove(S)}function dt(S){let U=ft.get(S).programs;U!==void 0&&(U.forEach(function(B){tt.releaseProgram(B)}),S.isShaderMaterial&&tt.releaseShaderCache(S))}this.renderBufferDirect=function(S,U,B,k,O,mt){U===null&&(U=Vt);let wt=O.isMesh&&O.matrixWorld.determinant()<0,Pt=au(S,U,B,k,O);K.setMaterial(k,wt);let Lt=B.index,Gt=1;if(k.wireframe===!0){if(Lt=V.getWireframeAttribute(B),Lt===void 0)return;Gt=2}let Ot=B.drawRange,Bt=B.attributes.position,ce=Ot.start*Gt,Ve=(Ot.start+Ot.count)*Gt;mt!==null&&(ce=Math.max(ce,mt.start*Gt),Ve=Math.min(Ve,(mt.start+mt.count)*Gt)),Lt!==null?(ce=Math.max(ce,0),Ve=Math.min(Ve,Lt.count)):Bt!=null&&(ce=Math.max(ce,0),Ve=Math.min(Ve,Bt.count));let xe=Ve-ce;if(xe<0||xe===1/0)return;bt.setup(O,k,Pt,B,Lt);let dn,ae=le;if(Lt!==null&&(dn=y.get(Lt),ae=Xt,ae.setIndex(dn)),O.isMesh)k.wireframe===!0?(K.setLineWidth(k.wireframeLinewidth*At()),ae.setMode(R.LINES)):ae.setMode(R.TRIANGLES);else if(O.isLine){let kt=k.linewidth;kt===void 0&&(kt=1),K.setLineWidth(kt*At()),O.isLineSegments?ae.setMode(R.LINES):O.isLineLoop?ae.setMode(R.LINE_LOOP):ae.setMode(R.LINE_STRIP)}else O.isPoints?ae.setMode(R.POINTS):O.isSprite&&ae.setMode(R.TRIANGLES);if(O.isBatchedMesh)ae.renderMultiDraw(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount);else if(O.isInstancedMesh)ae.renderInstances(ce,xe,O.count);else if(B.isInstancedBufferGeometry){let kt=B._maxInstanceCount!==void 0?B._maxInstanceCount:1/0,pa=Math.min(B.instanceCount,kt);ae.renderInstances(ce,xe,pa)}else ae.render(ce,xe)};function qt(S,U,B){S.transparent===!0&&S.side===bn&&S.forceSinglePass===!1?(S.side=Pe,S.needsUpdate=!0,Os(S,U,B),S.side=Hn,S.needsUpdate=!0,Os(S,U,B),S.side=bn):Os(S,U,B)}this.compile=function(S,U,B=null){B===null&&(B=S),f=Ct.get(B),f.init(),M.push(f),B.traverseVisible(function(O){O.isLight&&O.layers.test(U.layers)&&(f.pushLight(O),O.castShadow&&f.pushShadow(O))}),S!==B&&S.traverseVisible(function(O){O.isLight&&O.layers.test(U.layers)&&(f.pushLight(O),O.castShadow&&f.pushShadow(O))}),f.setupLights(x._useLegacyLights);let k=new Set;return S.traverse(function(O){let mt=O.material;if(mt)if(Array.isArray(mt))for(let wt=0;wt<mt.length;wt++){let Pt=mt[wt];qt(Pt,B,O),k.add(Pt)}else qt(mt,B,O),k.add(mt)}),M.pop(),f=null,k},this.compileAsync=function(S,U,B=null){let k=this.compile(S,U,B);return new Promise(O=>{function mt(){if(k.forEach(function(wt){ft.get(wt).currentProgram.isReady()&&k.delete(wt)}),k.size===0){O(S);return}setTimeout(mt,10)}$.get("KHR_parallel_shader_compile")!==null?mt():setTimeout(mt,10)})};let Qt=null;function ye(S){Qt&&Qt(S)}function qe(){Le.stop()}function te(){Le.start()}let Le=new Ah;Le.setAnimationLoop(ye),typeof self!="undefined"&&Le.setContext(self),this.setAnimationLoop=function(S){Qt=S,Ft.setAnimationLoop(S),S===null?Le.stop():Le.start()},Ft.addEventListener("sessionstart",qe),Ft.addEventListener("sessionend",te),this.render=function(S,U){if(U!==void 0&&U.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(b===!0)return;S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),Ft.enabled===!0&&Ft.isPresenting===!0&&(Ft.cameraAutoUpdate===!0&&Ft.updateCamera(U),U=Ft.getCamera()),S.isScene===!0&&S.onBeforeRender(x,S,U,w),f=Ct.get(S,M.length),f.init(),M.push(f),Tt.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),Dt.setFromProjectionMatrix(Tt),Q=this.localClippingEnabled,H=ct.init(this.clippingPlanes,Q),_=Ut.get(S,m.length),_.init(),m.push(_),an(S,U,0,x.sortObjects),_.finish(),x.sortObjects===!0&&_.sort(q,Y),this.info.render.frame++,H===!0&&ct.beginShadows();let B=f.state.shadowsArray;if(ht.render(B,S,U),H===!0&&ct.endShadows(),this.info.autoReset===!0&&this.info.reset(),(Ft.enabled===!1||Ft.isPresenting===!1||Ft.hasDepthSensing()===!1)&&Nt.render(_,S),f.setupLights(x._useLegacyLights),U.isArrayCamera){let k=U.cameras;for(let O=0,mt=k.length;O<mt;O++){let wt=k[O];Mc(_,S,wt,wt.viewport)}}else Mc(_,S,U);w!==null&&(yt.updateMultisampleRenderTarget(w),yt.updateRenderTargetMipmap(w)),S.isScene===!0&&S.onAfterRender(x,S,U),bt.resetDefaultState(),P=-1,N=null,M.pop(),M.length>0?f=M[M.length-1]:f=null,m.pop(),m.length>0?_=m[m.length-1]:_=null};function an(S,U,B,k){if(S.visible===!1)return;if(S.layers.test(U.layers)){if(S.isGroup)B=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(U);else if(S.isLight)f.pushLight(S),S.castShadow&&f.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||Dt.intersectsSprite(S)){k&&vt.setFromMatrixPosition(S.matrixWorld).applyMatrix4(Tt);let wt=X.update(S),Pt=S.material;Pt.visible&&_.push(S,wt,Pt,B,vt.z,null)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||Dt.intersectsObject(S))){let wt=X.update(S),Pt=S.material;if(k&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),vt.copy(S.boundingSphere.center)):(wt.boundingSphere===null&&wt.computeBoundingSphere(),vt.copy(wt.boundingSphere.center)),vt.applyMatrix4(S.matrixWorld).applyMatrix4(Tt)),Array.isArray(Pt)){let Lt=wt.groups;for(let Gt=0,Ot=Lt.length;Gt<Ot;Gt++){let Bt=Lt[Gt],ce=Pt[Bt.materialIndex];ce&&ce.visible&&_.push(S,wt,ce,B,vt.z,Bt)}}else Pt.visible&&_.push(S,wt,Pt,B,vt.z,null)}}let mt=S.children;for(let wt=0,Pt=mt.length;wt<Pt;wt++)an(mt[wt],U,B,k)}function Mc(S,U,B,k){let O=S.opaque,mt=S.transmissive,wt=S.transparent;f.setupLightsView(B),H===!0&&ct.setGlobalState(x.clippingPlanes,B),mt.length>0&&ru(O,mt,U,B),k&&K.viewport(v.copy(k)),O.length>0&&Ns(O,U,B),mt.length>0&&Ns(mt,U,B),wt.length>0&&Ns(wt,U,B),K.buffers.depth.setTest(!0),K.buffers.depth.setMask(!0),K.buffers.color.setMask(!0),K.setPolygonOffset(!1)}function ru(S,U,B,k){if((B.isScene===!0?B.overrideMaterial:null)!==null)return;let mt=st.isWebGL2;pt===null&&(pt=new En(1,1,{generateMipmaps:!0,type:$.has("EXT_color_buffer_half_float")?Ss:zn,minFilter:oi,samples:mt?4:0})),x.getDrawingBufferSize(Mt),mt?pt.setSize(Mt.x,Mt.y):pt.setSize(xo(Mt.x),xo(Mt.y));let wt=x.getRenderTarget();x.setRenderTarget(pt),x.getClearColor(J),I=x.getClearAlpha(),I<1&&x.setClearColor(16777215,.5),x.clear();let Pt=x.toneMapping;x.toneMapping=kn,Ns(S,B,k),yt.updateMultisampleRenderTarget(pt),yt.updateRenderTargetMipmap(pt);let Lt=!1;for(let Gt=0,Ot=U.length;Gt<Ot;Gt++){let Bt=U[Gt],ce=Bt.object,Ve=Bt.geometry,xe=Bt.material,dn=Bt.group;if(xe.side===bn&&ce.layers.test(k.layers)){let ae=xe.side;xe.side=Pe,xe.needsUpdate=!0,bc(ce,B,k,Ve,xe,dn),xe.side=ae,xe.needsUpdate=!0,Lt=!0}}Lt===!0&&(yt.updateMultisampleRenderTarget(pt),yt.updateRenderTargetMipmap(pt)),x.setRenderTarget(wt),x.setClearColor(J,I),x.toneMapping=Pt}function Ns(S,U,B){let k=U.isScene===!0?U.overrideMaterial:null;for(let O=0,mt=S.length;O<mt;O++){let wt=S[O],Pt=wt.object,Lt=wt.geometry,Gt=k===null?wt.material:k,Ot=wt.group;Pt.layers.test(B.layers)&&bc(Pt,U,B,Lt,Gt,Ot)}}function bc(S,U,B,k,O,mt){S.onBeforeRender(x,U,B,k,O,mt),S.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),O.onBeforeRender(x,U,B,k,S,mt),O.transparent===!0&&O.side===bn&&O.forceSinglePass===!1?(O.side=Pe,O.needsUpdate=!0,x.renderBufferDirect(B,U,k,O,S,mt),O.side=Hn,O.needsUpdate=!0,x.renderBufferDirect(B,U,k,O,S,mt),O.side=bn):x.renderBufferDirect(B,U,k,O,S,mt),S.onAfterRender(x,U,B,k,O,mt)}function Os(S,U,B){U.isScene!==!0&&(U=Vt);let k=ft.get(S),O=f.state.lights,mt=f.state.shadowsArray,wt=O.state.version,Pt=tt.getParameters(S,O.state,mt,U,B),Lt=tt.getProgramCacheKey(Pt),Gt=k.programs;k.environment=S.isMeshStandardMaterial?U.environment:null,k.fog=U.fog,k.envMap=(S.isMeshStandardMaterial?E:Wt).get(S.envMap||k.environment),k.envMapRotation=k.environment!==null&&S.envMap===null?U.environmentRotation:S.envMapRotation,Gt===void 0&&(S.addEventListener("dispose",F),Gt=new Map,k.programs=Gt);let Ot=Gt.get(Lt);if(Ot!==void 0){if(k.currentProgram===Ot&&k.lightsStateVersion===wt)return wc(S,Pt),Ot}else Pt.uniforms=tt.getUniforms(S),S.onBuild(B,Pt,x),S.onBeforeCompile(Pt,x),Ot=tt.acquireProgram(Pt,Lt),Gt.set(Lt,Ot),k.uniforms=Pt.uniforms;let Bt=k.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Bt.clippingPlanes=ct.uniform),wc(S,Pt),k.needsLights=cu(S),k.lightsStateVersion=wt,k.needsLights&&(Bt.ambientLightColor.value=O.state.ambient,Bt.lightProbe.value=O.state.probe,Bt.directionalLights.value=O.state.directional,Bt.directionalLightShadows.value=O.state.directionalShadow,Bt.spotLights.value=O.state.spot,Bt.spotLightShadows.value=O.state.spotShadow,Bt.rectAreaLights.value=O.state.rectArea,Bt.ltc_1.value=O.state.rectAreaLTC1,Bt.ltc_2.value=O.state.rectAreaLTC2,Bt.pointLights.value=O.state.point,Bt.pointLightShadows.value=O.state.pointShadow,Bt.hemisphereLights.value=O.state.hemi,Bt.directionalShadowMap.value=O.state.directionalShadowMap,Bt.directionalShadowMatrix.value=O.state.directionalShadowMatrix,Bt.spotShadowMap.value=O.state.spotShadowMap,Bt.spotLightMatrix.value=O.state.spotLightMatrix,Bt.spotLightMap.value=O.state.spotLightMap,Bt.pointShadowMap.value=O.state.pointShadowMap,Bt.pointShadowMatrix.value=O.state.pointShadowMatrix),k.currentProgram=Ot,k.uniformsList=null,Ot}function Sc(S){if(S.uniformsList===null){let U=S.currentProgram.getUniforms();S.uniformsList=Xi.seqWithValue(U.seq,S.uniforms)}return S.uniformsList}function wc(S,U){let B=ft.get(S);B.outputColorSpace=U.outputColorSpace,B.batching=U.batching,B.instancing=U.instancing,B.instancingColor=U.instancingColor,B.instancingMorph=U.instancingMorph,B.skinning=U.skinning,B.morphTargets=U.morphTargets,B.morphNormals=U.morphNormals,B.morphColors=U.morphColors,B.morphTargetsCount=U.morphTargetsCount,B.numClippingPlanes=U.numClippingPlanes,B.numIntersection=U.numClipIntersection,B.vertexAlphas=U.vertexAlphas,B.vertexTangents=U.vertexTangents,B.toneMapping=U.toneMapping}function au(S,U,B,k,O){U.isScene!==!0&&(U=Vt),yt.resetTextureUnits();let mt=U.fog,wt=k.isMeshStandardMaterial?U.environment:null,Pt=w===null?x.outputColorSpace:w.isXRRenderTarget===!0?w.texture.colorSpace:Wn,Lt=(k.isMeshStandardMaterial?E:Wt).get(k.envMap||wt),Gt=k.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,Ot=!!B.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),Bt=!!B.morphAttributes.position,ce=!!B.morphAttributes.normal,Ve=!!B.morphAttributes.color,xe=kn;k.toneMapped&&(w===null||w.isXRRenderTarget===!0)&&(xe=x.toneMapping);let dn=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,ae=dn!==void 0?dn.length:0,kt=ft.get(k),pa=f.state.lights;if(H===!0&&(Q===!0||S!==N)){let Ye=S===N&&k.id===P;ct.setState(k,S,Ye)}let se=!1;k.version===kt.__version?(kt.needsLights&&kt.lightsStateVersion!==pa.state.version||kt.outputColorSpace!==Pt||O.isBatchedMesh&&kt.batching===!1||!O.isBatchedMesh&&kt.batching===!0||O.isInstancedMesh&&kt.instancing===!1||!O.isInstancedMesh&&kt.instancing===!0||O.isSkinnedMesh&&kt.skinning===!1||!O.isSkinnedMesh&&kt.skinning===!0||O.isInstancedMesh&&kt.instancingColor===!0&&O.instanceColor===null||O.isInstancedMesh&&kt.instancingColor===!1&&O.instanceColor!==null||O.isInstancedMesh&&kt.instancingMorph===!0&&O.morphTexture===null||O.isInstancedMesh&&kt.instancingMorph===!1&&O.morphTexture!==null||kt.envMap!==Lt||k.fog===!0&&kt.fog!==mt||kt.numClippingPlanes!==void 0&&(kt.numClippingPlanes!==ct.numPlanes||kt.numIntersection!==ct.numIntersection)||kt.vertexAlphas!==Gt||kt.vertexTangents!==Ot||kt.morphTargets!==Bt||kt.morphNormals!==ce||kt.morphColors!==Ve||kt.toneMapping!==xe||st.isWebGL2===!0&&kt.morphTargetsCount!==ae)&&(se=!0):(se=!0,kt.__version=k.version);let Zn=kt.currentProgram;se===!0&&(Zn=Os(k,U,O));let Ec=!1,as=!1,ma=!1,Ee=Zn.getUniforms(),Jn=kt.uniforms;if(K.useProgram(Zn.program)&&(Ec=!0,as=!0,ma=!0),k.id!==P&&(P=k.id,as=!0),Ec||N!==S){Ee.setValue(R,"projectionMatrix",S.projectionMatrix),Ee.setValue(R,"viewMatrix",S.matrixWorldInverse);let Ye=Ee.map.cameraPosition;Ye!==void 0&&Ye.setValue(R,vt.setFromMatrixPosition(S.matrixWorld)),st.logarithmicDepthBuffer&&Ee.setValue(R,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&Ee.setValue(R,"isOrthographic",S.isOrthographicCamera===!0),N!==S&&(N=S,as=!0,ma=!0)}if(O.isSkinnedMesh){Ee.setOptional(R,O,"bindMatrix"),Ee.setOptional(R,O,"bindMatrixInverse");let Ye=O.skeleton;Ye&&(st.floatVertexTextures?(Ye.boneTexture===null&&Ye.computeBoneTexture(),Ee.setValue(R,"boneTexture",Ye.boneTexture,yt)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}O.isBatchedMesh&&(Ee.setOptional(R,O,"batchingTexture"),Ee.setValue(R,"batchingTexture",O._matricesTexture,yt));let ga=B.morphAttributes;if((ga.position!==void 0||ga.normal!==void 0||ga.color!==void 0&&st.isWebGL2===!0)&&rt.update(O,B,Zn),(as||kt.receiveShadow!==O.receiveShadow)&&(kt.receiveShadow=O.receiveShadow,Ee.setValue(R,"receiveShadow",O.receiveShadow)),k.isMeshGouraudMaterial&&k.envMap!==null&&(Jn.envMap.value=Lt,Jn.flipEnvMap.value=Lt.isCubeTexture&&Lt.isRenderTargetTexture===!1?-1:1),as&&(Ee.setValue(R,"toneMappingExposure",x.toneMappingExposure),kt.needsLights&&ou(Jn,ma),mt&&k.fog===!0&&j.refreshFogUniforms(Jn,mt),j.refreshMaterialUniforms(Jn,k,Z,z,pt),Xi.upload(R,Sc(kt),Jn,yt)),k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(Xi.upload(R,Sc(kt),Jn,yt),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&Ee.setValue(R,"center",O.center),Ee.setValue(R,"modelViewMatrix",O.modelViewMatrix),Ee.setValue(R,"normalMatrix",O.normalMatrix),Ee.setValue(R,"modelMatrix",O.matrixWorld),k.isShaderMaterial||k.isRawShaderMaterial){let Ye=k.uniformsGroups;for(let xa=0,lu=Ye.length;xa<lu;xa++)if(st.isWebGL2){let Tc=Ye[xa];St.update(Tc,Zn),St.bind(Tc,Zn)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return Zn}function ou(S,U){S.ambientLightColor.needsUpdate=U,S.lightProbe.needsUpdate=U,S.directionalLights.needsUpdate=U,S.directionalLightShadows.needsUpdate=U,S.pointLights.needsUpdate=U,S.pointLightShadows.needsUpdate=U,S.spotLights.needsUpdate=U,S.spotLightShadows.needsUpdate=U,S.rectAreaLights.needsUpdate=U,S.hemisphereLights.needsUpdate=U}function cu(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return C},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return w},this.setRenderTargetTextures=function(S,U,B){ft.get(S.texture).__webglTexture=U,ft.get(S.depthTexture).__webglTexture=B;let k=ft.get(S);k.__hasExternalTextures=!0,k.__autoAllocateDepthBuffer=B===void 0,k.__autoAllocateDepthBuffer||$.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),k.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(S,U){let B=ft.get(S);B.__webglFramebuffer=U,B.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(S,U=0,B=0){w=S,C=U,A=B;let k=!0,O=null,mt=!1,wt=!1;if(S){let Lt=ft.get(S);Lt.__useDefaultFramebuffer!==void 0?(K.bindFramebuffer(R.FRAMEBUFFER,null),k=!1):Lt.__webglFramebuffer===void 0?yt.setupRenderTarget(S):Lt.__hasExternalTextures&&yt.rebindTextures(S,ft.get(S.texture).__webglTexture,ft.get(S.depthTexture).__webglTexture);let Gt=S.texture;(Gt.isData3DTexture||Gt.isDataArrayTexture||Gt.isCompressedArrayTexture)&&(wt=!0);let Ot=ft.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Ot[U])?O=Ot[U][B]:O=Ot[U],mt=!0):st.isWebGL2&&S.samples>0&&yt.useMultisampledRTT(S)===!1?O=ft.get(S).__webglMultisampledFramebuffer:Array.isArray(Ot)?O=Ot[B]:O=Ot,v.copy(S.viewport),T.copy(S.scissor),W=S.scissorTest}else v.copy(it).multiplyScalar(Z).floor(),T.copy(et).multiplyScalar(Z).floor(),W=xt;if(K.bindFramebuffer(R.FRAMEBUFFER,O)&&st.drawBuffers&&k&&K.drawBuffers(S,O),K.viewport(v),K.scissor(T),K.setScissorTest(W),mt){let Lt=ft.get(S.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_CUBE_MAP_POSITIVE_X+U,Lt.__webglTexture,B)}else if(wt){let Lt=ft.get(S.texture),Gt=U||0;R.framebufferTextureLayer(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,Lt.__webglTexture,B||0,Gt)}P=-1},this.readRenderTargetPixels=function(S,U,B,k,O,mt,wt){if(!(S&&S.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Pt=ft.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&wt!==void 0&&(Pt=Pt[wt]),Pt){K.bindFramebuffer(R.FRAMEBUFFER,Pt);try{let Lt=S.texture,Gt=Lt.format,Ot=Lt.type;if(Gt!==nn&&Rt.convert(Gt)!==R.getParameter(R.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}let Bt=Ot===Ss&&($.has("EXT_color_buffer_half_float")||st.isWebGL2&&$.has("EXT_color_buffer_float"));if(Ot!==zn&&Rt.convert(Ot)!==R.getParameter(R.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Ot===cn&&(st.isWebGL2||$.has("OES_texture_float")||$.has("WEBGL_color_buffer_float")))&&!Bt){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=S.width-k&&B>=0&&B<=S.height-O&&R.readPixels(U,B,k,O,Rt.convert(Gt),Rt.convert(Ot),mt)}finally{let Lt=w!==null?ft.get(w).__webglFramebuffer:null;K.bindFramebuffer(R.FRAMEBUFFER,Lt)}}},this.copyFramebufferToTexture=function(S,U,B=0){let k=Math.pow(2,-B),O=Math.floor(U.image.width*k),mt=Math.floor(U.image.height*k);yt.setTexture2D(U,0),R.copyTexSubImage2D(R.TEXTURE_2D,B,0,0,S.x,S.y,O,mt),K.unbindTexture()},this.copyTextureToTexture=function(S,U,B,k=0){let O=U.image.width,mt=U.image.height,wt=Rt.convert(B.format),Pt=Rt.convert(B.type);yt.setTexture2D(B,0),R.pixelStorei(R.UNPACK_FLIP_Y_WEBGL,B.flipY),R.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),R.pixelStorei(R.UNPACK_ALIGNMENT,B.unpackAlignment),U.isDataTexture?R.texSubImage2D(R.TEXTURE_2D,k,S.x,S.y,O,mt,wt,Pt,U.image.data):U.isCompressedTexture?R.compressedTexSubImage2D(R.TEXTURE_2D,k,S.x,S.y,U.mipmaps[0].width,U.mipmaps[0].height,wt,U.mipmaps[0].data):R.texSubImage2D(R.TEXTURE_2D,k,S.x,S.y,wt,Pt,U.image),k===0&&B.generateMipmaps&&R.generateMipmap(R.TEXTURE_2D),K.unbindTexture()},this.copyTextureToTexture3D=function(S,U,B,k,O=0){if(x.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}let mt=Math.round(S.max.x-S.min.x),wt=Math.round(S.max.y-S.min.y),Pt=S.max.z-S.min.z+1,Lt=Rt.convert(k.format),Gt=Rt.convert(k.type),Ot;if(k.isData3DTexture)yt.setTexture3D(k,0),Ot=R.TEXTURE_3D;else if(k.isDataArrayTexture||k.isCompressedArrayTexture)yt.setTexture2DArray(k,0),Ot=R.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}R.pixelStorei(R.UNPACK_FLIP_Y_WEBGL,k.flipY),R.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),R.pixelStorei(R.UNPACK_ALIGNMENT,k.unpackAlignment);let Bt=R.getParameter(R.UNPACK_ROW_LENGTH),ce=R.getParameter(R.UNPACK_IMAGE_HEIGHT),Ve=R.getParameter(R.UNPACK_SKIP_PIXELS),xe=R.getParameter(R.UNPACK_SKIP_ROWS),dn=R.getParameter(R.UNPACK_SKIP_IMAGES),ae=B.isCompressedTexture?B.mipmaps[O]:B.image;R.pixelStorei(R.UNPACK_ROW_LENGTH,ae.width),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,ae.height),R.pixelStorei(R.UNPACK_SKIP_PIXELS,S.min.x),R.pixelStorei(R.UNPACK_SKIP_ROWS,S.min.y),R.pixelStorei(R.UNPACK_SKIP_IMAGES,S.min.z),B.isDataTexture||B.isData3DTexture?R.texSubImage3D(Ot,O,U.x,U.y,U.z,mt,wt,Pt,Lt,Gt,ae.data):k.isCompressedArrayTexture?R.compressedTexSubImage3D(Ot,O,U.x,U.y,U.z,mt,wt,Pt,Lt,ae.data):R.texSubImage3D(Ot,O,U.x,U.y,U.z,mt,wt,Pt,Lt,Gt,ae),R.pixelStorei(R.UNPACK_ROW_LENGTH,Bt),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,ce),R.pixelStorei(R.UNPACK_SKIP_PIXELS,Ve),R.pixelStorei(R.UNPACK_SKIP_ROWS,xe),R.pixelStorei(R.UNPACK_SKIP_IMAGES,dn),O===0&&k.generateMipmaps&&R.generateMipmap(Ot),K.unbindTexture()},this.initTexture=function(S){S.isCubeTexture?yt.setTextureCube(S,0):S.isData3DTexture?yt.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?yt.setTexture2DArray(S,0):yt.setTexture2D(S,0),K.unbindTexture()},this.resetState=function(){C=0,A=0,w=null,K.reset(),bt.reset()},typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Sn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=t===ac?"display-p3":"srgb",e.unpackColorSpace=Kt.workingColorSpace===ra?"display-p3":"srgb"}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(t){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=t}},Do=class extends Es{};Do.prototype.isWebGL1Renderer=!0;var zr=class i{constructor(t,e=1,n=1e3){this.isFog=!0,this.name="",this.color=new Et(t),this.near=e,this.far=n}clone(){return new i(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Hr=class extends Se{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ke,this.environmentRotation=new ke,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentRotation=this.environmentRotation.toArray(),e}},Uo=class{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=po,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.version=0,this.uuid=wn()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}get updateRange(){return wh("THREE.InterleavedBuffer: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[n+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=wn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=wn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},Ie=new L,Vr=class i{constructor(t,e,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)Ie.fromBufferAttribute(this,e),Ie.applyMatrix4(t),this.setXYZ(e,Ie.x,Ie.y,Ie.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ie.fromBufferAttribute(this,e),Ie.applyNormalMatrix(t),this.setXYZ(e,Ie.x,Ie.y,Ie.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ie.fromBufferAttribute(this,e),Ie.transformDirection(t),this.setXYZ(e,Ie.x,Ie.y,Ie.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=ln(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Jt(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=Jt(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=Jt(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=Jt(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=Jt(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=ln(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=ln(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=ln(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=ln(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=Jt(e,this.array),n=Jt(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=Jt(e,this.array),n=Jt(n,this.array),s=Jt(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=Jt(e,this.array),n=Jt(n,this.array),s=Jt(s,this.array),r=Jt(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new ue(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new i(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},ui=class extends An{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Et(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Ni,ps=new L,Oi=new L,Fi=new L,Bi=new nt,ms=new nt,Dh=new Zt,lr=new L,gs=new L,hr=new L,Ql=new nt,no=new nt,th=new nt,Ki=class extends Se{constructor(t=new ui){if(super(),this.isSprite=!0,this.type="Sprite",Ni===void 0){Ni=new de;let e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Uo(e,5);Ni.setIndex([0,1,2,0,2,3]),Ni.setAttribute("position",new Vr(n,3,0,!1)),Ni.setAttribute("uv",new Vr(n,2,3,!1))}this.geometry=Ni,this.material=t,this.center=new nt(.5,.5)}raycast(t,e){t.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Oi.setFromMatrixScale(this.matrixWorld),Dh.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Fi.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Oi.multiplyScalar(-Fi.z);let n=this.material.rotation,s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));let a=this.center;ur(lr.set(-.5,-.5,0),Fi,a,Oi,s,r),ur(gs.set(.5,-.5,0),Fi,a,Oi,s,r),ur(hr.set(.5,.5,0),Fi,a,Oi,s,r),Ql.set(0,0),no.set(1,0),th.set(1,1);let o=t.ray.intersectTriangle(lr,gs,hr,!1,ps);if(o===null&&(ur(gs.set(-.5,.5,0),Fi,a,Oi,s,r),no.set(0,1),o=t.ray.intersectTriangle(lr,hr,gs,!1,ps),o===null))return;let c=t.ray.origin.distanceTo(ps);c<t.near||c>t.far||e.push({distance:c,point:ps.clone(),uv:ci.getInterpolation(ps,lr,gs,hr,Ql,no,th,new nt),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}};function ur(i,t,e,n,s,r){Bi.subVectors(i,e).addScalar(.5).multiply(n),s!==void 0?(ms.x=r*Bi.x-s*Bi.y,ms.y=s*Bi.x+r*Bi.y):ms.copy(Bi),i.copy(t),i.x+=ms.x,i.y+=ms.y,i.applyMatrix4(Dh)}var No=class extends Be{constructor(t=null,e=1,n=1,s,r,a,o,c,l=be,h=be,u,d){super(null,a,o,c,l,h,s,r,u,d),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Gr=class extends ue{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},ki=new Zt,eh=new Zt,dr=[],nh=new Tn,dg=new Zt,xs=new jt,_s=new Gn,ji=class extends jt{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Gr(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,dg)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Tn),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,ki),nh.copy(t.boundingBox).applyMatrix4(ki),this.boundingBox.union(nh)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Gn),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,ki),_s.copy(t.boundingSphere).applyMatrix4(ki),this.boundingSphere.union(_s)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=t*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(t,e){let n=this.matrixWorld,s=this.count;if(xs.geometry=this.geometry,xs.material=this.material,xs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),_s.copy(this.boundingSphere),_s.applyMatrix4(n),t.ray.intersectsSphere(_s)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,ki),eh.multiplyMatrices(n,ki),xs.matrixWorld=eh,xs.raycast(t,dr);for(let a=0,o=dr.length;a<o;a++){let c=dr[a];c.instanceId=r,c.object=this,e.push(c)}dr.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new Gr(new Float32Array(this.instanceMatrix.count*3),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){let n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new No(new Float32Array(s*this.count),s,this.count,gh,cn));let r=this.morphTexture.source.data.data,a=0;for(let l=0;l<n.length;l++)a+=n[l];let o=this.geometry.morphTargetsRelative?1:1-a,c=s*t;r[c]=o,r.set(n,c+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"})}};var Qi=class extends An{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Et(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},ih=new Zt,Oo=new Lr,fr=new Gn,pr=new L,Ts=class extends Se{constructor(t=new de,e=new Qi){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){let n=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),fr.copy(n.boundingSphere),fr.applyMatrix4(s),fr.radius+=r,t.ray.intersectsSphere(fr)===!1)return;ih.copy(s).invert(),Oo.copy(t.ray).applyMatrix4(ih);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=n.index,u=n.attributes.position;if(l!==null){let d=Math.max(0,a.start),p=Math.min(l.count,a.start+a.count);for(let g=d,_=p;g<_;g++){let f=l.getX(g);pr.fromBufferAttribute(u,f),sh(pr,f,c,s,t,e,this)}}else{let d=Math.max(0,a.start),p=Math.min(u.count,a.start+a.count);for(let g=d,_=p;g<_;g++)pr.fromBufferAttribute(u,g),sh(pr,g,c,s,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function sh(i,t,e,n,s,r,a){let o=Oo.distanceSqToPoint(i);if(o<e){let c=new L;Oo.closestPointToPoint(i,c),c.applyMatrix4(n);let l=s.ray.origin.distanceTo(c);if(l<s.near||l>s.far)return;r.push({distance:l,distanceToRay:Math.sqrt(o),point:c,index:t,face:null,object:a})}}var ts=class extends Be{constructor(t,e,n,s,r,a,o,c,l){super(t,e,n,s,r,a,o,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}},Ke=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,s=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)n=this.getPoint(a/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e){let n=this.getLengths(),s=0,r=n.length,a;e?a=e:a=t*n[r-1];let o=0,c=r-1,l;for(;o<=c;)if(s=Math.floor(o+(c-o)/2),l=n[s]-a,l<0)o=s+1;else if(l>0)c=s-1;else{c=s;break}if(s=c,n[s]===a)return s/(r-1);let h=n[s],d=n[s+1]-h,p=(a-h)/d;return(s+p)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),c=e||(a.isVector2?new nt:new L);return c.copy(o).sub(a).normalize(),c}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e){let n=new L,s=[],r=[],a=[],o=new L,c=new Zt;for(let p=0;p<=t;p++){let g=p/t;s[p]=this.getTangentAt(g,new L)}r[0]=new L,a[0]=new L;let l=Number.MAX_VALUE,h=Math.abs(s[0].x),u=Math.abs(s[0].y),d=Math.abs(s[0].z);h<=l&&(l=h,n.set(1,0,0)),u<=l&&(l=u,n.set(0,1,0)),d<=l&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let p=1;p<=t;p++){if(r[p]=r[p-1].clone(),a[p]=a[p-1].clone(),o.crossVectors(s[p-1],s[p]),o.length()>Number.EPSILON){o.normalize();let g=Math.acos(Re(s[p-1].dot(s[p]),-1,1));r[p].applyMatrix4(c.makeRotationAxis(o,g))}a[p].crossVectors(s[p],r[p])}if(e===!0){let p=Math.acos(Re(r[0].dot(r[t]),-1,1));p/=t,s[0].dot(o.crossVectors(r[0],r[t]))>0&&(p=-p);for(let g=1;g<=t;g++)r[g].applyMatrix4(c.makeRotationAxis(s[g],p*g)),a[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},As=class extends Ke{constructor(t=0,e=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=c}getPoint(t,e=new nt){let n=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+t*r,c=this.aX+this.xRadius*Math.cos(o),l=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=c-this.aX,p=l-this.aY;c=d*h-p*u+this.aX,l=d*u+p*h+this.aY}return n.set(c,l)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Fo=class extends As{constructor(t,e,n,s,r,a){super(t,e,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function cc(){let i=0,t=0,e=0,n=0;function s(r,a,o,c){i=r,t=o,e=-3*r+3*a-2*o-c,n=2*r-2*a+o+c}return{initCatmullRom:function(r,a,o,c,l){s(a,o,l*(o-r),l*(c-a))},initNonuniformCatmullRom:function(r,a,o,c,l,h,u){let d=(a-r)/l-(o-r)/(l+h)+(o-a)/h,p=(o-a)/h-(c-a)/(h+u)+(c-o)/u;d*=h,p*=h,s(a,o,d,p)},calc:function(r){let a=r*r,o=a*r;return i+t*r+e*a+n*o}}}var mr=new L,io=new cc,so=new cc,ro=new cc,Bo=class extends Ke{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new L){let n=e,s=this.points,r=s.length,a=(r-(this.closed?0:1))*t,o=Math.floor(a),c=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:c===0&&o===r-1&&(o=r-2,c=1);let l,h;this.closed||o>0?l=s[(o-1)%r]:(mr.subVectors(s[0],s[1]).add(s[0]),l=mr);let u=s[o%r],d=s[(o+1)%r];if(this.closed||o+2<r?h=s[(o+2)%r]:(mr.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=mr),this.curveType==="centripetal"||this.curveType==="chordal"){let p=this.curveType==="chordal"?.5:.25,g=Math.pow(l.distanceToSquared(u),p),_=Math.pow(u.distanceToSquared(d),p),f=Math.pow(d.distanceToSquared(h),p);_<1e-4&&(_=1),g<1e-4&&(g=_),f<1e-4&&(f=_),io.initNonuniformCatmullRom(l.x,u.x,d.x,h.x,g,_,f),so.initNonuniformCatmullRom(l.y,u.y,d.y,h.y,g,_,f),ro.initNonuniformCatmullRom(l.z,u.z,d.z,h.z,g,_,f)}else this.curveType==="catmullrom"&&(io.initCatmullRom(l.x,u.x,d.x,h.x,this.tension),so.initCatmullRom(l.y,u.y,d.y,h.y,this.tension),ro.initCatmullRom(l.z,u.z,d.z,h.z,this.tension));return n.set(io.calc(c),so.calc(c),ro.calc(c)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new L().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function rh(i,t,e,n,s){let r=(n-t)*.5,a=(s-e)*.5,o=i*i,c=i*o;return(2*e-2*n+r+a)*c+(-3*e+3*n-2*r-a)*o+r*i+e}function fg(i,t){let e=1-i;return e*e*t}function pg(i,t){return 2*(1-i)*i*t}function mg(i,t){return i*i*t}function ys(i,t,e,n){return fg(i,t)+pg(i,e)+mg(i,n)}function gg(i,t){let e=1-i;return e*e*e*t}function xg(i,t){let e=1-i;return 3*e*e*i*t}function _g(i,t){return 3*(1-i)*i*i*t}function vg(i,t){return i*i*i*t}function Ms(i,t,e,n,s){return gg(i,t)+xg(i,e)+_g(i,n)+vg(i,s)}var Wr=class extends Ke{constructor(t=new nt,e=new nt,n=new nt,s=new nt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new nt){let n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Ms(t,s.x,r.x,a.x,o.x),Ms(t,s.y,r.y,a.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},ko=class extends Ke{constructor(t=new L,e=new L,n=new L,s=new L){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new L){let n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Ms(t,s.x,r.x,a.x,o.x),Ms(t,s.y,r.y,a.y,o.y),Ms(t,s.z,r.z,a.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Xr=class extends Ke{constructor(t=new nt,e=new nt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new nt){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new nt){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},zo=class extends Ke{constructor(t=new L,e=new L){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new L){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new L){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},qr=class extends Ke{constructor(t=new nt,e=new nt,n=new nt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new nt){let n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(ys(t,s.x,r.x,a.x),ys(t,s.y,r.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Ho=class extends Ke{constructor(t=new L,e=new L,n=new L){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new L){let n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(ys(t,s.x,r.x,a.x),ys(t,s.y,r.y,a.y),ys(t,s.z,r.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Yr=class extends Ke{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new nt){let n=e,s=this.points,r=(s.length-1)*t,a=Math.floor(r),o=r-a,c=s[a===0?a:a-1],l=s[a],h=s[a>s.length-2?s.length-1:a+1],u=s[a>s.length-3?s.length-1:a+2];return n.set(rh(o,c.x,l.x,h.x,u.x),rh(o,c.y,l.y,h.y,u.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new nt().fromArray(s))}return this}},Vo=Object.freeze({__proto__:null,ArcCurve:Fo,CatmullRomCurve3:Bo,CubicBezierCurve:Wr,CubicBezierCurve3:ko,EllipseCurve:As,LineCurve:Xr,LineCurve3:zo,QuadraticBezierCurve:qr,QuadraticBezierCurve3:Ho,SplineCurve:Yr}),Go=class extends Ke{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Vo[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let a=s[r]-n,o=this.curves[r],c=o.getLength(),l=c===0?0:1-a/c;return o.getPointAt(l,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],n;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,c=a.getPoints(o);for(let l=0;l<c.length;l++){let h=c[l];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(new Vo[s.type]().fromJSON(s))}return this}},$r=class extends Go{constructor(t){super(),this.type="Path",this.currentPoint=new nt,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let n=new Xr(this.currentPoint.clone(),new nt(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){let r=new qr(this.currentPoint.clone(),new nt(t,e),new nt(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,a){let o=new Wr(this.currentPoint.clone(),new nt(t,e),new nt(n,s),new nt(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),n=new Yr(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,a){let o=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(t+o,e+c,n,s,r,a),this}absarc(t,e,n,s,r,a){return this.absellipse(t,e,n,n,s,r,a),this}ellipse(t,e,n,s,r,a,o,c){let l=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+l,e+h,n,s,r,a,o,c),this}absellipse(t,e,n,s,r,a,o,c){let l=new As(t,e,n,s,r,a,o,c);if(this.curves.length>0){let u=l.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(l);let h=l.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}};var Zr=class i extends de{constructor(t=1,e=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:s},e=Math.max(3,e);let r=[],a=[],o=[],c=[],l=new L,h=new nt;a.push(0,0,0),o.push(0,0,1),c.push(.5,.5);for(let u=0,d=3;u<=e;u++,d+=3){let p=n+u/e*s;l.x=t*Math.cos(p),l.y=t*Math.sin(p),a.push(l.x,l.y,l.z),o.push(0,0,1),h.x=(a[d]/t+1)/2,h.y=(a[d+1]/t+1)/2,c.push(h.x,h.y)}for(let u=1;u<=e;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new ee(a,3)),this.setAttribute("normal",new ee(o,3)),this.setAttribute("uv",new ee(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.segments,t.thetaStart,t.thetaLength)}},di=class i extends de{constructor(t=1,e=1,n=1,s=32,r=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:c};let l=this;s=Math.floor(s),r=Math.floor(r);let h=[],u=[],d=[],p=[],g=0,_=[],f=n/2,m=0;M(),a===!1&&(t>0&&x(!0),e>0&&x(!1)),this.setIndex(h),this.setAttribute("position",new ee(u,3)),this.setAttribute("normal",new ee(d,3)),this.setAttribute("uv",new ee(p,2));function M(){let b=new L,C=new L,A=0,w=(e-t)/n;for(let P=0;P<=r;P++){let N=[],v=P/r,T=v*(e-t)+t;for(let W=0;W<=s;W++){let J=W/s,I=J*c+o,G=Math.sin(I),z=Math.cos(I);C.x=T*G,C.y=-v*n+f,C.z=T*z,u.push(C.x,C.y,C.z),b.set(G,w,z).normalize(),d.push(b.x,b.y,b.z),p.push(J,1-v),N.push(g++)}_.push(N)}for(let P=0;P<s;P++)for(let N=0;N<r;N++){let v=_[N][P],T=_[N+1][P],W=_[N+1][P+1],J=_[N][P+1];h.push(v,T,J),h.push(T,W,J),A+=6}l.addGroup(m,A,0),m+=A}function x(b){let C=g,A=new nt,w=new L,P=0,N=b===!0?t:e,v=b===!0?1:-1;for(let W=1;W<=s;W++)u.push(0,f*v,0),d.push(0,v,0),p.push(.5,.5),g++;let T=g;for(let W=0;W<=s;W++){let I=W/s*c+o,G=Math.cos(I),z=Math.sin(I);w.x=N*z,w.y=f*v,w.z=N*G,u.push(w.x,w.y,w.z),d.push(0,v,0),A.x=G*.5+.5,A.y=z*.5*v+.5,p.push(A.x,A.y),g++}for(let W=0;W<s;W++){let J=C+W,I=T+W;b===!0?h.push(I,I+1,J):h.push(I+1,I,J),P+=3}l.addGroup(m,P,b===!0?1:2),m+=P}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Rs=class i extends di{constructor(t=1,e=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new i(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Jr=class i extends de{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};let r=[],a=[];o(s),l(n),h(),this.setAttribute("position",new ee(r,3)),this.setAttribute("normal",new ee(r.slice(),3)),this.setAttribute("uv",new ee(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(M){let x=new L,b=new L,C=new L;for(let A=0;A<e.length;A+=3)p(e[A+0],x),p(e[A+1],b),p(e[A+2],C),c(x,b,C,M)}function c(M,x,b,C){let A=C+1,w=[];for(let P=0;P<=A;P++){w[P]=[];let N=M.clone().lerp(b,P/A),v=x.clone().lerp(b,P/A),T=A-P;for(let W=0;W<=T;W++)W===0&&P===A?w[P][W]=N:w[P][W]=N.clone().lerp(v,W/T)}for(let P=0;P<A;P++)for(let N=0;N<2*(A-P)-1;N++){let v=Math.floor(N/2);N%2===0?(d(w[P][v+1]),d(w[P+1][v]),d(w[P][v])):(d(w[P][v+1]),d(w[P+1][v+1]),d(w[P+1][v]))}}function l(M){let x=new L;for(let b=0;b<r.length;b+=3)x.x=r[b+0],x.y=r[b+1],x.z=r[b+2],x.normalize().multiplyScalar(M),r[b+0]=x.x,r[b+1]=x.y,r[b+2]=x.z}function h(){let M=new L;for(let x=0;x<r.length;x+=3){M.x=r[x+0],M.y=r[x+1],M.z=r[x+2];let b=f(M)/2/Math.PI+.5,C=m(M)/Math.PI+.5;a.push(b,1-C)}g(),u()}function u(){for(let M=0;M<a.length;M+=6){let x=a[M+0],b=a[M+2],C=a[M+4],A=Math.max(x,b,C),w=Math.min(x,b,C);A>.9&&w<.1&&(x<.2&&(a[M+0]+=1),b<.2&&(a[M+2]+=1),C<.2&&(a[M+4]+=1))}}function d(M){r.push(M.x,M.y,M.z)}function p(M,x){let b=M*3;x.x=t[b+0],x.y=t[b+1],x.z=t[b+2]}function g(){let M=new L,x=new L,b=new L,C=new L,A=new nt,w=new nt,P=new nt;for(let N=0,v=0;N<r.length;N+=9,v+=6){M.set(r[N+0],r[N+1],r[N+2]),x.set(r[N+3],r[N+4],r[N+5]),b.set(r[N+6],r[N+7],r[N+8]),A.set(a[v+0],a[v+1]),w.set(a[v+2],a[v+3]),P.set(a[v+4],a[v+5]),C.copy(M).add(x).add(b).divideScalar(3);let T=f(C);_(A,v+0,M,T),_(w,v+2,x,T),_(P,v+4,b,T)}}function _(M,x,b,C){C<0&&M.x===1&&(a[x]=M.x-1),b.x===0&&b.z===0&&(a[x]=C/2/Math.PI+.5)}function f(M){return Math.atan2(M.z,-M.x)}function m(M){return Math.atan2(-M.y,Math.sqrt(M.x*M.x+M.z*M.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.vertices,t.indices,t.radius,t.details)}};var Cs=class extends $r{constructor(t){super(t),this.uuid=wn(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){let s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(new $r().fromJSON(s))}return this}},yg={triangulate:function(i,t,e=2){let n=t&&t.length,s=n?t[0]*e:i.length,r=Uh(i,0,s,e,!0),a=[];if(!r||r.next===r.prev)return a;let o,c,l,h,u,d,p;if(n&&(r=Eg(i,t,r,e)),i.length>80*e){o=l=i[0],c=h=i[1];for(let g=e;g<s;g+=e)u=i[g],d=i[g+1],u<o&&(o=u),d<c&&(c=d),u>l&&(l=u),d>h&&(h=d);p=Math.max(l-o,h-c),p=p!==0?32767/p:0}return Ps(r,a,e,o,c,p,0),a}};function Uh(i,t,e,n,s){let r,a;if(s===Og(i,t,e,n)>0)for(r=t;r<e;r+=n)a=ah(r,i[r],i[r+1],a);else for(r=e-n;r>=t;r-=n)a=ah(r,i[r],i[r+1],a);return a&&ca(a,a.next)&&(Is(a),a=a.next),a}function fi(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(ca(e,e.next)||oe(e.prev,e,e.next)===0)){if(Is(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function Ps(i,t,e,n,s,r,a){if(!i)return;!a&&r&&Pg(i,n,s,r);let o=i,c,l;for(;i.prev!==i.next;){if(c=i.prev,l=i.next,r?bg(i,n,s,r):Mg(i)){t.push(c.i/e|0),t.push(i.i/e|0),t.push(l.i/e|0),Is(i),i=l.next,o=l.next;continue}if(i=l,i===o){a?a===1?(i=Sg(fi(i),t,e),Ps(i,t,e,n,s,r,2)):a===2&&wg(i,t,e,n,s,r):Ps(fi(i),t,e,n,s,r,1);break}}}function Mg(i){let t=i.prev,e=i,n=i.next;if(oe(t,e,n)>=0)return!1;let s=t.x,r=e.x,a=n.x,o=t.y,c=e.y,l=n.y,h=s<r?s<a?s:a:r<a?r:a,u=o<c?o<l?o:l:c<l?c:l,d=s>r?s>a?s:a:r>a?r:a,p=o>c?o>l?o:l:c>l?c:l,g=n.next;for(;g!==t;){if(g.x>=h&&g.x<=d&&g.y>=u&&g.y<=p&&Vi(s,o,r,c,a,l,g.x,g.y)&&oe(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function bg(i,t,e,n){let s=i.prev,r=i,a=i.next;if(oe(s,r,a)>=0)return!1;let o=s.x,c=r.x,l=a.x,h=s.y,u=r.y,d=a.y,p=o<c?o<l?o:l:c<l?c:l,g=h<u?h<d?h:d:u<d?u:d,_=o>c?o>l?o:l:c>l?c:l,f=h>u?h>d?h:d:u>d?u:d,m=Wo(p,g,t,e,n),M=Wo(_,f,t,e,n),x=i.prevZ,b=i.nextZ;for(;x&&x.z>=m&&b&&b.z<=M;){if(x.x>=p&&x.x<=_&&x.y>=g&&x.y<=f&&x!==s&&x!==a&&Vi(o,h,c,u,l,d,x.x,x.y)&&oe(x.prev,x,x.next)>=0||(x=x.prevZ,b.x>=p&&b.x<=_&&b.y>=g&&b.y<=f&&b!==s&&b!==a&&Vi(o,h,c,u,l,d,b.x,b.y)&&oe(b.prev,b,b.next)>=0))return!1;b=b.nextZ}for(;x&&x.z>=m;){if(x.x>=p&&x.x<=_&&x.y>=g&&x.y<=f&&x!==s&&x!==a&&Vi(o,h,c,u,l,d,x.x,x.y)&&oe(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;b&&b.z<=M;){if(b.x>=p&&b.x<=_&&b.y>=g&&b.y<=f&&b!==s&&b!==a&&Vi(o,h,c,u,l,d,b.x,b.y)&&oe(b.prev,b,b.next)>=0)return!1;b=b.nextZ}return!0}function Sg(i,t,e){let n=i;do{let s=n.prev,r=n.next.next;!ca(s,r)&&Nh(s,n,n.next,r)&&Ls(s,r)&&Ls(r,s)&&(t.push(s.i/e|0),t.push(n.i/e|0),t.push(r.i/e|0),Is(n),Is(n.next),n=i=r),n=n.next}while(n!==i);return fi(n)}function wg(i,t,e,n,s,r){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Dg(a,o)){let c=Oh(a,o);a=fi(a,a.next),c=fi(c,c.next),Ps(a,t,e,n,s,r,0),Ps(c,t,e,n,s,r,0);return}o=o.next}a=a.next}while(a!==i)}function Eg(i,t,e,n){let s=[],r,a,o,c,l;for(r=0,a=t.length;r<a;r++)o=t[r]*n,c=r<a-1?t[r+1]*n:i.length,l=Uh(i,o,c,n,!1),l===l.next&&(l.steiner=!0),s.push(Ig(l));for(s.sort(Tg),r=0;r<s.length;r++)e=Ag(s[r],e);return e}function Tg(i,t){return i.x-t.x}function Ag(i,t){let e=Rg(i,t);if(!e)return t;let n=Oh(e,i);return fi(n,n.next),fi(e,e.next)}function Rg(i,t){let e=t,n=-1/0,s,r=i.x,a=i.y;do{if(a<=e.y&&a>=e.next.y&&e.next.y!==e.y){let d=e.x+(a-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(d<=r&&d>n&&(n=d,s=e.x<e.next.x?e:e.next,d===r))return s}e=e.next}while(e!==t);if(!s)return null;let o=s,c=s.x,l=s.y,h=1/0,u;e=s;do r>=e.x&&e.x>=c&&r!==e.x&&Vi(a<l?r:n,a,c,l,a<l?n:r,a,e.x,e.y)&&(u=Math.abs(a-e.y)/(r-e.x),Ls(e,i)&&(u<h||u===h&&(e.x>s.x||e.x===s.x&&Cg(s,e)))&&(s=e,h=u)),e=e.next;while(e!==o);return s}function Cg(i,t){return oe(i.prev,i,t.prev)<0&&oe(t.next,i,i.next)<0}function Pg(i,t,e,n){let s=i;do s.z===0&&(s.z=Wo(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Lg(s)}function Lg(i){let t,e,n,s,r,a,o,c,l=1;do{for(e=i,i=null,r=null,a=0;e;){for(a++,n=e,o=0,t=0;t<l&&(o++,n=n.nextZ,!!n);t++);for(c=l;o>0||c>0&&n;)o!==0&&(c===0||!n||e.z<=n.z)?(s=e,e=e.nextZ,o--):(s=n,n=n.nextZ,c--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;e=n}r.nextZ=null,l*=2}while(a>1);return i}function Wo(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function Ig(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function Vi(i,t,e,n,s,r,a,o){return(s-a)*(t-o)>=(i-a)*(r-o)&&(i-a)*(n-o)>=(e-a)*(t-o)&&(e-a)*(r-o)>=(s-a)*(n-o)}function Dg(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!Ug(i,t)&&(Ls(i,t)&&Ls(t,i)&&Ng(i,t)&&(oe(i.prev,i,t.prev)||oe(i,t.prev,t))||ca(i,t)&&oe(i.prev,i,i.next)>0&&oe(t.prev,t,t.next)>0)}function oe(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function ca(i,t){return i.x===t.x&&i.y===t.y}function Nh(i,t,e,n){let s=xr(oe(i,t,e)),r=xr(oe(i,t,n)),a=xr(oe(e,n,i)),o=xr(oe(e,n,t));return!!(s!==r&&a!==o||s===0&&gr(i,e,t)||r===0&&gr(i,n,t)||a===0&&gr(e,i,n)||o===0&&gr(e,t,n))}function gr(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function xr(i){return i>0?1:i<0?-1:0}function Ug(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&Nh(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function Ls(i,t){return oe(i.prev,i,i.next)<0?oe(i,t,i.next)>=0&&oe(i,i.prev,t)>=0:oe(i,t,i.prev)<0||oe(i,i.next,t)<0}function Ng(i,t){let e=i,n=!1,s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function Oh(i,t){let e=new Xo(i.i,i.x,i.y),n=new Xo(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function ah(i,t,e,n){let s=new Xo(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Is(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Xo(i,t,e){this.i=i,this.x=t,this.y=e,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function Og(i,t,e,n){let s=0;for(let r=t,a=e-n;r<e;r+=n)s+=(i[a]-i[r])*(i[r+1]+i[a+1]),a=r;return s}var bs=class i{static area(t){let e=t.length,n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return i.area(t)<0}static triangulateShape(t,e){let n=[],s=[],r=[];oh(t),ch(n,t);let a=t.length;e.forEach(oh);for(let c=0;c<e.length;c++)s.push(a),a+=e[c].length,ch(n,e[c]);let o=yg.triangulate(n,s);for(let c=0;c<o.length;c+=3)r.push(o.slice(c,c+3));return r}};function oh(i){let t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function ch(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}var Kr=class i extends de{constructor(t=new Cs([new nt(.5,.5),new nt(-.5,.5),new nt(-.5,-.5),new nt(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let n=this,s=[],r=[];for(let o=0,c=t.length;o<c;o++){let l=t[o];a(l)}this.setAttribute("position",new ee(s,3)),this.setAttribute("uv",new ee(r,2)),this.computeVertexNormals();function a(o){let c=[],l=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,u=e.depth!==void 0?e.depth:1,d=e.bevelEnabled!==void 0?e.bevelEnabled:!0,p=e.bevelThickness!==void 0?e.bevelThickness:.2,g=e.bevelSize!==void 0?e.bevelSize:p-.1,_=e.bevelOffset!==void 0?e.bevelOffset:0,f=e.bevelSegments!==void 0?e.bevelSegments:3,m=e.extrudePath,M=e.UVGenerator!==void 0?e.UVGenerator:Fg,x,b=!1,C,A,w,P;m&&(x=m.getSpacedPoints(h),b=!0,d=!1,C=m.computeFrenetFrames(h,!1),A=new L,w=new L,P=new L),d||(f=0,p=0,g=0,_=0);let N=o.extractPoints(l),v=N.shape,T=N.holes;if(!bs.isClockWise(v)){v=v.reverse();for(let R=0,at=T.length;R<at;R++){let $=T[R];bs.isClockWise($)&&(T[R]=$.reverse())}}let J=bs.triangulateShape(v,T),I=v;for(let R=0,at=T.length;R<at;R++){let $=T[R];v=v.concat($)}function G(R,at,$){return at||console.error("THREE.ExtrudeGeometry: vec does not exist"),R.clone().addScaledVector(at,$)}let z=v.length,Z=J.length;function q(R,at,$){let st,K,_t,ft=R.x-at.x,yt=R.y-at.y,Wt=$.x-R.x,E=$.y-R.y,y=ft*ft+yt*yt,V=ft*E-yt*Wt;if(Math.abs(V)>Number.EPSILON){let X=Math.sqrt(y),tt=Math.sqrt(Wt*Wt+E*E),j=at.x-yt/X,Ut=at.y+ft/X,Ct=$.x-E/tt,ct=$.y+Wt/tt,ht=((Ct-j)*E-(ct-Ut)*Wt)/(ft*E-yt*Wt);st=j+ft*ht-R.x,K=Ut+yt*ht-R.y;let Nt=st*st+K*K;if(Nt<=2)return new nt(st,K);_t=Math.sqrt(Nt/2)}else{let X=!1;ft>Number.EPSILON?Wt>Number.EPSILON&&(X=!0):ft<-Number.EPSILON?Wt<-Number.EPSILON&&(X=!0):Math.sign(yt)===Math.sign(E)&&(X=!0),X?(st=-yt,K=ft,_t=Math.sqrt(y)):(st=ft,K=yt,_t=Math.sqrt(y/2))}return new nt(st/_t,K/_t)}let Y=[];for(let R=0,at=I.length,$=at-1,st=R+1;R<at;R++,$++,st++)$===at&&($=0),st===at&&(st=0),Y[R]=q(I[R],I[$],I[st]);let it=[],et,xt=Y.concat();for(let R=0,at=T.length;R<at;R++){let $=T[R];et=[];for(let st=0,K=$.length,_t=K-1,ft=st+1;st<K;st++,_t++,ft++)_t===K&&(_t=0),ft===K&&(ft=0),et[st]=q($[st],$[_t],$[ft]);it.push(et),xt=xt.concat(et)}for(let R=0;R<f;R++){let at=R/f,$=p*Math.cos(at*Math.PI/2),st=g*Math.sin(at*Math.PI/2)+_;for(let K=0,_t=I.length;K<_t;K++){let ft=G(I[K],Y[K],st);Tt(ft.x,ft.y,-$)}for(let K=0,_t=T.length;K<_t;K++){let ft=T[K];et=it[K];for(let yt=0,Wt=ft.length;yt<Wt;yt++){let E=G(ft[yt],et[yt],st);Tt(E.x,E.y,-$)}}}let Dt=g+_;for(let R=0;R<z;R++){let at=d?G(v[R],xt[R],Dt):v[R];b?(w.copy(C.normals[0]).multiplyScalar(at.x),A.copy(C.binormals[0]).multiplyScalar(at.y),P.copy(x[0]).add(w).add(A),Tt(P.x,P.y,P.z)):Tt(at.x,at.y,0)}for(let R=1;R<=h;R++)for(let at=0;at<z;at++){let $=d?G(v[at],xt[at],Dt):v[at];b?(w.copy(C.normals[R]).multiplyScalar($.x),A.copy(C.binormals[R]).multiplyScalar($.y),P.copy(x[R]).add(w).add(A),Tt(P.x,P.y,P.z)):Tt($.x,$.y,u/h*R)}for(let R=f-1;R>=0;R--){let at=R/f,$=p*Math.cos(at*Math.PI/2),st=g*Math.sin(at*Math.PI/2)+_;for(let K=0,_t=I.length;K<_t;K++){let ft=G(I[K],Y[K],st);Tt(ft.x,ft.y,u+$)}for(let K=0,_t=T.length;K<_t;K++){let ft=T[K];et=it[K];for(let yt=0,Wt=ft.length;yt<Wt;yt++){let E=G(ft[yt],et[yt],st);b?Tt(E.x,E.y+x[h-1].y,x[h-1].x+$):Tt(E.x,E.y,u+$)}}}H(),Q();function H(){let R=s.length/3;if(d){let at=0,$=z*at;for(let st=0;st<Z;st++){let K=J[st];Mt(K[2]+$,K[1]+$,K[0]+$)}at=h+f*2,$=z*at;for(let st=0;st<Z;st++){let K=J[st];Mt(K[0]+$,K[1]+$,K[2]+$)}}else{for(let at=0;at<Z;at++){let $=J[at];Mt($[2],$[1],$[0])}for(let at=0;at<Z;at++){let $=J[at];Mt($[0]+z*h,$[1]+z*h,$[2]+z*h)}}n.addGroup(R,s.length/3-R,0)}function Q(){let R=s.length/3,at=0;pt(I,at),at+=I.length;for(let $=0,st=T.length;$<st;$++){let K=T[$];pt(K,at),at+=K.length}n.addGroup(R,s.length/3-R,1)}function pt(R,at){let $=R.length;for(;--$>=0;){let st=$,K=$-1;K<0&&(K=R.length-1);for(let _t=0,ft=h+f*2;_t<ft;_t++){let yt=z*_t,Wt=z*(_t+1),E=at+st+yt,y=at+K+yt,V=at+K+Wt,X=at+st+Wt;vt(E,y,V,X)}}}function Tt(R,at,$){c.push(R),c.push(at),c.push($)}function Mt(R,at,$){Vt(R),Vt(at),Vt($);let st=s.length/3,K=M.generateTopUV(n,s,st-3,st-2,st-1);At(K[0]),At(K[1]),At(K[2])}function vt(R,at,$,st){Vt(R),Vt(at),Vt(st),Vt(at),Vt($),Vt(st);let K=s.length/3,_t=M.generateSideWallUV(n,s,K-6,K-3,K-2,K-1);At(_t[0]),At(_t[1]),At(_t[3]),At(_t[1]),At(_t[2]),At(_t[3])}function Vt(R){s.push(c[R*3+0]),s.push(c[R*3+1]),s.push(c[R*3+2])}function At(R){r.push(R.x),r.push(R.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return Bg(e,n,t)}static fromJSON(t,e){let n=[];for(let r=0,a=t.shapes.length;r<a;r++){let o=e[t.shapes[r]];n.push(o)}let s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new Vo[s.type]().fromJSON(s)),new i(n,t.options)}},Fg={generateTopUV:function(i,t,e,n,s){let r=t[e*3],a=t[e*3+1],o=t[n*3],c=t[n*3+1],l=t[s*3],h=t[s*3+1];return[new nt(r,a),new nt(o,c),new nt(l,h)]},generateSideWallUV:function(i,t,e,n,s,r){let a=t[e*3],o=t[e*3+1],c=t[e*3+2],l=t[n*3],h=t[n*3+1],u=t[n*3+2],d=t[s*3],p=t[s*3+1],g=t[s*3+2],_=t[r*3],f=t[r*3+1],m=t[r*3+2];return Math.abs(o-h)<Math.abs(a-l)?[new nt(a,1-c),new nt(l,1-u),new nt(d,1-g),new nt(_,1-m)]:[new nt(o,1-c),new nt(h,1-u),new nt(p,1-g),new nt(f,1-m)]}};function Bg(i,t,e){if(e.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var sn=class i extends Jr{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}},jr=class i extends Jr{constructor(t=1,e=0){let n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,s,t,e),this.type="OctahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}};var Qr=class i extends de{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let c=Math.min(a+o,Math.PI),l=0,h=[],u=new L,d=new L,p=[],g=[],_=[],f=[];for(let m=0;m<=n;m++){let M=[],x=m/n,b=0;m===0&&a===0?b=.5/e:m===n&&c===Math.PI&&(b=-.5/e);for(let C=0;C<=e;C++){let A=C/e;u.x=-t*Math.cos(s+A*r)*Math.sin(a+x*o),u.y=t*Math.cos(a+x*o),u.z=t*Math.sin(s+A*r)*Math.sin(a+x*o),g.push(u.x,u.y,u.z),d.copy(u).normalize(),_.push(d.x,d.y,d.z),f.push(A+b,1-x),M.push(l++)}h.push(M)}for(let m=0;m<n;m++)for(let M=0;M<e;M++){let x=h[m][M+1],b=h[m][M],C=h[m+1][M],A=h[m+1][M+1];(m!==0||a>0)&&p.push(x,b,A),(m!==n-1||c<Math.PI)&&p.push(b,C,A)}this.setIndex(p),this.setAttribute("position",new ee(g,3)),this.setAttribute("normal",new ee(_,3)),this.setAttribute("uv",new ee(f,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var ta=class i extends de{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r},n=Math.floor(n),s=Math.floor(s);let a=[],o=[],c=[],l=[],h=new L,u=new L,d=new L;for(let p=0;p<=n;p++)for(let g=0;g<=s;g++){let _=g/s*r,f=p/n*Math.PI*2;u.x=(t+e*Math.cos(f))*Math.cos(_),u.y=(t+e*Math.cos(f))*Math.sin(_),u.z=e*Math.sin(f),o.push(u.x,u.y,u.z),h.x=t*Math.cos(_),h.y=t*Math.sin(_),d.subVectors(u,h).normalize(),c.push(d.x,d.y,d.z),l.push(g/s),l.push(p/n)}for(let p=1;p<=n;p++)for(let g=1;g<=s;g++){let _=(s+1)*p+g-1,f=(s+1)*(p-1)+g-1,m=(s+1)*(p-1)+g,M=(s+1)*p+g;a.push(_,f,M),a.push(f,m,M)}this.setIndex(a),this.setAttribute("position",new ee(o,3)),this.setAttribute("normal",new ee(c,3)),this.setAttribute("uv",new ee(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}};var pi=class extends An{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Et(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Et(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Mh,this.normalScale=new nt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ke,this.combine=sc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};function _r(i,t,e){return!i||!e&&i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function kg(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var es=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let a;e:{i:if(!(t<s)){for(let o=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=e[++n],t<s)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(n=2,r=o);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=e[--n-1],t>=r)break t}a=n,n=0;break e}break n}for(;n<a;){let o=n+a>>>1;t<e[o]?a=o:n=o+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let a=0;a!==s;++a)e[a]=n[r+a];return e}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},qo=class extends es{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:cl,endingEnd:cl}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,a=t+1,o=s[r],c=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case ll:r=t,o=2*e-n;break;case hl:r=s.length-2,o=e+s[r]-s[r+1];break;default:r=t,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case ll:a=t,c=2*n-e;break;case hl:a=1,c=n+s[1]-s[0];break;default:a=t-1,c=e}let l=(n-e)*.5,h=this.valueSize;this._weightPrev=l/(e-o),this._weightNext=l/(c-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=t*o,l=c-o,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,p=this._weightNext,g=(n-e)/(s-e),_=g*g,f=_*g,m=-d*f+2*d*_-d*g,M=(1+d)*f+(-1.5-2*d)*_+(-.5+d)*g+1,x=(-1-p)*f+(1.5+p)*_+.5*g,b=p*f-p*_;for(let C=0;C!==o;++C)r[C]=m*a[h+C]+M*a[l+C]+x*a[c+C]+b*a[u+C];return r}},Yo=class extends es{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=t*o,l=c-o,h=(n-e)/(s-e),u=1-h;for(let d=0;d!==o;++d)r[d]=a[l+d]*u+a[c+d]*h;return r}},$o=class extends es{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},rn=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=_r(e,this.TimeBufferType),this.values=_r(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:_r(t.times,Array),values:_r(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s)}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new $o(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Yo(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new qo(this.times,this.values,this.getValueSize(),t)}setInterpolation(t){let e;switch(t){case Mr:e=this.InterpolantFactoryMethodDiscrete;break;case br:e=this.InterpolantFactoryMethodLinear;break;case Ca:e=this.InterpolantFactoryMethodSmooth;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Mr;case this.InterpolantFactoryMethodLinear:return br;case this.InterpolantFactoryMethodSmooth:return Ca}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t}return this}trim(t,e){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<t;)++r;for(;a!==-1&&n[a]>e;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let c=n[o];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,c),t=!1;break}if(a!==null&&a>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,c,a),t=!1;break}a=c}if(s!==void 0&&kg(s))for(let o=0,c=s.length;o!==c;++o){let l=s[o];if(isNaN(l)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,l),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Ca,r=t.length-1,a=1;for(let o=1;o<r;++o){let c=!1,l=t[o],h=t[o+1];if(l!==h&&(o!==1||l!==t[0]))if(s)c=!0;else{let u=o*n,d=u-n,p=u+n;for(let g=0;g!==n;++g){let _=e[u+g];if(_!==e[d+g]||_!==e[p+g]){c=!0;break}}}if(c){if(o!==a){t[a]=t[o];let u=o*n,d=a*n;for(let p=0;p!==n;++p)e[d+p]=e[u+p]}++a}}if(r>0){t[a]=t[r];for(let o=r*n,c=a*n,l=0;l!==n;++l)e[c+l]=e[o+l];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,s}};rn.prototype.TimeBufferType=Float32Array;rn.prototype.ValueBufferType=Float32Array;rn.prototype.DefaultInterpolation=br;var mi=class extends rn{};mi.prototype.ValueTypeName="bool";mi.prototype.ValueBufferType=Array;mi.prototype.DefaultInterpolation=Mr;mi.prototype.InterpolantFactoryMethodLinear=void 0;mi.prototype.InterpolantFactoryMethodSmooth=void 0;var Zo=class extends rn{};Zo.prototype.ValueTypeName="color";var Jo=class extends rn{};Jo.prototype.ValueTypeName="number";var Ko=class extends es{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-e)/(s-e),l=t*o;for(let h=l+o;l!==h;l+=4)Ze.slerpFlat(r,0,a,l-o,a,l,c);return r}},Ds=class extends rn{InterpolantFactoryMethodLinear(t){return new Ko(this.times,this.values,this.getValueSize(),t)}};Ds.prototype.ValueTypeName="quaternion";Ds.prototype.DefaultInterpolation=br;Ds.prototype.InterpolantFactoryMethodSmooth=void 0;var gi=class extends rn{};gi.prototype.ValueTypeName="string";gi.prototype.ValueBufferType=Array;gi.prototype.DefaultInterpolation=Mr;gi.prototype.InterpolantFactoryMethodLinear=void 0;gi.prototype.InterpolantFactoryMethodSmooth=void 0;var jo=class extends rn{};jo.prototype.ValueTypeName="vector";var Qo=class{constructor(t,e,n){let s=this,r=!1,a=0,o=0,c,l=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,u){return l.push(h,u),this},this.removeHandler=function(h){let u=l.indexOf(h);return u!==-1&&l.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=l.length;u<d;u+=2){let p=l[u],g=l[u+1];if(p.global&&(p.lastIndex=0),p.test(h))return g}return null}}},zg=new Qo,tc=class{constructor(t){this.manager=t!==void 0?t:zg,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}};tc.DEFAULT_MATERIAL_NAME="__DEFAULT";var ea=class extends Se{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Et(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),e}},na=class extends ea{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Se.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Et(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}},ao=new Zt,lh=new L,hh=new L,ec=class{constructor(t){this.camera=t,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new nt(512,512),this.map=null,this.mapPass=null,this.matrix=new Zt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ws,this._frameExtents=new nt(1,1),this._viewportCount=1,this._viewports=[new ve(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera,n=this.matrix;lh.setFromMatrixPosition(t.matrixWorld),e.position.copy(lh),hh.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(hh),e.updateMatrixWorld(),ao.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ao),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(ao)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}};var nc=class extends ec{constructor(){super(new Fr(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},ia=class extends ea{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Se.DEFAULT_UP),this.updateMatrix(),this.target=new Se,this.shadow=new nc}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}};var lc="\\[\\]\\.:\\/",Hg=new RegExp("["+lc+"]","g"),hc="[^"+lc+"]",Vg="[^"+lc.replace("\\.","")+"]",Gg=/((?:WC+[\/:])*)/.source.replace("WC",hc),Wg=/(WCOD+)?/.source.replace("WCOD",Vg),Xg=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",hc),qg=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",hc),Yg=new RegExp("^"+Gg+Wg+Xg+qg+"$"),$g=["material","materials","bones","map"],ic=class{constructor(t,e,n){let s=n||re.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},re=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Hg,"")}static parseTrackName(t){let e=Yg.exec(t);if(e===null)throw new Error("PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);$g.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let c=n(o.children);if(c)return c}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=e.objectIndex;switch(n){case"materials":if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===l){l=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(l!==void 0){if(t[l]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[l]}}let a=t[s];if(a===void 0){let l=e.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.needsUpdate!==void 0?o=this.Versioning.NeedsUpdate:t.matrixWorldNeedsUpdate!==void 0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};re.Composite=ic;re.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};re.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};re.prototype.GetterByBindingType=[re.prototype._getValue_direct,re.prototype._getValue_array,re.prototype._getValue_arrayElement,re.prototype._getValue_toArray];re.prototype.SetterByBindingTypeAndVersioning=[[re.prototype._setValue_direct,re.prototype._setValue_direct_setNeedsUpdate,re.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[re.prototype._setValue_array,re.prototype._setValue_array_setNeedsUpdate,re.prototype._setValue_array_setMatrixWorldNeedsUpdate],[re.prototype._setValue_arrayElement,re.prototype._setValue_arrayElement_setNeedsUpdate,re.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[re.prototype._setValue_fromArray,re.prototype._setValue_fromArray_setNeedsUpdate,re.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Tx=new Float32Array(1);typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"162"}}));typeof window!="undefined"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="162");var uc={};function Zg(i){if(uc[i])return uc[i];let t;switch(i){case"box":t=new Rn(1,1,1);break;case"cyl":t=new di(.5,.5,1,8);break;case"cyl6":t=new di(.5,.5,1,6);break;case"tcyl":t=new di(.3,.5,1,7);break;case"cone":t=new Rs(.5,1,7);break;case"cone4":t=new Rs(.5,1,4);break;case"ico":t=new sn(.5,0);break;case"ico1":t=new sn(.5,1);break;case"oct":t=new jr(.5,0);break;default:throw new Error("unknown primitive "+i)}let e=t.index?t.toNonIndexed():t;return uc[i]=e.attributes.position.array}var Fh=new Zt,Jg=new L,Bh=new Ze,Kg=new L,kh=new ke,Xn=new Et;function Yn(i,t){let e=Math.min(255,Math.round((i>>16&255)*t)),n=Math.min(255,Math.round((i>>8&255)*t)),s=Math.min(255,Math.round((i&255)*t));return e<<16|n<<8|s}var qn=class{constructor(t=6e3){this.pos=new Float32Array(t*3),this.col=new Float32Array(t*3),this.n=0}_grow(t){let e=(this.n+t)*3;if(e<=this.pos.length)return;let n=this.pos.length;for(;n<e;)n*=2;let s=new Float32Array(n);s.set(this.pos.subarray(0,this.n*3)),this.pos=s;let r=new Float32Array(n);r.set(this.col.subarray(0,this.n*3)),this.col=r}add(t,e,n,s,r,a,o,c,l=0,h=0,u=0){let d=Zg(t),p=d.length/3;this._grow(p),kh.set(l,h,u),Bh.setFromEuler(kh),Fh.compose(Jg.set(e,n,s),Bh,Kg.set(r,a,o)),Xn.setHex(c);let g=Fh.elements,_=this.pos,f=this.col,m=this.n*3;for(let M=0;M<d.length;M+=3,m+=3){let x=d[M],b=d[M+1],C=d[M+2];_[m]=g[0]*x+g[4]*b+g[8]*C+g[12],_[m+1]=g[1]*x+g[5]*b+g[9]*C+g[13],_[m+2]=g[2]*x+g[6]*b+g[10]*C+g[14],f[m]=Xn.r,f[m+1]=Xn.g,f[m+2]=Xn.b}return this.n+=p,this}quad(t,e,n,s,r,a,o,c,l,h,u,d,p){this._grow(6),Xn.setHex(p);let g=this.pos,_=this.col,f=this.n*3,m=(M,x,b)=>{g[f]=M,g[f+1]=x,g[f+2]=b,_[f]=Xn.r,_[f+1]=Xn.g,_[f+2]=Xn.b,f+=3};return m(t,e,n),m(s,r,a),m(o,c,l),m(t,e,n),m(o,c,l),m(h,u,d),this.n+=6,this}build(){let t=new de;return t.setAttribute("position",new ue(this.pos.slice(0,this.n*3),3)),t.setAttribute("color",new ue(this.col.slice(0,this.n*3),3)),t.computeVertexNormals(),t.computeBoundingSphere(),t}};var He=[-2.2,0,2.2],gt=-6,we=.9,ss=10.5,xi=32,dc=.75;function hn(i,t,e){return i<t?t:i>e?e:i}function fc(i){return function(){i|=0,i=i+1831565813|0;let t=Math.imul(i^i>>>15,1|i);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}function Us(i){return 13+15*(1-Math.exp(-i/2e3))}function zh(i){return Math.min(1,i/4500)}var Xe=Math.PI;function jg(i,t,e,n){let s=t();if(s<.48){let r=7+t()*6,a=3.6+t()*2;i.add("tcyl",e,gt+r/2,n,.9,r,.9,7228202);let o=[2917443,3511884,4434008];for(let c=0;c<3;c++)i.add("cone",e,gt+r+c*1.7-.2,n,a-c*1,3.5,a-c*1,o[c],0,t()*3)}else if(s<.82){let r=6.5+t()*5,a=4.2+t()*2.6;i.add("tcyl",e,gt+r/2,n,1,r,1,8016432),i.add("ico1",e,gt+r+a*.28,n,a,a*.85,a,t()<.5?5025616:6471506,t(),t()*3),i.add("ico",e+a*.36,gt+r-.1,n+.5,a*.56,a*.5,a*.56,4036167,t(),t())}else if(s<.92){let r=1.6+t()*2.2;i.add("ico",e,gt+r*.3,n,r*1.3,r,r,9410460,t(),t()*3),i.add("ico",e+r*.6,gt+r*.15,n+r*.3,r*.6,r*.5,r*.6,10660528,t(),t())}else{i.add("ico",e,gt+.7,n,2.4,1.6,2.2,5616470,t(),t());let r=[16740241,16765503,16777215][Math.floor(t()*3)];for(let a=0;a<3;a++)i.add("oct",e+(t()-.5)*2.4,gt+1.5+t()*.3,n+(t()-.5)*2.2,.4,.4,.4,r)}}function Qg(i,t,e,n){let s=t();if(s<.34){let r=6.5+t()*4,a=5217624;i.add("cyl",e,gt+r/2,n,1.3,r,1.3,a),i.add("ico",e,gt+r,n,1.3,1.1,1.3,a);let o=gt+r*.5+t()*1.2;i.add("cyl",e+1.2,o,n,.8,1.8,.8,a,0,0,Xe/2),i.add("cyl",e+1.9,o+1.3,n,.8,2.6,.8,a),i.add("cyl",e-1.2,o+1,n,.8,1.8,.8,a,0,0,Xe/2),i.add("cyl",e-1.9,o+2,n,.8,2.2,.8,a)}else if(s<.62){let r=6+t()*6,a=5+t()*6,o=5+t()*5;i.add("cyl6",e,gt+a/2,n,r,a,o,13206096,0,t()*3),i.add("cyl6",e,gt+a+.5,n,r*.86,1,o*.86,14391906,0,t()*3),t()<.5&&i.add("cyl6",e+r*.2,gt+a+2,n,r*.4,2.2,o*.4,13206096,0,t())}else if(s<.86){let r=8+t()*4,a=(t()-.5)*.3;i.add("tcyl",e,gt+r/2,n,.7,r,.7,10187846,0,0,a);let o=e-Math.sin(a)*r*.5,c=gt+r;for(let l=0;l<6;l++){let h=l/6*Xe*2+t()*.4;i.add("box",o+Math.cos(h)*1.7,c-.25,n+Math.sin(h)*1.7,3.6,.16,1,l%2?4891994:4035664,0,-h,-.32)}i.add("ico",o,c,n,.9,.8,.9,8018480)}else{let r=2+t()*2;i.add("ico",e,gt+r*.3,n,r*1.4,r,r,13933155,t(),t()*3),i.add("ico",e-r*.7,gt+r*.2,n+.4,r*.7,r*.6,r*.7,12551248,t(),t())}}function tx(i,t,e,n){let s=t();if(s<.55){let r=6.5+t()*6,a=3.8+t()*1.8;i.add("tcyl",e,gt+r/2,n,.8,r,.8,5916212);for(let o=0;o<3;o++){let c=gt+r+o*1.8-.4,l=a-o*1;i.add("cone",e,c,n,l,3.4,l,3108699,0,t()*3),i.add("cone",e,c+.75,n,l*.74,2.2,l*.74,16054781,0,t()*3)}}else if(s<.8){let r=3.5+t()*5;i.add("oct",e,gt+r*.45,n,1.8+t(),r,1.8+t(),10149112,0,t()*3,(t()-.5)*.3),i.add("oct",e+1.3,gt+r*.25,n+.6,1,r*.55,1,12905725,0,t()*3,.35),i.add("oct",e-1.1,gt+r*.2,n-.5,.9,r*.45,.9,8375796,0,t()*3,-.3)}else if(s<.93){let r=3+t()*4;i.add("ico1",e,gt+r*.1,n,r*1.6,r*.7,r*1.3,16514559,0,t()*3)}else i.add("ico1",e,gt+1.1,n,2.4,2.2,2.4,16777215),i.add("ico1",e,gt+2.7,n,1.7,1.6,1.7,16777215),i.add("ico1",e,gt+3.9,n,1.2,1.2,1.2,16777215),i.add("cone",e,gt+3.9,n+.8,.26,.9,.26,16747069,Xe/2),i.add("cyl",e,gt+4.7,n,1,.7,1,2831184)}function ex(i,t,e,n){let s=t();if(s<.5){let r=6+t()*9,a=2.4+t()*2.4;i.add("cone",e,gt+r/2,n,a,r,a,3879736,(t()-.5)*.16,t()*3,(t()-.5)*.16),i.add("cone",e+a*.6,gt+r*.28,n+.4,a*.6,r*.56,a*.6,4866118,0,t()*3,-.2),t()<.5&&i.add("oct",e,gt+r*.99,n,.6,.9,.6,16747054)}else if(s<.75){let r=4+t()*3;i.add("cyl6",e,gt+1.1,n,r,2.4,r,3090476,0,t()*3),i.add("cyl6",e,gt+2.32,n,r*.62,.1,r*.62,16752947,0,t()*3),i.add("oct",e,gt+3.4+t(),n,.5,.8,.5,16761418)}else if(s<.92){let r=5.5+t()*4;i.add("tcyl",e,gt+r/2,n,.7,r,.7,2300959),i.add("box",e+.9,gt+r*.72,n,2.2,.22,.22,2300959,0,0,.6),i.add("box",e-.8,gt+r*.56,n,1.8,.2,.2,2300959,0,0,-.7),i.add("box",e+.2,gt+r*.92,n+.5,.2,1.6,.2,2300959,.5,0,0)}else{let r=2+t()*2.4;i.add("ico",e,gt+r*.3,n,r*1.4,r,r*1.2,4208444,t(),t()*3),i.add("ico",e+.3,gt+r*.7,n,r*.4,r*.3,r*.4,16742954,t(),t())}}var $n=[58879,16732120,16765503,8191851,11766015];function nx(i,t,e,n,s){let r=t();if(r<.78){let a=5+t()*4.5,o=5+t()*4.5,c=11+t()*20,l=e+s*a*.5,h=[1777984,2304594,1382963][Math.floor(t()*3)];i.add("box",l,gt+c/2,n,a,c,o,h);let u=t()<.6?16767370:$n[Math.floor(t()*$n.length)];for(let d=gt+3.2;d<gt+c-1.2;d+=2.4)t()<.22||i.add("box",l,d,n,a+.12,.7,o+.12,t()<.8?u:Yn(u,.5));i.add("box",l,gt+c+.15,n,a+.5,.3,o+.5,$n[Math.floor(t()*$n.length)]),t()<.5&&(i.add("box",l+a*.2,gt+c+2,n,.16,4,.16,3818096),i.add("oct",l+a*.2,gt+c+4.1,n,.5,.5,.5,16726863))}else if(r<.92){let a=9+t()*4,o=$n[Math.floor(t()*$n.length)];i.add("box",e,gt+a/2,n,.4,a,.4,2765152),i.add("box",e,gt+a-1.2,n,.3,2.6,3.6,o),i.add("box",e,gt+a-1.2,n,.5,1.6,2.6,Yn(o,.35))}else{let a=$n[Math.floor(t()*$n.length)],o=8+t()*3;i.add("box",e,gt+o/2,n,.3,o,.3,2765152),i.add("oct",e,gt+o+1.2,n,2.2,2.2,2.2,a,0,t()*3)}}function ix(i,t,e,n){let s=t();if(s<.4){let r=4+t()*4,a=gt+.8+t()*4.5;i.add("ico1",e,a,n,r*1.5,r*.8,r*1.2,16777215,0,t()*3),i.add("ico1",e+r*.8,a-.3,n+.6,r,r*.6,r,15988991,0,t()*3),i.add("ico1",e-r*.75,a-.2,n-.5,r*.9,r*.55,r*.9,16448767,0,t()*3)}else if(s<.72){let r=4+t()*3.5,a=gt+3.5+t()*5;i.add("cone",e,a-r*.55,n,r*1.3,r*1.2,r*1.3,9138007,Xe,t()*3),i.add("cyl",e,a+.2,n,r*1.36,.7,r*1.36,7128156,0,t()*3),t()<.75?(i.add("tcyl",e,a+1.9,n,.5,3,.5,8016432),i.add("ico1",e,a+4.1,n,3,2.7,3,t()<.5?16752324:8246890,t(),t())):(i.add("cyl",e,a+2.3,n,.8,3.6,.8,15920612),i.add("box",e,a+4.3,n,1.3,.4,1.3,15251530))}else if(s<.9){let r=7+t()*5;i.add("cyl",e,gt+r/2,n,1.3,r,1.3,15920612),i.add("box",e,gt+r+.25,n,1.9,.5,1.9,15251530),i.add("box",e,gt+.4,n,2,.8,2,14867663)}else{let r=7+t()*3;i.add("cyl",e,gt+r/2,n,.5,r,.5,14867663),i.add("oct",e,gt+r+1.1,n,1.8,2.4,1.8,16765503,0,t()*3)}}var sx={forest:{low(i){i.add("cyl",0,.48,0,.94,2.06,.94,9067059,0,0,Xe/2),i.add("cyl",-1.04,.48,0,.8,.05,.8,14464640,0,0,Xe/2),i.add("cyl",1.04,.48,0,.8,.05,.8,14464640,0,0,Xe/2),i.add("ico",.5,.98,.1,.5,.3,.5,5814362)},high(i){i.add("box",-.98,1.05,0,.26,2.1,.26,7228202),i.add("box",.98,1.05,0,.26,2.1,.26,7228202),i.add("cyl",0,1.72,0,.78,2.3,.78,9067059,0,0,Xe/2),i.add("ico",-.5,2.2,0,.9,.5,.8,5025616),i.add("ico",.55,2.16,.1,.8,.45,.7,6471506)},block(i){i.add("ico",0,1.25,0,2.05,2.7,1.5,9410460,.3,.5),i.add("ico",-.5,.5,.2,1.2,1.1,1.2,8226186,.6,1.2),i.add("ico",.1,2.5,0,1.2,.5,1,5814362,0,.4)}},desert:{low(i){i.add("box",0,.4,0,2.05,.8,.85,13206096),i.add("box",0,.88,0,2.15,.16,.95,15119484)},high(i){i.add("box",-.96,1.05,0,.34,2.1,.6,13206096),i.add("box",.96,1.05,0,.34,2.1,.6,13206096),i.add("box",0,1.74,0,2.3,.84,.7,14391906),i.add("box",0,2.24,0,2.5,.18,.8,15119484)},block(i){i.add("cyl",0,1.4,0,1.5,2.8,1.5,5217624),i.add("ico",0,2.8,0,1.5,1.2,1.5,5217624),i.add("cyl",.86,1.6,0,.6,1,.6,5217624,0,0,Xe/2),i.add("cyl",-.86,1.2,0,.6,1,.6,5217624,0,0,Xe/2),i.add("oct",0,3.5,0,.5,.5,.5,16740241)}},snow:{low(i){i.add("box",0,.36,0,2.05,.72,.9,10149112),i.add("ico1",0,.74,0,2.2,.56,1.05,16777215)},high(i){i.add("oct",-.98,1,0,.6,2.3,.6,8375796),i.add("oct",.98,1,0,.6,2.3,.6,8375796),i.add("box",0,1.72,0,2.3,.8,.6,12577275);for(let t=-2;t<=2;t++)i.add("cone",t*.42,1.2,0,.2,.34,.2,15267839,Xe);i.add("ico1",0,2.14,0,2.3,.4,.75,16777215)},block(i){i.add("oct",0,1.5,0,1.9,3.3,1.5,10149112,0,.4),i.add("oct",-.55,.8,.2,1,1.9,1,12905725,0,1,.2),i.add("oct",.6,.7,-.1,.9,1.6,.9,8375796,0,2,-.25)}},volcano:{low(i){i.add("box",0,.36,0,2.05,.72,.85,3879736),i.add("cone",-.6,.85,0,.7,.6,.7,4866118),i.add("cone",.1,.9,0,.8,.7,.8,3879736),i.add("cone",.7,.82,0,.6,.5,.6,4866118),i.add("box",0,.3,.44,1.7,.14,.04,16747054)},high(i){i.add("box",-.98,1.05,0,.34,2.1,.5,3879736),i.add("box",.98,1.05,0,.34,2.1,.5,3879736),i.add("box",0,1.74,0,2.3,.84,.62,4866118),i.add("box",0,1.5,.33,1.9,.12,.04,16747054);for(let t=-2;t<=2;t++)i.add("cone",t*.42,1.16,0,.24,.4,.24,16747054,Xe)},block(i){i.add("cone",0,1.55,0,1.9,3.1,1.5,3879736,0,.5),i.add("cone",-.5,.8,.15,1,1.7,1,4866118,0,1,.15),i.add("cone",.55,.7,0,.9,1.4,.9,3090476,0,2,-.15),i.add("oct",0,3.1,0,.36,.5,.36,16747054)}},neon:{low(i){i.add("box",0,.44,0,2.05,.88,.6,2304594),i.add("box",0,.62,.31,1.9,.2,.04,16732120),i.add("box",0,.92,0,2.1,.1,.66,16732120),i.add("box",0,.26,.31,1.9,.12,.04,16765503)},high(i){i.add("box",-.98,1.05,0,.26,2.1,.26,2765152),i.add("box",.98,1.05,0,.26,2.1,.26,2765152),i.add("box",0,1.42,0,1.9,.14,.14,58879),i.add("box",0,1.72,0,1.9,.14,.14,58879),i.add("box",0,2.02,0,1.9,.14,.14,58879),i.add("box",0,2.22,0,2.3,.2,.4,2765152)},block(i){i.add("box",0,.7,0,1.9,1.4,1.2,2765152),i.add("box",0,2.05,0,1.6,1.3,1.1,2304594),i.add("box",0,1.42,0,2,.12,1.3,16765503),i.add("box",0,2.72,0,1.7,.12,1.2,58879),i.add("box",0,.7,.61,1.2,.5,.04,16732120),i.add("box",0,2.05,.56,.9,.5,.04,8191851)}},sky:{low(i){i.add("box",0,.2,0,2.1,.4,.8,14867663);for(let t=-2;t<=2;t++)i.add("cyl",t*.44,.58,0,.26,.4,.26,15920612);i.add("box",0,.86,0,2.15,.2,.86,15251530)},high(i){i.add("cyl",-.98,1.05,0,.36,2.1,.36,15920612),i.add("cyl",.98,1.05,0,.36,2.1,.36,15920612),i.add("box",0,1.72,0,2.4,.8,.6,15920612),i.add("box",0,2.2,0,2.6,.2,.75,15251530),i.add("oct",0,1.72,.32,.5,.5,.2,16765503)},block(i){i.add("box",0,.25,0,1.9,.5,1.4,14867663),i.add("cyl",0,1.6,0,1.4,2.3,1.2,15920612),i.add("box",0,2.9,0,1.9,.4,1.4,15251530),i.add("oct",0,3.6,0,.8,1,.8,16765503)}}},pc={};function Hh(i,t){let e=i.id+":"+t;if(!pc[e]){let n=new qn(600);sx[i.id][t](n),pc[e]=n.build()}return pc[e]}var mc=[{id:"forest",name:"\uACE0\uC694\uD55C \uC232",sky:[3117030,13496059],fog:[45,140],sun:16773577,sunI:2.3,hemiSky:14086143,hemiGround:5929544,hemiI:1.7,base:5216840,baseGlow:0,stars:0,clouds:1,pal:{top:13876627,top2:13021060,corner:14469539,side:8086596,trim:9071427,pillar:9271900,wall:8019258,warn:16761372,smash:9067059},particles:{color:15400858,size:.2,vx:.5,vy:.25,opacity:.75,count:50},deco:jg,decoStep:4.4,decoProb:.82},{id:"desert",name:"\uB178\uC744 \uC0AC\uB9C9",sky:[15764028,16638637],fog:[50,150],sun:16769200,sunI:2.4,hemiSky:16771529,hemiGround:12158290,hemiI:1.6,base:15121784,baseGlow:0,stars:0,clouds:.5,pal:{top:15520412,top2:14730378,corner:15981738,side:11898197,trim:13201471,pillar:13081186,wall:11888954,warn:2078665,smash:14391906},particles:{color:15980964,size:.14,vx:3.2,vy:.1,opacity:.55,count:70},deco:Qg,decoStep:5.2,decoProb:.72},{id:"snow",name:"\uC5BC\uC74C \uC124\uC6D0",sky:[6989542,15332604],fog:[40,130],sun:16777215,sunI:2,hemiSky:15267071,hemiGround:11125980,hemiI:1.9,base:15660539,baseGlow:0,stars:0,clouds:.8,pal:{top:13951983,top2:12834534,corner:14872311,side:9415103,trim:6271204,pillar:10335174,wall:7050165,warn:16742973,smash:12577275},particles:{color:16777215,size:.2,vx:.8,vy:-2.6,opacity:.95,count:120},deco:tx,decoStep:4.6,decoProb:.8},{id:"volcano",name:"\uBD88\uC758 \uD654\uC0B0",sky:[2363420,10104856],fog:[35,125],sun:16757370,sunI:2,hemiSky:16757898,hemiGround:16734751,hemiI:1.5,base:16738847,baseGlow:13908480,stars:.35,clouds:0,pal:{top:5919064,top2:5064011,corner:6642530,side:2761768,trim:16747054,pillar:3485235,wall:3090476,warn:16765503,smash:4866118},particles:{color:16752704,size:.16,vx:.4,vy:2.4,opacity:.9,count:90},deco:ex,decoStep:4.8,decoProb:.78},{id:"neon",name:"\uB124\uC628 \uC2DC\uD2F0",sky:[461344,4268139],fog:[45,140],sun:12166911,sunI:1.3,hemiSky:13620991,hemiGround:6967216,hemiI:2.3,base:856360,baseGlow:0,stars:1,clouds:0,pal:{top:3752302,top2:3159903,corner:4476288,side:1382963,trim:58879,pillar:2304594,wall:1777984,warn:16732120,smash:58879},particles:{color:8382975,size:.12,vx:.2,vy:-7,opacity:.6,count:110},deco:nx,decoStep:7.5,decoProb:.86},{id:"sky",name:"\uD558\uB298 \uC815\uC6D0",sky:[3112936,13625599],fog:[55,165],sun:16774876,sunI:1.9,hemiSky:15332863,hemiGround:13621486,hemiI:1.5,base:16186111,baseGlow:0,stars:0,clouds:1,pal:{top:14932164,top2:13879216,corner:15655887,side:13616824,trim:15251530,pillar:14867663,wall:14267749,warn:16735631,smash:15920612},particles:{color:16774064,size:.18,vx:.3,vy:.6,opacity:.85,count:60},deco:ix,decoStep:5.4,decoProb:.8}];var la=3.6,Vh=[[0,-1],[1,0],[0,1],[-1,0]],Gh=[[1,0],[0,1],[-1,0],[0,-1]],rx=4,Wh=[[-3.6,-2.2/2],[-2.2/2,2.2/2],[2.2/2,3.6]],Xh=i=>i<-2.2/2?0:i>2.2/2?2:1;function gc(i,t,e,n,s,r,a,o,c,l){let h=-n,u=-s;i.quad(t,r,h,e,r,h,e,a,u,t,a,u,c),i.quad(t,r,h,t,a,u,t,a-o,u,t,r-o,h,l),i.quad(e,r,h,e,r-o,h,e,a-o,u,e,a,u,l)}function qh(i,t,e,n,s,r,a){let o=-n;i.quad(t,s,o,t,s-r,o,e,s-r,o,e,s,o,a)}function xc(i,t,e,n,s,r,a){let o=-n;i.quad(t,s,o,e,s,o,e,s-r,o,t,s-r,o,a)}var _c=class i{constructor(t,e){this.track=t,this.ox=e.ox,this.oz=e.oz,this.dir=e.dir,this.h0=e.h0,this.depth=e.depth,this.startDist=e.startDist,this.isRoot=!!e.isRoot,this.biomeIndex=e.biomeIndex,this.biome=mc[e.biomeIndex],this.children=null,this.obstacles=[],this.coins=[],this.pickups=[],this.holes=[],this.ramps=[],this.obIdx=0,this.coinIdx=0,this.built=!1,this.queued=!1,this.dead=!1,this.seed=Math.floor(t.rng()*2147483647),this.group=new Ce,this.group.position.set(this.ox,0,this.oz),this.group.rotation.y=-this.dir*Math.PI/2,this.generate()}toWorld(t,e,n,s){let r=Vh[this.dir],a=Gh[this.dir];return s.set(this.ox+r[0]*t+a[0]*e,n,this.oz+r[1]*t+a[1]*e)}heightAt(t){let e=this.profile;for(let n=1;n<e.length;n++)if(t<=e[n][0]){let s=e[n-1],r=e[n];return s[1]+(r[1]-s[1])*((t-s[0])/(r[0]-s[0]))}return e[e.length-1][1]}holeMaskAt(t){for(let e of this.holes)if(t>e.s0&&t<e.s1)return e.mask;return null}holeAt(t,e){let n=this.holeMaskAt(t);return n?n[Xh(e-.3)]&&n[Xh(e+.3)]:!1}onRamp(t,e=1.5){for(let n of this.ramps)if(t>n[0]-e&&t<n[1]+e)return n;return null}flatSpot(t,e){let n=Math.max(3,this.v*.45);for(let s=0;s<6;s++){let r=!1;for(let a of this.ramps)t+e+2>a[0]&&t-n<a[1]&&(t=a[1]+n+.5,r=!0);if(!r)break}return t}generate(){let t=this.track,e=t.rng,n=this.d=t.attract?0:zh(this.startDist),s=this.v=t.attract?12:Us(this.startDist),r=(h,u)=>h+e()*(u-h),a=this.dir===0?r(82,128):r(68,104);if(a*=1+.4*n,this.isRoot&&(a=t.attract?96:124),this.len=Math.round(a),this.dir===1)this.turn="L";else if(this.dir===3)this.turn="R";else{let h=e();this.turn=this.depth>=2&&h<.22?"T":h<.61?"L":"R"}this.turnZone=Math.max(12,s*.75),this.turnZoneStart=this.len-7.2-this.turnZone;let o=this.isRoot?32:7.2+8+s*.3,c=this.turnZoneStart-5;this.profile=[[-1e4,this.h0]];let l=this.h0;if(!this.isRoot&&c-o>34&&e()<.72){let h=c-o>78&&e()<.5?2:1,u=(c-o)/h;for(let d=0;d<h;d++){let p=r(8,12),g=o+d*u+2+e()*Math.max(0,u-p-4),_=r(1.1,2.4)*(e()<.5?-1:1);l+_<0&&(_=Math.abs(_)),l+_>3.8&&(_=-Math.abs(_)),this.profile.push([g,l],[g+p,l+_]),this.ramps.push([g,g+p]),l+=_}}if(this.profile.push([1e5,l]),this.hEnd=l,t.attract)for(let h=o;h<c-12;h+=r(16,26))this.coinLine(Math.floor(e()*3),h,6);else{let h=o;for(;h<c-2;){if(this.startDist+h>=t.nextPowerAt){let d=["magnet","magnet","shield","shield","double","double","boost"];this.pickups.push({type:d[Math.floor(e()*d.length)],lane:Math.floor(e()*3),s:h,got:!1,obj:null}),t.nextPowerAt=this.startDist+h+r(240,420),h+=Math.max(9,s*.55);continue}let u=this.placePattern(h,c,n,s);h+=u+s*(1.2-.45*n)+r(0,5)}}this.obstacles.sort((h,u)=>h.s-u.s),this.coins.sort((h,u)=>h.s-u.s)}addOb(t,e,n){this.obstacles.push({type:t,lane:e,s:n,half:t==="block"?.6:.45,alive:!0,mesh:null})}addCoin(t,e,n=.95){this.coins.push({x:He[t],s:e,y:this.heightAt(e)+n,got:!1,pull:!1,hid:!1})}coinLine(t,e,n,s=.95){for(let r=0;r<n;r++)this.addCoin(t,e+r*1.7,s)}coinArc(t,e,n){let s=2*ss/xi,r=ss*ss/(2*xi);for(let a of[.18,.34,.5,.66,.82])this.addCoin(t,e+(a-.5)*n*s,.95+4*r*a*(1-a)*.82)}makeRow(t){let e=this.track.rng,n=o=>Math.floor(e()*o),s=[null,null,null],r=t<.05,a=e();if(a<.2)s.fill("low");else if(a<.38)s.fill("high");else if(a<.62||r){let o=n(3);s[o]="block",!r&&e()<.3+t*.45&&(s[(o+1+n(2))%3]=e()<.5?"low":"high")}else if(a<.84){let o=n(3);for(let c=0;c<3;c++)c!==o&&(s[c]="block");e()<t*.6&&(s[o]=e()<.5?"low":"high")}else{let o=["low","high","block"];for(let c=0;c<3;c++)s[c]=o[n(3)];s.every(c=>c==="block")&&(s[n(3)]=e()<.5?"low":"high")}return s}placeRow(t,e,n,s=.65){let r=this.track.rng;for(let l=0;l<3;l++)e[l]&&this.addOb(e[l],l,t);if(r()>s)return;let a=[0,1,2].filter(l=>!e[l]);if(a.length){this.coinLine(a[Math.floor(r()*a.length)],t-3.4,5);return}let o=[0,1,2].filter(l=>e[l]!=="block"),c=o[Math.floor(r()*o.length)];e[c]==="low"?this.coinArc(c,t,n):this.coinLine(c,t-3.4,5,.55)}placePattern(t,e,n,s){let r=this.track.rng,a=(g,_)=>g+r()*(_-g),o=g=>Math.floor(r()*g),c=e-t,l=[["coins",1.5-n],["row",4]];this.depth>=1&&l.push(["gap",1.3]),this.depth>=2&&c>24&&l.push(["narrow",1.1]),n>.1&&c>s*.65+6&&l.push(["double",1+3*n]),n>.28&&c>s*1.2+6&&l.push(["slalom",.6+2*n]);let h=0;for(let g of l)h+=g[1];let u=r()*h,d="row";for(let g of l)if(u-=g[1],u<=0){d=g[0];break}if(d==="coins"){let g=o(3);if(r()<.35){let f=g;for(let m=0;m<3;m++)this.coinLine(f,t+m*5.1,3),f=hn(f+(f===0?1:f===2||r()<.5?-1:1),0,2);return 15}let _=5+o(5);return this.coinLine(g,t,_),_*1.7}if(d==="gap"){let g=hn(s*.2,3,5.2),_=this.flatSpot(t,g);if(_+g<e)return this.holes.push({s0:_,s1:_+g,mask:[!0,!0,!0]}),r()<.75&&this.coinArc(o(3),_+g/2,s),_-t+g;d="row"}if(d==="narrow"){let g=a(10,15)+s*.15,_=this.flatSpot(t,g);if(_+g<e){let f=[[!0,!1,!0],[!1,!0,!0],[!0,!0,!1],[!0,!1,!1],[!1,!1,!0]],m=f[o(f.length)];this.holes.push({s0:_,s1:_+g,mask:m});let M=[0,1,2].filter(x=>!m[x]);return this.coinLine(M[o(M.length)],_+1,Math.floor((g-2)/1.7)),_-t+g}d="row"}if(d==="double"){let g=Math.max(9,s*.62),_=this.flatSpot(t,1),f=this.flatSpot(_+g,1);if(f<e)return this.placeRow(_,this.makeRow(n),s,.4),this.placeRow(f,this.makeRow(n),s,.6),f-t+1;d="row"}if(d==="slalom"){let g=Math.max(8.5,s*.56),_=t,f=o(3),m=t;for(let M=0;M<3;M++){let x=this.flatSpot(_,1);if(x>=e)break;let b=["block","block","block"];b[f]=null,this.placeRow(x,b,s,.8),m=x,_=x+g,f=f===0||f===2?1:r()<.5?0:2}return m-t+1}let p=this.flatSpot(t,1);return p<e&&this.placeRow(p,this.makeRow(n),s),p-t+1}build(){if(this.built||this.dead)return;this.built=!0;let t=this.track,e=new qn(9e3);this.buildFloor(e),this.buildCorner(e),this.buildPillars(e),this.buildDeco(e),this.staticMesh=new jt(e.build(),t.mat),this.group.add(this.staticMesh);for(let n of this.obstacles){let s=new jt(Hh(this.biome,n.type),t.mat);s.position.set(He[n.lane],this.heightAt(n.s),-n.s),this.group.add(s),n.mesh=s}if(this.coins.length){let n=new ji(t.coinGeo,t.coinMat,this.coins.length);n.frustumCulled=!1,n.instanceMatrix.setUsage(aa),this.coinMesh=n,this.group.add(n),this.updateCoins(0)}for(let n of this.pickups)n.obj=t.makePickup(n.type),n.y=this.heightAt(n.s)+1.3,n.obj.position.set(He[n.lane],n.y,-n.s),this.group.add(n.obj);t.scene.add(this.group)}buildFloor(t){let e=this.biome.pal,n=this.isRoot?-10:7.2,s=this.len-7.2,r=.45,a=new Set([n,s]);for(let[u]of this.profile)u>n&&u<s&&a.add(u);for(let u of this.holes)a.add(u.s0),a.add(u.s1),a.add(u.s0-r),a.add(u.s1+r);for(let u=Math.ceil(n/la)*la;u<s;u+=la)a.add(Math.round(u*1e3)/1e3);let o=[...a].filter(u=>u>=n&&u<=s).sort((u,d)=>u-d),c=e.side,l=Yn(e.side,.8),h=Yn(e.trim,.78);for(let u=0;u<o.length-1;u++){let d=o[u],p=o[u+1];if(p-d<.01)continue;let g=(d+p)/2,_=this.heightAt(d),f=this.heightAt(p),m=this.holeMaskAt(g),M=this.holeMaskAt(d-.05),x=this.holeMaskAt(p+.05),b=null;for(let P of this.holes)(g>P.s0-r&&g<P.s0||g>P.s1&&g<P.s1+r)&&(b=P.mask);let C=Math.floor(g/la)&1?e.top:e.top2,A=Yn(C,.84);if(!m&&!b){let P=-d,N=-p,v=.05,T=2.2/2,W=(J,I,G)=>t.quad(J,_,P,I,_,P,I,f,N,J,f,N,G);W(-3.6,-T-v,C),W(-T-v,-T+v,A),W(-T+v,T-v,C),W(T-v,T+v,A),W(T+v,3.6,C),t.quad(-3.6,_,P,-3.6,f,N,-3.6,f-we,N,-3.6,_-we,P,c),t.quad(3.6,_,P,3.6,_-we,P,3.6,f-we,N,3.6,f,N,c)}else for(let P=0;P<3;P++){if(m&&m[P])continue;let[N,v]=Wh[P];gc(t,N,v,d,p,_,f,we,b&&b[P]?e.warn:C,c)}for(let P=0;P<3;P++){if(m&&m[P])continue;let[N,v]=Wh[P];M&&M[P]&&qh(t,N,v,d,_,we,l),x&&x[P]&&xc(t,N,v,p,f,we,l)}let w=(P,N,v)=>{m&&m[v]||(gc(t,P,N,d,p,_+.2,f+.2,we+.36,e.trim,h),M&&M[v]&&qh(t,P,N,d,_+.2,we+.36,h),x&&x[v]&&xc(t,P,N,p,f+.2,we+.36,h))};w(-3.6-.12,-3.6+.26,0),w(3.6-.26,3.6+.12,2)}this.isRoot&&xc(t,-3.6,3.6,n,this.h0,we,l)}buildCorner(t){let e=this.biome.pal,n=this.len,s=this.hEnd;gc(t,-3.6,3.6,n-7.2,n,s,s,we,e.corner,e.side);let r=1.5,a=s+(r-we)/2;t.add("box",0,a,-(n+.3),7.2+1.2,r+we,.6,e.wall),t.add("box",0,s+r+.08,-(n+.3),7.2+1.4,.16,.8,e.trim);let o=(c,l)=>{let h=s+.78,u=-(n-.03);t.add("box",c,h+.24,u,.74,.2,.08,e.warn,0,0,-l*Math.PI/4),t.add("box",c,h-.24,u,.74,.2,.08,e.warn,0,0,l*Math.PI/4)};if(this.turn==="T"){for(let c of[-2.7,-1.6])o(c,-1);for(let c of[1.6,2.7])o(c,1);t.add("oct",0,s+.78,-(n-.03),.5,.5,.1,e.warn)}else{let c=this.turn==="R"?1:-1;for(let h of[-2.55,-.85,.85,2.55])o(h,c);let l=-c*(3.6+.3);t.add("box",l,a,-(n-7.2/2+.3),.6,r+we,7.2+.6,e.wall),t.add("box",l,s+r+.08,-(n-7.2/2+.3),.8,.16,7.2+.8,e.trim)}}buildPillars(t){let e=this.biome.pal,n=(s,r,a)=>{let o=this.heightAt(s)-we;t.add("box",0,(gt+o)/2,-s,r,o-gt,a,e.pillar),t.add("box",0,o-.3,-s,r+2.2,.6,a+.7,Yn(e.pillar,1.12))};for(let s=this.isRoot?2:7.2+9;s<this.len-7.2-6;s+=18)this.holeMaskAt(s-1.6)||this.holeMaskAt(s+1.6)||this.holeMaskAt(s)||n(s,2.8,1.6);n(this.len-3.6,3.4,3.4)}buildDeco(t){let e=this.biome,n=fc(this.seed);for(let s=this.isRoot?-8:7.2+3;s<this.len-7.2-3;s+=e.decoStep)for(let r of[-1,1]){if(n()>e.decoProb)continue;let a=r*(3.6+3.2+n()*11);e.deco(t,n,a,-(s+(n()-.5)*2),r)}}updateCoins(t){let e=this.coinMesh;if(!e)return;let n=e.instanceMatrix.array,s=this.coins;for(let r=0;r<s.length;r++){let a=s[r],o=r*16;if(a.got){a.hid||(n.fill(0,o,o+16),n[o+15]=1,a.hid=!0);continue}let c=t*3.2+a.s*.35,l=Math.cos(c),h=Math.sin(c);n[o]=l,n[o+1]=0,n[o+2]=-h,n[o+3]=0,n[o+4]=0,n[o+5]=1,n[o+6]=0,n[o+7]=0,n[o+8]=h,n[o+9]=0,n[o+10]=l,n[o+11]=0,n[o+12]=a.x,n[o+13]=a.y+(a.pull?0:Math.sin(t*2.4+a.s)*.08),n[o+14]=-a.s,n[o+15]=1}e.instanceMatrix.needsUpdate=!0}makeChildren(){if(this.children)return this.children;let t=this.track,e={},n=s=>{let r=s==="R"?(this.dir+1)%4:(this.dir+3)%4,a=this.len-3.6,o=s==="R"?-3.6:3.6,c=Vh[this.dir],l=Gh[this.dir];return new i(t,{ox:this.ox+c[0]*a+l[0]*o,oz:this.oz+c[1]*a+l[1]*o,dir:r,h0:this.hEnd,depth:this.depth+1,startDist:this.startDist+this.len-7.2,biomeIndex:t.biomeFor(this.depth+1)})};return this.turn!=="R"&&(e.L=n("L")),this.turn!=="L"&&(e.R=n("R")),this.children=e,e}dispose(){this.dead=!0,this.built&&(this.track.scene.remove(this.group),this.staticMesh.geometry.dispose(),this.coinMesh&&this.coinMesh.dispose())}};function ax(){let i=new Cs;for(let e=0;e<10;e++){let n=Math.PI/2+e*Math.PI/5,s=e%2?.2:.46,r=Math.cos(n)*s,a=Math.sin(n)*s;e?i.lineTo(r,a):i.moveTo(r,a)}i.closePath();let t=new Kr(i,{depth:.14,bevelEnabled:!1});return t.translate(0,0,-.07),t}var ha=class{constructor(t){this.scene=t,this.mat=new pi({vertexColors:!0}),this.coinGeo=ax(),this.coinMat=new pi({color:16765503,emissive:9067008}),this.pickupMats={},this.bubbleGeo=new sn(.62,1),this.live=new Set,this.queue=[],this.trash=[],this.rng=Math.random,this.current=null}makePickup(t){if(!this.pickupMats[t]){let a=fn[t],o=document.createElement("canvas");o.width=o.height=128;let c=o.getContext("2d"),l=c.createRadialGradient(64,64,8,64,64,62);l.addColorStop(0,"#ffffff"),l.addColorStop(.55,a.color),l.addColorStop(1,a.color),c.fillStyle=l,c.beginPath(),c.arc(64,64,58,0,Math.PI*2),c.fill(),c.lineWidth=7,c.strokeStyle="#ffffff",c.stroke(),Pc(c,a.icon,64,64,66,"#15203f");let h=new ts(o);h.colorSpace=Fe,this.pickupMats[t]={sprite:new ui({map:h,transparent:!0}),bubble:new ze({color:new Et(a.color),transparent:!0,opacity:.3,depthWrite:!1})}}let e=this.pickupMats[t],n=new Ce,s=new Ki(e.sprite);s.scale.set(1.25,1.25,1);let r=new jt(this.bubbleGeo,e.bubble);return r.scale.setScalar(1.5),n.add(r,s),n}biomeFor(t){return(this.startBiome+Math.floor(t/rx))%mc.length}reset({attract:t=!1,seed:e=Math.random()*1e9|0,startBiome:n=0}={}){for(let s of this.live)s.dispose();this.live.clear(),this.queue.length=0,this.trash.length=0,this.attract=t,this.rng=fc(e),this.startBiome=n,this.nextPowerAt=150,this.root=new _c(this,{ox:0,oz:0,dir:0,h0:0,depth:0,startDist:0,isRoot:!0,biomeIndex:this.biomeFor(0)}),this.current=this.root,this.expand(this.root,2,!0)}expand(t,e,n){if(!t.built&&!t.queued&&(this.live.add(t),n?t.build():(t.queued=!0,this.queue.push(t))),e<=0)return;let s=t.makeChildren();for(let r in s)this.expand(s[r],e-1,n)}advance(t){this.flushTrash(),this.trash.push(this.current),this.current=t,this.expand(t,2,!1)}flushTrash(){for(let t of this.trash)this.disposeTree(t,this.current);this.trash.length=0}disposeTree(t,e){if(t!==e){if(t.children)for(let n in t.children)this.disposeTree(t.children[n],e);t.dispose(),this.live.delete(t)}}update(t,e){if(this.queue.length){let n=this.queue.shift();n.dead||n.build()}this.trash.length&&t>26&&this.flushTrash();for(let n of this.live)if(n.built){n.updateCoins(e);for(let s of n.pickups)s.got||!s.obj||(s.obj.position.y=s.y+Math.sin(e*2.6+s.s)*.14,s.obj.children[0].rotation.y=e*1.5)}}};function ox(){let i=document.createElement("canvas");i.width=i.height=64;let t=i.getContext("2d"),e=t.createRadialGradient(32,32,0,32,32,32);e.addColorStop(0,"rgba(255,255,255,1)"),e.addColorStop(.4,"rgba(255,255,255,0.75)"),e.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=e,t.fillRect(0,0,64,64);let n=new ts(i);return n.colorSpace=Fe,n}var vc=140,Ne=[44,18,44],ua=class{constructor(t){this.scene=t,this.hemi=new na(16777215,6710886,1.6),this.sun=new ia(16777215,2.2),this.sun.position.set(-.5,1,.6),t.add(this.hemi,this.sun),t.fog=new zr(16777215,40,140),this.skyMat=new Je({uniforms:{top:{value:new Et},bottom:{value:new Et}},vertexShader:"varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:["uniform vec3 top; uniform vec3 bottom; varying vec3 vDir;","void main(){","  float h = clamp(vDir.y * 1.25 + 0.04, 0.0, 1.0);","  gl_FragColor = vec4(mix(bottom, top, pow(h, 0.65)), 1.0);","  #include <colorspace_fragment>","}"].join(`
`),side:Pe,depthWrite:!1,depthTest:!1,fog:!1}),this.sky=new jt(new Qr(200,20,12),this.skyMat),this.sky.renderOrder=-10,this.sky.frustumCulled=!1,t.add(this.sky);let e=ox();this.sunSprite=new Ki(new ui({map:e,color:16777215,fog:!1,depthWrite:!1,depthTest:!1,transparent:!0,blending:vr})),this.sunSprite.scale.setScalar(34),this.sunSprite.renderOrder=-9,t.add(this.sunSprite);let n=new Float32Array(260*3);for(let o=0;o<260;o++){let c=Math.random()*Math.PI*2,l=.08+Math.random()*1.4;n[o*3]=Math.cos(c)*Math.cos(l)*190,n[o*3+1]=Math.sin(l)*190,n[o*3+2]=Math.sin(c)*Math.cos(l)*190}let s=new de;s.setAttribute("position",new ue(n,3)),this.starMat=new Qi({color:16777215,size:2.2,sizeAttenuation:!1,transparent:!0,opacity:0,fog:!1,depthWrite:!1,depthTest:!1}),this.stars=new Ts(s,this.starMat),this.stars.renderOrder=-8,this.stars.frustumCulled=!1,t.add(this.stars),this.cloudMat=new ze({color:16777215,transparent:!0,opacity:.9,fog:!1,depthWrite:!1}),this.clouds=new Ce;let r=new sn(1,1);for(let o=0;o<12;o++){let c=o/12*Math.PI*2+Math.random()*.4,l=110+Math.random()*60,h=new Ce;h.position.set(Math.cos(c)*l,34+Math.random()*36,Math.sin(c)*l);for(let u=0;u<3;u++){let d=new jt(r,this.cloudMat),p=7+Math.random()*7;d.scale.set(p*1.7,p*.55,p),d.position.set((u-1)*p*1.1,(Math.random()-.5)*2,(Math.random()-.5)*4),h.add(d)}h.lookAt(0,h.position.y,0),this.clouds.add(h)}this.clouds.renderOrder=-7,t.add(this.clouds),this.baseMat=new pi({color:5216840,emissive:0}),this.base=new jt(new Ji(900,900),this.baseMat),this.base.rotation.x=-Math.PI/2,this.base.position.y=gt,t.add(this.base),this.pp=new Float32Array(vc*3),this.pv=new Float32Array(vc*3);for(let o=0;o<vc;o++)this.pp[o*3]=(Math.random()-.5)*Ne[0],this.pp[o*3+1]=Math.random()*Ne[1],this.pp[o*3+2]=(Math.random()-.5)*Ne[2],this.pv[o*3]=Math.random()-.5,this.pv[o*3+1]=Math.random()-.5,this.pv[o*3+2]=Math.random()-.5;let a=new de;a.setAttribute("position",new ue(this.pp,3)),this.pMat=new Qi({map:e,color:16777215,size:.2,transparent:!0,opacity:.8,depthWrite:!1,fog:!1}),this.points=new Ts(a,this.pMat),this.points.frustumCulled=!1,t.add(this.points),this.pVel={vx:0,vy:0},this.cur={top:new Et,bottom:new Et,base:new Et,glow:new Et,sun:new Et,hemiSky:new Et,hemiGround:new Et,part:new Et,sunI:2,hemiI:1.6,fogNear:40,fogFar:140,stars:0,clouds:1,pSize:.2,pOp:.8,vx:0,vy:0,pCount:60},this.tgt=null,this._c=new Et}setBiome(t,e=!1){this.tgt=t,e&&this.blend(1)}blend(t){let e=this.tgt,n=this.cur,s=this._c;e&&(n.top.lerp(s.setHex(e.sky[0]),t),n.bottom.lerp(s.setHex(e.sky[1]),t),n.base.lerp(s.setHex(e.base),t),n.glow.lerp(s.setHex(e.baseGlow),t),n.sun.lerp(s.setHex(e.sun),t),n.hemiSky.lerp(s.setHex(e.hemiSky),t),n.hemiGround.lerp(s.setHex(e.hemiGround),t),n.part.lerp(s.setHex(e.particles.color),t),n.sunI+=(e.sunI-n.sunI)*t,n.hemiI+=(e.hemiI-n.hemiI)*t,n.fogNear+=(e.fog[0]-n.fogNear)*t,n.fogFar+=(e.fog[1]-n.fogFar)*t,n.stars+=(e.stars-n.stars)*t,n.clouds+=(e.clouds-n.clouds)*t,n.pSize+=(e.particles.size-n.pSize)*t,n.pOp+=(e.particles.opacity-n.pOp)*t,n.vx+=(e.particles.vx-n.vx)*t,n.vy+=(e.particles.vy-n.vy)*t,n.pCount+=(e.particles.count-n.pCount)*t,this.skyMat.uniforms.top.value.copy(n.top),this.skyMat.uniforms.bottom.value.copy(n.bottom),this.scene.fog.color.copy(n.bottom),this.scene.fog.near=n.fogNear,this.scene.fog.far=n.fogFar,this.baseMat.color.copy(n.base),this.baseMat.emissive.copy(n.glow),this.sun.color.copy(n.sun),this.sun.intensity=n.sunI,this.hemi.color.copy(n.hemiSky),this.hemi.groundColor.copy(n.hemiGround),this.hemi.intensity=n.hemiI,this.sunSprite.material.color.copy(n.sun),this.starMat.opacity=n.stars,this.stars.visible=n.stars>.02,this.cloudMat.opacity=n.clouds*.9,this.cloudMat.color.copy(n.bottom).lerp(s.setHex(16777215),.6),this.clouds.visible=n.clouds>.02,this.pMat.color.copy(n.part),this.pMat.size=n.pSize,this.pMat.opacity=n.pOp,this.points.geometry.setDrawRange(0,Math.round(n.pCount)))}update(t,e,n,s){this.blend(1-Math.exp(-t*2.2)),this.sky.position.copy(n.position),this.stars.position.copy(n.position),this.clouds.position.set(n.position.x,0,n.position.z),this.clouds.rotation.y=s*.004,this.sunSprite.position.set(n.position.x+62,n.position.y+74,n.position.z-150),this.base.position.set(Math.round(e.x/10)*10,gt,Math.round(e.z/10)*10);let r=this.pp,a=this.pv,o=this.cur,c=Math.round(o.pCount),l=e.y+5;for(let h=0;h<c;h++){let u=h*3;r[u]+=(o.vx+a[u]*.8)*t,r[u+1]+=(o.vy+a[u+1]*.5)*t,r[u+2]+=a[u+2]*.8*t;let d=r[u]-e.x;d>Ne[0]/2?r[u]-=Ne[0]:d<-Ne[0]/2&&(r[u]+=Ne[0]),d=r[u+1]-l,d>Ne[1]/2?r[u+1]-=Ne[1]:d<-Ne[1]/2&&(r[u+1]+=Ne[1]),d=r[u+2]-e.z,d>Ne[2]/2?r[u+2]-=Ne[2]:d<-Ne[2]/2&&(r[u+2]+=Ne[2])}this.points.geometry.attributes.position.needsUpdate=!0}};var rs=new Zt,cx=new Ze,Yh=new ke,lx=new L,hx=new L,yc=new Et,da=class{constructor(t,e=110){this.n=e,this.mesh=new ji(new Rn(1,1,1),new ze({color:16777215}),e),this.mesh.frustumCulled=!1,this.mesh.instanceMatrix.setUsage(aa),this.items=[],rs.makeScale(0,0,0);for(let n=0;n<e;n++)this.items.push({life:0,max:1,x:0,y:0,z:0,vx:0,vy:0,vz:0,size:.1,g:0,r:0,rs:0}),this.mesh.setMatrixAt(n,rs),this.mesh.setColorAt(n,yc.setHex(16777215));this.next=0,t.add(this.mesh)}spawn(t,e,n,{speed:s=6,life:r=.6,size:a=.16,gravity:o=-18,up:c=3,spread:l=.3}={}){yc.setHex(e);for(let h=0;h<n;h++){let u=this.items[this.next],d=Math.random()*Math.PI*2,p=s*(.4+Math.random()*.6);u.x=t.x+(Math.random()-.5)*l,u.y=t.y+(Math.random()-.5)*l,u.z=t.z+(Math.random()-.5)*l,u.vx=Math.cos(d)*p,u.vz=Math.sin(d)*p,u.vy=c*(.3+Math.random()),u.life=u.max=r*(.6+Math.random()*.6),u.size=a*(.6+Math.random()*.8),u.g=o,u.r=Math.random()*6,u.rs=(Math.random()-.5)*14,this.mesh.setColorAt(this.next,yc),this.next=(this.next+1)%this.n}this.mesh.instanceColor.needsUpdate=!0}update(t){let e=!1;for(let n=0;n<this.n;n++){let s=this.items[n];if(s.life<=0)continue;if(e=!0,s.life-=t,s.life<=0){rs.makeScale(0,0,0),this.mesh.setMatrixAt(n,rs);continue}s.vy+=s.g*t,s.x+=s.vx*t,s.y+=s.vy*t,s.z+=s.vz*t,s.r+=s.rs*t;let r=s.size*Math.min(1,s.life/s.max*2);Yh.set(s.r,s.r*.7,0),rs.compose(lx.set(s.x,s.y,s.z),cx.setFromEuler(Yh),hx.set(r,r,r)),this.mesh.setMatrixAt(n,rs)}e&&(this.mesh.instanceMatrix.needsUpdate=!0)}};var Cn=Math.PI,$h={lumi:{skin:16765608,top:3120127,belt:1920924,sleeve:3120127,hand:16765608,pants:2832999,shoe:16777215},koko:{skin:15764012,top:15764012,belt:3122027,sleeve:15764012,hand:5911328,pants:14711328,shoe:5911328},bolt:{skin:13226976,top:5227465,belt:2899541,sleeve:9412789,hand:2899541,pants:9412789,shoe:2899541},kage:{skin:15910814,top:2107466,belt:15087942,sleeve:2107466,hand:1383219,pants:1712448,shoe:988200},nova:{skin:16054010,top:16054010,belt:16747069,sleeve:16054010,hand:16747069,pants:15133426,shoe:16747069},draco:{skin:5226346,top:5226346,belt:4038744,sleeve:5226346,hand:4038744,pants:4567136,shoe:16769955}};function un(i,t){let e=new qn(500);return t(e),new jt(e.build(),i)}function ux(i,t,e){switch(i.add("box",0,.31,0,.52,.62,.32,e.top),i.add("box",0,.04,0,.54,.1,.34,e.belt),t){case"lumi":i.add("box",0,.36,.24,.4,.46,.18,16756782),i.add("box",0,.5,.34,.3,.1,.04,16773314),i.add("box",0,.61,0,.56,.1,.36,16765503),i.add("oct",0,.36,-.17,.2,.2,.05,16765503);break;case"koko":i.add("box",0,.28,-.165,.32,.44,.02,16774112),i.add("box",0,.61,0,.56,.1,.36,3122027);break;case"bolt":i.add("box",0,.36,-.165,.32,.26,.03,1911626),i.add("oct",0,.36,-.19,.13,.13,.04,58879),i.add("cyl",-.29,.56,0,.12,.08,.12,2899541,0,0,Cn/2),i.add("cyl",.29,.56,0,.12,.08,.12,2899541,0,0,Cn/2);break;case"kage":i.add("box",.02,.38,.2,.06,.92,.06,12174036,0,0,.62),i.add("box",-.22,.68,.2,.08,.2,.08,15087942,0,0,.62),i.add("box",0,.3,-.165,.2,.5,.02,2831712);break;case"nova":i.add("box",0,.36,.25,.44,.52,.2,14673390),i.add("box",0,.36,.36,.3,.12,.03,16747069),i.add("box",0,.38,-.165,.26,.18,.03,2899541),i.add("box",-.06,.38,-.185,.06,.06,.02,4054167),i.add("box",.06,.38,-.185,.06,.06,.02,16731998),i.add("box",0,.61,0,.5,.08,.36,16747069);break;case"draco":for(let n=0;n<3;n++)i.add("box",0,.14+n*.16,-.165,.34-n*.02,.13,.03,16769955);for(let n=0;n<3;n++)i.add("cone4",0,.2+n*.18,.2,.12,.16,.12,16747069,Cn/2.6);break;default:break}}function dx(i,t,e){let n=(s,r,a,o=2106682,c=.07,l=.09)=>i.add("box",s,r,a,c,l,.02,o);switch(t){case"lumi":i.add("box",0,.22,0,.44,.42,.42,e.skin),i.add("box",0,.3,.2,.48,.34,.1,5912613),i.add("box",0,.12,.3,.16,.3,.12,5912613,.4),i.add("box",0,.47,0,.5,.16,.48,16735581),i.add("box",0,.41,-.3,.44,.05,.2,14698568),i.add("oct",0,.48,-.245,.12,.12,.03,16765503),n(-.1,.23,-.215),n(.1,.23,-.215),i.add("box",0,.1,-.215,.12,.03,.02,13204058);break;case"koko":i.add("box",0,.22,0,.48,.42,.44,e.skin),i.add("box",0,.13,-.27,.22,.16,.14,16774112),i.add("box",0,.18,-.345,.08,.06,.03,2759186),i.add("box",-.18,.1,-.2,.12,.16,.06,16774112),i.add("box",.18,.1,-.2,.12,.16,.06,16774112),i.add("cone4",-.15,.56,.02,.2,.3,.12,e.skin),i.add("cone4",.15,.56,.02,.2,.3,.12,e.skin),i.add("cone4",-.15,.6,-.01,.1,.16,.08,5911328),i.add("cone4",.15,.6,-.01,.1,.16,.08,5911328),n(-.11,.27,-.225),n(.11,.27,-.225);break;case"bolt":i.add("box",0,.22,0,.48,.4,.42,e.skin),i.add("box",0,.24,-.215,.4,.16,.02,1318970),n(-.1,.24,-.228,58879,.09,.07),n(.1,.24,-.228,58879,.09,.07),i.add("box",0,.09,-.215,.2,.03,.02,8950952),i.add("box",0,.54,0,.04,.24,.04,8950952),i.add("oct",0,.7,0,.13,.13,.13,16731998),i.add("cyl",-.26,.22,0,.16,.06,.16,5227465,0,0,Cn/2),i.add("cyl",.26,.22,0,.16,.06,.16,5227465,0,0,Cn/2);break;case"kage":i.add("box",0,.22,0,.46,.42,.44,2107466),i.add("box",0,.25,-.225,.36,.13,.02,e.skin),n(-.09,.25,-.238,2106682,.07,.07),n(.09,.25,-.238,2106682,.07,.07),i.add("box",0,.37,0,.49,.07,.47,15087942);break;case"nova":i.add("box",0,.26,0,.56,.52,.54,e.skin),i.add("box",0,.27,-.275,.42,.3,.02,1780309),i.add("box",.1,.34,-.288,.12,.08,.02,16763210),i.add("cyl",-.3,.2,0,.14,.06,.14,16747069,0,0,Cn/2),i.add("cyl",.3,.2,0,.14,.06,.14,16747069,0,0,Cn/2),i.add("box",.2,.62,.1,.03,.2,.03,8950952);break;case"draco":i.add("box",0,.22,0,.46,.4,.46,e.skin),i.add("box",0,.13,-.3,.3,.2,.22,6541180),i.add("box",-.07,.2,-.415,.04,.04,.02,2054704),i.add("box",.07,.2,-.415,.04,.04,.02,2054704),i.add("cone4",-.14,.52,.1,.1,.26,.1,16769955,.5),i.add("cone4",.14,.52,.1,.1,.26,.1,16769955,.5),n(-.12,.28,-.235,16765503,.1,.1),n(.12,.28,-.235,16765503,.1,.1),n(-.12,.28,-.245,2042400,.04,.08),n(.12,.28,-.245,2042400,.04,.08);for(let s=0;s<2;s++)i.add("cone4",0,.44-s*.16,.22,.1,.14,.1,16747069,Cn/2.4);break;default:break}}function Zh(i,t){i.add("box",0,-.2,0,.16,.44,.18,t.sleeve),i.add("box",0,-.5,0,.15,.16,.17,t.hand)}function Jh(i,t){i.add("box",0,-.26,0,.21,.52,.23,t.pants),i.add("box",0,-.66,-.05,.23,.18,.36,t.shoe)}function Kh(i,t){let e=$h[i]||$h.lumi,n=new Ce,s=new Ce;n.add(s);let r=new Ce;r.position.y=.78,s.add(r),r.add(un(t,g=>ux(g,i,e)));let a=un(t,g=>dx(g,i,e));a.position.y=.64,r.add(a);let o=un(t,g=>Zh(g,e));o.position.set(-.35,.56,0),r.add(o);let c=un(t,g=>Zh(g,e));c.position.set(.35,.56,0),r.add(c);let l=un(t,g=>Jh(g,e));l.position.set(-.15,.02,0),r.add(l);let h=un(t,g=>Jh(g,e));h.position.set(.15,.02,0),r.add(h);let u=null,d=null,p=null;if(i==="koko")u=un(t,g=>{g.add("ico",0,.1,.3,.26,.26,.6,15764012,-.5),g.add("ico",0,.24,.52,.2,.2,.3,16774112,-.5)}),u.position.set(0,.1,.14),r.add(u);else if(i==="draco"){u=un(t,_=>{_.add("cone",0,0,.4,.28,.8,.28,5226346,Cn/2),_.add("cone4",0,.14,.3,.1,.14,.1,16747069),_.add("cone4",0,.1,.52,.08,.12,.08,16747069)}),u.position.set(0,.1,.14),r.add(u);let g=_=>un(t,f=>{f.add("box",_*.3,.12,.05,.6,.42,.03,16752451),f.add("box",_*.52,.34,.05,.2,.1,.035,16747069),f.add("box",_*.14,.34,.05,.3,.06,.05,4038744)});d=g(-1),d.position.set(-.1,.42,.18),r.add(d),p=g(1),p.position.set(.1,.42,.18),r.add(p)}else i==="kage"&&(u=un(t,g=>{g.add("box",-.05,0,.22,.06,.04,.44,15087942,0,.12),g.add("box",.06,-.03,.18,.06,.04,.36,13184828,0,-.14)}),u.position.set(0,.37,.22),a.add(u));return{id:i,root:n,pivot:s,body:r,head:a,armL:o,armR:c,legL:l,legR:h,tail:u,wingL:d,wingR:p,phase:0,j:{legL:0,legR:0,armL:0,armR:0,bodyX:0,pivotX:0,pivotY:0,spread:0}}}function jh(i){i.root.traverse(t=>{t.geometry&&t.geometry.dispose()})}function Qh(i,t,e){let n=i.j,s=0,r=0,a=0,o=0,c=0,l=0,h=0,u=.06,d=18;switch(e.mode){case"run":{i.phase+=t*(7.5+e.speed*.42);let _=Math.sin(i.phase);s=_*1.05,r=-_*1.05,a=-_*.95,o=_*.95,c=-.2,h=Math.abs(Math.cos(i.phase))*.07,d=40;break}case"jump":i.phase+=t*6,s=1,r=-.5,a=2.6,o=2.2,c=-.12,u=.25;break;case"slide":l=1.22,s=.2,r=.75,a=-.5,o=-.3,c=.1,d=24;break;case"crash":l=1.5,s=.5,r=-.2,a=-2.4,o=-2,u=.5,d=9;break;case"fall":i.phase+=t*16,s=Math.sin(i.phase)*.8,r=-Math.sin(i.phase)*.8,a=2.8+Math.sin(i.phase*1.3)*.4,o=2.8-Math.sin(i.phase*1.3)*.4,u=.5;break;default:i.phase+=t*2,a=Math.sin(i.phase)*.06,o=-Math.sin(i.phase)*.06,h=Math.sin(i.phase)*.012;break}let p=1-Math.exp(-t*d);n.legL+=(s-n.legL)*p,n.legR+=(r-n.legR)*p,n.armL+=(a-n.armL)*p,n.armR+=(o-n.armR)*p,n.bodyX+=(c-n.bodyX)*p,n.pivotX+=(l-n.pivotX)*p,n.pivotY+=(h-n.pivotY)*p,n.spread+=(u-n.spread)*p,i.legL.rotation.x=n.legL,i.legR.rotation.x=n.legR,i.armL.rotation.x=n.armL,i.armR.rotation.x=n.armR,i.armL.rotation.z=-n.spread,i.armR.rotation.z=n.spread,i.body.rotation.x=n.bodyX,i.pivot.rotation.x=n.pivotX,i.pivot.position.y=n.pivotY,i.head.rotation.x=-n.bodyX*.6;let g=Math.sin(i.phase*(e.mode==="run"?1:.7));if(i.tail&&(i.id==="kage"?(i.tail.rotation.x=-.15+g*.2,i.tail.rotation.y=g*.25):i.tail.rotation.y=g*.45),i.wingL){let _=Math.sin(i.phase*1.5)*(e.mode==="jump"||e.mode==="fall"?.9:.35);i.wingL.rotation.y=-.5-_,i.wingR.rotation.y=.5+_}}var tu={play:{back:6.2,up:4,side:0,ahead:12,lookY:1.6},home:{back:5,up:2.3,side:2.3,ahead:2.5,lookY:1.9},show:{back:-4.6,up:1.6,side:1.7,ahead:0,lookY:-.9}},fx=["back","up","side","ahead","lookY"],px=["magnet","shield","boost","double"],mx=600,ge=new L,eu=new L,fa=class{constructor({canvas:t,save:e,sound:n,ui:s}){this.save=e,this.sound=n,this.ui=s,this.renderer=new Es({canvas:t,antialias:!0,powerPreference:"high-performance"}),this.pixelRatio=Math.min(window.devicePixelRatio||1,2),this.renderer.setPixelRatio(this.pixelRatio),this.scene=new Hr,this.camera=new Ue(70,1,.5,460),this.baseFov=70,this.env=new ua(this.scene),this.track=new ha(this.scene),this.bursts=new da(this.scene),this.shadow=new jt(new Zr(.55,16),new ze({color:0,transparent:!0,opacity:.28,depthWrite:!1})),this.shadow.rotation.x=-Math.PI/2,this.scene.add(this.shadow),this.shield=new jt(new sn(1.2,2),new ze({color:7328767,transparent:!0,opacity:.3,depthWrite:!1})),this.shield.visible=!1,this.scene.add(this.shield),this.ring=new jt(new ta(.95,.05,6,28),new ze({color:16732027,transparent:!0,opacity:.8})),this.ring.rotation.x=Math.PI/2,this.ring.visible=!1,this.scene.add(this.ring),this.player={seg:null,s:0,x:0,lane:0,y:0,vy:0,grounded:!0,sliding:0,slideOnLand:!1,jumpBuf:0,coyote:0,yaw:0,visYaw:0,pendingTurn:null,invuln:0,carry:!1,dead:null},this.char=null,this.charId=null,this.pulled=[],this.speed=0,this.time=0,this.state="home",this.camMode="home",this.camCur={...tu.home},this.camYaw=0,this.camGround=0,this.camFocus=new L,this.shake=0,this.fovKick=0,this.run=this.newRun(),this.bot=!1,this.botRng=Math.random,this.lastT=0,this.slow=0,this.fast=0,this.needsRender=!0,this.setCharacter(e.data.char),this.resize(),window.addEventListener("resize",()=>this.resize())}newRun(){return{score:0,dist:0,coins:0,jumps:0,slides:0,powerups:0,turns:0,biomes:1,fx:{magnet:0,shield:0,boost:0,double:0},fxMax:{magnet:1,shield:1,boost:1,double:1},headstart:0,headOffer:0,revives:0,freeUsed:!1,cheated:!1,smashed:0}}get cheat(){return!!this.save.data.settings.cheat}get mult(){let t=this.save.data;return 1+t.up.mult+(t.char==="kage"?1:0)}upgradeDur(t){let e=os.find(s=>s.id===t),n=cs(e,this.save.data.up[t]||0);return t==="boost"&&this.save.data.char==="nova"&&(n*=1.4),n}resize(){let t=window.innerWidth,e=window.innerHeight;this.renderer.setPixelRatio(this.pixelRatio),this.renderer.setSize(t,e,!1);let n=t/e;this.camera.aspect=n,this.baseFov=n<1?Math.min(92,2*Math.atan(Math.tan(50*Math.PI/360)/n)*180/Math.PI):62,this.camera.fov=this.baseFov,this.camera.updateProjectionMatrix(),this.needsRender=!0}setCharacter(t){this.charId!==t&&(this.char&&(this.scene.remove(this.char.root),jh(this.char)),this.char=Kh(t,this.track.mat),this.charId=t,this.scene.add(this.char.root),this.needsRender=!0)}setCamMode(t){this.camMode=t}resetPlayer(){let t=this.player,e=this.track.current;t.seg=e,t.s=3,t.x=0,t.lane=0,t.y=e.heightAt(3),t.vy=0,t.grounded=!0,t.sliding=0,t.slideOnLand=!1,t.jumpBuf=0,t.coyote=0,t.yaw=0,t.visYaw=0,t.pendingTurn=null,t.invuln=0,t.carry=!1,t.dead=null,this.pulled.length=0,this.camYaw=0,this.shake=0,this.env.setBiome(e.biome,!0),this.char.j.pivotX=0,this.char.root.rotation.set(0,0,0)}enterHome(){this.track.reset({attract:!0,startBiome:Math.floor(Math.random()*6)}),this.resetPlayer(),this.setCharacter(this.save.data.char),this.state="home",this.camMode="home",this.speed=11.5,this.updateCamera(0,!0),this.sound.setMusic("menu"),this.ui.showHome()}startRun(){this.sound.unlock(),this.setCharacter(this.save.data.char),this.track.reset({attract:!1,startBiome:0}),this.resetPlayer(),this.run=this.newRun();let t=this.save.data;this.cheat&&(this.run.cheated=!0),t.char==="bolt"&&(this.run.fx.shield=this.run.fxMax.shield=this.upgradeDur("shield")),t.items.headstart>0&&(this.run.headOffer=5),this.state="play",this.camMode="play",this.speed=9,this.updateCamera(0,!0),this.sound.setMusic("run"),this.sound.sfx("go"),this.ui.showHUD(),this.ui.banner("\uCD9C\uBC1C!")}useHeadstart(){let t=this.save.data,e=this.run;this.state!=="play"||e.headOffer<=0||t.items.headstart<=0||(t.items.headstart--,this.save.commit(),e.headOffer=0,e.headstart=mx,this.sound.sfx("boost"),this.ui.banner("\uC2A4\uD0C0\uD2B8 \uB300\uC2DC!"))}pause(){this.state==="play"&&(this.state="paused",this.sound.setMusic("off"),this.ui.showPause())}resume(){this.state==="paused"&&this.ui.countdown(()=>{this.state==="paused"&&(this.state="play",this.lastT=0,this.sound.setMusic("run"))})}restart(){if(this.state==="paused"){let t=this.save.data;t.coins+=this.run.coins,t.totalDist+=Math.floor(this.run.dist),this.save.commit()}this.startRun()}quitRun(){(this.state==="paused"||this.state==="play"||this.state==="revive")&&this.finishRun()}die(t){if(this.state!=="play")return;let e=this.player;e.dead=t,this.state="dying",this.dieT=0,e.sliding=0,this.sound.sfx(t==="fall"?"fall":"crash"),Kn(t==="fall"?120:220,this.save.data.settings.vibrate),t==="crash"&&(this.speed=-5,this.shake=.5,e.seg.toWorld(e.s,e.x,e.y+1,ge),this.bursts.spawn(ge,16777215,14,{speed:7,life:.6,size:.16}))}afterDeath(){let t=this.run,e=this.save.data,n=e.char==="draco"&&!t.freeUsed;t.revives<2&&(n||e.items.revive>0)?(this.state="revive",this.ui.showRevive({free:n,count:e.items.revive},()=>this.revive(n),()=>this.finishRun())):this.finishRun()}revive(t){let e=this.run,n=this.save.data,s=this.player;t?e.freeUsed=!0:(n.items.revive=Math.max(0,n.items.revive-1),this.save.commit()),e.revives++;let r=s.seg;s.pendingTurn=null,s.dead=null,s.s>r.len-7.2-1&&(s.s=r.len-3.6,s.x=0,s.lane=0,this.doTurn(r.turn==="T"?"L":r.turn),r=s.seg),s.s=Math.max(s.s,2);for(let a=0;a<60&&r.holeMaskAt(s.s);a++)s.s+=1;s.s+=1.2,s.x=He[s.lane+1],s.y=r.heightAt(s.s),s.vy=0,s.grounded=!0,s.sliding=0,s.slideOnLand=!1,s.jumpBuf=0,s.invuln=3,this.char.j.pivotX=0,this.speed=Us(e.dist)*.5,this.state="play",this.lastT=0,this.sound.sfx("revive"),this.sound.setMusic("run"),this.ui.showHUD(!0),this.ui.banner("\uB2E4\uC2DC \uB2EC\uB824\uC694!")}finishRun(){let t=this.run,e=this.save.data;this.state="over";let n=Math.floor(t.score),s=Math.floor(t.dist),r=!1;t.cheated||(n>e.best&&(e.best=n,r=e.runs>0),e.bestDist=Math.max(e.bestDist,s)),e.coins+=t.coins,e.totalDist+=s,e.runs++;let a=t.cheated?[]:this.save.applyRun({coins:t.coins,dist:s,score:n,biomes:t.biomes,jumps:t.jumps,slides:t.slides,powerups:t.powerups,turns:t.turns});this.save.commit(),this.sound.setMusic("menu"),this.sound.sfx(r?"record":a.length?"mission":"click"),this.ui.showResult({score:n,dist:s,coins:t.coins,best:e.best,record:r,cheated:t.cheated,missions:a})}input(t){if(t==="pause"){this.state==="play"?this.pause():this.state==="paused"&&this.resume();return}if(this.state!=="play")return;let e=this.player;if(t==="left"||t==="right"){let n=t==="left"?-1:1,s=n<0?"L":"R",r=e.seg;if(e.s>=r.turnZoneStart&&(r.turn==="T"||r.turn===s)){e.pendingTurn=s;return}let a=hn(e.lane+n,-1,1);a!==e.lane&&(e.lane=a,this.sound.sfx("lane"))}else t==="up"?this.jump():t==="down"&&this.slide()}jump(){let t=this.player;t.grounded||t.coyote>0?(t.vy=ss,t.grounded=!1,t.coyote=0,t.sliding=0,t.slideOnLand=!1,t.jumpBuf=0,this.run.jumps++,this.sound.sfx("jump")):t.jumpBuf=.14}slide(){let t=this.player;t.grounded?(t.sliding=dc,this.run.slides++,this.sound.sfx("slide")):(t.vy=Math.min(t.vy,-22),t.slideOnLand=!0)}onLand(){let t=this.player;t.slideOnLand?(t.slideOnLand=!1,t.sliding=dc*.8,this.run.slides++,this.sound.sfx("slide")):this.sound.sfx("land"),t.jumpBuf>0&&this.jump()}doTurn(t){let e=this.player,n=e.seg,s=n.children[t]||n.children.L||n.children.R,r=n.len-3.6,a,o;t==="R"?(a=e.x+3.6,o=r-e.s,e.yaw-=Math.PI/2):(a=3.6-e.x,o=e.s-r,e.yaw+=Math.PI/2);for(let c of this.pulled)this.collectCoin(c);if(this.pulled.length=0,e.seg=s,e.s=a,e.x=hn(o,-3.6+.6,3.6-.6),e.lane=hn(Math.round(e.x/He[2]),-1,1),e.pendingTurn=null,this.track.advance(s),this.state==="play"){this.run.turns++,this.sound.sfx("turn");let c=this.save.data.hints;c.turn<6&&c.turn++}s.biome!==this.env.tgt&&(this.env.setBiome(s.biome),this.state==="play"&&(this.run.biomes++,this.ui.banner(s.biome.name)))}collectCoin(t){if(t.got||(t.got=!0,this.state!=="play"&&this.state!=="dying"))return;let e=this.run;e.coins+=e.fx.double>0?2:1,e.score+=5*this.mult,this.sound.sfx("coin")}givePower(t){let e=this.run,n=this.upgradeDur(t);e.fx[t]=n,e.fxMax[t]=n,e.powerups++,this.sound.sfx(t==="boost"?"boost":"power"),Kn(30,this.save.data.settings.vibrate),this.ui.banner(fn[t].name+"!")}smash(t,e){t.alive=!1,t.mesh&&(t.mesh.visible=!1),e.toWorld(t.s,He[t.lane],e.heightAt(t.s)+1,ge),this.bursts.spawn(ge,e.biome.pal.smash,12,{speed:8,life:.7,size:.3,up:5}),this.sound.sfx("smash"),this.shake=Math.max(this.shake,.18)}step(t){let e=this.player,n=this.run,s=this.state==="play",r=e.seg,a=s&&(n.headstart>0||n.fx.boost>0),o=s&&this.cheat,c=!s||a||o||e.invuln>0,l=11.5;s&&(l=Us(n.dist),n.headstart>0?l=44:n.fx.boost>0&&(l=Math.max(l*1.7,32))),this.speed+=(l-this.speed)*Math.min(1,t*3.5);let h=this.speed*t;e.s+=h,s&&(n.dist+=h,n.score+=h*this.mult,n.headstart>0&&(n.headstart-=h,n.headstart<=0&&(n.headstart=0,e.invuln=Math.max(e.invuln,1.5))));let u=(14+this.speed*.25)*t;if(e.x+=hn(He[e.lane+1]-e.x,-u,u),(!s||a||o)&&!e.pendingTurn&&e.s>=r.len-3.6&&(e.pendingTurn=r.turn==="T"?Math.random()<.5?"L":"R":r.turn),e.pendingTurn){let A=e.pendingTurn==="R"?1:-1,w=Math.max(r.len-3.6-A*e.x,r.len-7.2+.3);e.s>=w&&(this.doTurn(e.pendingTurn),r=e.seg)}else if(e.s>=r.len-.45){e.s=r.len-.45,this.die("crash");return}let p=r.heightAt(e.s),g=r.holeAt(e.s,e.x);c?e.carry=!0:e.carry&&!g&&e.grounded&&(e.carry=!1);let _=g&&!(c||e.carry);if(e.grounded&&(_?(e.grounded=!1,e.vy=0,e.coyote=.08):e.y=p),!e.grounded){if(e.vy=Math.max(-42,e.vy-xi*t),e.y+=e.vy*t,e.coyote-=t,!_&&e.y<=p&&(e.vy<=0||e.y<p-.02))if(e.y>=p-.6)e.y=p,e.vy=0,e.grounded=!0,this.onLand();else{this.die("fall");return}else if(_&&e.y<p-1.3){this.die("fall");return}}e.sliding>0&&(e.sliding-=t),e.jumpBuf>0&&(e.jumpBuf-=t),e.invuln>0&&(e.invuln-=t);let f=r.obstacles;for(;r.obIdx<f.length&&f[r.obIdx].s+1.2<e.s;)r.obIdx++;for(let A=r.obIdx;A<f.length;A++){let w=f[A];if(w.s-w.half-.3>e.s)break;if(w.alive&&Math.abs(e.s-w.s)<w.half+.3&&Math.abs(e.x-He[w.lane])<1){let P=e.y-r.heightAt(w.s);if(!(w.type==="block"||w.type==="low"&&P<.8||w.type==="high"&&P+(e.sliding>0?.75:1.7)>1.25)||!s)continue;if(a||o||e.invuln>0)this.smash(w,r),n.smashed++;else if(n.fx.shield>0)this.smash(w,r),n.fx.shield=0,e.invuln=1.2,this.sound.sfx("shieldbreak"),Kn(60,this.save.data.settings.vibrate);else{this.die("crash");return}}}let m=s&&(n.fx.magnet>0||a),M=m?7*(this.save.data.char==="koko"?1.4:1):0,x=r.coins;for(;r.coinIdx<x.length&&x[r.coinIdx].s<e.s-3;)r.coinIdx++;let b=Math.max(1.2,M+1),C=e.y+.9;for(let A=r.coinIdx;A<x.length;A++){let w=x[A];if(w.s-e.s>b)break;if(w.got||w.pull)continue;let P=w.s-e.s,N=w.x-e.x,v=w.y-C;Math.abs(P)<.95&&Math.abs(N)<1.05&&Math.abs(v)<1.3?this.collectCoin(w):m&&P*P+N*N<M*M&&(w.pull=!0,this.pulled.push(w))}for(let A=this.pulled.length-1;A>=0;A--){let w=this.pulled[A],P=e.x-w.x,N=e.s+.3-w.s,v=C-w.y,T=Math.hypot(P,N,v),W=(this.speed+24)*t;T<W+.5?(this.collectCoin(w),this.pulled.splice(A,1)):(w.x+=P/T*W,w.s+=N/T*W,w.y+=v/T*W)}if(s)for(let A of r.pickups)A.got||!A.obj||Math.abs(A.s-e.s)<1.1&&Math.abs(He[A.lane]-e.x)<1.2&&Math.abs(A.y-C)<1.9&&(A.got=!0,A.obj.visible=!1,this.givePower(A.type))}frame(t){let e=t/1e3,n=this.lastT?e-this.lastT:1/60;this.lastT=e,n>.05&&(n=.05),n<0&&(n=0);let s=this.state;if(s==="paused"||s==="over"||s==="revive"){this.needsRender&&(this.renderer.render(this.scene,this.camera),this.needsRender=!1);return}this.needsRender=!0,this.time+=n,this.adaptQuality(n);let r=this.player,a=this.run;if(s==="play"||s==="home"){this.bot&&s==="play"&&this.botThink();let o=Math.max(1,Math.ceil(n*Math.max(this.speed,10)/.35)),c=n/o;for(let l=0;l<o&&(this.state==="play"||this.state==="home");l++)this.step(c);this.state==="play"&&this.tickRun(n)}else if(s==="dying"){this.dieT+=n;let o=r.seg;if(r.dead==="crash"){this.speed*=Math.exp(-n*5),r.s+=this.speed*n;let c=o.heightAt(r.s);r.y>c&&(r.vy-=xi*n,r.y=Math.max(c,r.y+r.vy*n))}else this.speed*=Math.exp(-n*2.5),r.s+=this.speed*n,r.vy=Math.max(-42,r.vy-xi*n),r.y+=r.vy*n;this.dieT>1.15&&this.afterDeath()}this.track.update(r.s,this.time),this.bursts.update(n),this.updateVisuals(n),this.updateCamera(n,!1),this.env.update(n,this.camFocus,this.camera,this.time),this.renderer.render(this.scene,this.camera),(this.state==="play"||this.state==="dying")&&this.ui.updateHUD(a,this)}tickRun(t){let e=this.run,n=this.player;this.cheat&&(e.cheated=!0);for(let s of px)e.fx[s]>0&&(e.fx[s]-=t,e.fx[s]<=0&&(e.fx[s]=0,s==="boost"&&(n.invuln=Math.max(n.invuln,1.5))));e.headOffer>0&&(e.headOffer-=t),this.updateHints(),(e.fx.boost>0||e.headstart>0)&&Math.random()<.6&&(n.seg.toWorld(n.s+.4,n.x,n.y+.8,ge),this.bursts.spawn(ge,16765503,1,{speed:1.2,life:.45,size:.09,gravity:-2,up:1,spread:.7}))}updateHints(){let t=this.save.data.hints,e=this.player,n=e.seg;if(t.jump>=3&&t.slide>=3&&t.lane>=3&&t.turn>=4||this.cheat||this.run.headstart>0||this.run.fx.boost>0)return;let s=this.speed*.35,r=this.speed*1;if(t.turn<4&&e.s>=n.turnZoneStart&&!e.pendingTurn){this.ui.hint(n.turn==="T"?"both":n.turn==="L"?"left":"right","\uCF54\uB108! \uC606\uC73C\uB85C \uC2A4\uC640\uC774\uD504");return}for(let a of n.holes){let o=a.s0-e.s;if(o>s&&o<r&&!a.hinted&&a.mask[e.lane+1]){a.mask.every(Boolean)?t.jump<3&&(a.hinted=!0,t.jump++,this.ui.hint("up","\uC704\uB85C \uC2A4\uC640\uC774\uD504 \u2014 \uC810\uD504")):t.lane<3&&(a.hinted=!0,t.lane++,this.ui.hint(a.mask[1]?a.mask[0]?"right":"left":e.lane<0?"right":"left","\uAE38\uC774 \uB04A\uACBC\uC5B4\uC694! \uC606\uC73C\uB85C"));return}}for(let a=n.obIdx;a<n.obstacles.length;a++){let o=n.obstacles[a],c=o.s-e.s;if(c>r)break;if(!(c<s||o.hinted||o.lane!==e.lane+1)){if(o.hinted=!0,o.type==="low"&&t.jump<3)t.jump++,this.ui.hint("up","\uC704\uB85C \uC2A4\uC640\uC774\uD504 \u2014 \uC810\uD504");else if(o.type==="high"&&t.slide<3)t.slide++,this.ui.hint("down","\uC544\uB798\uB85C \uC2A4\uC640\uC774\uD504 \u2014 \uC2AC\uB77C\uC774\uB4DC");else if(o.type==="block"&&t.lane<3){t.lane++;let l=n.obstacles.filter(u=>u.s===o.s&&u.type==="block").map(u=>u.lane-1),h=e.lane>=1||e.lane===0&&l.includes(1)?"left":"right";this.ui.hint(h,"\uC606\uC73C\uB85C \uC2A4\uC640\uC774\uD504 \u2014 \uD53C\uD558\uAE30")}return}}}updateVisuals(t){let e=this.player,n=this.char,s=this.run,r=e.seg;r.toWorld(e.s,e.x,e.y,ge),n.root.position.copy(ge),e.visYaw+=(e.yaw-e.visYaw)*(1-Math.exp(-t*16)),n.root.rotation.y=e.visYaw;let a=this.state==="play"||this.state==="home"?hn((He[e.lane+1]-e.x)*-.2,-.35,.35):0;n.root.rotation.z+=(a-n.root.rotation.z)*(1-Math.exp(-t*14));let o="run";e.dead==="crash"?o="crash":e.dead==="fall"?o="fall":e.grounded?e.sliding>0&&(o="slide"):o=e.vy<-3&&e.y<r.heightAt(e.s)-.1?"fall":"jump",Qh(n,t,{mode:o,speed:this.speed}),e.dead==="fall"?n.root.rotation.x+=t*5:n.root.rotation.x=0,n.root.visible=!(e.invuln>0&&this.state==="play"&&Math.floor(this.time*14)%2===0&&!(s.fx.boost>0||s.headstart>0));let c=r.heightAt(e.s),l=r.holeAt(e.s,e.x);if(this.shadow.visible=!l&&e.y>=c-.1,this.shadow.visible){this.shadow.position.set(ge.x,c+.03,ge.z);let u=hn(1-(e.y-c)*.25,.4,1);this.shadow.scale.setScalar(u)}let h=this.state==="play";if(this.shield.visible=h&&s.fx.shield>0,this.shield.visible){this.shield.position.set(ge.x,ge.y+.9,ge.z),this.shield.rotation.y=this.time*1.2;let u=s.fx.shield<2?.16+.14*Math.abs(Math.sin(this.time*10)):.3;this.shield.material.opacity=u}this.ring.visible=h&&s.fx.magnet>0,this.ring.visible&&(this.ring.position.set(ge.x,ge.y+.9+Math.sin(this.time*5)*.25,ge.z),this.ring.rotation.z=this.time*3)}updateCamera(t,e){let n=this.player,s=tu[this.camMode],r=this.camCur,a=n.seg,o=e?1:1-Math.exp(-t*4);for(let f of fx)r[f]+=(s[f]-r[f])*o;this.camYaw+=(n.yaw-this.camYaw)*(e?1:1-Math.exp(-t*8));let c=a.heightAt(n.s);this.camGround+=(c-this.camGround)*(e?1:1-Math.exp(-t*6));let l=this.camGround+Math.max(0,n.y-c)*.35;a.toWorld(n.s,n.x*.6,l,ge),e?this.camFocus.copy(ge):this.camFocus.lerp(ge,1-Math.exp(-t*16));let h=Math.sin(this.camYaw),u=Math.cos(this.camYaw),d=this.camFocus,p=r.side;this.camMode==="home"&&(p+=Math.sin(this.time*.35)*.5),this.camera.position.set(d.x+p*u+r.back*h,d.y+r.up,d.z-p*h+r.back*u),eu.set(d.x-r.ahead*h,d.y+r.lookY,d.z-r.ahead*u),this.shake>.001&&(this.camera.position.x+=(Math.random()-.5)*this.shake,this.camera.position.y+=(Math.random()-.5)*this.shake,this.shake*=Math.exp(-t*7)),this.camera.lookAt(eu);let g=this.state==="play"&&(this.run.fx.boost>0||this.run.headstart>0);this.fovKick+=((g?9:0)-this.fovKick)*(1-Math.exp(-t*4));let _=Math.min(100,this.baseFov+this.fovKick);Math.abs(_-this.camera.fov)>.05&&(this.camera.fov=_,this.camera.updateProjectionMatrix())}adaptQuality(t){t>.024?this.slow+=t:this.slow=Math.max(0,this.slow-t*.5),this.slow>1.5&&this.pixelRatio>1&&(this.pixelRatio=Math.max(1,this.pixelRatio-.25),this.slow=0,this.resize())}botThink(){let t=this.player,e=t.seg,n=this.speed;if(t.s>=e.turnZoneStart+1&&!t.pendingTurn){this.input(e.turn==="T"?this.botRng()<.5?"left":"right":e.turn==="L"?"left":"right");return}let s=t.lane+1,r=n*.75+3,a=[!1,!1,!1],o=[0,0,0];for(let l=e.obIdx;l<e.obstacles.length;l++){let h=e.obstacles[l];if(h.s-t.s>r)break;!h.alive||h.s<t.s-.8||(h.type==="block"?a[h.lane]=!0:o[h.lane]+=1)}for(let l of e.holes)if(!(l.s1<t.s||l.s0-t.s>r)&&!l.mask.every(Boolean))for(let h=0;h<3;h++)l.mask[h]&&(a[h]=!0);if(a[s]){let l=[s-1,s+1,s-2,s+2].filter(d=>d>=0&&d<3&&!a[d]),h=l.filter(d=>Math.abs(d-s)===1),u=(h.length?h:l).sort((d,p)=>o[d]-o[p])[0];u!==void 0&&this.input(u<s?"left":"right")}let c=He[s];for(let l=e.obIdx;l<e.obstacles.length;l++){let h=e.obstacles[l],u=h.s-t.s;if(u>n*.5+2)break;if(!(!h.alive||u<-.5||Math.abs(He[h.lane]-c)>.1)){if(h.type==="low"&&u<n*.26+.8&&t.grounded){this.input("up");break}if(h.type==="high"&&u<n*.22+.8){t.grounded?t.sliding<.35&&this.input("down"):this.input("down");break}}}for(let l of e.holes){let h=l.s0-t.s;l.mask[s]&&l.mask.every(Boolean)&&h>-.2&&h<n*.1+.7&&t.grounded&&this.input("up")}}};function nu(i,t){let e=0,n=0,s=null,r=()=>Math.max(18,Math.min(window.innerWidth,window.innerHeight)*.045);i.addEventListener("pointerdown",o=>{s===null&&(s=o.pointerId,e=o.clientX,n=o.clientY)}),i.addEventListener("pointermove",o=>{if(o.pointerId!==s)return;let c=o.clientX-e,l=o.clientY-n,h=r();Math.abs(c)<h&&Math.abs(l)<h||(Math.abs(c)>Math.abs(l)?t(c>0?"right":"left"):t(l>0?"down":"up"),e=o.clientX,n=o.clientY)});let a=o=>{o.pointerId===s&&(s=null)};i.addEventListener("pointerup",a),i.addEventListener("pointercancel",a),window.addEventListener("keydown",o=>{if(!o.repeat){switch(o.code){case"ArrowLeft":case"KeyA":t("left");break;case"ArrowRight":case"KeyD":t("right");break;case"ArrowUp":case"KeyW":case"Space":t("up");break;case"ArrowDown":case"KeyS":t("down");break;case"Escape":case"KeyP":t("pause");break;default:return}o.preventDefault()}})}function gx(){let i=document.getElementById("gl"),t=new ks,e=new zs;e.sfxOn=t.data.settings.sfx,e.musicOn=t.data.settings.music;let n=new Hs(document.getElementById("ui"),t,e),s=new fa({canvas:i,save:t,sound:e,ui:n});n.attach(s),nu(i,c=>{e.unlock(),s.input(c)}),window.addEventListener("pointerdown",()=>{e.unlock(),e.refresh()},{passive:!0}),new URLSearchParams(location.search).has("bot")&&(s.bot=!0),s.enterHome();let a=c=>{requestAnimationFrame(a);try{s.frame(c)}catch(l){console.error(l),su(l)}};requestAnimationFrame(a),document.addEventListener("visibilitychange",()=>{document.hidden?(s.pause(),e.suspend()):(e.resume(),s.lastT=0)}),window.__onBack=()=>n.back(),window.__setInsets=(c,l,h,u)=>{let d=document.documentElement.style;d.setProperty("--inset-top",c+"px"),d.setProperty("--inset-right",l+"px"),d.setProperty("--inset-bottom",h+"px"),d.setProperty("--inset-left",u+"px")},window.__game=s;let o=document.getElementById("boot");o&&o.remove()}var iu=!1;function su(i){if(iu)return;iu=!0;let t=document.createElement("div");t.className="fatal",t.textContent="\uBB38\uC81C\uAC00 \uC0DD\uACBC\uC5B4\uC694: "+(i&&i.message?i.message:i),document.body.appendChild(t)}try{gx()}catch(i){console.error(i),su(i)}})();

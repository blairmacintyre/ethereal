var e=Object.defineProperty,t=Object.getOwnPropertySymbols,s=Object.prototype.hasOwnProperty,i=Object.prototype.propertyIsEnumerable,n=(t,s,i)=>s in t?e(t,s,{enumerable:!0,configurable:!0,writable:!0,value:i}):t[s]=i,r=(e,r)=>{for(var a in r||(r={}))s.call(r,a)&&n(e,a,r[a]);if(t)for(var a of t(r))i.call(r,a)&&n(e,a,r[a]);return e};import{e as a,P as o,W as c,C as d,V as h,k as l,am as p,O as m,v as u,an as y,ao as g,M as b,ap as v,aq as w,ar as x,as as f,at as S,au as R,T as E,av as P,u as T,q as A,aw as L,ax as k,ay as M,az as j,aA as z,d as O,c as B,a as q,aB as C,t as X,aC as _,aD as I,o as W,aE as H,aF as U,n as F,aG as D,aH as N,aI as J,aJ as V}from"./vendor.js";import{W as Y,b as G,Q,d as $,c as K,e as Z}from"./ethereal.js";const ee=R(r({},E));class te{constructor(e){this.app=e,this.textureLoader=new P,this.stlLoader=new ee,this.snubber=new m,this.poster=new b(new T(1.04,2),new u),this.snubberAnchor=new m,this.snubberAnchorPosition=(new A).set(-.33,.92,.18),this.lineMaterial=new x({color:16753920,depthTest:!1}),this._scratchMatrix=new L,this.annotations=[{text:"TEST",anchorPoint:[0,0,0]},{text:"Part A",anchorPoint:[-.18,.06,.09]},{text:"Part B",anchorPoint:[.05,.05,.12]},{text:"Part C",anchorPoint:[-.1,.05,.11]},{text:"Part D",anchorPoint:[.14,-.22,-.06]},{text:"Part E",anchorPoint:[.11,0,.1]},{text:"Part F",anchorPoint:[-.06,-.04,.02]}],this.annotationState=new Map,this.loadPoser(),this.loadSnubberMesh()}loadPoser(){this.poster.name="poster",this.textureLoader.load("./public/Treadmill.jpeg",(e=>{this.poster.material.map=e,this.poster.material.needsUpdate=!0})),this.poster.add(this.snubberAnchor),this.snubberAnchor.position.copy(this.snubberAnchorPosition)}loadSnubberMesh(){this.snubber.name="snubber";const e=new m;e.quaternion.setFromAxisAngle(new A(0,0,1),Math.PI),e.scale.setScalar(.01),this.stlLoader.load("./public/fullSnubberSimplified.stl",(t=>{t.computeBoundsTree();const s=new k,i=new b(t,s);this.snubberMesh=i,this.snubberMesh.scale.setScalar(.1),e.add(i),this.snubber.add(e)}))}async enterXR(e){}update(e){}}const se="https://prideview-ar.traclabs.com:8025/AR_server/",ie={json:"",procedure:"Treadmill Monthly Maintenance",step:"",instruction:"test",image:"",video:"./public/armWiggleDemonstrated.mov",elementType:"",elementSubType:"",objects:{}};async function ne(){const e=await fetch(se+"ARready",{mode:"cors"}).catch(),t=await e.json().catch(),s=t&&t.procedureElementInfo&&t.procedureElementInfo.steplist;if(!s)return await ne();if("continue procedure"===t.text)return await re(),await ne();ie.json=t,ie.step=s[s.length-1].title,ie.instruction=t.text,ie.elementType=t.procedureElementInfo.elementType,ie.elementSubType=t.procedureElementInfo.elementData[ie.elementType.toLowerCase()+"Type"];const i=Object.keys(t).filter((e=>e.toLowerCase().includes("object")));for(const n of i){const e=t[n],s=ie.objects[e.name]={},i=e.properties;for(const t in i)if("realityaugmentation"===t){const e=i[t].split(";");for(const t of e){if(!t)continue;let[e,i]=t.split(":");if(e=e.trim(),i=i.trim(),"position"===e||"rotation"===e||"size"===e){const[t,n,r]=i.split(" ").map((e=>parseFloat(e)));s[e]={x:t,y:n,z:r}}else s[e]=isNaN(i)?i:parseFloat(i)}}else s[t]=i[t]}return t}async function re(e="none"){const t=await fetch(se+"ARready",{mode:"cors",method:"POST",body:JSON.stringify({action:"done",value:e})});return ne(),t.json()}var ae={data:ie,get:ne,getText:async function(){return(await fetch(se+"ARready",{mode:"cors"})).text()},done:re,startProcedure:async function(e){return(await fetch(se+"ARready",{mode:"cors",method:"POST",body:JSON.stringify({action:e})})).json()},back:async function(){return(await fetch(se+"ARready",{mode:"cors",method:"POST",body:JSON.stringify({action:"back",value:"none"})})).json()},skip:async function(){return(await fetch(se+"ARready",{mode:"cors",method:"POST",body:JSON.stringify({action:"skip",value:"none"})})).json()},comment:async function(e){return(await fetch(se+"ARready",{mode:"cors",method:"POST",body:JSON.stringify({action:"comment",value:e})})).json()}};class oe{constructor(){this.logo="./public/pride-view.png",this.pride=r({},ae.data),this.immersiveMode=!1}async get(){await ae.get(),this.pride=r({},ae.data)}async back(){await ae.back(),this.get()}async done(e){await ae.done(e),this.get()}start(){return this.get(),this}}const ce=Symbol("state");const de=O({setup:()=>M(z(ce))}),he=q("link",{href:"https://fonts.googleapis.com/css?family=Inconsolata:400,700",rel:"stylesheet"},null,-1),le=q("link",{rel:"stylesheet",href:"./modules/Pride.css"},null,-1),pe={"xr-layer":"",id:"procedure"},me={id:"flex"},ue={"xr-layer":"",id:"content"},ye={id:"step","xr-layer":""},ge=C("Step: "),be={id:"type"},ve={id:"instruction","xr-layer":""},we={"xr-layer":"","xr-pixel-ratio":"0.1",id:"media"},xe=q("div",{"xr-layer":"",id:"model"},null,-1),fe={id:"controls"},Se=q("div",{"xr-layer":"",class:"button",id:"back"},"Back",-1),Re={"xr-layer":"",class:"button",id:"done"},Ee={"xr-layer":"",class:"button",id:"yes"},Pe={"xr-layer":"",class:"button",id:"no"},Te={"xr-layer":"",class:"button",id:"record"},Ae={"xr-layer":"",class:"button",id:"immersive-toggle"};de.render=function(e,t,s,i,n,r){return W(),B("div",{id:"pride","xr-pixel-ratio":"0.01",class:e.immersiveMode},[he,le,q("div",pe,[q("img",{"xr-layer":"",class:"logo",src:e.logo},null,8,["src"]),C("Procedure: "+X(e.pride.procedure),1)]),q("div",me,[q("div",ue,[q("div",ye,[ge,q("span",be,X(e.pride.elementSubType),1),C(" "+X(e.pride.step),1)]),q("div",ve,X(e.pride.instruction),1)]),q("div",we,[_(q("video",{"xr-layer":"",id:"video",loop:"","webkit-playsinline":"",playsinline:"true",crossorigin:"anonymous",muted:"",src:e.pride.video},null,8,["src"]),[[I,e.pride.video]]),_(q("img",{"xr-layer":"",id:"image",crossorigin:"anonymous",src:e.pride.image},null,8,["src"]),[[I,e.pride.image]])]),xe]),q("div",fe,[Se,_(q("div",Re,"Done",512),[[I,["ManualInstruction","ClarifyingInfo","VerifyInstruction"].indexOf(e.pride.elementSubType)>-1]]),_(q("div",Ee,"Yes",512),[[I,"Conditional"===e.pride.elementSubType]]),_(q("div",Pe,"No",512),[[I,"Conditional"===e.pride.elementSubType]]),_(q("div",Te,"Record",512),[[I,"RecordInstruction"===e.pride.elementSubType]]),q("div",Ae,[q("b",null,X(e.immersiveMode?"Flat":"Immersive"),1)])])],2)};class Le{constructor(e){this.app=e,this.augmentations={},this.state=j(new oe).start(),this.prideVue=H(de).provide(ce,this.state).mount(document.createElement("div")),this.pride=this.app.createWebLayerTree(this.prideVue.$el,{onLayerCreate:e=>{this.app.system.getAdapter(e).onUpdate=()=>e.update()}}),this.procedure=this.pride.querySelector("#procedure"),this.step=this.pride.querySelector("#step"),this.instruction=this.pride.querySelector("#instruction"),this.content=this.pride.querySelector("#content"),this.media=this.pride.querySelector("#media"),this.image=this.pride.querySelector("#image"),this.video=this.pride.querySelector("#video"),this.model=this.pride.querySelector("#model"),this.controls=this.pride.querySelector("#controls"),this.backButton=this.pride.querySelector("#back"),this.doneButton=this.pride.querySelector("#done"),this.recordButton=this.pride.querySelector("#record"),this.yesButton=this.pride.querySelector("#yes"),this.noButton=this.pride.querySelector("#no"),this.immersiveButton=this.pride.querySelector("#immersive-toggle"),this.immersiveAnchor=new m,this.snubberBox=new U(this.app.treadmill.snubber);(()=>{this.app.scene.add(this.immersiveAnchor);const e=this.app.system.getAdapter(this.immersiveAnchor),t=new A;e.onUpdate=()=>{t.set(0,this.app.xrPresenting?1.6:0,this.app.xrPresenting?-.7:-1.4),e.bounds.target.setFromCenterAndSize(t,G)}})(),(()=>{const e=this.app.system.getAdapter(this.pride),t=e.createLayout().orientation(Q).scale(G).visualBounds({back:"-10m",center:{x:0,y:0}}).maximize(),s=e.createLayout().poseRelativeTo(this.app.camera).orientation(Q).keepAspect().visualBounds({back:"-4m",size:{y:"100 vh"},center:{x:"0 vdeg",y:"0 vdeg"}}).maximize();e.onUpdate=()=>{this.pride.options.autoRefresh=this.app.timeSinceLastResize>100,this.pride.update(),"world"===this.app.interactionSpace&&this.state.immersiveMode?e.layouts=[t]:e.layouts=[s]};const i=this.app.system.getAdapter(this.pride.contentMesh);i.bounds.enabled=!0,i.onUpdate=()=>{this.state.immersiveMode?this.pride.contentMesh.position.set(0,0,-1):this.pride.contentMesh.position.set(0,0,0)},setTimeout((()=>this.video.element.play()),5e3)})(),(()=>{const e=this.app.system.getAdapter(this.content),t=e.createLayout().poseRelativeTo(this.app.treadmill.snubber).keepAspect("xyz").orientation(Q).bounds({center:{distance:{lt:"1m"}}}).visualBounds({absolute:{left:{gt:"10px"},top:{lt:"-10px"},bottom:{gt:"10px"}},right:{lt:"-100% -10px"},size:{diagonal:{gt:"10px"}}}).magnetize().maximize();e.onUpdate=()=>{this.state.immersiveMode?e.layouts=[t]:e.layouts=[],this.content.update()}})(),(()=>{const t=this.app.treadmill.poster;this.app.scene.add(t);const s=e.system.getAdapter(t);s.onUpdate=()=>{this.state.immersiveMode?(t.position.set(0,0,-3),s.opacity.target=1):(t.position.set(0,0,-5),s.opacity.target=0)}})(),(()=>{const t=this.app.treadmill.snubber;t.position.set(10,-10,-10),this.app.scene.add(t),this.app.scene.add(this.snubberBox);const s=e.system.getAdapter(t);s.transition.maxWait=10;const i=s.createLayout().poseRelativeTo(this.model).orientation({swingRange:{x:"10deg",y:"10deg"},twistRange:"0deg"}).keepAspect("xyz").visualBounds({back:"0m",left:{gt:"10px"},right:{lt:"-10px"},bottom:{gt:"10px"},top:{lt:"-10px"}}).maximize({minAreaPercent:.1}),n=[s.createLayout().poseRelativeTo(this.app.treadmill.poster).scale(G).bounds({center:this.app.treadmill.snubberAnchorPosition}).orientation(Q)],r=[i];s.onUpdate=()=>{this.state.immersiveMode?s.layouts=n:s.layouts=r},s.onPostUpdate=()=>{this.snubberBox.update()}})(),this.backButton.element.addEventListener("click",(async()=>{this.state.back()})),this.doneButton.element.addEventListener("click",(async()=>{this.state.done()})),this.recordButton.element.addEventListener("click",(async()=>{this.state.done()})),this.yesButton.element.addEventListener("click",(async()=>{this.state.done("yes")})),this.noButton.element.addEventListener("click",(async()=>{this.state.done("no")})),this.immersiveButton.element.addEventListener("click",(async()=>{this.state.immersiveMode=!this.state.immersiveMode,this.state.immersiveMode&&this.app.enterXR()}))}updateAugmentations(){const e=ae.data.objects;for(const t in e){const s=e[t];let i=this.augmentations[t];if(!i){switch(s.type){case"box":const e=s.size;i=new b(new D(.01*e.x,.01*e.y,.01*e.z));break;case"sphere":i=new b(new F(.01*s.radius));break;default:i=new m}this.augmentations[t]=i}i.position.copy(s.position).multiplyScalar(.01),i.rotation.x=void 0*s.rotation.x,i.rotation.y=void 0*s.rotation.y,i.rotation.z=void 0*s.rotation.z}}update(e){}}v.prototype.computeBoundsTree=N,v.prototype.disposeBoundsTree=J,b.prototype.raycast=V;const ke=new class extends class{constructor(e){this._config=e,this.scene=new a,this.camera=new o,this.uiView=new o,this.renderer=new c({desynchronized:!0,antialias:!1,alpha:!0}),this.clock=new d,this.pointer=new h,this.raycaster=new l,this.mouseRay=[this.raycaster.ray],this.immersiveRays=new Set,this.interactionRays=[],this.xrObjects=new Map,this.webLayers=new Set,this.onAnimate=()=>{const e=this.renderer.domElement;this.xrPresenting||this._setSize(e.clientWidth,e.clientHeight,window.devicePixelRatio);const t=Math.min(this.clock.getDelta(),1/60);this.update(t),this.renderer.render(this.scene,this.camera)},this._wasPresenting=!1,this.update=e=>{if(this.interactionRays.length=0,"world"===this.interactionSpace)for(const t of this.immersiveRays)this.interactionRays.push(t);else for(const t of this.mouseRay)this.interactionRays.push(t);if(this.xrPresenting){this.renderer.setClearColor(new p("blue")),this.renderer.setClearColor(new p("white"),0),this._wasPresenting=!0;const e=this.renderer.xr.getCamera(this.camera);this.camera.matrix.copy(e.matrix),this.camera.matrix.decompose(this.camera.position,this.camera.quaternion,this.camera.scale),this.camera.projectionMatrix.copy(e.projectionMatrix),this.camera.projectionMatrixInverse.getInverse(this.camera.projectionMatrix),this.camera.updateWorldMatrix(!0,!0)}else{this.renderer.setClearColor(new p("white")),this._wasPresenting&&(this._wasPresenting=!1,this._exitXR(),this.interactionSpace="screen");const e=this.renderer.domElement,t=e.clientWidth/e.clientHeight;this.camera.aspect=t,this.camera.near=.001,this.camera.far=1e3,this.camera.updateProjectionMatrix()}this.raycaster.setFromCamera(this.pointer,this.camera),this._config.onUpdate({type:"update",deltaTime:e,elapsedTime:this.clock.elapsedTime})},this.interactionSpace="screen",this.lastResize=0,this.lastWidth=window.innerWidth,this.lastHeight=window.innerHeight,this.timeSinceLastResize=0,this.scene.add(this.camera);const t=this.renderer;document.documentElement.append(this.renderer.domElement),t.domElement.style.position="fixed",t.domElement.style.width="100%",t.domElement.style.height="100%",t.domElement.style.top="0",t.domElement.addEventListener("mousemove",(function(e){s(e.clientX,e.clientY)})),t.domElement.addEventListener("touchmove",(function(e){e.preventDefault(),s(e.touches[0].clientX,e.touches[0].clientY)}),{passive:!1}),t.domElement.addEventListener("touchstart",(function(e){s(e.touches[0].clientX,e.touches[0].clientY),i(e)}),{passive:!1}),t.domElement.addEventListener("touchend",(function(e){setTimeout((()=>s(-1/0,-1/0)),400)}),{passive:!1}),t.domElement.addEventListener("click",(function(e){i(e)}),!1),t.setAnimationLoop(this.onAnimate),window.addEventListener("vrdisplaypresentchange",(e=>{setTimeout((()=>{this.xrPresenting||this._exitXR()}))}),!1),document.documentElement.style.width="100%",document.documentElement.style.height="100%";const s=(e,t)=>{this.pointer.x=(e+window.pageXOffset)/document.documentElement.offsetWidth*2-1,this.pointer.y=-(t+window.pageYOffset)/document.documentElement.offsetHeight*2+1};const i=e=>{for(const t of this.webLayers){const s=t.hitTest(this.raycaster.ray);s&&(s.target.dispatchEvent(new e.constructor(e.type,e)),s.target.focus(),console.log("hit",s.target,s.layer))}},n=e=>{const s=14365238,i=new u({color:s}),n=t.xr.getController(e);this.scene.add(n),n.addEventListener("selectstart",(e=>{i.color.setHex(16040461),r()})),n.addEventListener("selectend",(e=>{i.color.setHex(s)})),n.add(new y(1)),this.immersiveRays.add(n);const r=()=>{for(const e of this.webLayers){const t=e.hitTest(n);t&&(t.target.click(),t.target.focus())}};let a;n.addEventListener("connected",(e=>{a=function(e){let t,s;switch(e.targetRayMode){case"tracked-pointer":return t=new v,t.setAttribute("position",new w([0,0,0,0,0,-1],3)),t.setAttribute("color",new w([.5,.5,.5,0,0,0],3)),s=new x({vertexColors:!0,blending:f}),new S(t,s);case"gaze":return t=new g(.02,.04,32).translate(0,0,-1),s=new u({opacity:.5,transparent:!0}),new b(t,s)}}(e),a&&n.add(a)})),n.addEventListener("disconnected",(()=>{a&&n.remove(a)}))};n(0),n(1)}createWebLayerTree(e,t){const s=new Y(e,t);return s.interactionRays=this.interactionRays,this.webLayers.add(s),this.scene.add(s),s.rootLayer}getXRObject3D(e){let t=this.xrObjects.get(e);return t||(t=new m,t.xrCoordinateSystem=e,this.xrObjects.set(e,t),t)}async start(){return this.enterXR().catch((()=>{console.log("Enter XR failed"),this.renderer.domElement.style.backgroundColor="lightgrey"}))}get xrPresenting(){return this.renderer.xr.isPresenting}async enterXR(){if(this.xrPresenting)return;if(!navigator.xr)throw new Error("WebXR is not supported by this browser");const e=async e=>{this.session&&this.session.end(),this.session=e,this.interactionSpace="world",await this.renderer.xr.setSession(e),e.addEventListener("end",(()=>{this.session=void 0,this.frameOfReference=void 0,this._exitXR()})),this._enterXR()};if(navigator.xr.requestSession){var t={optionalFeatures:["local-floor","bounded-floor","hand-tracking"]};return await navigator.xr.isSessionSupported("immersive-ar",t)?(console.log("AR supported, trying AR"),navigator.xr.requestSession("immersive-ar",t).then(e)):(console.log("AR not supported, trying VR"),navigator.xr.requestSession("immersive-vr",t).then(e))}}_enterXR(){this.renderer.xr.enabled=!0,this._config.onEnterXR({type:"enterxr"})}_exitXR(){this._config.onExitXR({type:"exitxr"}),this.camera.position.set(0,0,0),this.camera.quaternion.set(0,0,0,1),this.interactionSpace="screen",this.renderer.xr.enabled=!1}_setSize(e,t,s=1){e===this.lastWidth&&t===this.lastHeight||(this.lastWidth=e,this.lastHeight=t,this.lastResize=performance.now());const i=this.renderer.domElement;this.timeSinceLastResize=performance.now()-this.lastResize,this.timeSinceLastResize>2e3&&(i.width!==e*s||i.height!==t*s)&&(this.renderer.setSize(e,t,!1),this.renderer.setPixelRatio(s))}}{constructor(){super(...arguments),this.pride=ae,this.system=K(this.camera),this.treadmill=new te(this),this.ui=new Le(this),this.ethereal=Z}}({onUpdate:e=>{ke.renderer.getSize(ke.system.viewResolution),ke.system.update(e.deltaTime,e.elapsedTime)},onEnterXR:e=>{},onExitXR:e=>{ke.ui.state.immersiveMode=!1}});ke.system.transition.duration=1,ke.system.transition.easing=$.easeOut,ke.start().catch((e=>{console.log(e.stack),alert(e)})),Object.assign(window,{THREE:E,app:ke});

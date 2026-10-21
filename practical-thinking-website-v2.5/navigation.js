const copy=value=>JSON.parse(JSON.stringify(value));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function routeUrl(route){
 const params=new URLSearchParams();
 for(const key of ['selected','micro','qid','unitId'])if(route[key]!=null)params.set(key,route[key]);
 for(const [key,value] of Object.entries(route.workspace||{}))if(value!=null)params.set(key,value);
 return '#/'+route.page+(params.size?'?'+params:'');
}
export function routeFromHash(hash){
 const match=/^#\/([a-z]+)(?:\?(.*))?$/.exec(hash||'');if(!match)return null;
 const p=new URLSearchParams(match[2]);const route={page:match[1]};
 for(const key of ['selected','micro','qid','unitId'])if(p.has(key))route[key]=p.get(key);
 if(['studio','scenarios'].includes(route.page)){route.workspace={};for(const key of ['projectId','tool','simId','scenarioId'])if(p.has(key))route.workspace[key]=p.get(key);}
 return route;
}
// History contains navigation and presentation only. Learning/project data stays in its store.
export function createNavigation({host=window,normalise=x=>x,capture=()=>({}),restore,fallback}){
 const history=host.history;let current=null,restoring=false;
 const read=state=>state?.ptmNavigation?.version===3?state.ptmNavigation:null;
 const write=(method,entry)=>history[method]({...history.state,ptmNavigation:copy(entry)},'',routeUrl(entry.route));
 const entry=(route,index,ui={})=>({version:3,id:globalThis.crypto.randomUUID(),index,route:copy(route),ui:copy(ui)});
 function remember(){if(current&&!restoring){current.ui=copy(capture());write('replaceState',current);}}
 function start(defaultRoute){const stored=read(history.state),fromUrl=routeFromHash(host.location.hash);const route=normalise(fromUrl||stored?.route||defaultRoute);current=stored&&routeUrl(normalise(stored.route))===routeUrl(route)?{...stored,route}:entry(route,0);write('replaceState',current);return copy(current);}
 function commit(route){route=normalise(route);if(same(current.route,route))return false;remember();current=entry(route,current.index+1);write('pushState',current);return true;}
 function apply(){restoring=true;try{restore(copy(current));}finally{restoring=false;}}
 function back(){if(current.index>0){remember();history.back();}else{current=entry(normalise(fallback(current.route)),0);write('replaceState',current);apply();}}
 function onPop(event){const stored=read(event.state);const route=normalise(routeFromHash(host.location.hash)||stored?.route||{page:'home'});current=stored?{...stored,route}:entry(route,0);write('replaceState',current);apply();}
 host.addEventListener('popstate',onPop);
 return {start,commit,remember,back,get canBack(){return current?.index>0;},get route(){return copy(current.route);},dispose(){host.removeEventListener('popstate',onPop);}};
}

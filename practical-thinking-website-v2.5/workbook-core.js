
export const emptyWorkbook=()=>({version:1,lastTask:null,outputs:{}});
const plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const safeKey=k=>/^[a-z][a-z0-9_-]{0,79}$/.test(k)&&!['constructor','prototype','__proto__'].includes(k);
export function validateWorkbook(raw){
 if(raw===undefined)return emptyWorkbook();
 if(!plain(raw)||raw.version!==1||!plain(raw.outputs)||Object.keys(raw.outputs).length>200||!(raw.lastTask===null||typeof raw.lastTask==='string'&&/^task-[a-z0-9-]{1,60}$/.test(raw.lastTask)))throw Error('工作成果備份格式錯誤');
 for(const [id,r] of Object.entries(raw.outputs)){
  if(!/^task-[a-z0-9-]{1,60}$/.test(id)||!plain(r)||!plain(r.fields)||Object.keys(r.fields).length>30||typeof r.selfChecked!=='boolean'||r.updatedAt!==undefined&&(typeof r.updatedAt!=='string'||r.updatedAt.length>64))throw Error('工作成果紀錄格式錯誤');
  if(Object.entries(r.fields).some(([k,v])=>!safeKey(k)||typeof v!=='string'||v.length>12000))throw Error('工作成果欄位格式錯誤');
 }
 return raw;
}
export function updateWorkbook(state,id,key,value){
 if(!/^task-[a-z0-9-]{1,60}$/.test(id)||!safeKey(key)||typeof value!=='string'||value.length>12000)throw Error('無效工作成果');
 state.workbook??=emptyWorkbook();const old=state.workbook.outputs[id]||{fields:{},selfChecked:false};
 state.workbook.outputs[id]={...old,fields:{...old.fields,[key]:value},selfChecked:false,updatedAt:new Date().toISOString()};
 state.workbook.lastTask=id;return state.workbook.outputs[id];
}
function cents(value){if(typeof value!=='string'||!/^\d+(?:\.\d{1,2})?$/.test(value.trim()))return null;const [a,b='']=value.trim().split('.');const n=Number(a)*100+Number(b.padEnd(2,'0'));return Number.isSafeInteger(n)&&n<=1000000000?n:null;}
export function budgetTotals(fields={}){
 const fixed=cents(fields.fixed),variable=cents(fields.variable),price=cents(fields.price);
 const q=typeof fields.quantity==='string'&&/^\d+$/.test(fields.quantity.trim())?Number(fields.quantity):NaN;
 if([fixed,variable,price].some(x=>x===null)||!Number.isSafeInteger(q)||q<0||q>1000000)return {ok:false,message:'請填完四個數值；金額用不含逗號、最多兩位小數的非負數，數量用整數。'};
 const revenue=price*q,cost=fixed+variable*q,margin=price-variable;
 if(!Number.isSafeInteger(revenue)||!Number.isSafeInteger(cost))return {ok:false,message:'數值超過可可靠計算的範圍。'};
 return {ok:true,revenue,cost,profit:revenue-cost,margin,breakeven:margin>0?Math.ceil(fixed/margin):fixed===0&&margin===0?0:null};
}
export function workbookReady(lesson,record){
 return !!record&&lesson.fields.every(([key])=>typeof record.fields?.[key]==='string'&&record.fields[key].trim())&&(lesson.tool!=='budget'||budgetTotals(record.fields).ok);
}
export function workbookCSV(fields){
 if(!budgetTotals(fields).ok)throw Error('請先填入有效預算數值');
 const rows=[['項目','金額／數量'],['固定成本',fields.fixed.trim()],['每份變動成本',fields.variable.trim()],['單價',fields.price.trim()],['預估數量',fields.quantity.trim()],['總收入','=B4*B5'],['總成本','=B2+B3*B5'],['預估損益','=B6-B7'],['每份貢獻','=B4-B3'],['損益兩平數量','=IF(B9>0,ROUNDUP(B2/B9,0),IF(AND(B2=0,B9=0),0,"無可行兩平量"))']];
 return rows.map(r=>r.map(x=>'"'+String(x).replaceAll('"','""')+'"').join(',')).join('\r\n');
}
export function workbookText(lesson,record){
 return lesson.title+'\n'+lesson.deliverable+'\n\n'+lesson.fields.map(([key,label])=>label+'\n'+(record?.fields?.[key]||'（尚未填寫）')).join('\n\n')+'\n\n自行檢核：'+(record?.selfChecked?'已標記（不是能力認證）':'尚未標記')+'\n';
}

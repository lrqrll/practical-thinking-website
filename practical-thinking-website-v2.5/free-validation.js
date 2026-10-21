import {dialogueNodes,dialogueVersion} from './dialogue.js?v=0f769c796eb8';
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const text=(x,max=12000)=>typeof x==='string'&&x.length<=max;
export function validateFreeState(state){
 if(state.objectiveDrafts!==undefined){if(!object(state.objectiveDrafts)||Object.keys(state.objectiveDrafts).length>1000)throw Error('客觀題草稿格式錯誤');for(const value of Object.values(state.objectiveDrafts)){if(Array.isArray(value)){if(value.length>30||value.some(x=>!text(x,100))||new Set(value).size!==value.length)throw Error('排序草稿格式錯誤');}else if(!object(value)||Object.values(value).some(x=>!text(x,200)))throw Error('計算題草稿格式錯誤');}}
 if(state.dialogue!==undefined&&state.dialogue!==null){const d=state.dialogue;if(!object(d)||d.version!==dialogueVersion||!dialogueNodes[d.node]||!Array.isArray(d.log)||d.log.length>25||d.log.some(m=>!object(m)||!text(m.role,100)||!text(m.text))||!text(d.notes))throw Error('分支對話備份格式錯誤');}
 for(const a of state.attempts){if(a.status==='selfcheck'&&a.result)throw Error('自我檢核不得含自動語意分數');if(!a.selfReview)continue;const r=a.selfReview,s=r.snapshot;if(!object(r)||r.kind!=='self'||r.version!=='free-self-1.0'||!text(r.rubricId,200)||'total' in r||'scores' in r||!object(s)||s.id!==r.rubricId||s.questionId!==a.questionId||s.questionVersion!==a.version||!Array.isArray(s.items)||s.items.length<1||s.items.length>20||!Array.isArray(r.items)||r.items.length!==s.items.length)throw Error('自我檢核快照格式錯誤');
 const ids=s.items.map(i=>i?.id);if(new Set(ids).size!==ids.length||s.items.some(i=>!object(i)||!text(i.id,100)||!text(i.name,200)||!text(i.prompt,3000)))throw Error('檢核規準項目格式錯誤');
 if(new Set(r.items.map(i=>i?.id)).size!==r.items.length||r.items.some(i=>!object(i)||!ids.includes(i.id)||!['unknown','met','partial','unmet'].includes(i.value)||!text(i.evidence,3000)||!text(i.note,3000)))throw Error('逐項自我檢核格式錯誤');
 for(const key of ['standards','critical'])if(!Array.isArray(s[key])||s[key].some(x=>!text(x,4000)))throw Error('自我檢核標準格式錯誤');if(!text(s.example)||!Array.isArray(s.contrasts)||s.contrasts.some(c=>!object(c)||!text(c.weak,4000)||!text(c.reason,4000)||!text(c.better,4000)))throw Error('檢核示範格式錯誤');
 }
 return state;
}

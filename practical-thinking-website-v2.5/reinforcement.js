// Recommendations use real graded attempts only; this module never creates scores.
const axisLessons=[['u01-c01',1],['u02-c02',2],['u01-c03',2],['u01-c04',0],['u01-c05',2],['u02-c03',1]];
const names=['事實與假設混淆','因果推論不足','優先順序不當','可行性驗證不足','成本與授權疏漏','追蹤與備案不足'];
export function learningPlan(attempts,questions){
 const graded=attempts.filter(a=>a.status==='graded'&&a.result&&a.type!=='single'&&a.type!=='multi'&&Array.isArray(a.result.scores));
 if(!graded.length)return {diagnosed:false,chapter:'u01-c01',micro:0,questionId:'q-facts-01',sourceId:null,reason:'尚無真正的模型批改，先練資訊判讀；不推定你的弱點。',count:0};
 const recent=graded.slice(-10),ratios=names.map((name,i)=>{const list=recent.flatMap(a=>{const s=a.result.scores.find(s=>s.axis===i);return s?.max>0?[s.score/s.max]:[];});return {i,name,ratio:list.length?list.reduce((a,b)=>a+b,0)/list.length:1,count:list.length,errors:recent.filter(a=>a.result.errorTypes?.includes(name)).length};}).filter(x=>x.count);
 if(!ratios.length)return {diagnosed:false,chapter:'u01-c01',micro:0,questionId:'q-facts-01',reason:'現有結果沒有可比較分項，先進行資訊判讀基礎練習。',count:0};
 const weak=ratios.sort((a,b)=>a.ratio-b.ratio||b.errors-a.errors||a.i-b.i)[0],last=graded.at(-1);
 const focus=recent.slice().reverse().find(a=>a.result.errorTypes?.includes(weak.name))||recent.slice().reverse().find(a=>a.result.scores.some(s=>s.axis===weak.i&&s.max>0&&s.score/s.max<.9))||last;
 const compatible=questions.filter(q=>q.type==='open'&&q.skill===focus.skill&&q.id!==focus.questionId);
 const next=compatible.find(q=>!attempts.some(a=>a.questionId===q.id))||compatible.sort((a,b)=>{const date=id=>attempts.filter(x=>x.questionId===id).at(-1)?.date||'';return date(a.id).localeCompare(date(b.id));})[0];
 const labels=['事實確認與假設辨識','因果分析','優先順序與決策','執行可行性','風險、責任與授權','備案、追蹤與驗證'];
 return {diagnosed:true,weakness:weak.errors?weak.name:weak.ratio<.9?labels[weak.i]+'需補強':'持續用不同情境驗證能力',ratio:Math.round(weak.ratio*100),count:weak.count,sourceId:focus.id,skill:focus.skill,chapter:axisLessons[weak.i][0],micro:axisLessons[weak.i][1],questionId:next?.id||null,reason:'最近'+weak.count+'次有評此面向的真正批改，平均得分率'+Math.round(weak.ratio*100)+'%；此為補強線索，不是能力認證。'};
}
export function linkRetraining(attempt,session){return session&&session.questionId===attempt.questionId?{...attempt,retraining:{sourceAttemptId:session.sourceAttemptId||null,skill:session.skill||null,started:session.started}}:attempt;}

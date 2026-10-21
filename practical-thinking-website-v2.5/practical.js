
import {practicalDomains,practicalLessons,legacyLessonMap} from './practical-data.js?v=3407959b8289';
import {emptyWorkbook,updateWorkbook,budgetTotals,workbookReady,workbookCSV,workbookText} from './workbook-core.js?v=3407959b8289';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const record=(state,id)=>state.workbook?.outputs?.[id];
const status=(lesson,state)=>record(state,lesson.id)?.selfChecked&&workbookReady(lesson,record(state,lesson.id))?'已自行檢查':Object.values(record(state,lesson.id)?.fields||{}).some(x=>x.trim())?'已有草稿':'尚未開始';
export function taskCatalogue(state){
 return '<div class="intro"><p class="eyebrow">工作課程</p><h1>選一個要完成的成果</h1><p class="muted">先看做法與示範，再依需要操作。深入理論放在展開區，不必逐章讀完。</p></div>'+
 practicalDomains.map(([id,title])=>'<section class="task-domain"><h2>'+title+'</h2>'+practicalLessons.filter(l=>l.domain===id).map(l=>'<div class="course"><span class="course-num">'+esc(status(l,state))+'</span><div><h3>'+l.title+'</h3><p>'+l.deliverable+'</p></div><button data-open-task="'+l.id+'">開始</button></div>').join('')+'</section>').join('');
}
export function taskHome(state){
 const lesson=practicalLessons.find(l=>l.id===state.workbook?.lastTask)||practicalLessons[0];
 const checked=practicalLessons.filter(l=>record(state,l.id)?.selfChecked&&workbookReady(l,record(state,l.id))).length;
 return '<section class="start-page"><div class="start-heading"><h1>學習首頁</h1><p>練習寫清問題、回報、排時程，或做一張基本預算。</p></div><section class="resume-panel"><p class="small muted">'+(state.workbook?.lastTask?'接續工作課':'建議從這裡開始')+'</p><h2>'+lesson.title+'</h2><p>完成成果：'+lesson.deliverable+'</p><button class="primary" data-open-task="'+lesson.id+'">'+(state.workbook?.lastTask?'繼續':'開始')+' →</button> <button data-page="courses">查看其他工作課</button></section><p class="small muted">已自行檢查 '+checked+' 份成果。這是你的檢核標記，不代表能力認證；舊章節已讀不換算成新進度。</p><div class="row"><button data-page="studio">專案工作室</button><button data-page="scenarios">綜合情境</button></div></section>';
}
export function taskSummary(state){
 const saved=practicalLessons.filter(l=>record(state,l.id)&&Object.values(record(state,l.id).fields).some(x=>x.trim()));
 return '<section class="panel"><h2>我的工作成果</h2><p class="small muted">草稿與自行檢核獨立保存，不與考題分數或舊閱讀進度混算。</p>'+(saved.length?saved.map(l=>'<p><button data-open-task="'+l.id+'">'+l.title+'</button> <span class="tag">'+esc(status(l,state))+'</span></p>').join(''):'<p>尚無工作成果。可從問題說明或基本預算開始。</p><button data-page="courses">選擇工作課</button>')+'</section>';
}
const money=n=>'NT$'+(n/100).toLocaleString('zh-TW',{minimumFractionDigits:0,maximumFractionDigits:2});
export function budgetResult(fields){
 const b=budgetTotals(fields);if(!b.ok)return '<p class="small muted">'+esc(b.message)+'</p>';
 return '<dl class="task-budget-totals"><div><dt>收入</dt><dd>'+money(b.revenue)+'</dd></div><div><dt>總成本</dt><dd>'+money(b.cost)+'</dd></div><div><dt>預估損益</dt><dd>'+money(b.profit)+'</dd></div><div><dt>兩平數量</dt><dd>'+(b.breakeven===null?'目前無可行兩平量':b.breakeven+' 份')+'</dd></div></dl><p class="small muted">僅依你輸入的成本與收入試算，尚未估入的項目不會自動補齊；這不是報價建議。</p>';
}
export function taskView(id,state){
 const l=practicalLessons.find(x=>x.id===id)||practicalLessons[0],r=record(state,l.id),fields=r?.fields||{};
 return '<article class="reading task-reading"><div class="intro"><p class="eyebrow">工作課程</p><h1>'+l.title+'</h1><p class="muted">完成成果：'+l.deliverable+'</p></div><p>'+l.intro+'</p><ol>'+l.steps.map(x=>'<li>'+x+'</li>').join('')+'</ol><h2>看一次怎麼做</h2><p>'+l.example+'</p><details class="learning-layer"><summary>深入了解與適用限制</summary><p>'+l.limits+'</p><p>'+l.advanced+'</p>'+(l.sources.length?'<p class="small muted">需要完整推理時查閱舊版講義：</p>'+l.sources.map(id=>'<button data-chapter="'+id+'">'+esc(legacyLessonMap.find(x=>x.oldId===id)?.title||id)+'</button>').join(' '):'')+'</details>'+
 '<details class="learning-layer"'+(l.tool==='budget'?' open':'')+'><summary>記錄自己的工作成果 <span>選用・自動儲存</span></summary><div class="task-fields">'+l.fields.map(([key,label])=>'<div><label for="workbook-'+key+'">'+label+'</label>'+(l.tool==='budget'&&key!=='unknown'?'<input id="workbook-'+key+'" type="text" inputmode="'+(key==='quantity'?'numeric':'decimal')+'" data-workbook="'+key+'" maxlength="30" value="'+esc(fields[key]||'')+'">':'<textarea id="workbook-'+key+'" data-workbook="'+key+'" maxlength="12000" rows="3">'+esc(fields[key]||'')+'</textarea>')+'</div>').join('')+'</div>'+(l.tool==='budget'?'<div data-budget-result aria-live="polite">'+budgetResult(fields)+'</div>':'')+'<p class="small muted">自行核對：資訊有依據、安排符合限制、負責人與確認點清楚。完成下方標記不會產生專業分數。</p><div class="row"><button data-workbook-check aria-pressed="'+(r?.selfChecked?'true':'false')+'">'+(r?.selfChecked?'已自行檢查':'標記已自行檢查')+'</button><button data-workbook-export>匯出成果文字</button>'+(l.tool==='budget'?'<button data-workbook-csv>匯出CSV預算</button>':'')+'</div><p class="small muted" role="status" data-workbook-status></p></details>'+
 (l.tool==='studio'?'<button data-page="studio">在專案工作室繼續操作</button>':l.tool==='scenarios'?'<button data-page="scenarios">用不同事件做綜合練習</button>':'')+'</article>';
}
export function bindTask({doc,state,id,save,toast,download}){
 const l=practicalLessons.find(x=>x.id===id);if(!l)return;
 const notice=text=>{const n=doc.querySelector('[data-workbook-status]');if(n)n.textContent=text;};
 doc.querySelectorAll('[data-workbook]').forEach(el=>el.addEventListener('input',()=>{
  updateWorkbook(state,l.id,el.dataset.workbook,el.value);
  const button=doc.querySelector('[data-workbook-check]');if(button){button.textContent='標記已自行檢查';button.setAttribute('aria-pressed','false');}
  const result=doc.querySelector('[data-budget-result]');if(result)result.innerHTML=budgetResult(record(state,l.id).fields);
  notice(save()?'已儲存':'尚未儲存，請先檢查設定與備份。');
 }));
 doc.querySelector('[data-workbook-check]')?.addEventListener('click',e=>{
  const r=record(state,l.id);if(!workbookReady(l,r)){toast('請先填完成果欄位；預算數值也必須可計算。');return;}
  r.selfChecked=!r.selfChecked;notice(save()?'已儲存你的自行檢核標記':'標記尚未儲存');
  e.currentTarget.setAttribute('aria-pressed',String(r.selfChecked));e.currentTarget.textContent=r.selfChecked?'已自行檢查':'標記已自行檢查';
 });
 doc.querySelector('[data-workbook-export]')?.addEventListener('click',()=>download(l.id+'.txt',workbookText(l,record(state,l.id)),'text/plain;charset=utf-8'));
 doc.querySelector('[data-workbook-csv]')?.addEventListener('click',()=>{try{download(l.id+'.csv','\uFEFF'+workbookCSV(record(state,l.id)?.fields),'text/csv;charset=utf-8');}catch(e){toast(e.message);}});
}

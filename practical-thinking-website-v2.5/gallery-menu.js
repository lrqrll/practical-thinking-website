export const galleryThemes={"light":{"bg":"#f4f1eb","paper":"#fdfbf7","text":"#302d2a","muted":"#696159","line":"#8f8377","accent":"#526762","soft":"#e8e3dc"},"dark":{"bg":"#242629","paper":"#2e3134","text":"#eee8df","muted":"#c0b4a7","line":"#8f857b","accent":"#c3b095","soft":"#383c3d"}};
export function isGalleryPreview(search=''){return new URLSearchParams(search).get('design')==='gallery';}
export function preferredTheme(raw,dark=false){try{const t=JSON.parse(raw||'null')?.theme;if(t==='light'||t==='dark')return t;}catch{}return dark?'dark':'light';}

export const galleryMenuEntries=[
 ['read','繼續學習','回到上次閱讀的位置'],
 ['courses','所有課程','依單元尋找教材'],
 ['practice','互動實戰','分析情境與練習決策'],
 ['studio','專案工作室','編輯企劃、預算與時程'],
 ['analysis','我的學習','查看紀錄與補強方向']
];
const menuSection=page=>['unit','chapters'].includes(page)?'courses':['scenarios','role'].includes(page)?'practice':['history','notes','settings'].includes(page)?'analysis':page;
export function galleryMenuMarkup(page){
 const active=menuSection(page);
 return '<nav class="gallery-topnav" aria-label="主要導覽"><button id="gallery-menu-open" class="gallery-menu-trigger" aria-haspopup="dialog" aria-expanded="false" aria-controls="gallery-menu">選單 <span lang="en">MENU</span><span aria-hidden="true">＋</span></button></nav>'+
 '<dialog id="gallery-menu" class="gallery-dialog" aria-labelledby="gallery-menu-title"><div class="gallery-menu-head"><h2 id="gallery-menu-title">實務思考與管理</h2><button id="gallery-menu-close" autofocus>關閉 <span lang="en">CLOSE</span><span aria-hidden="true">×</span></button></div><div class="gallery-menu-grid"><div class="gallery-mainnav">'+
 galleryMenuEntries.map(([id,label,description],i)=>'<button data-gallery-page="'+id+'"'+(active===id?' data-active="true"':'')+(page===id?' aria-current="page"':'')+'><span class="gallery-nav-number" aria-hidden="true">0'+(i+1)+'</span><span class="gallery-nav-copy"><span class="gallery-nav-label">'+label+'</span><span class="gallery-nav-description">'+description+'</span></span><span class="gallery-nav-arrow" aria-hidden="true">↗</span></button>').join('')+
 '</div><div class="gallery-subnav"><p>學習紀錄與工具</p>'+
 [['history','作答與檢核'],['notes','筆記與收藏'],['settings','設定與備份'],['scenarios','職場情境庫'],['role','分支溝通練習'],['home','學習首頁']].map(([id,label])=>'<button data-gallery-page="'+id+'"'+(page===id?' aria-current="page"':'')+'>'+label+'</button>').join('')+
 '</div></div><div class="gallery-menu-foot"><span>學習紀錄保存在這台裝置</span><span>固定規則與自我檢核・無付費API</span></div></dialog>';
}
export function bindGalleryMenu({navigate,remember=()=>{},toast=()=>{},doc=globalThis.document}){
 const dialog=doc?.querySelector('#gallery-menu'),trigger=doc?.querySelector('#gallery-menu-open'),closeButton=doc?.querySelector('#gallery-menu-close');
 if(!dialog||!trigger||!closeButton)return;
 let opened=false;
 const restore=()=>{
  doc.body.classList.remove('gallery-menu-open');
  trigger.setAttribute('aria-expanded','false');
  if(opened&&trigger.isConnected!==false)trigger.focus({preventScroll:true});
  opened=false;
 };
 const close=()=>{if(dialog.open)dialog.close();restore();};
 trigger.addEventListener('click',()=>{
  if(dialog.open)return;
  if(typeof dialog.showModal!=='function'){toast('此瀏覽器未支援試用版選單，請先使用原介面。');return;}
  remember();dialog.showModal();opened=true;
  trigger.setAttribute('aria-expanded','true');
  doc.body.classList.add('gallery-menu-open');
  closeButton.focus({preventScroll:true});
 });
 closeButton.addEventListener('click',close);
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 dialog.addEventListener('close',restore);
 dialog.addEventListener('keydown',e=>{
  if(e.key!=='Tab')return;
  const controls=[...dialog.querySelectorAll('button:not([disabled]),a[href]')];
  if(!controls.length)return;
  const first=controls[0],last=controls.at(-1);
  if(e.shiftKey&&doc.activeElement===first){e.preventDefault();last.focus({preventScroll:true});}
  else if(!e.shiftKey&&doc.activeElement===last){e.preventDefault();first.focus({preventScroll:true});}
 });
 dialog.querySelectorAll('[data-gallery-page]').forEach(button=>button.addEventListener('click',()=>{
  const page=button.dataset.galleryPage;close();navigate(page);
 }));
}

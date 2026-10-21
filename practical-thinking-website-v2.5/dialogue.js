export const dialogueVersion='free-dialogue-1.0';
export const dialogueNodes={
 start:{speaker:'客戶',text:'明晚活動請加20分鐘演出，不增加預算。你現在直接答應就好。',options:[['goal','先確認希望增加的成果及不能改的條件','goal'],['promise','答應免費加演，之後再內部協調','repair'],['refuse','直接說不可能，不問原因','repair']]},
 goal:{speaker:'客戶',text:'我希望來賓更願意拍照分享；不一定非要完整20分鐘，但希望明晚看得出成果。原結束時間不能改。',options:[['constraints','說明需核流程、人力、費用與批准窗口，再給回覆期限','constraints'],['guarantee','既然不用20分鐘，就保證任何互動都免費','repair']]},
 constraints:{speaker:'製作窗口',text:'本模擬已確認原流程無20分鐘空檔。沿用已核准素材的5分鐘互動需1,500元與1位人員，PM可評估由另一非必要工作調人。變更仍未批准。',options:[['propose','將5分鐘互動的取捨與條件送PM，並向客戶說明尚待批准','approval'],['order','先安排人員開始製作，批准後補','repair'],['reject','維持原範圍，說明未批准前不變更並請PM決定','approval']]},
 approval:{speaker:'PM',text:'本模擬PM批准由原預備金支應1,500元，不增加客戶總價，並從原非必要工作釋出1人；客戶仍需確認5分鐘互動的效果與交付範圍，未確認前不要對外公告。',options:[['write','請客戶確認交付差異，記錄批准、負責人、期限與驗收','done'],['announce','只要PM批准就直接公告客戶已同意','repair']]},
 repair:{speaker:'協作窗口',text:'目前無法依這項承諾安排；請重新釐清目標、原流程限制及誰能批准。你的前一步保留在紀錄中，不會被系統抹掉。',options:[['clarify','修正承諾，重新確認目標及條件','goal'],['end','結束模擬，保留問題供自我檢核','end']]},
 done:{speaker:'客戶',text:'我接受5分鐘互動與已說明的範圍，請傳書面摘要，列出誰負責、何時完成及如何確認成果。',options:[]},
 end:{speaker:'系統',text:'模擬結束。請用固定規準檢查已做與漏做的事，不產生語意分數。',options:[]}
};
export function newDialogue(){return {version:dialogueVersion,node:'start',log:[{role:'客戶',text:dialogueNodes.start.text}],notes:''};}
export function chooseDialogue(run,id){if(run.version!==dialogueVersion)throw Error('舊版對話請保留後重新開始');const node=dialogueNodes[run.node],option=node?.options.find(x=>x[0]===id);if(!option)throw Error('目前狀態沒有這個選項');if(run.log.length>=25)throw Error('已達本次練習輪數，請結束檢核或重新開始');run.log.push({role:'你選擇的意圖',text:option[1]});run.node=option[2];run.log.push({role:dialogueNodes[run.node].speaker,text:dialogueNodes[run.node].text});return run;}

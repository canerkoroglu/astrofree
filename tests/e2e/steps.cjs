// Steps run inside the app window. Each js string may return
// "PASS ..." / "FAIL ..." / "SKIP ..." to be recorded.
const HELPERS = `
window.c=(sel,txt)=>{const b=[...document.querySelectorAll(sel)].find(b=>b.textContent.trim().startsWith(txt)); if(!b) throw new Error('bulunamadı: '+txt); b.click(); return true};
window.setv=(el,v)=>{const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}))};
window.ok=(name,cond,detail='')=>(cond?'PASS ':'FAIL ')+name+(detail?' — '+detail:'');
window.aiAsk=(provider,model,q)=>new Promise(res=>{const id='t'+Math.random();let txt='';const off=window.astro.ai.onEvent(e=>{if(e.id!==id)return;if(e.type==='delta')txt+=e.text;if(e.type==='done'){off();res('OK: '+txt.trim().slice(0,120))}if(e.type==='error'){off();res('ERR: '+e.message.slice(0,200))}});window.astro.ai.start({id,provider,model,system:'Kısa yanıt ver.',context:'',messages:[{role:'user',content:q}]});setTimeout(()=>{off();res('TIMEOUT')},120000)});
'ok'`

function steps({ ai, tmp }) {
  const S = []
  const step = (name, js, wait) => S.push({ name, js, wait })
  step('helpers', HELPERS, 100)
  step('onboarding', `(()=>{const o=document.querySelector('.onboarding');if(!o)return ok('İlk açılış rehberi',false,'görünmedi');c('.onboarding .actions button','Atla');return ok('İlk açılış rehberi',true)})()`, 500)
  step('ephemeris', `window.astro.compute([{jdUT:2430377.5243055555,lat:38.25,lon:-85.7667,houseSystem:'P',sidMode:null,bodies:[0,1,9]}]).then(r=>{const b=r[0].bodies;return ok('Efemeris doğruluğu',Math.abs(b[0].lon-297.2930)<0.001&&Math.abs(b[1].lon-312.4323)<0.002&&Math.abs(r[0].asc-139.5244)<0.01,'Güneş '+b[0].lon.toFixed(4))})`)
  step('geo', `Promise.all(['Kadıköy','Londra','louisville, kentucky'].map(q=>window.astro.geo.search(q,'tr'))).then(r=>ok('Çevrimdışı şehir arama',r.every(x=>x.length>0)&&r[0][0].zone==='Europe/Istanbul'))`)
  step('new person', `c('.side-actions button','+ Kişi')`, 600)
  step('fill', `(()=>{setv(document.querySelector('.big-input'),'Muhammad Ali');setv(document.querySelector('.ed-sec .dtf > input'),'17.01.1942 18:35');setv(document.querySelector('.place-search input'),'Louisville, kentucky');return 1})()`, 900)
  step('pick place', `(()=>{[...document.querySelectorAll('.place-results button')].find(b=>b.textContent.includes('Kentucky')).click();return 1})()`, 500)
  step('preview', `(()=>{const t=[...document.querySelectorAll('.pv-item')].map(e=>e.innerText).join(' ');return ok('Canlı önizleme',t.includes('Oğlak')&&t.includes('Kova')&&t.includes('Aslan'),t.replace(/\\s+/g,' '))})()`)
  step('save', `c('.modal footer button','Ekle')`, 1500)
  step('saved', `ok('Formdan kişi ekleme',document.querySelector('.chart-head').innerText.includes('17.01.1942 18:35'),document.querySelector('.chart-head').innerText.slice(0,80).replace(/\\n/g,' | '))`)
  step('natal table', `(()=>{const r=[...document.querySelectorAll('table.data tr')].find(r=>r.textContent.includes('Güneş'));return ok('Natal konum tablosu',!!r&&r.textContent.includes('27°'),r?r.textContent.slice(0,50):'satır yok')})()`)
  step('partner', `window.astro.charts.save({id:'p2',name:'Test Partner',local:{y:1990,m:5,d:3,h:9,mi:20,s:0},tz:{kind:'zone',zone:'Europe/Istanbul'},place:{name:'İzmir',lat:38.42,lon:27.14,zone:'Europe/Istanbul'},createdAt:1,updatedAt:1}).then(()=>{location.reload();return 1})`, 3000)
  step('helpers2', HELPERS, 100)
  step('open ali', `c('.chart-list .item .nm','Muhammad')`, 1200)
  for (const k of ['Transit', 'Progresyon', 'Solar Ark', 'Güneş Dönüşü', 'Ay Dönüşü', 'Sinastri']) {
    step('layer ' + k, `c('.toolbar .seg button','${k}')`, 1600)
    step('layer check ' + k, `ok('Katman: ${k}',!document.querySelector('.center .error')&&[...document.querySelectorAll('.toolbar .seg button.on')].some(b=>b.textContent==='${k}'))`)
    step('layer off ' + k, `c('.toolbar .seg button','${k}')`, 500)
  }
  step('transit on', `c('.toolbar .seg button','Transit')`, 1200)
  step('info', `c('.view-tabs button','Natal Bilgiler')`, 1200)
  step('info check', `ok('Natal Bilgiler',document.querySelectorAll('.natal-info details').length>=8)`)
  step('mansion check', `(()=>{const t=document.querySelector('.natal-info').innerText;return ok('Ay durağı ve Ay lordu',t.includes("23. Sa'd Bula")&&t.includes('Jüpiter'))})()`)
  step('calendar', `c('.view-tabs button','Transit Takvimi')`, 4000)
  step('calendar check', `ok('Transit takvimi',document.querySelectorAll('table.cal tr').length>5)`)
  step('acg', `c('.view-tabs button','Astrokartografi')`, 1500)
  step('acg check', `ok('Astrokartografi çizgileri',document.querySelectorAll('.acg .wm-overlay').length>=30)`)
  step('chart', `c('.view-tabs button','Harita')`, 800)
  step('step day', `(()=>{window.T0=document.querySelector('.timebar .dtf > input').value;c('.timebar .steps button','+G');return 1})()`, 600)
  step('step check', `ok('Zaman adımı',document.querySelector('.timebar .dtf > input').value!==window.T0)`)
  step('theme', `(()=>{document.querySelector('.toolbar button[title^="Tema"]').click();return 1})()`, 500)
  step('theme check', `ok('Tema düğmesi',!!document.documentElement.getAttribute('data-theme'))`)
  step('png', `c('.head-actions button','PNG')`, 2500)
  step('pdf', `c('.head-actions button','PDF')`, 5000)
  step('backup', `window.astro.backup.run('${tmp}/backup').then(p=>ok('Yedek',!!p))`)
  step('kb save', `window.astro.kb.save('test.md','# Test notları\\n\\n### Kova durağı\\n- anahtarlar: durak:23\\nDeneme metni.\\n').then(()=>window.astro.kb.list()).then(l=>ok('Bilgi bankası dosyası',l.length===1&&l[0].text.includes('durak:23')))`)
  step('kb reload', `(()=>{location.reload();return 1})()`, 3000)
  step('helpers3', HELPERS, 100)
  step('kb open', `(()=>{c('.chart-list .item .nm','Muhammad');return 1})()`, 1200)
  step('kb tab', `c('.view-tabs button','Bilgi Bankası')`, 800)
  step('kb check', `(()=>{const t=document.querySelector('.kb-main')?.innerText||'';return ok('Bilgi bankası eşleşmesi',t.includes('Kova durağı')&&t.includes('Natal Ay 23. durakta'),t.slice(0,80).replace(/\\n/g,' | '))})()`)
  step('interp', `window.astro.interp.add({id:'i1',chartId:'x',title:'t',content:'c',provider:'test',createdAt:Date.now()}).then(a=>ok('Yorum arşivi',a.length===1))`)
  if (ai) {
    step('claude', `aiAsk('claude-code','','Sadece "tamam" yaz.').then(r=>(r.startsWith('OK')?'PASS ':'FAIL ')+'Claude Code — '+r)`)
    step('codex', `aiAsk('codex','gpt-5.6-luna','Sadece "tamam" yaz.').then(r=>(r.startsWith('OK')?'PASS ':'FAIL ')+'Codex — '+r)`)
  } else step('ai', `'SKIP AI sağlayıcıları (E2E_AI=1 ile çalıştırın)'`)
  return S
}

module.exports = { steps }

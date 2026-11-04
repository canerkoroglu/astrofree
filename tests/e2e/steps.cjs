// Steps run inside the app window. Each js string may return
// "PASS ..." / "FAIL ..." / "SKIP ..." to be recorded.
const HELPERS = `
window.c=(sel,txt)=>{const b=[...document.querySelectorAll(sel)].find(b=>b.textContent.trim().startsWith(txt)); if(!b) throw new Error('bulunamadı: '+txt); b.click(); return true};
window.setv=(el,v)=>{const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}))};
window.ok=(name,cond,detail='')=>(cond?'PASS ':'FAIL ')+name+(detail?' — '+detail:'');
window.aiAsk=(provider,model,q)=>new Promise(res=>{const id='t'+Math.random();let txt='';const off=window.astro.ai.onEvent(e=>{if(e.id!==id)return;if(e.type==='delta')txt+=e.text;if(e.type==='done'){off();res('OK: '+txt.trim().slice(0,120))}if(e.type==='error'){off();res('ERR: '+e.message.slice(0,200))}});window.astro.ai.start({id,provider,model,system:'Kısa yanıt ver.',context:'',messages:[{role:'user',content:q}]});setTimeout(()=>{off();res('TIMEOUT')},120000)});
'ok'`

const CONTRAST = require('./contrast.cjs')

function steps({ ai, tmp, mock }) {
  const S = []
  const step = (name, js, wait) => S.push({ name, js, wait })
  step('helpers', HELPERS, 100)
  step('onboarding', `(()=>{const o=document.querySelector('.onboarding');if(!o)return ok('İlk açılış rehberi',false,'görünmedi');const skip=[...o.querySelectorAll('.actions button')].find(b=>b.textContent.trim()==='Atla');return ok('Lisans onayı olmadan geçilemiyor',skip.disabled)})()`, 200)
  step('terms', `(()=>{document.querySelector('.onboarding .terms-check input').click();return 1})()`, 300)
  step('onboarding done', `(()=>{c('.onboarding .actions button','Atla');return 1})()`, 500)
  step('terms saved', `window.astro.settings.get().then(s=>ok('İlk açılış rehberi ve lisans onayı',!document.querySelector('.onboarding')&&!!s.termsAccepted&&!!s.termsAcceptedAt&&!document.querySelector('.terms-dialog')))`)
  step('ephemeris', `window.astro.compute([{jdUT:2430377.5243055555,lat:38.25,lon:-85.7667,houseSystem:'P',sidMode:null,bodies:[0,1,9]}]).then(r=>{const b=r[0].bodies;return ok('Efemeris doğruluğu',Math.abs(b[0].lon-297.2930)<0.001&&Math.abs(b[1].lon-312.4323)<0.002&&Math.abs(r[0].asc-139.5244)<0.01,'Güneş '+b[0].lon.toFixed(4))})`)
  step('geo', `Promise.all(['Kadıköy','Londra','louisville, kentucky'].map(q=>window.astro.geo.search(q,'tr'))).then(r=>ok('Çevrimdışı şehir arama',r.every(x=>x.length>0)&&r[0][0].zone==='Europe/Istanbul'))`)
  step('new person', `c('.side-actions button','+ Kişi')`, 1500)
  step('fill', `(()=>{setv(document.querySelector('.big-input'),'Muhammad Ali');setv(document.querySelector('.ed-sec .dtf > input'),'17.01.1942 18:35');setv(document.querySelector('.place-search input'),'Louisville, kentucky');return 1})()`, 900)
  step('pick place', `(()=>{[...document.querySelectorAll('.place-results button')].find(b=>b.textContent.includes('Kentucky')).click();return 1})()`, 500)
  step('preview', `(()=>{const t=[...document.querySelectorAll('.pv-item')].map(e=>e.innerText).join(' ');return ok('Canlı önizleme',t.includes('Oğlak')&&t.includes('Kova')&&t.includes('Aslan'),t.replace(/\\s+/g,' '))})()`)
  step('date kept', `(()=>{const i=document.querySelector('.ed-sec .dtf > input');if(!i.value.startsWith('17.01.1942'))setv(i,'17.01.1942 18:35');return 1})()`, 600)
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
  step('export menu', `c('.head-actions button','Dışa aktar')`, 300)
  step('png', `c('.pop-menu button','Çark görseli')`, 2500)
  step('export menu 2', `c('.head-actions button','Dışa aktar')`, 300)
  step('pdf', `c('.pop-menu button','PDF')`, 5000)
  step('backup', `window.astro.backup.run('${tmp}/backup').then(p=>ok('Yedek',!!p))`)
  step('kb save', `window.astro.kb.save('test.md','# Test notları\\n\\n### Kova durağı\\n- anahtarlar: durak:23\\nDeneme metni.\\n').then(()=>window.astro.kb.list()).then(l=>ok('Bilgi bankası dosyası',l.length===1&&l[0].text.includes('durak:23')))`)
  step('kb reload', `(()=>{location.reload();return 1})()`, 3000)
  step('helpers3', HELPERS, 100)
  step('kb open', `(()=>{c('.chart-list .item .nm','Muhammad');return 1})()`, 2000)
  step('kb tab', `c('.view-tabs button','Bilgi Bankası')`, 800)
  step('kb check', `(()=>{const t=document.querySelector('.kb-main')?.innerText||'';return ok('Bilgi bankası eşleşmesi',t.includes('Kova durağı')&&t.includes('Natal Ay 23. durakta'),(document.querySelector('.chart-head')?.innerText||'').split('\\n')[0]+' :: '+t.slice(0,80).replace(/\\n/g,' | '))})()`)
  step('sunrise chart', `window.astro.charts.save({id:'sr1',name:'Gün doğumu',local:{y:2024,m:6,d:21,h:6,mi:5,s:0},tz:{kind:'zone',zone:'Europe/Istanbul'},place:{name:'İstanbul',lat:41.01,lon:28.97,zone:'Europe/Istanbul'},createdAt:1,updatedAt:1}).then(()=>1)`, 200)
  step('whole sign', `window.astro.settings.get().then(s=>{s.houseSystem='W';return window.astro.settings.set(s)}).then(()=>{location.reload();return 1})`, 3000)
  step('helpers4', HELPERS, 100)
  step('whole sign open', `(()=>{c('.chart-list .item .nm','Muhammad');return 1})()`, 1500)
  step('whole sign check', `(()=>{const l=[...document.querySelectorAll('svg .w-anglelabel')].map(x=>x.textContent.trim());const ac=l.find(x=>x.startsWith('AC'))||'';return ok('Tam burç: AC gerçek derecede',ac.startsWith('AC 19°'),l.join(' | '))})()`)
  step('sunrise open', `(()=>{c('.chart-list .item .nm','Gün doğumu');return 1})()`, 1500)
  step('sunrise info', `c('.view-tabs button','Natal Bilgiler')`, 900)
  step('sunrise sect', `(()=>{const t=document.querySelector('.natal-info').innerText;const rows=[...[...document.querySelectorAll('.natal-info table.data')].find(tb=>tb.innerText.includes('Yöneticinin evi')).querySelectorAll('tbody tr')].map(r=>r.cells[0].innerText);return ok('Tam burç: ufkun üstündeki Güneş gündüz haritası, 1. ev ASC diye etiketlenmiyor',t.includes('Gündüz haritası')&&!rows[0].includes('ASC'),rows[0])})()`)
  step('back to chart', `c('.view-tabs button','Harita')`, 500)
  step('settings open', `(()=>{document.querySelector('button[aria-label="Ayarlar"]').click();return 1})()`, 500)
  step('settings ai', `c('.modal .seg button, .modal button','Yapay zekâ')`, 400)
  step('key test ui', `(async()=>{const f=[...document.querySelectorAll('.modal fieldset')].find(x=>x.querySelector('legend').textContent.startsWith('OpenAI'));const i=f.querySelector('input[type=password]');setv(i,'sk-test');await new Promise(r=>setTimeout(r,50));const base=[...f.querySelectorAll('label')].find(l=>l.textContent.startsWith('Base URL')).querySelector('input');setv(base,'http://127.0.0.1:${mock}/401');await new Promise(r=>setTimeout(r,50));[...f.querySelectorAll('button')].find(b=>b.textContent.startsWith('Anahtarı test et')).click();await new Promise(r=>setTimeout(r,800));const e=f.querySelector('.ls-test .error');f.scrollIntoView();return ok('Ayarlar: Anahtarı test et hatayı gösteriyor',!!e&&/anahtar/i.test(e.textContent),e?.textContent)})()`, 300)
  step('guide open', `(()=>{const m=document.querySelector('.modal');if(!m)return 'FAIL ayarlar açılmadı: '+document.querySelectorAll('button[aria-label="Ayarlar"]').length;if(!m.querySelector('.ai-guide-link'))return 'FAIL sekme: '+[...m.querySelectorAll('.tabs button.on')].map(b=>b.textContent).join();c('.modal button.link','Bağlantı rehberi');return 1})()`, 400)
  step('guide check', `(()=>{const g=document.querySelector('.ai-guide');if(!g)return ok('Yapay zekâ bağlantı rehberi açılıyor',false,'yok');const tx=g.innerText;const tabs=[...g.querySelectorAll('[role=tab]')].map(b=>b.textContent);c('.ai-guide [role=tab]','Windows');return ok('Yapay zekâ bağlantı rehberi açılıyor (masaüstü uygulaması uyarısı, 4 yol, işletim sistemi sekmeleri)',tx.includes('Claude masaüstü uygulaması')&&g.querySelectorAll('section').length===5&&tabs.length===3)})()`, 300)
  step('guide windows', `(()=>{const tx=document.querySelector('.ai-guide').innerText;return ok('Rehberde Windows komutları',tx.includes('install.ps1')&&tx.includes('where.exe claude'))})()`)
  step('guide contrast', `(()=>{const bad=${CONTRAST}.filter(x=>!x.includes('[disabled]'));return ok('Kontrast (bağlantı rehberi)',bad.length===0,bad.slice(0,3).join(' || '))})()`)
  step('guide close', `c('.ai-guide footer button','Kapat')`, 300)
  step('guide closed', `(()=>{const r=ok('Rehber kapanınca ayarlar açık kalıyor',!document.querySelector('.ai-guide')&&!!document.querySelector('.ai-guide-link'));c('.modal .actions button','Vazgeç');return r})()`, 400)
  // Provider error messages: a fake server returns each HTTP status; the app must explain it in plain words.
  step('api errors', `(async()=>{const b='http://127.0.0.1:${mock}';const T=(p,code)=>window.astro.ai.testKey(p,'sk-test',b+'/'+code);const r={};for(const c of [200,401,402,429,400]) r[c]=await T('openai',c);const down=await window.astro.ai.testKey('deepseek','sk-test','http://127.0.0.1:1');const dns=await window.astro.ai.testKey('openai','sk-test','https://api.astrofree-e2e.invalid/v1');const none=await window.astro.ai.testKey('anthropic','',undefined);const checks=[['model listesi (sohbet modelleri)',JSON.stringify(r[200].models)==='["gpt-5.5","gpt-5-mini"]'],['401 anahtar',/anahtar/i.test(r[401].error||'')],['402 bakiye',/bakiye/.test(r[402].error||'')&&/aboneliklerden ayrı/.test(r[402].error)],['429 sınır',/İstek sınırına/.test(r[429].error||'')],['400 ülke',/ülkeden/.test(r[400].error||'')],['kapalı yerel sunucu',/Sunucu çalışıyor mu/.test(down.error||'')],['internet yok',/İnternet bağlantınızı/.test(dns.error||'')],['anahtar yok',/Önce API anahtarını/.test(none.error||'')]];const bad=checks.filter(c=>!c[1]).map(c=>c[0]);return ok('API hata mesajları anlaşılır (8 durum)',bad.length===0,bad.join(', ')+' '+JSON.stringify({r,down,dns}).slice(0,300))})()`)
  step('cli missing', `(async()=>{const s=await window.astro.settings.get();const keep=JSON.parse(JSON.stringify(s.ai.providers));s.ai.providers['claude-code'].command='claude-e2e-yok';s.ai.providers.codex.command='codex-e2e-yok';await window.astro.settings.set(s);const st=await window.astro.ai.detect();s.ai.providers=keep;await window.astro.settings.set(s);const cc=st.find(x=>x.id==='claude-code'),cx=st.find(x=>x.id==='codex');return ok('Komut bulunamayınca açıklama (Claude Code, Codex)',!cc.available&&!cx.available&&/(bulunamadı|masaüstü uygulaması)/.test(cc.detail)&&/(bulunamadı|ChatGPT uygulaması)/.test(cx.detail),cc.detail+' | '+cx.detail)})()`)
  step('local provider', `window.astro.settings.get().then(s=>{s.ai.provider='local';s.ai.providers.local.baseUrl='http://127.0.0.1:1/v1';return window.astro.settings.set(s)}).then(()=>{location.reload();return 1})`, 3000)
  step('helpers-local', HELPERS, 100)
  step('local open chat', `(()=>{if(!document.querySelector('.chat'))c('button','AI sohbet');return 1})()`, 1500)
  step('local link', `(()=>{const opt=[...document.querySelectorAll('.chat-head select option')].find(o=>o.value==='local');const l=[...document.querySelectorAll('.chat-status button.link')].find(b=>b.textContent==='Adres ve port');if(!l)return ok('Yerel sunucu: sohbetten adres ve port ayarına gidiliyor',false,document.querySelector('.chat-status')?.innerText);l.click();return ok('Yerel sunucu adı sadeleşti',/Yerel sunucu$/.test(opt.textContent),opt.textContent)})()`, 600)
  step('local settings', `(()=>{const f=document.getElementById('ai-provider-local');const r=ok('Yerel sunucu: sohbetten adres ve port ayarına gidiliyor',!!f&&f.classList.contains('focus-flash')&&!!f.querySelector('.ls-port input'));c('.modal .actions button','Vazgeç');return r})()`, 400)
  step('local back', `window.astro.settings.get().then(s=>{s.ai.provider='claude-code';return window.astro.settings.set(s)}).then(()=>{location.reload();return 1})`, 3000)
  step('helpers-local2', HELPERS, 100)
  step('settings open2', `(()=>{document.querySelector('button[aria-label="Ayarlar"]').click();return 1})()`, 500)
  step('settings general', `(()=>{c('.modal .tabs button','Genel');return 1})()`, 400)
  step('general layout', `(()=>{const L=[...document.querySelectorAll('.modal legend')].map(l=>l.textContent);return ok('Genel: dil ve tema bir başlık altında',L[0]==='Dil ve görünüm'&&!!document.querySelector('.modal fieldset .form-grid select'),L.join(' | '))})()`, 300)
  step('settings aspects', `(()=>{c('.modal .tabs button','Açılar ve orb');return 1})()`, 400)
  step('aspect colours', `(()=>{const col=k=>{const e=document.createElement('span');e.style.color='var(--asp-'+k+')';document.body.appendChild(e);const v=getComputedStyle(e).color;e.remove();return v};const c0=col('conjunction'),sq=col('square'),tr=col('trine'),qx=col('quincunx'),ss=col('semisquare'),q=col('quintile');const d=new Set([c0,sq,tr,qx,ss,q]);const r=ok('Açı renkleri klasik düzende (kavuşum nötr, kare ailesi kırmızı, quincunx yeşil, kuintil mor)',d.size===6&&col('opposition')===sq&&col('sextile')===tr&&col('semisextile')===qx&&col('sesquiquadrate')===ss&&col('biquintile')===q,[...d].join(' '));return r})()`, 300)
  step('settings close2', `c('.modal .actions button','Vazgeç')`, 300)
  step('house system back', `window.astro.settings.get().then(s=>{s.houseSystem='B';return window.astro.settings.set(s)}).then(()=>{location.reload();return 1})`, 3000)
  step('helpers5', HELPERS, 100)
  step('reopen', `(()=>{c('.chart-list .item .nm','Muhammad');return 1})()`, 1500)
  for (const theme of ['light', 'dark']) {
    step('theme ' + theme, `(()=>{if(!document.getElementById('e2e-no-anim')){const st=document.createElement('style');st.id='e2e-no-anim';st.textContent='*,*::before,*::after{transition:none!important;animation:none!important}';document.head.appendChild(st)}document.documentElement.setAttribute('data-theme','${theme}');return 1})()`, 400)
    for (const v of ['Harita', 'Natal Bilgiler', 'Bilgi Bankası']) {
      step('view ' + v, `c('.view-tabs button','${v}')`, 900)
      step('contrast ' + theme + v, `(()=>{const bad=${CONTRAST}.filter(x=>!x.includes('[disabled]'));return ok('Kontrast (${theme}, ${v})',bad.length===0,bad.slice(0,3).join(' || '))})()`)
    }
  }
  step('interp', `window.astro.interp.add({id:'i1',chartId:'x',title:'t',content:'c',provider:'test',createdAt:Date.now()}).then(a=>ok('Yorum arşivi',a.length===1))`)
  if (ai) {
    step('claude', `aiAsk('claude-code','','Sadece "tamam" yaz.').then(r=>(r.startsWith('OK')?'PASS ':'FAIL ')+'Claude Code — '+r)`)
    step('codex', `aiAsk('codex','gpt-5.6-luna','Sadece "tamam" yaz.').then(r=>(r.startsWith('OK')?'PASS ':'FAIL ')+'Codex — '+r)`)
  } else step('ai', `'SKIP AI sağlayıcıları (E2E_AI=1 ile çalıştırın)'`)
  return S
}

module.exports = { steps }

// Simple visual novel engine with 3 choices: bad, meh, good

const state = {
  current: 'scene1',
  scenes: {},
  typing: false
}

async function loadScenes(){
  const res = await fetch('data/scenes.json');
  state.scenes = await res.json();
}

function $(sel){return document.querySelector(sel)}

// Remove text animation: set text immediately
function typeText(targetEl, text){
  state.typing = false;
  targetEl.textContent = text || '';
}

function clearChoices(){
  const choicesEl = $('#choices');
  choicesEl.innerHTML = '';
}

function renderScene(id){
  const scene = state.scenes[id];
  if(!scene) return console.error('Scene not found',id);
  state.current = id;

  // background
  // background images removed — atmosphere is conveyed through text and UI

  // text (typewriter)
  const textEl = $('#text');
  clearChoices();
  typeText(textEl, scene.text || '');

  // build an array of available choices then shuffle them so players must read
  const keys = ['bad','meh','good'];
  const choicesEl = $('#choices');
  const choicesArray = [];
  keys.forEach((k)=>{
    const opt = scene.choices[k];
    if(!opt) return;
    choicesArray.push({ kind: k, opt });
  });

  // Fisher-Yates shuffle
  for(let i = choicesArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = choicesArray[i];
    choicesArray[i] = choicesArray[j];
    choicesArray[j] = tmp;
  }

  // render shuffled choices; keyboard keys 1/2/3 will map to the displayed order
  choicesArray.forEach((choice, idx) => {
    const k = choice.kind;
    const opt = choice.opt;
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.setAttribute('data-kind', k);
    btn.setAttribute('role', 'listitem');
    // keep an aria-label for screen readers, but the visible kind label was removed
    btn.setAttribute('aria-label', `${k} choice ${idx+1}: ${opt.text}`);
    btn.tabIndex = 0;

    const computedVibe = typeof opt.vibe === 'number' ? opt.vibe : (k === 'good' ? 10 : (k === 'bad' ? -10 : 0));
    btn.dataset.vibe = String(computedVibe);
    btn.dataset.good = k === 'good' ? '1' : '0';

    const t = document.createElement('div');
    t.className = 'text';
    t.textContent = opt.text;

    btn.appendChild(t);
    btn.addEventListener('click', ()=>applyChoice(k,opt,btn));
    choicesEl.appendChild(btn);
  });
}

function applyChoice(kind,opt,btn){
  if(state.typing){
    // finish typing instantly
    const textEl = $('#text');
    textEl.textContent = state.scenes[state.current].text || '';
    state.typing = false;
    return;
  }

  // Check if this is a good choice that requires a minigame
  if(kind === 'good' && opt.next){
    if(window.minigameHandler.isChoiceLocked(state.current, opt.text)) {
      // This choice is locked due to previous failure
      textEl.textContent = 'You must try something else - that path is blocked for now.';
      return;
    }
    
    // Launch minigame for good choices with next scenes
    window.minigameHandler.launchMinigame(
      state.current, 
      opt.text,
      () => {
        // On win - proceed to next scene
        setTimeout(() => renderScene(opt.next), 250);
      },
      () => {
        // On lose - update text and lock the choice
        textEl.textContent = 'You failed the challenge. Perhaps try another path for now...';
      }
    );
    return;
  }

  // For non-good choices or endings, proceed normally
  if(opt.next){
    setTimeout(() => renderScene(opt.next), 250);
  } else if(opt.end){
    setTimeout(() => endGame(opt.end), 250);
  }
}

function endGame(text){
  const textEl = $('#text');
  typeText(textEl, text || 'The End');
  clearChoices();
}

// keyboard handling: 1 = bad, 2 = meh, 3 = good. Space to advance if typing.
document.addEventListener('keydown', (e)=>{
  const key = e.key;
  if(key === '1' || key === '2' || key === '3'){
    const idx = { '1':0,'2':1,'3':2 }[key];
    const choices = $('#choices').children;
    if(choices && choices[idx]) choices[idx].click();
  }
});

// (Text animation removed — clicks no longer need to finish typewriter.)

async function start(){
  await loadScenes();
  renderScene(state.current);
}

start().catch(err=>console.error(err));

// --- Save / Load / Menu system ---
const SAVE_PREFIX = 'vibe_save_';

function getSaveKey(slot){ return `${SAVE_PREFIX}${slot}` }

function saveToSlot(slot){
  const payload = {
    current: state.current,
    timestamp: Date.now()
  };
  try{
    localStorage.setItem(getSaveKey(slot), JSON.stringify(payload));
    updateSlotPreviews();
    // show a random ad when the player saves
    try{ showSaveAd(); }catch(e){ console.error('Ad show failed', e); }
    return true;
  }catch(e){ console.error('Save failed',e); return false }
}

// Show a random advertisement overlay when the player saves.
// The overlay can only be dismissed by clicking the image itself.
function showSaveAd(){
  const ads = [
    'assets/ads/ad-fluff-soda.svg',
    'assets/ads/ad-nebula-socks.svg',
    'assets/ads/ad-quantum-toaster.svg',
    'assets/ads/ad-pocket-turnip.svg',
    'assets/ads/ad-glow-mud.svg',
    'assets/ads/ad-gamble-away.svg'
  ];
  const links = {
    'assets/ads/ad-fluff-soda.svg': 'https://www.thekitchn.com/viral-fluffy-coke-recipe-review-23671111',
    'assets/ads/ad-gamble-away.svg': 'https://henry6197.github.io/OrangeCasino/',
    'assets/ads/ad-glow-mud.svg': 'https://www.yardenit.com/shop/uncategorized/ein-gedi-black-mud-shampoo/',
    'assets/ads/ad-nebula-socks.svg': 'https://www.sockittome.com/products/mens-helix-nebula-crew-socks-mef0390?srsltid=AfmBOorp3YDPCgGQECsud333Clg3Y6f0LA-dHJURmbMm5R_1SJ8OAP54',
    'assets/ads/ad-pocket-turnip.svg': 'https://www.etsy.com/listing/855553910/crochet-turnip-plushie-animal-crossing?ls=s&ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=positive+turnip&ref=sr_gallery-1-16&etp=1&content_source=5be3ceca-4809-4feb-ba80-63be65e182fe%253ALT2ed1a0bf551b872839b9579e259d710c40809b5c&organic_search_click=1&logging_key=5be3ceca-4809-4feb-ba80-63be65e182fe%3ALT2ed1a0bf551b872839b9579e259d710c40809b5c',
    'assets/ads/ad-quantum-toaster.svg': 'https://nyancat.fandom.com/wiki/Quantum_Toaster_Theory'
  };

  const pick = ads[Math.floor(Math.random()*ads.length)];
  const targetUrl = links[pick] || pick;
  // if an ad or notice is already present, don't stack
  if(document.getElementById('save-ad-overlay') || document.getElementById('save-ad-notice')) return;

  // small notice telling player an ad will appear in a few seconds
  const notice = document.createElement('div');
  notice.id = 'save-ad-notice';
  Object.assign(notice.style, {
    position: 'fixed', right: '18px', bottom: '18px', zIndex: 10000,
    background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '12px 14px', borderRadius: '8px',
    fontFamily: 'sans-serif', boxShadow: '0 6px 20px rgba(0,0,0,0.5)'
  });
  let countdown = 3;
  notice.innerHTML = `<div style="font-weight:700;margin-bottom:6px">Advertisement incoming</div><div style="font-size:13px">Showing in <span id=\"save-ad-countdown\">${countdown}</span>…</div>`;
  document.body.appendChild(notice);

  const tick = setInterval(()=>{
    countdown--;
    const el = document.getElementById('save-ad-countdown');
    if(el) el.textContent = String(countdown);
    if(countdown <= 0){
      clearInterval(tick);
      // remove notice
      if(notice && notice.parentNode) notice.parentNode.removeChild(notice);
      // now show the actual ad overlay
      showAdOverlay(pick, targetUrl);
    }
  }, 1000);
}

function showAdOverlay(pick, targetUrl){
  // create overlay
  const overlay = document.createElement('div');
  overlay.id = 'save-ad-overlay';
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.75)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 9999
  });

  // image
  const img = document.createElement('img');
  img.src = pick;
  img.alt = 'Advertisement';
  Object.assign(img.style, {
    maxWidth: '90%', maxHeight: '90%', cursor: 'pointer', boxShadow: '0 6px 30px rgba(0,0,0,0.6)', borderRadius: '8px'
  });

  // clicking the image opens link in a new tab and dismisses overlay
  img.addEventListener('click', ()=>{
    try{
      const w = window.open(targetUrl, '_blank');
      if(w) try{ w.opener = null; }catch(e){}
    }catch(e){ console.error('Open link failed', e); }
    if(overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  });

  // prevent clicks on overlay from closing it (only image closes)
  overlay.addEventListener('click', (e)=>{
    if(e.target !== img) e.stopPropagation();
  });

  overlay.appendChild(img);
  document.body.appendChild(overlay);
}

function loadFromSlot(slot){
  const raw = localStorage.getItem(getSaveKey(slot));
  if(!raw) return false;
  try{
    const payload = JSON.parse(raw);
  state.current = payload.current || state.current;
    renderScene(state.current);
    closeMenu();
    return true;
  }catch(e){ console.error('Load failed', e); return false }
}

function clearSlot(slot){
  localStorage.removeItem(getSaveKey(slot));
  updateSlotPreviews();
}

function getSlotData(slot){
  const raw = localStorage.getItem(getSaveKey(slot));
  if(!raw) return null;
  try{ return JSON.parse(raw) }catch(e){return null}
}

function updateSlotPreviews(){
  document.querySelectorAll('.slot').forEach(el=>{
    const slot = el.getAttribute('data-slot');
    const meta = el.querySelector('.slot-meta');
    const data = getSlotData(slot);
  if(!data) meta.textContent = 'empty';
  else meta.textContent = `${data.current} — ${new Date(data.timestamp).toLocaleString()}`;
  });
  // update main menu previews too
  document.querySelectorAll('.slot-preview').forEach(el=>{
    const slot = el.getAttribute('data-slot');
    const meta = el.querySelector('.meta');
    const data = getSlotData(slot);
  if(!data) meta.textContent = 'empty';
  else meta.textContent = `${data.current} — ${new Date(data.timestamp).toLocaleString()}`;
  });
}

// Menu open/close
function openMenu(){
  const overlay = $('#menu-overlay');
  overlay.removeAttribute('hidden');
  // focus first interactive element for accessibility
  const first = overlay.querySelector('button');
  if(first) first.focus();
  updateSlotPreviews();
}
function closeMenu(){
  $('#menu-overlay').setAttribute('hidden','');
}

// Wire menu buttons
document.addEventListener('click', (e)=>{
  const t = e.target;
  if(t.matches('#btn-menu')) openMenu();
  if(t.matches('#close-menu')) closeMenu();
  if(t.matches('#new-game')){

    state.current = 'scene1';
    renderScene(state.current);
    closeMenu();
  }
  if(t.matches('#continue')){
    // try to find latest save
    let latest = null;
    for(let i=1;i<=3;i++){
      const data = getSlotData(i);
      if(!data) continue;
      if(!latest || data.timestamp > latest.timestamp) latest = {slot:i, data};
    }
    if(latest) loadFromSlot(latest.slot);
    else { closeMenu(); }
  }

  if(t.matches('.save-slot')){
    const slot = t.closest('.slot').getAttribute('data-slot');
    if(saveToSlot(slot)){
      t.textContent = 'Saved';
      setTimeout(()=>{ t.textContent = 'Save' },1000);
    }
  }
  if(t.matches('.load-slot')){
    const slot = t.closest('.slot').getAttribute('data-slot');
    loadFromSlot(slot);
  }
  if(t.matches('.clear-slot')){
    const slot = t.closest('.slot').getAttribute('data-slot');
    clearSlot(slot);
  }
});

// Quick-save HUD button
document.addEventListener('click',(e)=>{
  if(e.target && e.target.id === 'btn-save'){
    // quick save to slot 1
    saveToSlot(1);
  }
});

// initialize slot previews on load
updateSlotPreviews();

// Close menu when clicking outside the menu card
document.addEventListener('click', (e)=>{
  const overlay = $('#menu-overlay');
  if(overlay && !overlay.hasAttribute('hidden')){
    const card = overlay.querySelector('#menu-card');
    if(card && !card.contains(e.target) && !e.target.matches('#btn-menu')){
      closeMenu();
    }
  }
});

// Close menu with Escape key
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    const overlay = $('#menu-overlay');
    if(overlay && !overlay.hasAttribute('hidden')){
      closeMenu();
    }
  }
});

// --- Main menu wiring ---
function showMainMenu(){
  // show main menu, hide in-game menu and game UI
  document.getElementById('main-menu').style.display = 'flex';
  document.getElementById('game').style.display = 'none';
  updateSlotPreviews();
}
function hideMainMenu(){
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('game').style.display = '';
}

// Show main menu by default on app start
showMainMenu();

document.addEventListener('click', (e)=>{
  const t = e.target;
  if(t.matches('#main-new-game')){
    hideMainMenu();
     state.current = 'scene1'; renderScene(state.current);
  }
  if(t.matches('#main-continue')){
    // Instead of auto-loading the most recent save, ask the player which slot to continue from
    // Open the in-game menu which lists save slots so the player can choose
    hideMainMenu();
    openMenu();
  }
  if(t.matches('#quit-to-main')){
    // close in-game menu and return to main menu
    closeMenu();
    showMainMenu();
  }
});

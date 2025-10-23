// Simple visual novel engine with 3 choices: bad, meh, good

const state = {
  courage: 0,
  current: 'scene1',
  scenes: {},
  typing: false
}

async function loadScenes(){
  const res = await fetch('data/scenes.json');
  state.scenes = await res.json();
}

function $(sel){return document.querySelector(sel)}

// typewriter effect for dialogue text
async function typeText(targetEl, text){
  state.typing = true;
  targetEl.textContent = '';
  for(let i=0;i<text.length;i++){
    targetEl.textContent += text[i];
    // small delay
    await new Promise(r=>setTimeout(r, 16 + Math.random()*24));
  }
  state.typing = false;
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
  const bg = $('#bg');
  if(scene.background) bg.src = scene.background; else bg.removeAttribute('src');

  // text (typewriter)
  const textEl = $('#text');
  clearChoices();
  typeText(textEl, scene.text || '');

  // choices are expected to be exactly 3: bad, meh, good
  const keys = ['bad','meh','good'];
  const choicesEl = $('#choices');

  keys.forEach((k, idx)=>{
    const opt = scene.choices[k];
    if(!opt) return;
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.setAttribute('data-kind',k);
    btn.setAttribute('role','listitem');
    btn.setAttribute('aria-label', `${k} choice ${idx+1}: ${opt.text}`);
    btn.tabIndex = 0;

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = k.toUpperCase();

    const t = document.createElement('div');
    t.className = 'text';
    t.textContent = opt.text;

    btn.appendChild(label);
    btn.appendChild(t);

    btn.addEventListener('click', ()=>applyChoice(k,opt));

    choicesEl.appendChild(btn);
  });
}

function applyChoice(kind,opt){
  if(state.typing){
    // finish typing instantly
    const textEl = $('#text');
    textEl.textContent = state.scenes[state.current].text || '';
    state.typing = false;
    return;
  }

  // adjust vibe: each choice may carry a delta (e.g., -10,0,+10)
  const delta = typeof opt.vibe === 'number' ? opt.vibe : (kind==='good'?10: kind==='bad'?-10:0);
  state.courage += delta;
  const scoreEl = document.getElementById('courage-score') || document.getElementById('vibe-score');
  scoreEl.textContent = state.courage;

  // go to next scene (if provided) or end
  if(opt.next){
    // small delay for UX
    setTimeout(()=>renderScene(opt.next),250);
  } else if(opt.end){
    setTimeout(()=>endGame(opt.end),250);
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
  if(state.typing && (key === ' ' || key === 'Spacebar')){
    // finish current text
    const textEl = $('#text');
    textEl.textContent = state.scenes[state.current].text || '';
    state.typing = false;
    return;
  }
  if(key === '1' || key === '2' || key === '3'){
    const idx = { '1':0,'2':1,'3':2 }[key];
    const choices = $('#choices').children;
    if(choices && choices[idx]) choices[idx].click();
  }
});

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
    courage: state.courage,
    timestamp: Date.now()
  };
  try{
    localStorage.setItem(getSaveKey(slot), JSON.stringify(payload));
    updateSlotPreviews();
    return true;
  }catch(e){ console.error('Save failed',e); return false }
}

function loadFromSlot(slot){
  const raw = localStorage.getItem(getSaveKey(slot));
  if(!raw) return false;
  try{
    const payload = JSON.parse(raw);
  state.current = payload.current || state.current;
  state.courage = typeof payload.courage === 'number' ? payload.courage : state.courage;
  const scoreEl = document.getElementById('courage-score') || document.getElementById('vibe-score');
  scoreEl.textContent = state.courage;
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
  else meta.textContent = `${data.current} — Courage ${data.courage} — ${new Date(data.timestamp).toLocaleString()}`;
  });
  // update main menu previews too
  document.querySelectorAll('.slot-preview').forEach(el=>{
    const slot = el.getAttribute('data-slot');
    const meta = el.querySelector('.meta');
    const data = getSlotData(slot);
  if(!data) meta.textContent = 'empty';
  else meta.textContent = `${data.current} — Courage ${data.courage} — ${new Date(data.timestamp).toLocaleString()}`;
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
     state.courage = 0;
     $('#courage-score').textContent = 0;
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
     state.courage = 0; $('#courage-score').textContent = 0; state.current = 'scene1'; renderScene(state.current);
  }
  if(t.matches('#main-continue')){
    // same logic as Continue: pick most recent slot
    let latest = null;
    for(let i=1;i<=3;i++){
      const data = getSlotData(i);
      if(!data) continue;
      if(!latest || data.timestamp > latest.timestamp) latest = {slot:i, data};
    }
    if(latest){ hideMainMenu(); loadFromSlot(latest.slot); }
  }
  if(t.matches('#quit-to-main')){
    // close in-game menu and return to main menu
    closeMenu();
    showMainMenu();
  }
});

// Dev/test UI wiring
document.addEventListener('click', (e)=>{
  // Help button and video handling
  if(e.target && e.target.id === 'help-btn') {
    const overlay = document.getElementById('help-overlay');
    const video = document.getElementById('help-video');
    overlay.removeAttribute('hidden');
    video.play();
  }

  // Close help overlay
  if(e.target && (e.target.id === 'close-help' || e.target.id === 'help-overlay')) {
    const overlay = document.getElementById('help-overlay');
    const video = document.getElementById('help-video');
    overlay.setAttribute('hidden', '');
    video.pause();
    video.currentTime = 0;
  }

  // Legacy dev button handling - keeping for reference
  if(false && e.target.id === 'dev-test-btn'){
    document.getElementById('dev-dimmer-preview').removeAttribute('hidden');
  }
  if(e.target && e.target.id === 'dev-close'){
    document.getElementById('dev-dimmer-preview').setAttribute('hidden','');
  }
  if(e.target && e.target.id === 'dev-toggle-dimmer'){
    document.getElementById('bg').style.filter = (document.getElementById('bg').style.filter||'') + ' brightness(.35)';
  }
  // fallback: if any element with data-game is clicked, open the minigame overlay
  const el = e.target && e.target.closest && e.target.closest('[data-game]');
  if(el){
    e.preventDefault && e.preventDefault();
    const game = el.getAttribute('data-game');
    try{ if(window.openMinigame) openMinigame(game); else window.dispatchEvent(new CustomEvent('dev-open-minigame',{detail:{game}})); }catch(err){ console.error(err); }
    // hide dev dimmer if present
    const dlg = document.getElementById('dev-dimmer-preview'); if(dlg) dlg.setAttribute('hidden','');
  }
});

// Close help overlay with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const overlay = document.getElementById('help-overlay');
    const video = document.getElementById('help-video');
    if (overlay && !overlay.hasAttribute('hidden')) {
      overlay.setAttribute('hidden', '');
      video.pause();
      video.currentTime = 0;
    }
  }
});;

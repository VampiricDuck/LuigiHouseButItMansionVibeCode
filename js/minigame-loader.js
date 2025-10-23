// Simple loader that fetches an HTML file and injects it into a container
// Exposes load(path, container, onReady) and unload(container)
window.MiniGameLoader = (function(){
  async function load(path, container, onReady){
    container.innerHTML = '<div class="mg-loading">Loading...</div>';
    try{
      const res = await fetch(path);
      if(!res.ok) throw new Error('Failed to load '+path);
      const html = await res.text();
      // Inject the HTML into a wrapper to keep scope isolated
      container.innerHTML = html;
      if(onReady) onReady(container);
    }catch(err){
      console.error(err);
      container.innerHTML = `<div class="mg-error">Could not load game: ${err.message}</div>`;
    }
  }
  function unload(container){ container.innerHTML = ''; }
  return {load, unload};
})();

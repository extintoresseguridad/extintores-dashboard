// Núcleo de estado preparado para la migración progresiva desde app.js.
// No fuerza todavía un cambio de arquitectura: los módulos existentes pueden
// adoptar este store uno por uno sin romper la aplicación actual.
(function(){
  function createStore(initialState = {}){
    let state = { ...initialState };
    const listeners = new Set();

    return {
      get(){ return state; },
      set(patch){
        state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
        listeners.forEach(listener => {
          try{ listener(state); }catch(e){ console.error('Error en listener de estado', e); }
        });
        return state;
      },
      subscribe(listener){
        if(typeof listener !== 'function') return () => {};
        listeners.add(listener);
        return () => listeners.delete(listener);
      }
    };
  }

  window.ExtintoresCore = window.ExtintoresCore || {};
  window.ExtintoresCore.createStore = createStore;
})();

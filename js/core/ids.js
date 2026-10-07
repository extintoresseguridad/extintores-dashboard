// Generación centralizada de identificadores.
(function(){
  const IDs = {
    uid(prefix = 'ext'){
      if(window.crypto && typeof window.crypto.randomUUID === 'function'){
        return `${prefix}_${window.crypto.randomUUID()}`;
      }
      return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
    }
  };

  window.ExtintoresCore = window.ExtintoresCore || {};
  window.ExtintoresCore.ids = IDs;
})();

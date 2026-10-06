// Adaptador pequeño para almacenamiento local. Los módulos no deberían depender directamente de localStorage.
(function(){
  const Storage = {
    read(key, fallback = null){
      try{
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      }catch(e){ return fallback; }
    },
    write(key, value){
      try{
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      }catch(e){ return false; }
    },
    readSet(key){
      const value = this.read(key, []);
      return new Set(Array.isArray(value) ? value : []);
    },
    writeSet(key, set){
      return this.write(key, [...set]);
    },
    test(){
      const key = '__extintores_storage_test__';
      try{
        localStorage.setItem(key, '1');
        localStorage.removeItem(key);
        return true;
      }catch(e){ return false; }
    }
  };

  window.ExtintoresCore = window.ExtintoresCore || {};
  window.ExtintoresCore.storage = Storage;
})();

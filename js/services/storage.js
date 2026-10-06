(function(){
  const KEY=(window.CRMData&&window.CRMData.AUTH_SESSION_KEY)||'extintores:session';
  function test(){try{const k='__crm_storage_test__'+Date.now();localStorage.setItem(k,'1');localStorage.removeItem(k);return true;}catch(e){return false;}}
  function get(key){try{return localStorage.getItem(key);}catch(e){return null;}}
  function set(key,value){try{localStorage.setItem(key,value);return true;}catch(e){return false;}}
  function remove(key){try{localStorage.removeItem(key);return true;}catch(e){return false;}}
  function getJSON(key,fallback=null){try{const raw=get(key);return raw?JSON.parse(raw):fallback;}catch(e){return fallback;}}
  function setJSON(key,value){try{return set(key,JSON.stringify(value));}catch(e){return false;}}
  window.CRMStorage={KEY,test,get,set,remove,getJSON,setJSON};
})();

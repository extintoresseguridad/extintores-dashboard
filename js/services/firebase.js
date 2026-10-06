(function(){
  function fetchConTimeout(url, options, timeoutMs){
    timeoutMs = timeoutMs || 15000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, Object.assign({}, options, { signal: controller.signal }))
      .finally(() => clearTimeout(timer));
  }
  function esperar(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }
  async function conReintentos(fn, intentos){
    let ultimoError = null;
    for(let i=0;i<intentos;i++){
      try{return await fn();}catch(e){
        ultimoError=e;
        if(i<intentos-1) await esperar(300*Math.pow(3,i));
      }
    }
    throw ultimoError;
  }
  function authHeaders(getAuth){
    const auth = typeof getAuth === 'function' ? getAuth() : null;
    return auth && auth.idToken ? {'Authorization':'Bearer '+auth.idToken} : {};
  }
  async function get({url,getAuth,refresh}){
    if(typeof refresh==='function') await refresh();
    const res=await fetchConTimeout(url,{headers:authHeaders(getAuth)});
    if(res.status===404) return null;
    if(!res.ok) throw new Error('firestore get failed: '+res.status);
    const data=await res.json();
    return data && data.fields && data.fields.data && data.fields.data.stringValue || null;
  }
  async function set({url,json,getAuth,refresh}){
    if(typeof refresh==='function') await refresh();
    const body={fields:{data:{stringValue:json}}};
    const res=await fetchConTimeout(url+'&updateMask.fieldPaths=data',{method:'PATCH',headers:Object.assign({'Content-Type':'application/json'},authHeaders(getAuth)),body:JSON.stringify(body)});
    if(!res.ok) throw new Error('firestore set failed: '+res.status);
  }
  window.CRMFirebase={fetchConTimeout,conReintentos,get,set};
})();

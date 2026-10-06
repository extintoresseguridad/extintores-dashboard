(function(window){
  'use strict';

  const storage = () => window.CRMStorage;
  const firebase = () => window.CRMFirebase;

  function saveSession(user){
    if(user) storage().setJSON(AUTH_SESSION_KEY, user);
    else storage().remove(AUTH_SESSION_KEY);
  }

  function loadSession(){
    return storage().getJSON(AUTH_SESSION_KEY, null);
  }

  function buildUser(data){
    return {
      uid: data.localId,
      email: data.email,
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      expiresAt: Date.now() + (parseInt(data.expiresIn,10) || 3600) * 1000,
    };
  }

  async function request(url, email, password){
    const res = await firebase().fetchConTimeout(url, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error && data.error.message || 'Error de autenticación');
    return data;
  }

  async function signUp(email, password){
    const data = await request(AUTH_SIGNUP_URL, email, password);
    const user = buildUser(data);
    saveSession(user);
    return user;
  }

  async function signIn(email, password){
    const data = await request(AUTH_SIGNIN_URL, email, password);
    const user = buildUser(data);
    saveSession(user);
    return user;
  }

  function signOut(){
    saveSession(null);
  }

  async function refreshIdTokenIfNeeded(user){
    if(!user) return null;
    if(user.expiresAt && Date.now() < user.expiresAt - 60000) return user;

    if(!user.refreshToken) return null;

    try{
      const res = await firebase().fetchConTimeout(AUTH_REFRESH_URL, {
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:'grant_type=refresh_token&refresh_token=' + encodeURIComponent(user.refreshToken)
      });
      if(!res.ok) return null;

      const data = await res.json();
      const updated = Object.assign({}, user, {
        idToken: data.id_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (parseInt(data.expires_in,10) || 3600) * 1000,
      });
      saveSession(updated);
      return updated;
    }catch(e){
      return null;
    }
  }

  async function init(){
    const user = loadSession();
    if(!user) return null;

    const refreshed = await refreshIdTokenIfNeeded(user);
    if(!refreshed) saveSession(null);
    return refreshed;
  }

  window.CRMAuth = {
    saveSession,
    loadSession,
    signUp,
    signIn,
    signOut,
    refreshIdTokenIfNeeded,
    init
  };
})(window);

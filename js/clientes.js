// Módulo de Clientes / Ficha 360°
// Helpers independientes extraídos de app.js. Se carga antes de app.js.
(function(){
  function clienteKey(rec){
    return (rec && rec.cliente || '').trim().toLowerCase();
  }
  function inicialesDe(nombre){
    const partes = (nombre||'').trim().split(/\s+/).filter(Boolean);
    if(partes.length === 0) return '?';
    if(partes.length === 1) return partes[0].slice(0,2).toUpperCase();
    return (partes[0][0] + partes[partes.length-1][0]).toUpperCase();
  }
  function telefonosTexto(c){
    const lista = (c && c.telefonos) || [];
    if(lista.length === 0) return '';
    return lista.join(' · ');
  }
  function perfilDeCliente(key, perfiles){
    const lista = Array.isArray(perfiles) ? perfiles : [];
    return lista.find(p => clienteKey(p) === key) || null;
  }
  const ETIQUETAS_CLIENTE = ['VIP','Corporativo','Residencial','Moroso'];
  function emptyPerfilCliente(){
    return { id:null, cliente:'', telefono:'', empresa:'', cedula:'', direccion:'', notas:'', etiquetas:[], extintores:[] };
  }
  window.CRMClientes = {
    clienteKey,
    inicialesDe,
    telefonosTexto,
    perfilDeCliente,
    emptyPerfilCliente,
    ETIQUETAS_CLIENTE
  };
})();

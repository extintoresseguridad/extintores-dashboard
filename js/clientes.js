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

  function extintorVacio(uid){ return { id: uid(), serie:'', tipo:'PQS ABC', capacidad:'', ubicacion:'', estado:'Activo', ultimoMantenimiento:'', proximoMantenimiento:'', trabajoRealizado:'', observaciones:'' }; }
  function extintoresPerfilHTML(lista, esc, tipos){
    tipos = Array.isArray(tipos) && tipos.length ? tipos : ['PQS ABC','CO2','Agua','Espuma','Otro'];
    const items=lista||[];
    if(!items.length) return '<div class="caja-hint" style="margin:0;">No hay extintores individuales registrados todavía.</div>';
    return items.map((e,i)=>`
      <div class="perfil-extintor" data-extintor-id="${esc(e.id)}">
        <div class="linea-head"><b>Extintor ${i+1}</b><button type="button" class="linea-remove" data-quitar-extintor="${esc(e.id)}">Quitar</button></div>
        <div class="form-row"><div><label>ID / Serie</label><input class="pf-ext-serie" value="${esc(e.serie||'')}" placeholder="Ej. EXT-001"/></div><div><label>Tipo</label><select class="pf-ext-tipo">${tipos.map(t=>`<option ${t===e.tipo?'selected':''}>${t}</option>`).join('')}</select></div></div>
        <div class="form-row"><div><label>Capacidad</label><input class="pf-ext-capacidad" value="${esc(e.capacidad||'')}" placeholder="Ej. 10 lb"/></div><div><label>Ubicación</label><input class="pf-ext-ubicacion" value="${esc(e.ubicacion||'')}" placeholder="Recepción, cocina, bodega..."/></div></div>
        <div class="form-row"><div><label>Estado</label><select class="pf-ext-estado">${['Activo','En mantenimiento','Fuera de servicio','Reemplazado'].map(x=>`<option ${x===e.estado?'selected':''}>${x}</option>`).join('')}</select></div><div><label>Último mantenimiento</label><input type="date" class="pf-ext-ultimo" value="${esc(e.ultimoMantenimiento||'')}"/></div></div>
        <div class="form-row"><div><label>Próximo mantenimiento</label><input type="date" class="pf-ext-proximo" value="${esc(e.proximoMantenimiento||'')}"/></div><div><label>Trabajo realizado</label><input class="pf-ext-trabajo" value="${esc(e.trabajoRealizado||'')}" placeholder="Recarga, prueba, repintado..."/></div></div>
        <div class="form-row full"><div><label>Observaciones</label><textarea class="pf-ext-observaciones" placeholder="Detalles del equipo...">${esc(e.observaciones||'')}</textarea></div></div>
      </div>`).join('');
  }
  function capturarExtintoresPerfil(){
    return Array.from(document.querySelectorAll('.perfil-extintor')).map(el=>({
      id:el.getAttribute('data-extintor-id')||String(Date.now()+Math.random()),
      serie:el.querySelector('.pf-ext-serie')?.value.trim()||'',
      tipo:el.querySelector('.pf-ext-tipo')?.value||'PQS ABC',
      capacidad:el.querySelector('.pf-ext-capacidad')?.value.trim()||'',
      ubicacion:el.querySelector('.pf-ext-ubicacion')?.value.trim()||'',
      estado:el.querySelector('.pf-ext-estado')?.value||'Activo',
      ultimoMantenimiento:el.querySelector('.pf-ext-ultimo')?.value||'',
      proximoMantenimiento:el.querySelector('.pf-ext-proximo')?.value||'',
      trabajoRealizado:el.querySelector('.pf-ext-trabajo')?.value.trim()||'',
      observaciones:el.querySelector('.pf-ext-observaciones')?.value.trim()||''
    }));
  }

  window.CRMClientes = {
    clienteKey,
    inicialesDe,
    telefonosTexto,
    perfilDeCliente,
    emptyPerfilCliente,
    ETIQUETAS_CLIENTE,
    extintorVacio,
    extintoresPerfilHTML,
    capturarExtintoresPerfil
  };
})();

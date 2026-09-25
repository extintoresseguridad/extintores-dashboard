// Módulo independiente para Órdenes de Trabajo.
// No depende de variables globales: app.js le entrega los datos y utilidades necesarias.
(function(){
  function extintoresOrdenHTML(cliente, selectedIds, clientesPerfil, clienteKey, esc){
    const perfil = (clientesPerfil || []).find(p=>clienteKey(p)===clienteKey({cliente}));
    const lista = (perfil && perfil.extintores) || [];
    if(!lista.length) return '<div class="caja-hint" style="margin:0;">Este cliente no tiene extintores individuales registrados en su Ficha 360°. Puedes registrarlos primero desde el perfil.</div>';
    return '<div class="orden-extintores-grid">'+lista.map(e=>'<label class="orden-extintor-check"><input type="checkbox" class="f-extintor-link" value="'+esc(e.id)+'" '+((selectedIds||[]).includes(e.id)?'checked':'')+'/><span><b>'+esc(e.serie||'Sin serie')+'</b> · '+esc(e.tipo||'')+' '+(e.capacidad?'· '+esc(e.capacidad):'')+'<small>'+(e.ubicacion?esc(e.ubicacion)+' · ':'')+esc(e.estado||'Activo')+'</small></span></label>').join('')+'</div>';
  }
  function actualizarHistorialExtintores(cliente, selectedIds, fechaServicio, fechaProximo, servicios, observaciones, clientesPerfil, clienteKey){
    if(!selectedIds || !selectedIds.length) return clientesPerfil;
    const ids = new Set(selectedIds);
    return (clientesPerfil || []).map(p=>{
      if(clienteKey(p)!==clienteKey({cliente}) || !p.extintores) return p;
      return {...p, extintores:p.extintores.map(e=>ids.has(e.id)?{...e, estado:'Activo', ultimoMantenimiento:fechaServicio || e.ultimoMantenimiento || '', proximoMantenimiento:fechaProximo || e.proximoMantenimiento || '', trabajoRealizado:(servicios||[]).join(', ') || e.trabajoRealizado || '', observaciones:observaciones || e.observaciones || ''}:e)};
    });
  }
  window.CRMOrders = { extintoresOrdenHTML, actualizarHistorialExtintores };
})();

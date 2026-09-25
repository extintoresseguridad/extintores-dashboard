// Módulo de Referidos — separación progresiva.
(function(){
  function renderReferidos(referidos, esc){
    referidos = Array.isArray(referidos) ? referidos : [];
    const confirmados=referidos.filter(r=>r.estado==='confirmado'), pendientes=referidos.filter(r=>r.estado==='pendiente');
    const credito=confirmados.reduce((s,r)=>s+(parseFloat(r.credito)||0),0);
    return `<div class="cliente-seguro-view view-fade"><div class="cs-hero"><div><h2>🔥 Programa de Referidos</h2><p>Cliente que recomienda</p><div class="quote">Programa independiente de Cliente Seguro. Los resultados se consolidan en el Dashboard.</div></div><div class="cs-hero-actions"><button class="btn-primary" id="ref-nuevo">+ Registrar referido</button></div></div>
      <div class="cs-section"><h3>Resumen</h3><span>Referidos y créditos</span></div><div class="cs-two"><div class="cs-panel"><div class="cs-benefit-grid">
      <div class="cs-benefit">🔥 Total: <b>${referidos.length}</b></div><div class="cs-benefit">🟢 Confirmados: <b>${confirmados.length}</b></div><div class="cs-benefit">🟠 Pendientes: <b>${pendientes.length}</b></div><div class="cs-benefit">💰 Créditos: <b>₡${credito.toLocaleString('es-CR')}</b></div>
      </div></div></div><div class="cs-section"><h3>Historial</h3><span>${referidos.length} registro(s)</span></div><div class="cs-panel">${referidos.length?`<div class="cs-active-list">${referidos.map(r=>`<div class="cs-active-row"><div class="cs-active-main"><b>${esc(r.referidor||'')} → ${esc(r.referido||'')}</b><span>${esc(r.fecha||'—')} · ${esc(r.servicio||'Sin servicio')} · ₡${(parseFloat(r.credito)||0).toLocaleString('es-CR')}</span></div><span class="cs-status">${esc(r.estado||'pendiente')}</span></div>`).join('')}</div>`:'<div class="dash-empty">Todavía no hay referidos registrados.</div>'}</div></div>`;
  }

  function abrirNuevoReferido({referidos, setReferidos, persist, todayISO, showToast}){
    referidos = Array.isArray(referidos) ? referidos : [];
    const o=document.createElement('div'); o.className='overlay referido-overlay';
    o.innerHTML=`<div class="modal" style="max-width:680px"><div class="modal-head"><h2>Registrar referido</h2><button id="ref-close">×</button></div><div class="modal-body">
      <div class="form-row"><div><label>Cliente que recomienda *</label><input id="ref-r"></div><div><label>Teléfono</label><input id="ref-tr"></div></div><div class="form-row"><div><label>Cliente referido *</label><input id="ref-n"></div><div><label>Teléfono</label><input id="ref-tn"></div></div>
      <div class="form-row"><div><label>Fecha</label><input type="date" id="ref-f" value="${todayISO()}"></div><div><label>Servicio</label><input id="ref-s" placeholder="Primera recarga"></div></div><div class="form-row"><div><label>Crédito</label><input type="number" id="ref-c" value="5000" step="5000"></div><div><label>Estado</label><select id="ref-e"><option value="pendiente">Pendiente</option><option value="confirmado">Confirmado</option><option value="rechazado">Rechazado</option></select></div></div></div><div class="modal-foot"><button class="btn-ghost" id="ref-cancel">Cancelar</button><button class="btn-primary" id="ref-save">Registrar referido</button></div></div>`;
    document.body.appendChild(o);
    const close=()=>o.remove();
    document.getElementById('ref-close').onclick=close;
    document.getElementById('ref-cancel').onclick=close;
    document.getElementById('ref-save').onclick=async()=>{
      const a=document.getElementById('ref-r').value.trim(), b=document.getElementById('ref-n').value.trim();
      if(!a||!b){showToast('El referidor y el nuevo cliente son obligatorios.');return;}
      const nuevo={id:String(Date.now()),referidor:a,telefonoReferidor:document.getElementById('ref-tr').value.trim(),referido:b,telefonoReferido:document.getElementById('ref-tn').value.trim(),fecha:document.getElementById('ref-f').value,servicio:document.getElementById('ref-s').value.trim(),credito:parseFloat(document.getElementById('ref-c').value)||0,estado:document.getElementById('ref-e').value};
      setReferidos([nuevo,...referidos]);
      if(await persist()){close();showToast('Referido registrado.');}
    };
  }

  window.CRMReferidos={renderReferidos,abrirNuevoReferido};
})();
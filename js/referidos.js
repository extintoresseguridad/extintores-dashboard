// Módulo de Referidos — separación progresiva.
(function(){
  function renderReferidos(referidos, esc){
    referidos = Array.isArray(referidos) ? referidos : [];
    const confirmados=referidos.filter(r=>r.estado==='confirmado'), pendientes=referidos.filter(r=>r.estado==='pendiente');
    const credito=confirmados.reduce((s,r)=>s+(parseFloat(r.credito)||0),0);
    return `<div class="referidos-view view-fade"><div class="ref-hero"><div><h2>🔥 Programa de Referidos</h2><p>Cliente que recomienda</p><div class="quote">Programa independiente de referidos. Los resultados se consolidan en el Dashboard.</div></div><div class="ref-hero-actions"><button class="btn-primary" id="ref-nuevo">+ Registrar referido</button></div></div>
      <div class="ref-section"><h3>Resumen</h3><span>Referidos y créditos</span></div><div class="ref-two"><div class="ref-panel"><div class="ref-benefit-grid">
      <div class="ref-benefit">🔥 Total: <b>${referidos.length}</b></div><div class="ref-benefit">🟢 Confirmados: <b>${confirmados.length}</b></div><div class="ref-benefit">🟠 Pendientes: <b>${pendientes.length}</b></div><div class="ref-benefit">💰 Créditos: <b>₡${credito.toLocaleString('es-CR')}</b></div>
      </div></div></div><div class="ref-section"><h3>Historial</h3><span>${referidos.length} registro(s)</span></div><div class="ref-panel">${referidos.length?`<div class="ref-active-list">${referidos.map(r=>`<div class="ref-active-row"><div class="ref-active-main"><b>${esc(r.referidor||'')} → ${esc(r.referido||'')}</b><span>${esc(r.fecha||'—')} · ${esc(r.servicio||'Sin servicio')} · ₡${(parseFloat(r.credito)||0).toLocaleString('es-CR')}</span></div><span class="ref-status">${esc(r.estado||'pendiente')}</span></div>`).join('')}</div>`:'<div class="dash-empty">Todavía no hay referidos registrados.</div>'}</div></div>`;
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
// Módulo preparado para Programa Cliente Seguro.
// En esta etapa NO se carga desde index.html: se mantiene inactivo para proteger la estabilidad del CRM.
// La activación se hará en un cambio separado, después de verificar dependencias.
(function(){
  const CLIENTE_SEGURO_PLANES = {
    cliente_seguro:{nombre:'Cliente Seguro',equipos:'1–5 equipos',precio:15000,beneficios:['Registro de los extintores.','Historial de mantenimiento.','Recordatorio de mantenimiento.','Revisión visual preventiva.','Atención por WhatsApp.','Precio preferencial en determinados servicios.']},
    cliente_seguro_plus:{nombre:'Cliente Seguro Plus',equipos:'6–15 equipos',precio:25000,beneficios:['Todo lo anterior.','Prioridad de atención.','Coordinación programada.','Beneficio adicional por volumen.','Seguimiento de equipos pendientes.']},
    cliente_seguro_empresa:{nombre:'Cliente Seguro Empresa',equipos:'16+ equipos',precio:40000,beneficios:['Todo lo anterior.','Control individual de cada equipo.','Reporte de mantenimiento.','Programación anual.','Recolección y entrega según condiciones del servicio.','Cotización especial para empresas con volumen.']}
  };
  function planClienteSeguro(tipo){return CLIENTE_SEGURO_PLANES[tipo]||CLIENTE_SEGURO_PLANES.cliente_seguro;}
  function renderClienteSeguro(){
    const activos=contratos.filter(c=>c.estado==='activo');
    const diasRenovacion = (fecha)=>{
      if(!fecha) return null;
      const d=new Date(fecha+'T00:00:00');
      const h=new Date(); h.setHours(0,0,0,0);
      if(isNaN(d)) return null;
      return Math.round((d-h)/86400000);
    };
    const vencidas=activos.filter(c=>{const d=diasRenovacion(c.fechaRenovacion);return d!==null&&d<0;});
    const proximas=activos.filter(c=>{const d=diasRenovacion(c.fechaRenovacion);return d!==null&&d>=0&&d<=30;});
    const urgentes=activos.filter(c=>{const d=diasRenovacion(c.fechaRenovacion);return d!==null&&d>=0&&d<=7;});
    return `<div class="cliente-seguro-view view-fade">
      <div class="cs-hero"><div><h2>🛡️ Programa Cliente Seguro</h2><p>“Nosotros nos encargamos de recordar. Usted se encarga de estar protegido.”</p><div class="quote">Seguimiento, historial, recordatorios y beneficios especiales para sus equipos.</div></div><div class="cs-hero-actions"><button class="btn-primary" id="cs-nueva-membresia">+ Registrar Cliente Seguro</button><button class="btn-ghost" id="cs-ver-membresias">Ver membresías</button></div></div>
      <div class="cs-section"><h3>Planes disponibles</h3><span>Vigencia de 12 meses</span></div>
      <div class="cs-plan-grid">${Object.entries(CLIENTE_SEGURO_PLANES).map(([id,p],idx)=>`<div class="cs-plan ${idx===1?'featured':''}">${idx===1?'<div class="cs-ribbon">Plus</div>':''}<h4>${p.nombre}</h4><div class="equipos">${p.equipos}</div><div class="cs-price">₡${p.precio.toLocaleString('es-CR')} <small>/ año</small></div><ul>${p.beneficios.map(x=>`<li>${x}</li>`).join('')}</ul></div>`).join('')}</div>
      <div class="cs-note"><b>Importante:</b> la membresía no sustituye el costo de recargas, reparaciones, repuestos, pruebas u otros trabajos que requieran los equipos. Es el servicio de seguimiento y beneficios.</div>
      <div class="cs-section"><h3>Beneficios de Cliente Seguro</h3><span>Exclusivos de la membresía</span></div>
      <div class="cs-section"><h3>Seguimiento de renovaciones</h3><span>Control automático de vencimientos</span></div>
      <div class="cs-two">
        <div class="cs-panel">
          <h4>Estado de las membresías</h4>
          <div class="cs-benefit-grid">
            <div class="cs-benefit">🟢 Activas: <b>${activos.length}</b></div>
            <div class="cs-benefit" style="${proximas.length?'border-color:#E5A81C;':''}">🟠 Por vencer en 30 días: <b>${proximas.length}</b></div>
            <div class="cs-benefit" style="${urgentes.length?'border-color:#E5A81C;':''}">⏰ Renovación en 7 días: <b>${urgentes.length}</b></div>
            <div class="cs-benefit" style="${vencidas.length?'border-color:#D64545;':''}">🔴 Vencidas: <b>${vencidas.length}</b></div>
          </div>
          ${(urgentes.length||vencidas.length) ? `<div class="cs-note" style="margin-top:12px;"><b>Atención:</b> hay ${vencidas.length} membresía(s) vencida(s) y ${urgentes.length} con renovación dentro de 7 días. Revise “Ventas / CRM → Membresías” para gestionar las renovaciones.</div>` : `<div class="cs-note" style="margin-top:12px;">No hay renovaciones urgentes registradas en este momento.</div>`}
        </div>
      </div>
      <div class="cs-section"><h3>Membresías activas</h3><span>${activos.length} cliente(s)</span></div><div class="cs-panel">${activos.length?`<div class="cs-active-list">${activos.slice(0,10).map(c=>{const p=planClienteSeguro(c.tipoMembresia);return `<div class="cs-active-row"><div class="cs-active-main"><b>${esc(c.cliente||'Sin nombre')}</b><span>${esc(p.nombre)} · ${c.cantidadExtintores||0} extintores · renueva ${esc(c.fechaRenovacion||'—')}</span></div><span class="cs-status">Activo</span></div>`}).join('')}</div>${activos.length>10?'<div style="margin-top:10px;font-size:11px;color:#6B7280;">Mostrando las primeras 10. Consulte “Ventas / CRM → Membresías” para ver todas.</div>':''}`:'<div class="dash-empty">Todavía no hay membresías activas del Programa Cliente Seguro.</div>'}</div>
    </div>`;
  }

  window.CRMClienteSeguro = {
    CLIENTE_SEGURO_PLANES,
    planClienteSeguro,
    renderClienteSeguro
  };
})();

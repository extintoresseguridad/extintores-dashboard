// Módulo de Dashboard — preparado para separación progresiva.
// Contiene la vista consolidada; aún no se activa para mantener estable el CRM.
(function(){
function renderDashboard(){
    const ingresos = ingresosPorMes();
    const maxIngreso = Math.max(...ingresos.map(m=>m.total), 1);
    const ventasMes = ventasPorMes();
    const maxVentaMes = Math.max(...ventasMes.map(m=>m.total), 1);
    const resVentasAnio = resumenVentasAnio();
    const totalIngresos6m = ingresos.reduce((s,m)=>s+m.total,0);
    const porTipo = agruparPor('tipo');
    const porCapacidad = agruparPor('capacidad');
    const estados = conteoPorEstado();
    const maxEstado = Math.max(...estados.map(e=>e.count), 1);
    const referidosConfirmados=referidos.filter(r=>r.estado==='confirmado'), referidosPendientes=referidos.filter(r=>r.estado==='pendiente');
    const creditosReferidos=referidosConfirmados.reduce((s,r)=>s+(parseFloat(r.credito)||0),0);
    const membresiasActivas=contratos.filter(c=>c.estado==='activo');
    const vencimientos = proximosVencimientos();
    const vencidosCount = vencimientos.filter(x=>x.vs==='vencido').length;
    const proximoCount = vencimientos.filter(x=>x.vs==='proximo').length;
    const riesgoCount = clientesEnRiesgo().length;
    const renovacion = tasaRenovacionAnual();
    const hoyISO = todayISO();
    const seguimientosHoyCount = recordatorios.filter(r=>!r.completado && r.fecha<=hoyISO).length;
    const pagadoCount = records.filter(r=>saldoOf(r).saldo<=0 && saldoOf(r).precio>0).length;
    const pendienteCount = records.filter(r=>saldoOf(r).saldo>0).length;

    return `
      <div class="dash-content">
        <div class="quick-actions">
          <span class="quick-title">Acciones rápidas</span>
          <button class="btn-primary" id="dash-quick-new">+ Registrar ingreso</button>
          <button class="btn-ghost" id="dash-quick-oportunidad">+ Nueva oportunidad</button>
          <button class="btn-ghost" data-view="crm">Ver CRM</button>
          <button class="btn-ghost" data-view="listado">Ver órdenes</button>
          <button class="btn-ghost" data-view="clientes">Ver clientes</button>
          <button class="btn-ghost" data-view="caja">Abrir caja</button>
          <button class="btn-ghost" data-view="inventario">Ver inventario</button>
        </div>

        <div class="kpi-grid" style="margin-bottom:18px;"><div class="kpi-card"><div class="kpi-label">🛡️ Cliente Seguro</div><div class="kpi-value">${membresiasActivas.length}</div><div class="kpi-sub">Membresías activas</div></div><div class="kpi-card"><div class="kpi-label">🔥 Referidos</div><div class="kpi-value">${referidosConfirmados.length}</div><div class="kpi-sub">${referidosPendientes.length} pendientes · ₡${creditosReferidos.toLocaleString('es-CR')}</div></div></div>
      <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Total de registros</div>
            <div class="kpi-value">${records.length}</div>
            <div class="kpi-sub">${records.reduce((s,r)=>s+(r.cantidad||1),0)} extintores en total</div>
          </div>
          <div class="kpi-card kpi-green">
            <div class="kpi-label">Ingresos (últimos 6 meses)</div>
            <div class="kpi-value">₡${totalIngresos6m.toLocaleString('es-CR',{maximumFractionDigits:0})}</div>
            <div class="kpi-sub">${pagadoCount} pagado(s) · ${pendienteCount} pendiente(s)</div>
          </div>
          <div class="kpi-card kpi-amber">
            <div class="kpi-label">Por vencer (30 días)</div>
            <div class="kpi-value">${proximoCount}</div>
            <div class="kpi-sub">Próximas recargas</div>
          </div>
          <div class="kpi-card kpi-red ${vencidosCount>0?'kpi-critical':''}">
            <div class="kpi-label">Vencidos</div>
            <div class="kpi-value">${vencidosCount}</div>
            <div class="kpi-sub">Requieren atención</div>
          </div>
          <div class="kpi-card kpi-red ${riesgoCount>0?'kpi-critical':''}">
            <div class="kpi-label">Clientes en riesgo</div>
            <div class="kpi-value">${riesgoCount}</div>
            <div class="kpi-sub">Vencidos +${DIAS_RIESGO_CLIENTE}d sin volver</div>
          </div>
          <div class="kpi-card kpi-amber ${seguimientosHoyCount>0?'kpi-critical':''}">
            <div class="kpi-label">Seguimientos pendientes</div>
            <div class="kpi-value">${seguimientosHoyCount}</div>
            <div class="kpi-sub">Para hoy o atrasados</div>
          </div>
          <div class="kpi-card ${renovacion.porcentaje!==null && renovacion.porcentaje<60?'kpi-red':'kpi-green'}">
            <div class="kpi-label">Tasa de renovación</div>
            <div class="kpi-value">${renovacion.porcentaje!==null ? renovacion.porcentaje+'%' : '—'}</div>
            <div class="kpi-sub">${renovacion.juzgables>0 ? renovacion.renovaron+' de '+renovacion.juzgables+' renovaron' : 'Sin datos suficientes aún'}</div>
          </div>
          <div class="kpi-card kpi-red ${productosStockBajo().length>0?'kpi-critical':''}">
            <div class="kpi-label">Stock bajo</div>
            <div class="kpi-value">${productosStockBajo().length}</div>
            <div class="kpi-sub">Productos por reponer</div>
          </div>
        </div>

        <div class="dash-grid">
          <div class="dash-panel full">
            <h3>Próximas recargas <span>${vencimientos.length} en total — lo más urgente primero</span></h3>
            <div class="vence-list">
              ${vencimientos.length === 0 ? '<div class="dash-empty">No hay recargas vencidas o próximas.</div>' : vencimientos.map(({rec,vs,origen,fecha})=>`
                <div class="vence-item">
                  <div>
                    <div class="v-name">${esc(rec.cliente)}</div>
                    <div class="v-order">${origen==='venta'
                      ? `Equipo vendido · ${esc(rec.marca||'')}${rec.marca&&rec.producto?' · ':''}${esc(rec.producto||'')}`
                      : `${rec.orden ? 'Orden #'+esc(rec.orden) : 'Sin orden'} · ${esc(rec.tipo)}`}</div>
                  </div>
                  <div class="v-date ${vs==='vencido'?'venc-vencido':'venc-proximo'}">${esc(fecha)}</div>
                </div>`).join('')}
            </div>
          </div>

          <div class="dash-panel full">
            <h3>Clientes en riesgo <span>vencidos hace más de ${DIAS_RIESGO_CLIENTE} días sin volver</span></h3>
            <div class="vence-list">
              ${(()=>{
                const riesgo = clientesEnRiesgo();
                if(riesgo.length === 0) return '<div class="dash-empty">Ningún cliente en riesgo por ahora.</div>';
                return riesgo.map(c=>`
                  <div class="vence-item">
                    <div>
                      <div class="v-name">${esc(c.nombre)}</div>
                      <div class="v-order">${c.telefono ? esc(c.telefono) : 'Sin teléfono'} · ${c.diasVencido} días vencido</div>
                    </div>
                    <button class="btn-ghost" data-cliente-riesgo="${esc(c.key)}" style="padding:6px 12px;font-size:11px;">Ver cliente</button>
                  </div>`).join('');
              })()}
            </div>
          </div>

          <div class="dash-panel">
            <h3>Embudo de ventas <span>${oportunidades.length} oportunidad(es) activas</span></h3>
            ${oportunidades.length === 0 ? '<div class="dash-empty">Todavía no hay oportunidades registradas.</div>' : (()=>{
              const maxEtapa = Math.max(...ETAPAS_EMBUDO.map(et=>oportunidades.filter(o=>o.etapa===et.id).length), 1);
              return ETAPAS_EMBUDO.map(et=>{
                const items = oportunidades.filter(o=>o.etapa===et.id);
                const monto = items.reduce((s,o)=>s+(parseFloat(o.montoEstimado)||0),0);
                const colorCls = et.id==='ganado'?'c-green':(et.id==='perdido'?'c-ink':(et.id==='cotizado'?'c-amber':'c-red'));
                return `
                <div class="bar-row">
                  <div class="bar-label">${et.label}</div>
                  <div class="bar-track"><div class="bar-fill ${colorCls}" style="width:${Math.max(4,(items.length/maxEtapa*100))}%"></div></div>
                  <div class="bar-value">${items.length}</div>
                </div>
                ${monto>0 ? `<div style="font-size:10.5px;color:#6B7280;padding:0 0 6px 0;text-align:right;">₡${monto.toLocaleString('es-CR',{maximumFractionDigits:0})} estimado</div>` : ''}`;
              }).join('');
            })()}
            <button class="btn-ghost" data-view="crm" style="width:100%;margin-top:10px;">Ver embudo completo</button>
          </div>

          <div class="dash-panel">
            <h3>Seguimientos de hoy <span>${seguimientosHoyCount} pendiente(s)</span></h3>
            ${(()=>{
              const lista = recordatorios.filter(r=>!r.completado && r.fecha<=hoyISO).sort((a,b)=>(a.fecha||'').localeCompare(b.fecha||'')).slice(0,6);
              if(lista.length === 0) return '<div class="dash-empty">No tienes seguimientos pendientes por ahora.</div>';
              return `<div class="vence-list">${lista.map(r=>`
                <div class="vence-item">
                  <div>
                    <div class="v-name">${esc(r.texto)}</div>
                    <div class="v-order">${r.cliente ? esc(r.cliente) : 'General'}</div>
                  </div>
                  <div class="v-date ${r.fecha<hoyISO?'venc-vencido':'venc-proximo'}">${r.fecha<hoyISO?'Atrasado':'Hoy'}</div>
                </div>`).join('')}</div>`;
            })()}
            <button class="btn-ghost" data-view="crm" style="width:100%;margin-top:10px;">Ver recordatorios</button>
          </div>

          ${(()=>{
            const caja = cajaDeHoy();
            if(!caja) return `
              <div class="dash-panel full">
                <h3>Caja de hoy</h3>
                <div class="dash-empty">Todavía no se ha abierto la caja de hoy.</div>
              </div>`;
            const r = calcularEsperado(caja);
            return `
              <div class="dash-panel">
                <h3>Caja de hoy <span>efectivo</span></h3>
                <div class="kpi-grid" style="margin-bottom:0;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));">
                  <div class="kpi-card"><div class="kpi-label">Apertura</div><div class="kpi-value" style="font-size:20px;">₡${caja.apertura.toLocaleString('es-CR',{maximumFractionDigits:0})}</div></div>
                  <div class="kpi-card kpi-green"><div class="kpi-label">Entradas</div><div class="kpi-value" style="font-size:20px;">₡${r.entradas.toLocaleString('es-CR',{maximumFractionDigits:0})}</div></div>
                  <div class="kpi-card kpi-red"><div class="kpi-label">Salidas</div><div class="kpi-value" style="font-size:20px;">₡${r.salidas.toLocaleString('es-CR',{maximumFractionDigits:0})}</div></div>
                  <div class="kpi-card kpi-amber"><div class="kpi-label">${caja.cerrada?'Estado':'Esperado'}</div><div class="kpi-value" style="font-size:18px;">${caja.cerrada ? (Math.abs(caja.cierre-r.esperado)<0.5?'Cuadró ✓':'No cuadró') : '₡'+r.esperado.toLocaleString('es-CR',{maximumFractionDigits:0})}</div></div>
                </div>
              </div>`;
          })()}

          <div class="dash-panel">
            <h3>Caja del mes <span>todos los métodos</span></h3>
            ${(()=>{
              const resMes = resumenMes();
              return `
              <div class="kpi-grid" style="margin-bottom:0;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));">
                <div class="kpi-card"><div class="kpi-label">Días con caja</div><div class="kpi-value" style="font-size:20px;">${resMes.dias}</div></div>
                <div class="kpi-card kpi-green"><div class="kpi-label">Entradas</div><div class="kpi-value" style="font-size:20px;">₡${resMes.totalEntradas.toLocaleString('es-CR',{maximumFractionDigits:0})}</div></div>
                <div class="kpi-card kpi-red"><div class="kpi-label">Salidas</div><div class="kpi-value" style="font-size:20px;">₡${resMes.totalSalidas.toLocaleString('es-CR',{maximumFractionDigits:0})}</div></div>
                <div class="kpi-card"><div class="kpi-label">Neto</div><div class="kpi-value" style="font-size:18px;">₡${resMes.neto.toLocaleString('es-CR',{maximumFractionDigits:0})}</div></div>
              </div>`;
            })()}
          </div>

          <div class="dash-panel full">
            <h3>Caja por método de pago <span>mensual y anual, neto</span></h3>
            ${(()=>{
              const resMes = resumenMes();
              const resAnio = resumenAnio();
              const metodosMes = METODOS_PAGO.filter(met=>resMes.porMetodoMes[met]);
              const metodosAnio = METODOS_PAGO.filter(met=>resAnio.porMetodoAnio[met]);
              return `
              <div class="caja-subtitle">Este mes</div>
              ${metodosMes.length ? `
              <div class="metodo-grid">
                ${metodosMes.map(met=>{
                  const d = resMes.porMetodoMes[met];
                  return `<div class="metodo-item">
                    <span class="metodo-label">${met}</span>
                    <span class="metodo-monto">₡${(d.entradas-d.salidas).toLocaleString('es-CR',{maximumFractionDigits:0})}</span>
                  </div>`;
                }).join('')}
              </div>` : '<div class="dash-empty">Sin movimientos de caja este mes.</div>'}

              <div class="caja-subtitle" style="margin-top:18px;">Este año (${resAnio.anio})</div>
              ${metodosAnio.length ? `
              <div class="metodo-grid" style="margin-bottom:0;">
                ${metodosAnio.map(met=>{
                  const d = resAnio.porMetodoAnio[met];
                  return `<div class="metodo-item">
                    <span class="metodo-label">${met}</span>
                    <span class="metodo-monto">₡${(d.entradas-d.salidas).toLocaleString('es-CR',{maximumFractionDigits:0})}</span>
                  </div>`;
                }).join('')}
              </div>` : '<div class="dash-empty">Sin movimientos de caja este año.</div>'}
            `;
            })()}
          </div>

          <div class="dash-panel full">
            <h3>Ingresos mensuales <span>últimos 6 meses, colones</span></h3>
            <div class="month-chart">
              ${ingresos.map(m=>`
                <div class="month-col">
                  <div class="month-bar-value">${m.total>0 ? '₡'+m.total.toLocaleString('es-CR',{maximumFractionDigits:0}) : ''}</div>
                  <div class="month-bar" style="height:${Math.max(2,(m.total/maxIngreso*140))}px"></div>
                  <div class="month-bar-label">${m.label}</div>
                </div>`).join('')}
            </div>
          </div>

          <div class="dash-panel full">
            <h3>Ventas de equipos <span>últimos 6 meses, colones</span></h3>
            ${ventas.length === 0 ? '<div class="dash-empty">Todavía no hay ventas de equipos registradas.</div>' : `
            <div class="month-chart">
              ${ventasMes.map(m=>`
                <div class="month-col">
                  <div class="month-bar-value">${m.total>0 ? '₡'+m.total.toLocaleString('es-CR',{maximumFractionDigits:0}) : ''}</div>
                  <div class="month-bar" style="height:${Math.max(2,(m.total/maxVentaMes*140))}px;background:var(--brass);"></div>
                  <div class="month-bar-label">${m.label}</div>
                </div>`).join('')}
            </div>
            <div class="caja-subtitle" style="margin-top:16px;">Este año (${resVentasAnio.anio})</div>
            <div class="kpi-grid" style="margin-bottom:0;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));">
              <div class="kpi-card"><div class="kpi-label">Ventas realizadas</div><div class="kpi-value" style="font-size:20px;">${resVentasAnio.cantidadVentas}</div></div>
              <div class="kpi-card"><div class="kpi-label">Equipos vendidos</div><div class="kpi-value" style="font-size:20px;">${resVentasAnio.totalUnidades}</div></div>
              <div class="kpi-card kpi-green"><div class="kpi-label">Monto total</div><div class="kpi-value" style="font-size:20px;">₡${resVentasAnio.totalMonto.toLocaleString('es-CR',{maximumFractionDigits:0})}</div></div>
            </div>
            ${Object.keys(resVentasAnio.porProducto).length ? `
            <div class="caja-subtitle" style="margin-top:16px;">Por producto (unidades, este año)</div>
            ${barsHTML(Object.entries(resVentasAnio.porProducto).sort((a,b)=>b[1]-a[1]), 'c-amber', 8)}
            ` : ''}
            `}
          </div>

          <div class="dash-panel">
            <h3>Estado del servicio <span>registros</span></h3>
            ${estados.map(e=>`
              <div class="bar-row">
                <div class="bar-label">${e.label}</div>
                <div class="bar-track"><div class="bar-fill ${e.id==='listo'?'c-green':(e.id==='proceso'?'c-red':(e.id==='entregado'?'c-ink':'c-amber'))}" style="width:${Math.max(4,(e.count/maxEstado*100))}%"></div></div>
                <div class="bar-value">${e.count}</div>
              </div>`).join('')}
          </div>

          <div class="dash-panel">
            <h3>Extintores por tipo <span>cantidad</span></h3>
            ${barsHTML(porTipo, 'c-red')}
          </div>

          <div class="dash-panel">
            <h3>Extintores por capacidad <span>cantidad</span></h3>
            ${barsHTML(porCapacidad, 'c-amber', 8)}
          </div>
        </div>
      </div>
    `;
  }
  window.CRMDashboard = { renderDashboard };
})();

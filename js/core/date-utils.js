// Utilidades de fecha centralizadas. Mantienen las fechas de negocio como YYYY-MM-DD.
(function(){
  const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

  function toDateOnly(date){
    const d = date instanceof Date ? date : new Date(date);
    if(Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function todayISO(){
    return toDateOnly(new Date());
  }

  function parseDateOnly(value){
    if(!DATE_ONLY_RE.test(String(value || ''))) return null;
    const [y,m,d] = String(value).split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function addDays(dateStr, days){
    const d = parseDateOnly(dateStr);
    if(!d) return dateStr;
    d.setDate(d.getDate() + Number(days || 0));
    return toDateOnly(d);
  }

  function addMonths(dateStr, months){
    const d = parseDateOnly(dateStr);
    if(!d) return '';
    d.setMonth(d.getMonth() + Number(months || 0));
    return toDateOnly(d);
  }

  window.ExtintoresCore = window.ExtintoresCore || {};
  window.ExtintoresCore.dates = { todayISO, toDateOnly, parseDateOnly, addDays, addMonths };
})();

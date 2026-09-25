// Datos compartidos del CRM. Este archivo se carga antes de app.js.
(function(){
  const FIREBASE_PROJECT_ID = 'extintores-seguridad';
  const FIREBASE_API_KEY = 'AIzaSyAxcak72NgLAzbg5a1rF0D5nO18AW7-Pjo';
  const FIRESTORE_DOC_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/backups/main?key=${FIREBASE_API_KEY}`;
  const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;
  const AUTH_SIGNUP_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;
  const AUTH_SIGNIN_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
  const AUTH_REFRESH_URL = `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`;
  const OWNER_EMAIL = 'extintoresseguridad.cr@gmail.com';
  const EMPRESA_TELEFONO = '2101-4399 / 8839-9134';
  const EMPRESA_CORREO = 'extintoresseguridad.cr@gmail.com';
  const DEFAULT_CONFIGURACION = {
    telefono: EMPRESA_TELEFONO,
    correo: EMPRESA_CORREO,
    horario: 'Lunes a viernes: 8:00 a. m. – 5:00 p. m. · Sábados: 8:00 a. m. – 12:00 md',
    ivaPorcentaje: 13,
    serviciosExtra: [],
  };
  const EMPRESA_CEDULA_JURIDICA = '104830006';
  const EMPRESA_REPRESENTANTE = 'Álvaro Sandi Chaves';
  const AUTH_SESSION_KEY = 'extintores:session';
  const ESTADOS = [
    {id:'recibido', label:'Recibido', cls:'b-recibido'},
    {id:'proceso', label:'En proceso', cls:'b-proceso'},
    {id:'listo', label:'Listo', cls:'b-listo'},
    {id:'entregado', label:'Entregado', cls:'b-entregado'},
  ];
  const TIPOS = ['PQS (Polvo Químico)','CO2','Agua','Espuma (AFFF)','Halón/Limpio','Otro'];
  const SERVICIOS = ['Recarga + Mantenimiento general','Prueba hidrostática','Cambio de manguera','Cambio de manómetro','Cambio de válvula','Repintado','Reemplazo de unidad'];

  window.CRMData = {
    FIREBASE_PROJECT_ID, FIREBASE_API_KEY, FIRESTORE_DOC_URL, FIRESTORE_BASE,
    AUTH_SIGNUP_URL, AUTH_SIGNIN_URL, AUTH_REFRESH_URL, OWNER_EMAIL,
    EMPRESA_TELEFONO, EMPRESA_CORREO, DEFAULT_CONFIGURACION,
    EMPRESA_CEDULA_JURIDICA, EMPRESA_REPRESENTANTE, AUTH_SESSION_KEY,
    ESTADOS, TIPOS, SERVICIOS
  };
})();
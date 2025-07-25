import NProgress from 'nprogress'

// 🚀 CONFIGURACIÓN OPTIMIZADA PARA VELOCIDAD
NProgress.configure({ 
  showSpinner: false,      // Sin spinner para más limpieza
  minimum: 0.1,            // Inicio más rápido
  speed: 200,              // Animación más rápida (default: 500)
  trickleSpeed: 50,        // Incrementos más frecuentes
  easing: 'ease-out',      // Transición más suave
  template: '<div class="bar" role="bar"><div class="peg"></div></div>' // Template minimalista
})

export default NProgress 
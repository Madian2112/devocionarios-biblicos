# 🙏 Devocionarios Bíblicos

**Una aplicación web progresiva (PWA) para el estudio bíblico personal y crecimiento espiritual.**

## 🌟 **Características principales**

### 📖 **Devocionales personales**
- ✅ Creación y gestión de devocionales diarios
- ✅ Selector de versículos bíblicos con múltiples versiones
- ✅ Sistema de referencias cruzadas
- ✅ Seguimiento de progreso y rachas de estudio
- ✅ Estados de completado interactivos

### 📚 **Estudios temáticos**
- ✅ Organización por temas específicos
- ✅ Entradas múltiples por estudio
- ✅ Auto-guardado inteligente
- ✅ Sistema de collapse/expansión

### 🔔 **Sistema de notificaciones nativas**
- ✅ **Notificaciones push PWA** como WhatsApp/Instagram
- ✅ Recordatorios diarios personalizables
- ✅ Alertas de racha en peligro
- ✅ Reportes semanales de progreso
- ✅ Configuración de horarios flexible

### 📧 **Emails automáticos (Sin Dominio)**
- ✅ **Sistema dual Supabase + Brevo**
- ✅ **Sin verificación de dominio requerida**
- ✅ Emails de bienvenida para nuevos usuarios
- ✅ Recordatorios de racha por email
- ✅ Reportes semanales detallados
- ✅ Edge Functions para máximo rendimiento
- ✅ Fallbacks automáticos

### 📱 **PWA optimizada**
- ✅ Instalación como app nativa
- ✅ Funciona offline (Service Worker)
- ✅ Cache inteligente para móviles
- ✅ Diseño mobile-first
- ✅ Rendimiento optimizado

### 🎨 **Interfaz moderna**
- ✅ Diseño dark mode elegante
- ✅ Gradientes y animaciones fluidas
- ✅ Componentes UI consistentes (Shadcn)
- ✅ Responsive design
- ✅ Paleta de colores unificada

### 📊 **Analytics y seguimiento**
- ✅ Estadísticas de progreso en tiempo real
- ✅ Cálculo automático de rachas
- ✅ Contadores de versículos y referencias
- ✅ Dashboard visual interactivo

### ⚡ **Rendimiento avanzado**
- ✅ Cache en memoria (RAM) inteligente
- ✅ Cache persistente IndexedDB para móviles
- ✅ Precarga de contenido bíblico
- ✅ Optimización de imágenes Next.js
- ✅ Code splitting automático

## 🚀 **Tecnologías utilizadas**

### **Frontend:**
- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **Shadcn UI** - Componentes UI modernos
- **Lucide Icons** - Iconografía consistente

### **Backend & Database:**
- **Firebase Authentication** - Gestión de usuarios
- **Firestore** - Base de datos NoSQL
- **Firebase Extensions** - Trigger Email automático
- **Firebase Hosting** - Despliegue optimizado

### **PWA & Caching:**
- **Next.js PWA** - Funcionalidades de app nativa
- **Service Worker** - Cache offline y notificaciones
- **IndexedDB** - Storage persistente local
- **Web Push API** - Notificaciones push nativas

### **APIs externas:**
- **Bible API** - Obtención de textos bíblicos
- **Notification API** - Notificaciones del navegador
- **Gmail SMTP** - Envío de emails via Firebase

## 📱 **Instalación y configuración**

### **1. Clonación del proyecto:**
```bash
git clone https://github.com/tu-usuario/devocionarios-biblicos.git
cd devocionarios-biblicos
npm install
```

### **2. Variables de entorno:**
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_BIBLE_API_URL=https://bible-api.com
```

### **3. Configuración de Firebase:**

#### **a) Firestore Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Devocionales
    match /devocionales/{devocionalId} {
      allow list: if isSignedIn();
      allow get, delete: if isSignedIn() && isOwner(resource.data.userId);
      allow create: if isSignedIn() && isOwner(request.resource.data.userId);
      allow update: if isSignedIn() && isOwner(resource.data.userId);
    }

    // Estudios temáticos
    match /estudios_topicos/{estudioId} {
      allow list: if isSignedIn();
      allow get, delete: if isSignedIn() && isOwner(resource.data.userId);
      allow create: if isSignedIn() && isOwner(request.resource.data.userId);
      allow update: if isSignedIn() && isOwner(resource.data.userId);
    }

    // Emails (para Firebase Extension)
    match /mail/{mailId} {
      allow write: if isSignedIn();
      allow read: if false;
    }
  }
}
```

#### **b) Firestore Indexes:**
Crear estos índices compuestos:
- **devocionales**: `userId` (Ascending), `fecha` (Descending)
- **estudios_topicos**: `userId` (Ascending), `name` (Ascending)

### **4. Configuración de emails (Firebase Extension):**

Ver guía completa en: [`FIREBASE_EMAIL_SETUP.md`](./FIREBASE_EMAIL_SETUP.md)

**Resumen rápido:**
1. Instalar "Trigger Email" extension en Firebase Console
2. Configurar SMTP con Gmail app password
3. Agregar reglas de Firestore para colección `mail`

### **5. Ejecución:**
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm run start
```

## 🔧 **Scripts disponibles**

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit"
}
```

## 📁 **Estructura del proyecto**

```
devocionarios-biblicos/
├── app/                    # App Router de Next.js
│   ├── dashboard/         # Página principal de devocionales
│   ├── devocional/[id]/   # Detalle de devocional
│   ├── home/              # Página de inicio autenticada
│   ├── login/             # Autenticación
│   ├── settings/          # Configuración de notificaciones
│   ├── topical/           # Estudios temáticos
│   └── layout.tsx         # Layout global
├── components/            # Componentes reutilizables
│   ├── auth/             # Componentes de autenticación
│   ├── bible/            # Componentes bíblicos
│   ├── ui/               # Componentes UI (Shadcn)
│   └── ...
├── context/              # Contextos de React
├── hooks/                # Custom hooks
├── lib/                  # Utilidades y servicios
│   ├── firebase.ts       # Configuración Firebase
│   ├── firestore.ts      # Servicios Firestore
│   ├── firebase-email-service.ts  # Emails via Firebase
│   ├── notification-service.ts    # Notificaciones PWA
│   ├── mobile-cache.ts   # Cache para móviles
│   └── ...
├── public/               # Archivos estáticos
└── styles/               # Estilos globales
```

## 🎯 **Funcionalidades clave**

### **📊 Dashboard dinámico:**
- Estadísticas en tiempo real
- Navegación optimizada para móviles
- Acceso rápido a funciones principales

### **🔔 Notificaciones inteligentes:**
- Configuración de horarios personalizados
- Recordatorios de racha automáticos
- Notificaciones PWA nativas
- Persistencia de configuración

### **📧 Sistema de emails:**
- Emails HTML profesionales
- Integración con Firebase Trigger Email
- Fallback con localStorage
- Monitoreo en tiempo real

### **💾 Cache inteligente:**
- Cache en memoria para desktop
- IndexedDB para móviles
- Precarga de contenido bíblico
- Invalidación automática

### **🎨 UX optimizada:**
- Estados de loading consistentes
- Transiciones fluidas
- Feedback visual inmediato
- Diseño mobile-first

## 🤝 **Contribución**

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 **Reconocimientos**

- **Bible API** - Acceso a textos bíblicos
- **Firebase** - Backend y hosting
- **Shadcn UI** - Componentes UI
- **Next.js** - Framework React
- **Vercel** - Inspiración en desarrollo web

---

**"Lámpara es a mis pies tu palabra, y lumbrera a mi camino." - Salmos 119:105** 🙏 
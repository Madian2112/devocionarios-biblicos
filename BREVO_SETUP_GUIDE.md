# 📧 GUÍA COMPLETA: BREVO EMAIL SERVICE (100% GRATIS)

## 🎯 **¿POR QUÉ BREVO?**

✅ **9,000 emails/mes** completamente GRATIS  
✅ **100,000 contactos** sin límites  
✅ **Sin tarjeta de crédito** requerida  
✅ **API profesional** y confiable  
✅ **Templates incluidos** y personalizables  
✅ **Automatización** incluida  
✅ **CRM gratuito** incorporado  
✅ **Sin fecha de expiración**  

---

## 🚀 **PASO 1: REGISTRO GRATUITO**

1. Ve a [https://www.brevo.com](https://www.brevo.com)
2. Haz clic en **"Sign up free"**
3. Completa el formulario:
   - **Email**: Tu email personal
   - **Password**: Contraseña segura
   - **Company name**: Devocionarios Bíblicos
   - **Country**: Tu país
4. **Verifica tu email** (revisa spam/promociones)
5. **Completa el perfil** básico

---

## 🔑 **PASO 2: OBTENER API KEY**

1. Una vez logueado, ve a **"API & SMTP"** en el menú
2. Haz clic en **"API Keys"** 
3. Clic en **"Generate a new API Key"**
4. Nombre: `Devocionarios App`
5. **Copia la API Key** (guárdala, no se vuelve a mostrar)

---

## 🔧 **PASO 3: CONFIGURAR EN TU APP**

### **3.1 Agregar API Key**

Crea el archivo `.env.local` en la raíz de tu proyecto:

```bash
# .env.local
NEXT_PUBLIC_BREVO_API_KEY=xkeysib-tu_api_key_aqui
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### **3.2 Verificar Dominio (Opcional pero Recomendado)**

1. En Brevo, ve a **"Senders & IP"** → **"Domains"**
2. Clic en **"Add a domain"**
3. Ingresa tu dominio: `tu-dominio.com`
4. **Configura los DNS records** que te proporcione Brevo:
   - **DKIM**: Mejora deliverability
   - **SPF**: Evita spam
   - **DMARC**: Protege tu dominio

**Ejemplo de DNS records:**
```
TXT @ "v=spf1 include:spf.brevo.com ~all"
TXT brevo._domainkey "k=rsa; p=MIGfMA0GCS..."
```

---

## 📧 **PASO 4: CONFIGURAR EMAIL SENDER**

### **4.1 Verificar Email Sender**

1. Ve a **"Senders & IP"** → **"Senders"**
2. Clic en **"Add a sender"**
3. Configurar:
   - **Email**: `noreply@tu-dominio.com`
   - **Name**: `Devocionarios Bíblicos`
4. **Verifica el email** (revisa tu bandeja)

### **4.2 Actualizar Código**

En `lib/brevo-email-service.ts`, cambia:

```typescript
sender: {
  name: 'Devocionarios Bíblicos',
  email: 'noreply@tu-dominio.com', // ← Cambia por tu dominio verificado
},
```

---

## 🧪 **PASO 5: PRUEBAS**

### **5.1 Test Básico**

```typescript
// En tu consola del navegador o componente de prueba
import { BrevoEmailService } from '@/lib/brevo-email-service';

// Probar email de bienvenida
BrevoEmailService.sendWelcomeEmail({
  userName: 'Prueba',
  userEmail: 'tu@email.com'
}).then(success => {
  console.log('Resultado:', success);
});
```

### **5.2 Test desde Settings**

1. Ve a `/settings` en tu app
2. Haz clic en **"Enviar Email de Prueba"**
3. Revisa tu bandeja de entrada
4. **¡Debería llegar en menos de 1 minuto!**

---

## 📊 **PASO 6: MONITOREAR USAGE**

### **6.1 Dashboard de Brevo**

- Ve a **"Statistics"** para ver:
  - Emails enviados hoy/mes
  - Tasa de apertura
  - Clics en enlaces
  - Bounces y quejas

### **6.2 Limits del Plan Gratuito**

```
📧 EMAILS: 300/día = 9,000/mes
👥 CONTACTOS: 100,000 max
📈 AUTOMATIZACIÓN: Incluida
📊 REPORTES: Básicos incluidos
🎨 TEMPLATES: 40+ incluidos
⏰ SOPORTE: Email (24-48h)
```

---

## 🚨 **TROUBLESHOOTING**

### **Problema: "API Key inválida"**
```
✅ Verifica que copiaste la key completa
✅ Debe empezar con "xkeysib-"
✅ Revisa .env.local sin espacios extra
✅ Reinicia npm run dev
```

### **Problema: "Sender no verificado"**
```
✅ Verifica el email sender en Brevo
✅ Usa el email exacto configurado
✅ Si usas dominio custom, configura DNS
```

### **Problema: "Emails no llegan"**
```
✅ Revisa carpeta SPAM/Promociones
✅ Verifica límite diario (300 emails)
✅ Revisa logs en Dashboard de Brevo
✅ Confirma que el destinatario existe
```

---

## 🎉 **¡CONFIGURACIÓN COMPLETA!**

### **✅ Lo que tienes ahora:**

- 🎯 **9,000 emails gratis** cada mes
- 📧 **Emails profesionales** con HTML
- 📊 **Estadísticas** de apertura y clics
- 🔄 **Automatización** para workflows
- 👥 **100,000 contactos** sin costo
- 🎨 **Templates** profesionales
- 🔐 **Deliverability** empresarial

### **🚀 Próximos pasos:**

1. **Testear** el envío de emails
2. **Personalizar** templates
3. **Configurar** automatizaciones
4. **Monitorear** estadísticas
5. **Escalar** cuando necesites más

---

## 🔥 **TIPS AVANZADOS**

### **Template Personalizado**
```typescript
// Crear templates custom en Brevo dashboard
// Luego usarlos con templateId en lugar de HTML
```

### **Segmentación**
```typescript
// Crear listas de contactos
// Enviar emails targeteados
```

### **A/B Testing**
```typescript
// Probar diferentes subject lines
// Optimizar tasas de apertura
```

---

## 💰 **¿Y SI NECESITO MÁS?**

Si superas 9,000 emails/mes, Brevo tiene planes económicos:

- **20K emails**: $29/mes
- **40K emails**: $39/mes
- **100K emails**: $69/mes

**¡Pero para empezar, 9,000 emails gratis es PERFECTO!** 🎯

---

## 📞 **SOPORTE**

- **Brevo Help**: [help.brevo.com](https://help.brevo.com)
- **API Docs**: [developers.brevo.com](https://developers.brevo.com)
- **Status**: [status.brevo.com](https://status.brevo.com)

---

## 🌟 **COMPARACIÓN vs ALTERNATIVAS**

| **Servicio** | **Emails Gratis** | **Contactos** | **API** | **Complejidad** |
|--------------|-------------------|---------------|---------|-----------------|
| **🥇 Brevo** | **9,000/mes** | **100,000** | **✅ Fácil** | **⭐ Simple** |
| SendGrid     | 100/día         | Limitado    | ✅ Buena | ⭐⭐ Media |
| Mailgun      | 100/día         | Limitado    | ✅ Buena | ⭐⭐ Media |
| Resend       | 3,000/mes       | Limitado    | ✅ Excelente | ⭐ Simple |
| EmailJS      | Muy limitado    | N/A         | ⭐ Básica | ⭐⭐⭐ Compleja |

---

**🎯 CONCLUSIÓN: Brevo es la MEJOR opción gratuita para tu app** ✨

¡Disfruta enviando emails profesionales sin costo! 🚀 
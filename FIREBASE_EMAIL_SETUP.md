# 📧 Configuración de Firebase Email Extension

## 🚀 **INSTRUCCIONES COMPLETAS**

### **✅ PASO 1: Instalar la extensión**

1. **Ve a Firebase Console** → https://console.firebase.google.com/
2. **Selecciona tu proyecto** Devocionarios Bíblicos
3. **Click en "Extensions"** en el menú lateral
4. **Click en "Browse Hub"**
5. **Busca "Trigger Email"** 
6. **Selecciona "Trigger Email"** (by Firebase)
7. **Click en "Install"**

### **✅ PASO 2: Configurar la extensión**

Durante la instalación te pedirá:

#### **📧 Configuración de SMTP:**
```
SMTP Connection URI: smtp://username:password@smtp.gmail.com:587
```

#### **🔧 Para Gmail:**
1. **Ve a tu cuenta Google** → https://myaccount.google.com/
2. **Security** → **App passwords**
3. **Genera una contraseña** para la app
4. **Usa esta configuración:**
   ```
   smtp://tu-email@gmail.com:tu-app-password@smtp.gmail.com:587
   ```

#### **📬 Ejemplo completo:**
```
smtp://devocionarios@gmail.com:abcd-efgh-ijkl-mnop@smtp.gmail.com:587
```

#### **⚙️ Otras configuraciones:**
- **Default FROM address**: `noreply@tu-dominio.com`
- **Default Reply-To**: `support@tu-dominio.com`  
- **Firestore collection**: `mail` (default)

### **✅ PASO 3: Reglas de Firestore**

Agrega esta regla a tu Firestore:

```javascript
// Regla para la colección 'mail'
match /mail/{mailId} {
  allow write: if isSignedIn();
  allow read: if false; // Solo la extensión lee
}
```

### **✅ PASO 4: Variables de entorno**

Agrega a tu `.env.local`:

```env
# URL de tu app para links en emails
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### **✅ PASO 5: Probar funcionamiento**

1. **Registra un usuario nuevo** en tu app
2. **Verifica en Firebase Console** → Firestore → Colección `mail`
3. **Debería aparecer** un documento con el email
4. **Revisa la bandeja** del usuario

### **📊 PASO 6: Monitoreo**

#### **En Firebase Console:**
- **Extensions** → **Trigger Email** → **View logs**
- **Firestore** → **Collection: mail** → Documentos procesados

#### **Estados de documentos:**
- **`processed: false`** → Pendiente
- **`processed: true`** → Enviado
- **`error`** → Error en envío

### **🔧 TROUBLESHOOTING**

#### **❌ Si no funciona:**

1. **Verifica logs** en Extensions
2. **Revisa SMTP config** (usuario/contraseña)
3. **Confirma reglas** de Firestore
4. **Verifica quota** de Gmail (500 emails/día)

#### **📝 Logs comunes:**
```
✅ Email enqueued successfully
❌ SMTP Authentication failed
⚠️ Daily quota exceeded
```

### **💡 VENTAJAS vs EmailJS**

| Feature | EmailJS | Firebase Extension |
|---------|---------|-------------------|
| **Confiabilidad** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Configuración** | Manual | Un click |
| **Monitoreo** | Limitado | Completo |
| **Escalabilidad** | Limitada | Ilimitada |
| **Costos** | Freemium | Solo Gmail quota |
| **Integración** | Externa | Nativa Firebase |

### **🎯 RESULTADO FINAL:**

Una vez configurado:
- ✅ **Emails automáticos** de bienvenida
- ✅ **Recordatorios** de racha
- ✅ **Reportes** semanales  
- ✅ **Monitoreo** completo en Firebase
- ✅ **Escalabilidad** ilimitada

### **📱 PARA EL USUARIO:**

Los emails llegarán:
- 📧 **A su bandeja** principal (no spam)
- 🎨 **Con diseño** profesional
- 🔗 **Con links** funcionalen a tu app
- 📊 **Con seguimiento** de apertura (opcional)

---

## 🔥 **¡Firebase + Gmail = Combinación perfecta!**

**Mucho más confiable que cualquier servicio externo** ✨ 
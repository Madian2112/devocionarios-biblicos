import { collection, addDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// 📧 Servicio híbrido que NO requiere Firebase Extensions
// Almacena emails pendientes en Firestore para procesamiento manual/externo

interface EmailQueue {
  id?: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  type: 'welcome' | 'streak' | 'weekly';
  priority: 'high' | 'normal' | 'low';
  scheduled: Timestamp;
  processed: boolean;
  attempts: number;
  userId: string;
  createdAt: Timestamp;
}

interface WelcomeEmailData {
  userName: string;
  userEmail: string;
}

export class HybridEmailService {
  /**
   * 🎉 Encola email de bienvenida (SIN extensión Firebase)
   */
  static async queueWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    try {
      console.log('📧 Encolando email de bienvenida (método híbrido):', data.userEmail);

      const emailData: EmailQueue = {
        to: data.userEmail,
        subject: '🙏 ¡Bienvenido a Devocionarios Bíblicos!',
        type: 'welcome',
        priority: 'high',
        scheduled: Timestamp.now(),
        processed: false,
        attempts: 0,
        userId: data.userEmail, // Usar email como userId temporal
        createdAt: Timestamp.now(),
        html: this.generateWelcomeHTML(data),
        text: this.generateWelcomeText(data)
      };

      // Guardar en colección 'email_queue' en lugar de 'mail'
      const docRef = await addDoc(collection(db, 'email_queue'), emailData);
      
      console.log('✅ Email encolado para procesamiento externo con ID:', docRef.id);

      // 🔔 Opcional: Mostrar notificación al usuario
      this.showEmailQueueNotification();

      return true;

    } catch (error) {
      console.error('❌ Error encolando email:', error);
      return false;
    }
  }

  /**
   * 🔥 Encola email de recordatorio de racha
   */
  static async queueStreakReminder(data: WelcomeEmailData & { streak: number }): Promise<boolean> {
    try {
      const emailData: EmailQueue = {
        to: data.userEmail,
        subject: `🔥 ¡No pierdas tu racha de ${data.streak} días!`,
        type: 'streak',
        priority: 'high',
        scheduled: Timestamp.now(),
        processed: false,
        attempts: 0,
        userId: data.userEmail,
        createdAt: Timestamp.now(),
        html: this.generateStreakHTML(data),
        text: this.generateStreakText(data)
      };

      const docRef = await addDoc(collection(db, 'email_queue'), emailData);
      console.log('✅ Email de racha encolado con ID:', docRef.id);
      return true;

    } catch (error) {
      console.error('❌ Error encolando email de racha:', error);
      return false;
    }
  }

  /**
   * 📊 Obtener emails pendientes (para procesamiento externo)
   */
  static async getPendingEmails(): Promise<EmailQueue[]> {
    try {
      const q = query(
        collection(db, 'email_queue'),
        where('processed', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      const emails: EmailQueue[] = [];
      
      querySnapshot.forEach((doc) => {
        emails.push({ id: doc.id, ...doc.data() } as EmailQueue);
      });

      console.log(`📧 ${emails.length} emails pendientes en cola`);
      return emails;

    } catch (error) {
      console.error('❌ Error obteniendo emails pendientes:', error);
      return [];
    }
  }

  /**
   * 🎨 Generar HTML de bienvenida
   */
  private static generateWelcomeHTML(data: WelcomeEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bienvenido a Devocionarios Bíblicos</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f0f0f0; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .icon { font-size: 64px; margin-bottom: 20px; }
          .feature { margin: 15px 0; padding: 10px; background: #f8fafc; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">🙏</div>
            <h1>¡Bienvenido ${data.userName}!</h1>
            <p>Tu viaje espiritual comienza aquí</p>
          </div>
          
          <div class="content">
            <h2>🎉 ¡Qué alegría tenerte en nuestra comunidad!</h2>
            
            <p>Has dado un paso hermoso hacia un crecimiento espiritual más profundo.</p>
            
            <div class="feature">✨ <strong>Espacio personal</strong> para tus reflexiones diarias</div>
            <div class="feature">📖 <strong>Herramientas</strong> para estudiar la Palabra de Dios</div>
            <div class="feature">🔥 <strong>Sistema</strong> que te ayudará a mantener tu constancia</div>
            <div class="feature">📊 <strong>Seguimiento</strong> de tu progreso espiritual</div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tu-app.com'}/home" class="button">
                📱 Comenzar mi viaje espiritual
              </a>
            </div>
            
            <p><strong>Que Dios bendiga abundantemente tu tiempo de estudio y reflexión.</strong></p>
            
            <p>Con cariño,<br><strong>Devocionarios Bíblicos</strong> 🙏</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="text-align: center; font-style: italic; color: #666;">
              <em>"Lámpara es a mis pies tu palabra, y lumbrera a mi camino."</em><br>
              <strong>- Salmos 119:105</strong>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 📝 Generar texto plano de bienvenida
   */
  private static generateWelcomeText(data: WelcomeEmailData): string {
    return `
¡Hola ${data.userName}!

🎉 ¡Qué alegría tenerte en nuestra comunidad de Devocionarios Bíblicos!

Has dado un paso hermoso hacia un crecimiento espiritual más profundo. Aquí encontrarás:

✨ Un espacio personal para tus reflexiones diarias
📖 Herramientas para estudiar la Palabra de Dios  
🔥 Un sistema que te ayudará a mantener tu constancia
📊 Seguimiento de tu progreso espiritual

📱 Visita: ${process.env.NEXT_PUBLIC_APP_URL || 'https://tu-app.com'}/home

Que Dios bendiga abundantemente tu tiempo de estudio y reflexión.

Con cariño,
El equipo de Devocionarios Bíblicos 🙏

---
"Lámpara es a mis pies tu palabra, y lumbrera a mi camino." - Salmos 119:105
    `;
  }

  /**
   * 🔥 Generar HTML de racha
   */
  private static generateStreakHTML(data: WelcomeEmailData & { streak: number }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>¡Mantén tu racha!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f0f0f0; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .streak { font-size: 96px; margin: 20px 0; }
          .action { margin: 10px 0; padding: 8px; background: #fef3c7; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="streak">🔥</div>
            <h1>${data.userName}</h1>
            <h2>${data.streak} días consecutivos</h2>
          </div>
          
          <div class="content">
            <p>Tienes una hermosa racha de <strong>${data.streak} días consecutivos</strong> de estudio bíblico.</p>
            
            <p><strong>¡No dejes que se rompa!</strong> Dedica unos minutos hoy para:</p>
            
            <div class="action">📖 Leer un versículo</div>
            <div class="action">✍️ Escribir una reflexión</div>
            <div class="action">🙏 Conectar con Dios</div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tu-app.com'}/dashboard" class="button">
                🚀 ¡Continuar mi racha!
              </a>
            </div>
            
            <p><strong>Tu constancia es una bendición. ¡Sigue adelante!</strong></p>
            
            <p>Bendiciones,<br><strong>Devocionarios Bíblicos</strong> 🙏</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 📝 Generar texto plano de racha
   */
  private static generateStreakText(data: WelcomeEmailData & { streak: number }): string {
    return `
¡Hola ${data.userName}!

🔥 Tienes una hermosa racha de ${data.streak} días consecutivos de estudio bíblico.

¡No dejes que se rompa! Dedica unos minutos hoy para:
📖 Leer un versículo
✍️ Escribir una reflexión  
🙏 Conectar con Dios

Tu constancia es una bendición. ¡Sigue adelante!

Visita: ${process.env.NEXT_PUBLIC_APP_URL || 'https://tu-app.com'}/dashboard

Bendiciones,
Devocionarios Bíblicos 🙏
    `;
  }

  /**
   * 🔔 Mostrar notificación de que el email fue encolado
   */
  private static showEmailQueueNotification(): void {
    // Solo mostrar en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email encolado - será procesado externamente');
    }
  }
}

/**
 * 🔧 INSTRUCCIONES PARA PROCESAMIENTO EXTERNO:
 * 
 * 1. Los emails se guardan en Firestore collection 'email_queue'
 * 2. Puedes usar un script externo/servidor para procesarlos
 * 3. O un servicio como Zapier/IFTTT para enviar emails
 * 4. O incluso Gmail API directamente desde un script
 * 
 * EJEMPLO DE SCRIPT PROCESADOR:
 * 
 * async function processEmailQueue() {
 *   const emails = await HybridEmailService.getPendingEmails();
 *   for (const email of emails) {
 *     // Enviar con tu servicio preferido (Nodemailer, SendGrid, etc.)
 *     await sendEmail(email);
 *     // Marcar como procesado en Firestore
 *     await markAsProcessed(email.id);
 *   }
 * }
 */ 
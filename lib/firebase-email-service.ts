import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

// 📧 Interface para email usando Firebase Trigger Email Extension
interface FirebaseEmailData {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  from?: string;
  replyTo?: string;
  subject: string;
  text?: string;
  html?: string;
  template?: {
    name: string;
    data: Record<string, any>;
  };
}

interface WelcomeEmailData {
  userName: string;
  userEmail: string;
}

export class FirebaseEmailService {
  /**
   * 🎉 Envía email de bienvenida usando Firebase Extension
   */
  static async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    try {
      console.log('📧 Enviando email de bienvenida via Firebase a:', data.userEmail);

      const emailDoc: FirebaseEmailData = {
        to: data.userEmail,
        subject: '🙏 ¡Bienvenido a Devocionarios Bíblicos!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Bienvenido a Devocionarios Bíblicos</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
              .icon { font-size: 48px; margin-bottom: 10px; }
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
                
                <p>Has dado un paso hermoso hacia un crecimiento espiritual más profundo. En <strong>Devocionarios Bíblicos</strong> encontrarás:</p>
                
                <ul>
                  <li>✨ <strong>Espacio personal</strong> para tus reflexiones diarias</li>
                  <li>📖 <strong>Herramientas</strong> para estudiar la Palabra de Dios</li>
                  <li>🔥 <strong>Sistema</strong> que te ayudará a mantener tu constancia</li>
                  <li>📊 <strong>Seguimiento</strong> de tu progreso espiritual</li>
                </ul>
                
                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tu-app.com'}/home" class="button">
                    📱 Comenzar mi viaje espiritual
                  </a>
                </div>
                
                <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3>💡 Consejo importante:</h3>
                  <p>Agrega nuestra app a tu pantalla de inicio para acceso rápido y recibir notificaciones de recordatorio.</p>
                </div>
                
                <p><strong>Que Dios bendiga abundantemente tu tiempo de estudio y reflexión.</strong></p>
                
                <p>Con cariño,<br>
                <strong>El equipo de Devocionarios Bíblicos</strong> 🙏</p>
              </div>
              
              <div class="footer">
                <p><em>"Lámpara es a mis pies tu palabra, y lumbrera a mi camino."</em><br>
                <strong>- Salmos 119:105</strong></p>
                
                <p style="margin-top: 30px; font-size: 12px; color: #999;">
                  Este correo fue enviado automáticamente. Si no solicitaste esta cuenta, puedes ignorar este mensaje.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
¡Hola ${data.userName}!

🎉 ¡Qué alegría tenerte en nuestra comunidad de Devocionarios Bíblicos!

Has dado un paso hermoso hacia un crecimiento espiritual más profundo. Aquí encontrarás:

✨ Un espacio personal para tus reflexiones diarias
📖 Herramientas para estudiar la Palabra de Dios
🔥 Un sistema que te ayudará a mantener tu constancia
📊 Seguimiento de tu progreso espiritual

📱 Consejo: Agrega nuestra app a tu pantalla de inicio para acceso rápido.

Que Dios bendiga abundantemente tu tiempo de estudio y reflexión.

Con cariño,
El equipo de Devocionarios Bíblicos 🙏

---
"Lámpara es a mis pies tu palabra, y lumbrera a mi camino." - Salmos 119:105
        `
      };

      // Agregar documento a la colección 'mail' que monitorea Firebase Extension
      const docRef = await addDoc(collection(db, 'mail'), {
        ...emailDoc,
        createdAt: Timestamp.now(),
        processed: false
      });

      console.log('✅ Email encolado en Firebase con ID:', docRef.id);
      return true;

    } catch (error) {
      console.error('❌ Error enviando email via Firebase:', error);
      return false;
    }
  }

  /**
   * 🔥 Envía email de recordatorio de racha
   */
  static async sendStreakReminderEmail(data: WelcomeEmailData & { streak: number }): Promise<boolean> {
    try {
      console.log('📧 Enviando email de racha via Firebase a:', data.userEmail);

      const emailDoc: FirebaseEmailData = {
        to: data.userEmail,
        subject: `🔥 ¡No pierdas tu racha de ${data.streak} días!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>¡Mantén tu racha!</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .streak { font-size: 64px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="streak">🔥</div>
                <h1>¡${data.userName}!</h1>
                <h2>${data.streak} días consecutivos</h2>
              </div>
              
              <div class="content">
                <p>Tienes una hermosa racha de <strong>${data.streak} días consecutivos</strong> de estudio bíblico.</p>
                
                <p><strong>¡No dejes que se rompa!</strong> Dedica unos minutos hoy para:</p>
                
                <ul>
                  <li>📖 Leer un versículo</li>
                  <li>✍️ Escribir una reflexión</li>
                  <li>🙏 Conectar con Dios</li>
                </ul>
                
                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tu-app.com'}/dashboard" class="button">
                    🚀 ¡Continuar mi racha!
                  </a>
                </div>
                
                <p><strong>Tu constancia es una bendición. ¡Sigue adelante!</strong></p>
                
                <p>Bendiciones,<br>
                <strong>Devocionarios Bíblicos</strong> 🙏</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
¡Hola ${data.userName}!

🔥 Tienes una hermosa racha de ${data.streak} días consecutivos de estudio bíblico.

¡No dejes que se rompa! Dedica unos minutos hoy para:
📖 Leer un versículo
✍️ Escribir una reflexión
🙏 Conectar con Dios

Tu constancia es una bendición. ¡Sigue adelante!

Bendiciones,
Devocionarios Bíblicos 🙏
        `
      };

      const docRef = await addDoc(collection(db, 'mail'), {
        ...emailDoc,
        createdAt: Timestamp.now(),
        processed: false
      });

      console.log('✅ Email de racha encolado en Firebase con ID:', docRef.id);
      return true;

    } catch (error) {
      console.error('❌ Error enviando email de racha via Firebase:', error);
      return false;
    }
  }

  /**
   * 📊 Envía reporte semanal
   */
  static async sendWeeklyReport(data: WelcomeEmailData & { 
    completed: number; 
    streak: number; 
    totalDevocionales: number;
    totalStudies: number;
  }): Promise<boolean> {
    try {
      const emailDoc: FirebaseEmailData = {
        to: data.userEmail,
        subject: '📊 Tu reporte semanal está listo',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Reporte Semanal</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
              .stats { display: flex; justify-content: space-around; margin: 20px 0; }
              .stat { text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 0 5px; }
              .stat-number { font-size: 32px; font-weight: bold; color: #3b82f6; }
              .stat-label { font-size: 14px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📊 Tu Progreso Semanal</h1>
                <p>¡Hola ${data.userName}!</p>
              </div>
              
              <div class="content">
                <h2>🎉 ¡Aquí tienes tu resumen de la semana!</h2>
                
                <div class="stats">
                  <div class="stat">
                    <div class="stat-number">${data.completed}</div>
                    <div class="stat-label">Devocionales completados</div>
                  </div>
                  <div class="stat">
                    <div class="stat-number">${data.streak}</div>
                    <div class="stat-label">Racha actual</div>
                  </div>
                </div>
                
                <div class="stats">
                  <div class="stat">
                    <div class="stat-number">${data.totalDevocionales}</div>
                    <div class="stat-label">Total devocionales</div>
                  </div>
                  <div class="stat">
                    <div class="stat-number">${data.totalStudies}</div>
                    <div class="stat-label">Estudios temáticos</div>
                  </div>
                </div>
                
                <p>¡Sigue así! Tu dedicación y constancia son una inspiración. 🙏</p>
                
                <p>Bendiciones,<br>
                <strong>Devocionarios Bíblicos</strong></p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const docRef = await addDoc(collection(db, 'mail'), {
        ...emailDoc,
        createdAt: Timestamp.now(),
        processed: false
      });

      console.log('✅ Reporte semanal encolado en Firebase con ID:', docRef.id);
      return true;

    } catch (error) {
      console.error('❌ Error enviando reporte semanal via Firebase:', error);
      return false;
    }
  }
} 
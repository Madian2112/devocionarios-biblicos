import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

// 📧 SERVICIO DE EMAILS 100% GRATUITO CON BREVO
// 🎯 9,000 emails/mes completamente gratis + 100K contactos

interface WelcomeEmailData {
  userName: string;
  userEmail: string;
}

interface BrevoEmailData {
  sender: {
    name: string;
    email: string;
  };
  to: Array<{
    email: string;
    name: string;
  }>;
  subject: string;
  htmlContent: string;
  textContent: string;
  headers?: {
    [key: string]: string;
  };
}

export class BrevoEmailService {
  // 🔑 Tu API Key de Brevo (gratis) - Cámbiala por la tuya
  private static readonly API_KEY = process.env.NEXT_PUBLIC_BREVO_API_KEY || 'TU_API_KEY_AQUI';
  private static readonly API_URL = 'https://api.brevo.com/v3/smtp/email';

  /**
   * 🎉 Enviar email de bienvenida (100% GRATIS)
   */
  /**
   * 🔑 Enviar email de reset password (personalizado)
   */
  static async sendPasswordResetEmail(data: { userEmail: string }): Promise<boolean> {
    try {
      console.log('🔑 Enviando email de reset password con Brevo:', data.userEmail);

      const userName = data.userEmail.split('@')[0];

      const emailData = {
        sender: {
          name: 'Devocionarios Bíblicos - Soporte',
          email: 'noreply@tu-dominio.com', // Cambia por tu dominio verificado
        },
        to: [{ email: data.userEmail, name: userName }],
        subject: '🔑 Restablecimiento de Contraseña - Devocionarios Bíblicos',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="font-size: 64px; margin: 0;">🔑</h1>
              <h2 style="margin: 20px 0 10px 0;">Restablecimiento de Contraseña</h2>
              <p style="margin: 0; opacity: 0.9;">Hemos recibido tu solicitud</p>
            </div>
            <div style="padding: 40px; background: white; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <h3 style="color: #1f2937;">🛡️ Hola ${userName}</h3>
              <p>Has solicitado restablecer tu contraseña en <strong>Devocionarios Bíblicos</strong>.</p>
              
              <div style="margin: 20px 0; padding: 20px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #dc2626;">
                <h4 style="margin: 0 0 10px 0; color: #dc2626;">📧 Revisa tu email oficial</h4>
                <p style="margin: 0; color: #374151;">Recibirás otro email de <strong>Firebase Authentication</strong> con el enlace oficial para restablecer tu contraseña. Ese email contiene el enlace seguro que debes usar.</p>
              </div>

              <div style="margin: 20px 0; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <strong>🔒 Pasos a seguir:</strong>
                <ol style="margin: 10px 0; padding-left: 20px;">
                  <li>Busca el email oficial de Firebase</li>
                  <li>Haz clic en "Restablecer contraseña"</li>
                  <li>Crea tu nueva contraseña</li>
                  <li>¡Regresa a estudiar la Palabra!</li>
                </ol>
              </div>

              <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; font-style: italic; text-align: center;">
                  <strong>⚠️ ¿No solicitaste esto?</strong><br>
                  Si no fuiste tú, simplemente ignora este email. Tu cuenta está segura.
                </p>
              </div>

              <div style="background: #ecfdf5; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; font-style: italic; text-align: center;">
                "Confía en el Señor de todo corazón, y no en tu propia inteligencia." - Proverbios 3:5
              </div>

              <p><strong>Que Dios bendiga tu regreso a Su Palabra.</strong></p>
              <p>Con amor cristiano,<br><strong>El equipo de Devocionarios Bíblicos</strong> 💙</p>
            </div>
          </div>
        `,
        textContent: `
🔑 Restablecimiento de Contraseña - Devocionarios Bíblicos

Hola ${userName},

Has solicitado restablecer tu contraseña en Devocionarios Bíblicos.

📧 IMPORTANTE: Recibirás otro email de Firebase Authentication con el enlace oficial para restablecer tu contraseña. ESE email contiene el enlace seguro que debes usar.

🔒 Pasos a seguir:
1. Busca el email oficial de Firebase
2. Haz clic en "Restablecer contraseña"  
3. Crea tu nueva contraseña
4. ¡Regresa a estudiar la Palabra!

⚠️ ¿No solicitaste esto?
Si no fuiste tú, simplemente ignora este email. Tu cuenta está segura.

"Confía en el Señor de todo corazón, y no en tu propia inteligencia." - Proverbios 3:5

Con amor cristiano,
El equipo de Devocionarios Bíblicos 💙
        `
      };

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'api-key': this.API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Email de reset password enviado con Brevo:', result.messageId);
        return true;
      } else {
        const error = await response.text();
        console.error('❌ Error con Brevo (reset password):', error);
        return false;
      }

    } catch (error) {
      console.error('❌ Error en BrevoEmailService (reset password):', error);
      return false;
    }
  }

  static async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    try {
      console.log('📧 Enviando email de bienvenida con Brevo (GRATIS):', data.userEmail);

      const emailData: BrevoEmailData = {
        sender: {
          name: 'Devocionarios Bíblicos',
          email: 'noreply@tu-dominio.com', // Cambiar por tu dominio
        },
        to: [
          {
            email: data.userEmail,
            name: data.userName,
          },
        ],
        subject: '🙏 ¡Bienvenido a Devocionarios Bíblicos!',
        htmlContent: this.generateWelcomeHTML(data),
        textContent: this.generateWelcomeText(data),
        headers: {
          'X-Mailin-custom': 'Devocionarios|welcome|' + Date.now(),
        },
      };

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.API_KEY,
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Email enviado exitosamente:', result.messageId);
        
        // 📊 Opcional: Guardar estadística en Firestore
        await this.logEmailSent('welcome', data.userEmail);
        
        return true;
      } else {
        const error = await response.text();
        console.error('❌ Error enviando email:', error);
        return false;
      }

    } catch (error) {
      console.error('❌ Error en BrevoEmailService:', error);
      return false;
    }
  }

  /**
   * 🔥 Enviar email de recordatorio de racha (100% GRATIS)
   */
  static async sendStreakReminder(data: WelcomeEmailData & { streak: number }): Promise<boolean> {
    try {
      const emailData: BrevoEmailData = {
        sender: {
          name: 'Devocionarios Bíblicos',
          email: 'noreply@tu-dominio.com',
        },
        to: [
          {
            email: data.userEmail,
            name: data.userName,
          },
        ],
        subject: `🔥 ¡No pierdas tu racha de ${data.streak} días!`,
        htmlContent: this.generateStreakHTML(data),
        textContent: this.generateStreakText(data),
        headers: {
          'X-Mailin-custom': 'Devocionarios|streak|' + Date.now(),
        },
      };

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.API_KEY,
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        console.log('✅ Email de racha enviado exitosamente');
        await this.logEmailSent('streak', data.userEmail);
        return true;
      } else {
        console.error('❌ Error enviando email de racha');
        return false;
      }

    } catch (error) {
      console.error('❌ Error enviando reminder:', error);
      return false;
    }
  }

  /**
   * 📊 Enviar reporte semanal (100% GRATIS)
   */
  static async sendWeeklyReport(data: WelcomeEmailData & { 
    completed: number; 
    streak: number; 
    totalDevocionales: number; 
    totalStudies: number; 
  }): Promise<boolean> {
    try {
      const emailData: BrevoEmailData = {
        sender: {
          name: 'Devocionarios Bíblicos',
          email: 'noreply@tu-dominio.com',
        },
        to: [
          {
            email: data.userEmail,
            name: data.userName,
          },
        ],
        subject: `📊 Tu progreso semanal: ${data.completed} devocionales completados`,
        htmlContent: this.generateWeeklyHTML(data),
        textContent: this.generateWeeklyText(data),
        headers: {
          'X-Mailin-custom': 'Devocionarios|weekly|' + Date.now(),
        },
      };

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.API_KEY,
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        console.log('✅ Reporte semanal enviado exitosamente');
        await this.logEmailSent('weekly', data.userEmail);
        return true;
      } else {
        console.error('❌ Error enviando reporte semanal');
        return false;
      }

    } catch (error) {
      console.error('❌ Error enviando reporte:', error);
      return false;
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
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Bienvenido a Devocionarios Bíblicos</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
          .icon { font-size: 64px; margin-bottom: 20px; }
          .feature { margin: 20px 0; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6; }
          .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px; }
          .verse { font-style: italic; color: #6b7280; background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">🙏</div>
            <h1>¡Bienvenido ${data.userName}!</h1>
            <p style="font-size: 18px; opacity: 0.9;">Tu viaje espiritual comienza aquí</p>
          </div>
          
          <div class="content">
            <h2 style="color: #1f2937;">🎉 ¡Qué alegría tenerte en nuestra comunidad!</h2>
            
            <p style="font-size: 16px;">Has dado un paso hermoso hacia un crecimiento espiritual más profundo. Aquí encontrarás todo lo que necesitas para fortalecer tu relación con Dios.</p>
            
            <div class="feature">
              <strong>✨ Espacio personal</strong> para tus reflexiones diarias
            </div>
            <div class="feature">
              <strong>📖 Herramientas avanzadas</strong> para estudiar la Palabra de Dios
            </div>
            <div class="feature">
              <strong>🔥 Sistema inteligente</strong> que te ayudará a mantener tu constancia
            </div>
            <div class="feature">
              <strong>📊 Seguimiento detallado</strong> de tu progreso espiritual
            </div>
            <div class="feature">
              <strong>🤝 Comunidad</strong> de creyentes comprometidos
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tu-app.com'}/home" class="button">
                📱 Comenzar mi viaje espiritual
              </a>
            </div>
            
            <div class="verse">
              <em>"Lámpara es a mis pies tu palabra, y lumbrera a mi camino."</em><br>
              <strong>- Salmos 119:105</strong>
            </div>
            
            <p><strong>Que Dios bendiga abundantemente tu tiempo de estudio y reflexión.</strong></p>
            
            <p>Con amor cristiano,<br><strong>El equipo de Devocionarios Bíblicos</strong> ❤️</p>
          </div>
          
          <div class="footer">
            <p>© 2025 Devocionarios Bíblicos - Creciendo en la fe juntos</p>
            <p>Si tienes alguna pregunta, responde a este email</p>
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
📖 Herramientas avanzadas para estudiar la Palabra de Dios  
🔥 Un sistema inteligente que te ayudará a mantener tu constancia
📊 Seguimiento detallado de tu progreso espiritual
🤝 Una comunidad de creyentes comprometidos

📱 Comienza tu viaje: ${process.env.NEXT_PUBLIC_APP_URL || 'https://tu-app.com'}/home

"Lámpara es a mis pies tu palabra, y lumbrera a mi camino." - Salmos 119:105

Que Dios bendiga abundantemente tu tiempo de estudio y reflexión.

Con amor cristiano,
El equipo de Devocionarios Bíblicos ❤️

---
© 2025 Devocionarios Bíblicos - Creciendo en la fe juntos
Si tienes alguna pregunta, responde a este email
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
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>¡Mantén tu racha!</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); }
          .streak { font-size: 96px; margin: 20px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
          .action { margin: 15px 0; padding: 16px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b; }
          .progress { background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="streak">🔥</div>
            <h1>${data.userName}</h1>
            <h2 style="margin: 0; font-size: 32px;">${data.streak} días consecutivos</h2>
            <p style="opacity: 0.9;">¡Tu constancia es admirable!</p>
          </div>
          
          <div class="content">
            <div class="progress">
              <h3 style="color: #dc2626; margin-top: 0;">🏆 ¡Increíble progreso!</h3>
              <p>Tienes una hermosa racha de <strong>${data.streak} días consecutivos</strong> de estudio bíblico.</p>
            </div>
            
            <p style="font-size: 18px; text-align: center;"><strong>¡No dejes que se rompa!</strong></p>
            
            <p>Dedica unos minutos hoy para:</p>
            
            <div class="action">📖 <strong>Leer un versículo</strong> - Nutre tu alma con la Palabra</div>
            <div class="action">✍️ <strong>Escribir una reflexión</strong> - Profundiza en su significado</div>
            <div class="action">🙏 <strong>Conectar con Dios</strong> - Fortalece tu relación personal</div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tu-app.com'}/dashboard" class="button">
                🚀 ¡Continuar mi racha!
              </a>
            </div>
            
            <p style="text-align: center; font-style: italic; color: #6b7280;">
              "Cada día es una nueva oportunidad para crecer en la fe"
            </p>
            
            <p><strong>Tu constancia es una bendición. ¡Sigue adelante!</strong></p>
            
            <p>Bendiciones,<br><strong>Devocionarios Bíblicos</strong> 🙏</p>
          </div>
          
          <div class="footer">
            <p>© 2025 Devocionarios Bíblicos</p>
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

🔥 ¡Increíble! Tienes una hermosa racha de ${data.streak} días consecutivos de estudio bíblico.

🏆 Tu constancia es admirable y una bendición.

¡No dejes que se rompa! Dedica unos minutos hoy para:
📖 Leer un versículo - Nutre tu alma con la Palabra
✍️ Escribir una reflexión - Profundiza en su significado
🙏 Conectar con Dios - Fortalece tu relación personal

"Cada día es una nueva oportunidad para crecer en la fe"

🚀 Continúa tu racha: ${process.env.NEXT_PUBLIC_APP_URL || 'https://tu-app.com'}/dashboard

Tu constancia es una bendición. ¡Sigue adelante!

Bendiciones,
Devocionarios Bíblicos 🙏

---
© 2025 Devocionarios Bíblicos
    `;
  }

  /**
   * 📊 Generar HTML de reporte semanal
   */
  private static generateWeeklyHTML(data: WelcomeEmailData & { 
    completed: number; 
    streak: number; 
    totalDevocionales: number; 
    totalStudies: number; 
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Tu progreso semanal</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #059669, #3b82f6); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 30px; }
          .stat { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 15px 0; text-align: center; border-left: 4px solid #3b82f6; }
          .stat-number { font-size: 36px; font-weight: bold; color: #1e40af; margin: 0; }
          .stat-label { color: #6b7280; margin: 5px 0 0 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #059669, #3b82f6); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
          .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-size: 64px; margin-bottom: 20px;">📊</div>
            <h1>¡Hola ${data.userName}!</h1>
            <p style="font-size: 18px; opacity: 0.9;">Tu progreso de esta semana</p>
          </div>
          
          <div class="content">
            <h2 style="color: #1f2937; text-align: center;">🎯 Resumen Semanal</h2>
            
            <div class="stat">
              <div class="stat-number">${data.completed}</div>
              <div class="stat-label">Devocionales completados esta semana</div>
            </div>
            
            <div class="stat">
              <div class="stat-number">${data.streak}</div>
              <div class="stat-label">Días consecutivos de estudio</div>
            </div>
            
            <div class="stat">
              <div class="stat-number">${data.totalDevocionales}</div>
              <div class="stat-label">Total de devocionales</div>
            </div>
            
            <div class="stat">
              <div class="stat-number">${data.totalStudies}</div>
              <div class="stat-label">Estudios temáticos completados</div>
            </div>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3 style="color: #065f46; margin-top: 0;">💪 ¡Excelente trabajo!</h3>
              <p style="color: #047857;">Tu dedicación al estudio bíblico es inspiradora. Sigue creciendo en la fe.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tu-app.com'}/dashboard" class="button">
                📱 Ver mi progreso completo
              </a>
            </div>
            
            <p style="text-align: center; font-style: italic; color: #6b7280;">
              "Persevera en la lectura, la exhortación y la enseñanza" - 1 Timoteo 4:13
            </p>
            
            <p>¡Que Dios bendiga tu constancia y dedicación!</p>
            
            <p>Con cariño,<br><strong>El equipo de Devocionarios Bíblicos</strong> ❤️</p>
          </div>
          
          <div class="footer">
            <p>© 2025 Devocionarios Bíblicos</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 📝 Generar texto plano de reporte semanal
   */
  private static generateWeeklyText(data: WelcomeEmailData & { 
    completed: number; 
    streak: number; 
    totalDevocionales: number; 
    totalStudies: number; 
  }): string {
    return `
¡Hola ${data.userName}!

📊 TU PROGRESO SEMANAL

🎯 Resumen de esta semana:
• ${data.completed} devocionales completados
• ${data.streak} días consecutivos de estudio
• ${data.totalDevocionales} total de devocionales
• ${data.totalStudies} estudios temáticos completados

💪 ¡Excelente trabajo! Tu dedicación al estudio bíblico es inspiradora. Sigue creciendo en la fe.

"Persevera en la lectura, la exhortación y la enseñanza" - 1 Timoteo 4:13

📱 Ve tu progreso completo: ${process.env.NEXT_PUBLIC_APP_URL || 'https://tu-app.com'}/dashboard

¡Que Dios bendiga tu constancia y dedicación!

Con cariño,
El equipo de Devocionarios Bíblicos ❤️

---
© 2025 Devocionarios Bíblicos
    `;
  }

  /**
   * 📊 Registrar email enviado (opcional - para estadísticas)
   */
  private static async logEmailSent(type: string, email: string): Promise<void> {
    try {
      await addDoc(collection(db, 'email_logs'), {
        type,
        email,
        service: 'brevo',
        timestamp: Timestamp.now(),
        success: true,
      });
    } catch (error) {
      // No es crítico si falla el log
      console.log('Info: No se pudo registrar el log del email');
    }
  }

  /**
   * 📈 Obtener estadísticas de emails enviados
   */
  static async getEmailStats(): Promise<{ sent: number; types: Record<string, number> }> {
    try {
      // Implementar si necesitas estadísticas
      return { sent: 0, types: {} };
    } catch (error) {
      return { sent: 0, types: {} };
    }
  }
}

/**
 * 🔧 INSTRUCCIONES DE CONFIGURACIÓN:
 * 
 * 1. Regístrate GRATIS en https://www.brevo.com
 * 2. Ve a tu cuenta → API & SMTP → API Keys
 * 3. Crea una nueva API Key
 * 4. Añade a tu .env.local:
 *    NEXT_PUBLIC_BREVO_API_KEY=tu_api_key_aqui
 * 5. Verifica tu dominio de envío en Brevo
 * 6. ¡Listo! 9,000 emails gratis al mes
 * 
 * 📊 LÍMITES GRATUITOS:
 * - 300 emails/día = 9,000 emails/mes
 * - 100,000 contactos
 * - Sin fecha de expiración
 * - Automatización incluida
 * - Sin tarjeta de crédito requerida
 */ 
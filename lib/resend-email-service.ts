// 📧 ALTERNATIVA: RESEND EMAIL SERVICE (3,000 emails/mes GRATIS)
// 🔗 Regístrate en: https://resend.com

interface WelcomeEmailData {
  userName: string;
  userEmail: string;
}

export class ResendEmailService {
  // 🔑 Tu API Key de Resend (gratis)
  private static readonly API_KEY = process.env.NEXT_PUBLIC_RESEND_API_KEY || 'TU_API_KEY_AQUI';
  private static readonly API_URL = 'https://api.resend.com/emails';

  /**
   * 🎉 Enviar email de bienvenida con Resend (GRATIS)
   */
  static async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    try {
      console.log('📧 Enviando email con Resend (3K gratis/mes):', data.userEmail);

      const emailData = {
        from: 'Devocionarios Bíblicos <noreply@tu-dominio.com>',
        to: [data.userEmail],
        subject: '🙏 ¡Bienvenido a Devocionarios Bíblicos!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="font-size: 64px; margin: 0;">🙏</h1>
              <h2 style="margin: 20px 0 10px 0;">¡Bienvenido ${data.userName}!</h2>
              <p style="margin: 0; opacity: 0.9;">Tu viaje espiritual comienza aquí</p>
            </div>
            <div style="padding: 40px; background: white; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <h3 style="color: #1f2937;">🎉 ¡Qué alegría tenerte en nuestra comunidad!</h3>
              <p>Has dado un paso hermoso hacia un crecimiento espiritual más profundo.</p>
              <div style="margin: 20px 0; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <strong>✨ Espacio personal</strong> para tus reflexiones diarias
              </div>
              <div style="margin: 20px 0; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <strong>📖 Herramientas</strong> para estudiar la Palabra de Dios
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tu-app.com'}/home" 
                   style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  📱 Comenzar mi viaje espiritual
                </a>
              </div>
              <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; font-style: italic; text-align: center;">
                "Lámpara es a mis pies tu palabra, y lumbrera a mi camino." - Salmos 119:105
              </div>
              <p><strong>Que Dios bendiga abundantemente tu tiempo de estudio y reflexión.</strong></p>
              <p>Con amor cristiano,<br><strong>El equipo de Devocionarios Bíblicos</strong> ❤️</p>
            </div>
          </div>
        `,
        text: `
¡Hola ${data.userName}!

🎉 ¡Qué alegría tenerte en nuestra comunidad de Devocionarios Bíblicos!

Has dado un paso hermoso hacia un crecimiento espiritual más profundo. Aquí encontrarás:

✨ Un espacio personal para tus reflexiones diarias
📖 Herramientas para estudiar la Palabra de Dios  
🔥 Un sistema que te ayudará a mantener tu constancia

📱 Comienza: ${process.env.NEXT_PUBLIC_APP_URL || 'https://tu-app.com'}/home

"Lámpara es a mis pies tu palabra, y lumbrera a mi camino." - Salmos 119:105

Con amor cristiano,
El equipo de Devocionarios Bíblicos ❤️
        `
      };

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Email enviado con Resend:', result.id);
        return true;
      } else {
        const error = await response.text();
        console.error('❌ Error con Resend:', error);
        return false;
      }

    } catch (error) {
      console.error('❌ Error en ResendEmailService:', error);
      return false;
    }
  }
}

/**
 * 🔧 SETUP RESEND (MUY FÁCIL):
 * 
 * 1. Regístrate en https://resend.com
 * 2. Ve a API Keys y crea una nueva
 * 3. Añade a .env.local:
 *    NEXT_PUBLIC_RESEND_API_KEY=re_tu_api_key_aqui
 * 4. Verifica tu dominio en Resend
 * 5. ¡Listo! 3,000 emails gratis/mes
 * 
 * 📊 LÍMITES:
 * - 3,000 emails/mes (100/día)
 * - Dominios ilimitados
 * - API súper simple
 * - Excelente para developers
 */ 
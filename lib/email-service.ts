import emailjs from '@emailjs/browser';

// 📧 Configuración de EmailJS
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

interface WelcomeEmailData {
  userName: string;
  userEmail: string;
}

export class EmailService {
  private static initialized = false;

  private static async init() {
    if (!this.initialized) {
      emailjs.init(EMAILJS_PUBLIC_KEY);
      this.initialized = true;
    }
  }

  /**
   * 🎉 Envía email de bienvenida a nuevo usuario
   */
  static async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    try {
      await this.init();

      console.log('📧 Enviando email de bienvenida a:', data.userEmail);

      const templateParams = {
        to_name: data.userName,
        to_email: data.userEmail,
        from_name: 'Devocionarios Bíblicos',
        subject: '🙏 ¡Bienvenido a tu Nuevo Viaje Espiritual!',
        message: `
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
        `,
      };

      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log('✅ Email de bienvenida enviado exitosamente:', result);
      return true;

    } catch (error) {
      console.error('❌ Error enviando email de bienvenida:', error);
      return false;
    }
  }

  /**
   * 📬 Envía email de recordatorio de racha
   */
  static async sendStreakReminderEmail(data: WelcomeEmailData & { streak: number }): Promise<boolean> {
    try {
      await this.init();

      const templateParams = {
        to_name: data.userName,
        to_email: data.userEmail,
        from_name: 'Devocionarios Bíblicos',
        subject: `🔥 ¡No pierdas tu racha de ${data.streak} días!`,
        message: `
¡Hola ${data.userName}!

🔥 Tienes una hermosa racha de ${data.streak} días consecutivos de estudio bíblico.

¡No dejes que se rompa! Dedica unos minutos hoy para:
📖 Leer un versículo
✍️ Escribir una reflexión
🙏 Conectar con Dios

Tu constancia es una bendición. ¡Sigue adelante!

Bendiciones,
Devocionarios Bíblicos 🙏
        `,
      };

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email de racha:', error);
      return false;
    }
  }
} 
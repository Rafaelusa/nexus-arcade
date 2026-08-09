import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initTransporter();
  }

  private async initTransporter() {
    // Para ambiente de dev/teste, usa conta Ethereal ou SMTP local simulado
    const testAccount = await nodemailer.createTestAccount().catch(() => null);

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || testAccount?.smtp.host || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || testAccount?.smtp.port || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || testAccount?.user || 'nexus.arcade.robot@ethereal.email',
        pass: process.env.SMTP_PASS || testAccount?.pass || 'secret_pass_123',
      },
    });

    this.logger.log('[MailService] Robô de Envio de E-mails inicializado com sucesso.');
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `http://localhost:4200/reset-password?token=${resetToken}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 32px; border-radius: 12px;">
        <h1 style="color: #00f0ff; margin-bottom: 8px;">🎮 NEXUS ARCADE</h1>
        <h2 style="color: #ff007f;">Solicitação de Redefinição de Senha</h2>
        <p style="font-size: 15px; color: #94a3b8;">
          Recebemos uma solicitação para redefinir a senha da sua conta vinculada ao e-mail <strong>${email}</strong>.
        </p>
        <p style="margin-top: 24px;">
          Clique no botão abaixo para redefinir sua senha com segurança (Link válido por 15 minutos):
        </p>
        <div style="margin: 32px 0;">
          <a href="${resetUrl}" target="_blank" style="background: linear-gradient(135deg, #00f0ff, #7000ff); color: #000; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-size: 16px; display: inline-block;">
            🔒 REDEFINIR SENHA AGORA
          </a>
        </div>
        <p style="font-size: 12px; color: #64748b;">
          Se você não solicitou a redefinição de senha, ignore este e-mail. Nenhuma alteração foi realizada.
        </p>
        <hr style="border: 0; border-top: 1px solid #334155; margin-top: 32px;" />
        <p style="font-size: 11px; color: #64748b; text-align: center;">
          Nexus Arcade — Plataforma de Emulação Retro Cloud High Performance
        </p>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: '"Nexus Arcade Security" <no-reply@nexusarcade.com>',
        to: email,
        subject: '🔒 Redefinição de Senha - Nexus Arcade',
        html: htmlContent,
      });

      this.logger.log(`[MailService] E-mail de redefinição de senha enviado para ${email}. MessageId: ${info.messageId}`);
      if (nodemailer.getTestMessageUrl(info)) {
        this.logger.log(`[MailService] Visualizar e-mail simulado (Ethereal): ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      this.logger.error(`[MailService] Erro ao enviar e-mail para ${email}: ${error.message}`);
    }
  }

  async sendAccountStatusNotification(email: string, username: string, isBlocked: boolean): Promise<void> {
    const statusText = isBlocked ? 'BLOQUEADA' : 'DESBLOQUEADA / ATIVADA';
    const statusColor = isBlocked ? '#ef4444' : '#10b981';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 32px; border-radius: 12px;">
        <h1 style="color: #00f0ff; margin-bottom: 8px;">🎮 NEXUS ARCADE</h1>
        <h2>Notificação de Status da Conta</h2>
        <p style="font-size: 15px; color: #94a3b8;">
          Olá <strong>${username}</strong>, informamos que o status da sua conta no Nexus Arcade foi alterado.
        </p>
        <div style="margin: 24px 0; padding: 16px; background-color: rgba(15,23,42,0.9); border: 2px solid ${statusColor}; border-radius: 8px;">
          <span style="font-size: 18px; font-weight: bold; color: ${statusColor};">
            STATUS ATUAL: ${statusText}
          </span>
        </div>
        ${
          isBlocked
            ? '<p style="color: #ef4444;">Sua conta foi suspensa temporariamente por um Administrador. Entre em contato com a equipe de suporte caso considere isso um engano.</p>'
            : '<p style="color: #10b981;">Sua conta foi reativada e você já pode fazer login e jogar normalmente na biblioteca!</p>'
        }
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: '"Nexus Arcade Support" <support@nexusarcade.com>',
        to: email,
        subject: `🔔 Notificação de Status de Conta (${statusText}) - Nexus Arcade`,
        html: htmlContent,
      });
      this.logger.log(`[MailService] Notificação de status de conta enviada para ${email}`);
    } catch (error) {
      this.logger.error(`[MailService] Erro ao enviar notificação de status para ${email}: ${error.message}`);
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private isRealSmtpConfigured = false;

  constructor() {
    this.initTransporter();
  }

  private async initTransporter() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.isRealSmtpConfigured = true;
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass },
      });
      this.logger.log(`[MailService] Robô SMTP REAL configurado para servidor ${host} (Usuário: ${user}).`);
    } else {
      this.isRealSmtpConfigured = false;
      const testAccount = await nodemailer.createTestAccount().catch(() => null);
      if (testAccount) {
        this.transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: { user: testAccount.user, pass: testAccount.pass },
        });
        this.logger.log(`[MailService] Modo Sandbox Ethereal Ativo. E-mails de teste serão capturados e os links exibidos nos logs.`);
      }
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<{ sentRealEmail: boolean; previewUrl?: string }> {
    if (!this.transporter) {
      await this.initTransporter();
    }

    const resetUrl = `http://localhost:4200/reset-password?token=${resetToken}`;
    const fromAddress = process.env.SMTP_FROM || '"Nexus Arcade Security" <no-reply@nexusarcade.com>';

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
      if (!this.transporter) {
        return { sentRealEmail: false };
      }

      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: '🔒 Redefinição de Senha - Nexus Arcade',
        html: htmlContent,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;

      this.logger.log(`[MailService] E-mail de redefinição processado para ${email}. MessageId: ${info.messageId}`);
      if (previewUrl) {
        this.logger.log(`[MailService] 🔗 Link de visualização do e-mail (Ethereal Sandbox): ${previewUrl}`);
      }

      return {
        sentRealEmail: this.isRealSmtpConfigured,
        previewUrl,
      };
    } catch (error) {
      this.logger.error(`[MailService] Erro ao enviar e-mail para ${email}: ${error.message}`);
      return { sentRealEmail: false };
    }
  }

  async sendAccountStatusNotification(email: string, username: string, isBlocked: boolean): Promise<void> {
    if (!this.transporter) {
      await this.initTransporter();
    }

    const statusText = isBlocked ? 'BLOQUEADA' : 'DESBLOQUEADA / ATIVADA';
    const statusColor = isBlocked ? '#ef4444' : '#10b981';
    const fromAddress = process.env.SMTP_FROM || '"Nexus Arcade Support" <support@nexusarcade.com>';

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
      if (this.transporter) {
        await this.transporter.sendMail({
          from: fromAddress,
          to: email,
          subject: `🔔 Notificação de Status de Conta (${statusText}) - Nexus Arcade`,
          html: htmlContent,
        });
        this.logger.log(`[MailService] Notificação de status de conta enviada para ${email}`);
      }
    } catch (error) {
      this.logger.error(`[MailService] Erro ao enviar notificação de status para ${email}: ${error.message}`);
    }
  }
}

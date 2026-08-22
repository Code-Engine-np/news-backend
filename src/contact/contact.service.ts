import {
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Resend } from 'resend';
import { CreateContactDto } from './dto/create-contact.dto';

/** Minimal HTML escaping so visitor-supplied text can't inject markup. */
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private readonly resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

  async sendContactMessage(dto: CreateContactDto): Promise<{ success: true }> {
    const to = process.env.CONTACT_TO_EMAIL;
    const from =
      process.env.CONTACT_FROM_EMAIL ?? 'Best Khabar <onboarding@resend.dev>';

    if (!this.resend || !to) {
      this.logger.error(
        'Contact email not configured: set RESEND_API_KEY and CONTACT_TO_EMAIL.',
      );
      throw new ServiceUnavailableException(
        'Email service is not configured. Please try again later.',
      );
    }

    const subject = dto.subject?.trim()
      ? `[Contact] ${dto.subject.trim()}`
      : `[Contact] New message from ${dto.name}`;

    const safeName = escapeHtml(dto.name);
    const safeEmail = escapeHtml(dto.email);
    const safeSubject = dto.subject ? escapeHtml(dto.subject) : '—';
    const safeMessage = escapeHtml(dto.message).replace(/\n/g, '<br/>');

    const html = `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #1c2a24;">
        <h2 style="margin: 0 0 12px;">New contact form submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <hr style="border: none; border-top: 1px solid #e5ebe5; margin: 16px 0;" />
        <p style="white-space: pre-wrap;">${safeMessage}</p>
      </div>
    `;

    const text =
      `New contact form submission\n\n` +
      `Name: ${dto.name}\n` +
      `Email: ${dto.email}\n` +
      `Subject: ${dto.subject ?? '—'}\n\n` +
      `${dto.message}`;

    const { error } = await this.resend.emails.send({
      from,
      to,
      replyTo: dto.email,
      subject,
      html,
      text,
    });

    if (error) {
      this.logger.error(`Resend failed to send contact email: ${error.message}`);
      throw new InternalServerErrorException(
        'Failed to send your message. Please try again later.',
      );
    }

    return { success: true };
  }
}

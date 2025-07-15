import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-reply',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reply.component.html',
  styleUrl: './reply.component.scss'
})
export class ReplyComponent implements OnInit {
  // Form verileri
  customerEmail = '';
  customerName = '';
  serviceType = '';
  appointmentDate = '';
  appointmentTime = '';
  additionalMessage = '';

  // Servis seçenekleri
  serviceOptions = [
    'Teta Healing',
    'Reiki Şifacılığı',
    'AccessBars',
    'Enerji Temizliği',
    'Chakra Dengesi',
    'Aura Okuma',
    'Genel Danışmanlık'
  ];

  private isBrowser: boolean;

  constructor(
    private route: ActivatedRoute,
    private meta: Meta,
    private title: Title,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // SEO için noindex ve nofollow meta tag'leri ekle
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    this.meta.updateTag({ name: 'description', content: 'Internal tool for email template generation' });
    this.title.setTitle('Email Yanıt Hazırlayıcı - Internal Tool');

    if (this.isBrowser) {
      // URL parametrelerinden verileri al
      this.route.queryParams.subscribe(params => {
        this.customerEmail = params['email'] || '';
        this.customerName = params['name'] || '';
        this.serviceType = params['service'] || this.serviceOptions[0];
      });

      // İlk önizlemeyi güncelle
      this.updatePreview();
    }
  }

  // Email şablonunu oluştur (HTML version)
  generateEmailTemplate(): string {
    let appointmentInfo = '';

    if (this.appointmentDate && this.appointmentTime) {
      const formattedDate = new Date(this.appointmentDate).toLocaleDateString('tr-TR');
      appointmentInfo = `
        <div style="background: #fff5f5; border-left: 4px solid #f56565; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3 style="color: #c53030; margin: 0 0 10px 0; font-size: 16px;">
            🗓️ Randevu Önerisi
          </h3>
          <p style="color: #c53030; margin: 0; font-size: 14px;">
            <strong>Tarih:</strong> ${formattedDate}<br>
            <strong>Saat:</strong> ${this.appointmentTime}<br>
            <em>Bu randevu önerimi size uygun mu? Değişiklik istiyorsanız lütfen belirtin.</em>
          </p>
        </div>`;
    }

    return `
<div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">

  <div style="background: linear-gradient(135deg, #52c085, #3a9b69); padding: 25px; text-align: center; color: white;">
    <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 10px; display: inline-flex; align-items: center; justify-content: center;">
      <span style="font-size: 24px; font-weight: bold;">G</span>
    </div>
    <h1 style="margin: 0; font-size: 20px; font-weight: normal;">Gülseven Üçerler</h1>
    <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">Enerji Şifacılığı Uzmanı • Teta Healing • Reiki • AccessBars</p>
  </div>

  <div style="padding: 25px;">

    <p style="color: #2d3748; margin: 0 0 15px 0; font-size: 15px;">
      Merhaba <strong style="color: #52c085;">${this.customerName}</strong>,
    </p>

    <p style="color: #4a5568; margin: 0 0 20px 0; line-height: 1.6; font-size: 14px;">
      Web sitemi ziyaret ettiğiniz ve benimle iletişime geçtiğiniz için çok teşekkür ederim.
      Mesajınızı aldım ve size yardımcı olmaktan büyük mutluluk duyarım. 🌟
    </p>

    <div style="background: #f0fff4; border-left: 4px solid #52c085; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <h3 style="color: #234e52; margin: 0 0 10px 0; font-size: 16px; font-weight: normal;">
        🔮 ${this.serviceType} Hakkında
      </h3>
      <p style="color: #2c7a7b; margin: 0; font-size: 13px; line-height: 1.5;">
        Bu hizmet konusunda detaylı bilgi vermek ve sorularınızı yanıtlamak için
        size özel zaman ayırmak istiyorum.
      </p>
    </div>

    ${appointmentInfo}

    <div style="background: #e6fffa; border-left: 4px solid #52c085; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <h3 style="color: #234e52; margin: 0 0 10px 0; font-size: 16px; font-weight: normal;">
        📅 Çalışma Saatleri
      </h3>
      <p style="color: #2c7a7b; margin: 0; font-size: 13px; line-height: 1.6;">
        • Pazartesi - Cuma: 09:00 - 18:00<br>
        • Cumartesi: 10:00 - 16:00<br>
        • Konum: Bademler, İzmir<br>
        • Seans süresi: 60-90 dakika
      </p>
    </div>

    ${this.additionalMessage ? `
    <div style="background: #fffaf0; border-left: 4px solid #ed8936; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <h3 style="color: #c05621; margin: 0 0 10px 0; font-size: 16px; font-weight: normal;">
        💬 Özel Not
      </h3>
      <p style="color: #c05621; margin: 0; font-size: 13px; line-height: 1.5;">
        ${this.additionalMessage}
      </p>
    </div>` : ''}

    <p style="color: #4a5568; margin: 0 0 20px 0; line-height: 1.6; font-size: 14px;">
      Size uygun olan tarih ve saat aralıklarınızı belirtirseniz,
      randevunuzu uygun bir zamana planlayalım. En kısa sürede size dönüş yapacağım.
    </p>

    <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <p style="margin: 0; font-size: 13px; color: #4a5568;">
        <strong>📧 E-posta:</strong> info@gulsevenucerler.com<br>
        <strong>🌐 Web:</strong> gulsevenucerler.com.tr
      </p>
    </div>

    <p style="color: #2d3748; margin: 20px 0; text-align: center; font-weight: 500; font-size: 14px;">
      Sevgi ve ışıkla, 🙏<br>
      <strong style="color: #52c085; font-size: 16px;">Gülseven Üçerler</strong>
    </p>

  </div>

  <div style="background: #f7fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;">
    <div style="margin-bottom: 8px;">
      <span style="background: #52c085; color: white; padding: 4px 8px; border-radius: 10px; font-size: 10px; margin: 0 3px;">🔮 Teta Healing</span>
      <span style="background: #52c085; color: white; padding: 4px 8px; border-radius: 10px; font-size: 10px; margin: 0 3px;">⚡ Reiki</span>
      <span style="background: #52c085; color: white; padding: 4px 8px; border-radius: 10px; font-size: 10px; margin: 0 3px;">🧠 AccessBars</span>
    </div>
    <p style="margin: 0; color: #718096; font-size: 11px; line-height: 1.4;">
      <strong style="color: #52c085;">gulsevenucerler.com.tr</strong><br>
      🌿 İç huzura ulaşmanın en doğal yolu • ✨ Enerji şifacılığı ile yaşamınızı dönüştürün
    </p>
  </div>

</div>`;
  }

  // Plain text versiyonu oluştur (Gmail URL için)
  generatePlainTextTemplate(): string {
    let appointmentInfo = '';

    if (this.appointmentDate && this.appointmentTime) {
      const formattedDate = new Date(this.appointmentDate).toLocaleDateString('tr-TR');
      appointmentInfo = `

📅 RANDEVU ÖNERİSİ:
Tarih: ${formattedDate}
Saat: ${this.appointmentTime}
(Bu randevu önerimi size uygun mu? Değişiklik istiyorsanız lütfen belirtin.)

`;
    }

    return `Merhaba ${this.customerName},

Web sitemi ziyaret ettiğiniz ve benimle iletişime geçtiğiniz için çok teşekkür ederim. Mesajınızı aldım ve size yardımcı olmaktan büyük mutluluk duyarım. 🌟

🔮 ${this.serviceType} HAKKINDA:
Bu hizmet konusunda detaylı bilgi vermek ve sorularınızı yanıtlamak için size özel zaman ayırmak istiyorum.
${appointmentInfo}
📅 ÇALIŞMA SAATLERİ:
• Pazartesi - Cuma: 09:00 - 18:00
• Cumartesi: 10:00 - 16:00
• Konum: Bademler, İzmir
• Seans süresi: 60-90 dakika

${this.additionalMessage ? `💬 ÖZEL NOT:
${this.additionalMessage}

` : ''}Size uygun olan tarih ve saat aralıklarınızı belirtirseniz, randevunuzu uygun bir zamana planlayalım. En kısa sürede size dönüş yapacağım.

📧 E-posta: info@gulsevenucerler.com
🌐 Web: gulsevenucerler.com.tr

Sevgi ve ışıkla, 🙏
Gülseven Üçerler

----
🔮 Teta Healing • ⚡ Reiki • 🧠 AccessBars
gulsevenucerler.com.tr
🌿 İç huzura ulaşmanın en doğal yolu • ✨ Enerji şifacılığı ile yaşamınızı dönüştürün`;
  }

  // Önizlemeyi güncelle
  updatePreview() {
    if (this.isBrowser) {
      const previewElement = document.getElementById('emailPreview');
      if (previewElement) {
        previewElement.innerHTML = this.generateEmailTemplate();
      }
    }
  }

  // Gmail'de aç (Plain text versiyonu)
  sendToGmail() {
    if (!this.isBrowser) return;

    const plainTextContent = this.generatePlainTextTemplate();
    const subject = encodeURIComponent(`Re: ${this.serviceType} - Gülseven Üçerler`);
    const body = encodeURIComponent(plainTextContent);

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${this.customerEmail}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  }

  // HTML formatını panoya kopyala (Rich text için)
  async copyAsRichText() {
    if (!this.isBrowser) return;

    try {
      const htmlContent = this.generateEmailTemplate();

      // HTML içeriğini geçici bir div'e koy
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      document.body.appendChild(tempDiv);

      // İçeriği seç
      const range = document.createRange();
      range.selectNodeContents(tempDiv);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);

        // Kopyala
        const successful = document.execCommand('copy');
        if (successful) {
          alert('✅ HTML email şablonu rich format olarak kopyalandı!\n\n📧 Gmail\'de şu adımları izleyin:\n1. "Oluştur" butonuna tıklayın\n2. Rich formatting modunda olduğunuzdan emin olun (A simgesi aktif)\n3. Ctrl+V ile yapıştırın\n\n💡 HTML formatı görünecektir!');
        } else {
          throw new Error('Kopyalama komutu başarısız');
        }

        selection.removeAllRanges();
      }

      // Geçici div'i kaldır
      document.body.removeChild(tempDiv);

    } catch (err) {
      console.error('Rich text kopyalama hatası:', err);
      // Fallback: normal kopyalama
      await this.copyToClipboard();
    }
  }

  // HTML kodunu metin olarak panoya kopyala
  async copyToClipboard() {
    if (!this.isBrowser) return;

    try {
      const htmlContent = this.generateEmailTemplate();
      await navigator.clipboard.writeText(htmlContent);
      alert('📋 HTML kodu panoya kopyalandı!\n\n💡 Gmail\'de görsel olarak kullanmak için:\n1. HTML kodunu bir .html dosyasına kaydedin\n2. Tarayıcıda açın\n3. Ctrl+A ve Ctrl+C ile kopyalayın\n4. Gmail\'de rich format modunda yapıştırın');
    } catch (err) {
      console.error('Kopyalama hatası:', err);
      alert('❌ Kopyalama işlemi başarısız oldu.');
    }
  }

  // Form alanları değiştiğinde önizlemeyi güncelle
  onFieldChange() {
    this.updatePreview();
  }
}

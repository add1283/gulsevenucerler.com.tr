import { Component, ChangeDetectionStrategy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import emailjs from '@emailjs/browser';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent {
    contactForm: FormGroup;
    isFormSubmitted = false;
    isFormSubmitting = false;
    private isBrowser: boolean;

    // EmailJS Configuration - GitHub Actions'da replacement yapılacak
    private readonly emailjsConfig = {
        serviceId: '__EMAILJS_SERVICE_ID__',
        templateId: '__EMAILJS_TEMPLATE_ID__',
        publicKey: '__EMAILJS_PUBLIC_KEY__'
    };

    constructor(
        private fb: FormBuilder,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);
        this.contactForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            service: ['', Validators.required],
            message: ['', [Validators.required, Validators.minLength(10)]]
        });

        // EmailJS'i initialize et
        if (this.isBrowser) {
            emailjs.init(this.emailjsConfig.publicKey);
        }
    }

    scrollToSection(sectionId: string) {
        if (this.isBrowser) {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    getFieldError(fieldName: string): string | null {
        const field = this.contactForm.get(fieldName);
        if (field && field.touched && field.errors) {
            if (field.errors['required']) {
                const fieldNames: { [key: string]: string } = {
                    'name': 'Ad Soyad',
                    'email': 'E-posta',
                    'service': 'Hizmet seçimi',
                    'message': 'Mesaj'
                };
                return `${fieldNames[fieldName]} gereklidir.`;
            }
            if (field.errors['email']) return 'Geçerli bir e-posta adresi girin.';
            if (field.errors['minlength']) return `En az ${field.errors['minlength'].requiredLength} karakter olmalıdır.`;
        }
        return null;
    }

    async onSubmit() {
        this.isFormSubmitted = true;
        if (this.contactForm.valid && !this.isFormSubmitting) {
            this.isFormSubmitting = true;
            try {
                if (this.isBrowser) {
                    // EmailJS ile e-posta gönderme
                    const templateParams = {
                        from_name: this.contactForm.value.name,
                        from_email: this.contactForm.value.email,
                        service_type: this.contactForm.value.service,
                        message: this.contactForm.value.message,
                        to_name: 'Gülseven Üçerler'
                    };

                    await emailjs.send(
                        this.emailjsConfig.serviceId,
                        this.emailjsConfig.templateId,
                        templateParams
                    );

                    alert('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağım.');
                    this.contactForm.reset();
                    this.isFormSubmitted = false;
                } else {
                    // Server-side rendering için fallback
                    console.log('Form submitted:', this.contactForm.value);
                    alert('Mesajınız kaydedildi. Sayfa yeniden yüklendiğinde gönderilecek.');
                }
            } catch (error) {
                console.error('Email gönderme hatası:', error);
                alert('Bir hata oluştu. Lütfen tekrar deneyin veya doğrudan e-posta gönderin.');
            } finally {
                this.isFormSubmitting = false;
            }
        }
    }

    readonly services = [
        { title: 'Teta Healing Seansı' },
        { title: 'Reiki Şifa Seansı' },
        { title: 'AccessBars Seansı' },
        { title: 'Diğer' }
    ] as const;
}

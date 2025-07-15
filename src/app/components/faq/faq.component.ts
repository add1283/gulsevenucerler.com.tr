import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FAQ {
    id: number;
    question: string;
    answer: string;
    isOpen: boolean;
}

@Component({
    selector: 'app-faq',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './faq.component.html',
    styleUrl: './faq.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaqComponent {

    faqs: FAQ[] = [
        {
            id: 1,
            question: 'Theta Healing nedir ve nasıl çalışır?',
            answer: 'Theta Healing, bilinç altındaki sınırlayıcı inançları tespit ederek bunları pozitif inançlarla değiştiren bir enerji şifacılığı tekniğidir. Beyin dalgalarını theta frekansına getirerek derin şifa ve DNA aktivasyonu sağlar.',
            isOpen: false
        },
        {
            id: 2,
            question: 'Reiki seansı nasıl gerçekleşir?',
            answer: 'Reiki seansında, evrensel yaşam enerjisi eller aracılığıyla vücudun enerji merkezlerine (chakra) aktarılır. Seanslar genellikle 60-90 dakika sürer ve kişi rahatlatıcı bir ortamda uzanarak enerji alır.',
            isOpen: false
        },
        {
            id: 3,
            question: 'AccessBars seansında ne yapılır?',
            answer: 'AccessBars seansında kafadaki 32 noktaya nazikçe dokunularak zihinsel bloklar, sınırlayıcı düşünceler ve stres serbest bırakılır. Bu teknik derin gevşeme ve zihinsel netlik sağlar.',
            isOpen: false
        },
        {
            id: 4,
            question: 'Enerji şifacılığı kimler için uygundur?',
            answer: 'Enerji şifacılığı her yaştan kişi için güvenlidir. Stres, anksiyete, travma, fiziksel ağrılar, duygusal bloklar ve kişisel gelişim alanlarında destek arayan herkes faydalanabilir.',
            isOpen: false
        },
        {
            id: 5,
            question: 'Seansların etkisini ne zaman hissederim?',
            answer: 'Etki kişiden kişiye değişir. Bazı kişiler seans sırasında rahatlamayı hissederken, bazıları birkaç gün sonra değişimi fark eder. Kalıcı sonuçlar için genellikle düzenli seanslar önerilir.',
            isOpen: false
        },
        {
            id: 6,
            question: 'İzmir Bademler\'de nasıl randevu alabilirim?',
            answer: 'Web sitemizdeki iletişim formu üzerinden veya info@gulsevenucerler.com e-posta adresinden randevu talep edebilirsiniz. Hem yüz yüze hem de online seanslar düzenlenmektedir.',
            isOpen: false
        }
    ];

    toggleFAQ(faq: FAQ) {
        faq.isOpen = !faq.isOpen;
    }
}

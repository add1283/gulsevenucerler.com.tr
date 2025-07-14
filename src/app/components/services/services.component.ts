import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Service {
    id: number;
    title: string;
    description: string;
    icon: string;
    features: string[];
    duration: string;
    price: string;
}

@Component({
    selector: 'app-services',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './services.component.html',
    styleUrls: ['./services.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServicesComponent {
    readonly services: readonly Service[] = [
        {
            id: 1,
            title: 'Teta Healing Seansı',
            description: 'Bilinç altındaki sınırlayıcı inançları dönüştürerek, yaşam kalitenizi artıran güçlü bir şifa modalitesi.',
            icon: '🧘‍♀️',
            features: ['İnanç Sistemi Dönüşümü', 'Chakra Dengeleme', 'Enerji Temizleme', 'Duygusal Şifa'],
            duration: '45-60 dakika',
            price: 'Fiyat için İletişime Geçin'
        },
        {
            id: 2,
            title: 'Reiki Şifa Seansı',
            description: 'Evrensel yaşam enerjisi ile bedeninizin doğal şifa kapasitesini aktive eden, dinlendirici ve şifa verici bir deneyim.',
            icon: '✨',
            features: ['Enerji Dengeleme', 'Stres Azaltma', 'Fiziksel Şifa', 'Ruhsal Huzur'],
            duration: '45-60 dakika',
            price: 'Fiyat için İletişime Geçin'
        },
        {
            id: 3,
            title: 'AccessBars Seansı',
            description: 'Kafanızdaki 32 noktaya dokunarak zihinsel blokları ve sınırlayıcı düşünceleri serbest bırakan, derin rahatlama sağlayan teknik.',
            icon: '🌟',
            features: ['Zihinsel Temizlik', 'Stres Azaltma', 'Derin Rahatlama', 'Bilinç Genişletme'],
            duration: '60-75 dakika',
            price: 'Fiyat için İletişime Geçin'
        }
    ] as const

    trackByServiceId(index: number, service: Service): number {
        return service.id;
    }

    trackByFeature(index: number, feature: string): string {
        return feature;
    }
}

# 🌳 Dendroloji Çalışma Sitesi

Orman Endüstrisi Mühendisliği öğrencileri için geliştirilmiş interaktif ağaç tanıma çalışma platformu.

## ✨ Özellikler

### 🎮 Oyun Modu
- Rastgele ağaç resimleri gösterimi
- Büyük/küçük harf duyarlı ağaç adı kontrolü
- "Atla" özelliği (yanlış olarak sayılır)
- 100 üzerinden puanlama sistemi
- Oyun sonu detaylı istatistikler

### 📊 İstatistik Sistemi
- Doğru, yanlış ve atlanan cevap sayıları
- Yanlış cevaplar ve doğru karşılıkları
- İstatistikler otomatik olarak localStorage'da saklanır
- En çok yanlış yapılan ağaçları gösterir (Eksiklerim)

### 📝 Not Sistemi
- Her ağaç için özel notlar ekleyebilme
- Notlar otomatik olarak localStorage'da saklanır
- Mevcut ağaçlar sayfasından not düzenleme

### 🎵 Ses Efektleri
- Doğru cevap sesi (yüksek ton)
- Yanlış cevap sesi (düşük ton)
- Atla sesi (orta ton)
- Oyun başlangıç ve bitiş melodileri

### 🎨 Modern Tasarım
- Gradient arka plan
- Glassmorphism efektleri
- Smooth animasyonlar
- Responsive tasarım (mobil uyumlu)
- Font Awesome ikonları

## 🚀 Kullanım

### 📁 Ağaç Ekleme
1. **Ağaç Resimlerini Yükleyin**
   - Ana menüden "Resim Yükle" butonuna tıklayın
   - Ağaç resimlerinizi seçin
   - Dosya adları ağaç adları olarak kullanılacak

2. **Oyunu Başlatın**
   - "Oyuna Başla" butonuna tıklayın
   - Gösterilen ağacın adını yazın
   - Enter ile gönderin veya modern "Atla" butonunu kullanın

3. **İstatistikleri İnceleyin**
   - "Eksiklerim" ile en çok yanlış yaptığınız ağaçları görün
   - "Mevcut Ağaçlar" ile tüm ağaçları ve notlarınızı yönetin
   - Her ağacı not ekleyebilir veya silebilirsiniz

## ⌨️ Klavye Kısayolları

- **Enter**: Cevabı gönder
- **Tab**: Ağacı atla (oyun sırasında)
- **Escape**: Ana menüye dön / Modalları kapat

## 📁 Dosya Yapısı

```
dendroloji/
├── index.html          # Ana HTML dosyası
├── styles.css          # CSS stilleri
├── script.js           # JavaScript kodları
├── manifest.json       # PWA manifest
├── sw.js              # Service Worker
└── README.md           # Bu dosya
```

## 🗄️ Veri Saklama

- **İstatistikler**: `localStorage` - 'dendroloji-statistics'
- **Notlar**: `localStorage` - 'dendroloji-notes'

## 🌐 Tarayıcı Desteği

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## 🔧 Kurulum

1. Bu dosyaları bir web sunucusunda barındırın
2. Veya yerel olarak çalıştırın:
   ```bash
   # Python 3 ile
   python -m http.server 8000
   
   # Node.js ile
   npx serve .
   ```

## 💡 İpuçları

1. **Dosya Adlandırma**: Ağaç resimlerini doğru adlarla kaydedin (örn: "Meşe.jpg", "Çam.png")
2. **Büyük/Küçük Harf**: Cevaplar dosya adlarıyla tam olarak eşleşmelidir
3. **Resim Formatları**: JPG, JPEG, PNG, GIF, WebP, BMP, SVG formatları desteklenir
4. **Performans**: Çok büyük resimler yavaşlığa sebep olabilir
5. **Manuel Yükleme**: Sadece "Resim Yükle" butonu ile yüklediğiniz ağaçlar çalışmada kullanılır

## 🎯 Hedef Kitle

- Orman Endüstrisi Mühendisliği öğrencileri
- Orman Mühendisliği öğrencileri
- Dendroloji dersi alan öğrenciler
- Ağaç tanıma öğrenmek isteyen herkes

## 📱 Mobil Uyumluluk

Site tamamen responsive tasarıma sahiptir ve mobil cihazlarda sorunsuz çalışır.

---

**Geliştirici Notu**: Bu proje, öğrenme amacıyla geliştirilmiş olup, eğitim amaçlı kullanım için tasarlanmıştır. 
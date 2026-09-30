# Local Chat Work

Aynı yerel ağdaki bilgisayarların tarayıcı üzerinden birbirleriyle gerçek zamanlı
mesajlaşabileceği bir uygulama. Node.js + Express ile sunucu, vanilla HTML/CSS/JS
ile arayüz.

## Durum

| Aşama | İçerik | Durum |
|---|---|---|
| 1 | Express sunucusu, `express.static`, port 3000 | Tamamlandı |
| 2 | Profesyonel chat arayüzü (dark theme, responsive) | Tamamlandı |
| 3 | Socket.IO ile gerçek zamanlı mesajlaşma | Sırada |

Şu an mesajlar yalnızca tarayıcıda tutulur. Sayfa yenilenince kaybolur ve
başka biri ne yazdığını göremez. Bu, bilinçli olarak 3. aşamaya bırakıldı.

## Gereksinimler

- Node.js 18 veya üzeri (geliştirme v24.21.0 ile yapıldı)
- npm (Node ile birlikte gelir)

Kontrol etmek için:

```bash
node --version
npm --version
```

## Kurulum

```bash
npm install
```

`express` paketini indirip `node_modules/` klasörüne kurar ve
`package.json` dosyasına ekler. Bu komutu **bir kez** çalıştırman yeterli.

## Çalıştırma

```bash
npm start
```

Terminalde şu mesajı göreceksin:

```
Sunucu http://localhost:3000 adresinde calisiyor.
```

Sonra tarayıcıda `http://localhost:3000` adresini aç.

Sunucuyu durdurmak için terminalde **Ctrl + C**.

## Klasör Yapısı

```
local_chat/
├── package.json          proje kimlik kartı, bağımlılıklar, scriptler
├── package-lock.json     sürüm kilidi (elle düzenlenmez)
├── .gitignore            git'e girmemesi gereken dosyalar
├── public/               frontend dosyaları - sunucuya açıktır
│   ├── index.html        semantik iskelet, SVG ikon tanımları
│   ├── style.css         design token'lar, bileşenler, responsive kurallar
│   └── app.js            demo veri, render fonksiyonları, event listener'lar
└── src/
    └── server.js         Express sunucusu
```

`public` ve `src` ayrımının sebebi: `public` içindeki her dosya tarayıcıya
sunulur. Sunucuya ait kod (API, veritabani bağlantısı, gizli anahtarlar)
oraya **konmaz**.

## Sunucu Kodu

`src/server.js` — projenin tamamı bu dosyada:

```js
const path = require('path');
const express = require('express');

const app = express();
const PORT = 3000;

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

app.use(express.static(PUBLIC_DIR));

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde calisiyor.`);
});
```

Üç şey yapıyor:

- `__dirname` = bu dosyanın bulunduğu klasör. `path.join(__dirname, '..', 'public')`
  ile `public` klasörünü buluyoruz. Sabit yol yazmak yerine bunu kullanıyoruz
  çünkü proje başka bir bilgisayara kopyalansa da çalışsın.
- `express.static(public)` = `public` klasöründeki dosyaları sunar.
  `/style.css` istenirse o dosya, `/` istenirse `index.html` gönderilir.
- `app.listen(3000)` = 3000 portunu dinlemeye başlar.

## Kullanılan Teknolojiler

- **Node.js** — sunucu çalıştırma ortamı
- **Express** — HTTP sunucusu, statik dosya servisi
- **HTML5 / CSS3 / Vanilla JavaScript** — arayüz
- **Socket.IO** — 3. aşamada eklenecek

Harici UI kütüphanesi, CSS framework'ü veya ikon paketi **yok**. İkonlar elle
yazılmış SVG, avatarlar kullanıcı adının baş harflerinden üretiliyor.

## Arayüz Özellikleri

- Koyu tema, üç kolonlu düzen (sidebar / sohbet / üyeler)
- 3 kanal, 5 kullanıcı, 20+ örnek mesaj (tümü frontend demo verisi)
- Online / offline / idle durum göstergeleri
- Mesaj gruplama: aynı kişinin ardışık mesajları tek grupta toplanır
- Kanal geçişi, kullanıcı seçimi, kullanıcı detay kartı
- Enter ile gönderme, Shift+Enter ile yeni satır, boş mesaj engelleme
- Kanal başına yarım kalan yazılar saklanıyor
- Responsive: 1280 / 1080 / 768 / 520px kırılımları
- Mobilde panel ve sidebar üstten açılan drawer olarak çalışıyor
- `prefers-reduced-motion` ile animasyon duyarlılığı

## Aşama 2'de Öğrenilen Kavramlar

**Statik dosya servisi** — `express.static()` nasıl çalışır, `app.use()` ile
`app.get()` arasındaki fark, yazılım parçalarının sıraya göre çalışması.

**CSS bağlantısı** — `<link rel="stylesheet">` neden `<head>` içinde,
`<script src>` neden `</body>` öncesinde.

**DOM'a veri basma** — `innerHTML`, `map()` + `join('')`, neden HTML'i elle
yazmak yerine JavaScript ile üretiyoruz.

**Event delegation** — `addEventListener` + `event.target.closest()`, tek
listener ile tüm liste öğelerini yakalamak.

**Olay delegasyonu** — `keydown` + `preventDefault()`, Enter/Shift+Enter
ayrımı.

**XSS koruması** — `escapeHtml()` neden zorunlu, neden `&` ilk sırada
değiştirilir.

**Responsive CSS** — media query, `desktop-first` yaklaşımı, drawer pattern,
Flexbox/Grid'de `min-height: 0` ve `min-width: 0` neden şart.

## 3. Aşama İçin Not

Socket.IO eklendiğinde değişecek yer az. `index.html` ve `style.css` olduğu
 gibi kalacak; `app.js` içinde mesaj gönderme yöntemi ve `server.js` içinde
sunucu kurulumu değişecek.

Bilinen tuzak: mesajın gönderene iki kere gösterilmemesi. Gönderen kişi
mesajı kendi ekranına ekliyorsa, sunucu da onu yollayınca iki kere görünür.
3. aşamada bu sunucu tarafında çözülecek.

## Lisans

MIT

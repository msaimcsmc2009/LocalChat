/* =========================================================================
   LOCAL CHAT WORK - app.js
   -------------------------------------------------------------------------
   Bu dosya su isleri yapar:
     1. Demo verisini tutar (kullanicilar, kanallar, mesajlar)
     2. O veriyi HTML'e cizer (render fonksiyonlari)
     3. Kullanici etkilesimlerini yakalar (event listener'lar)
     4. Gonderilen mesaji ekrana ekler

   Onemli not: Burada HICBIR ag istegi (fetch, axios, WebSocket) yok.
   Mesajlar yalnizca tarayicida, sayfa acilmazken tutulur.
   ========================================================================= */


/* =========================================================================
   1. DEMO VERI
   -------------------------------------------------------------------------
   Normalde bu veriler backend'den gelirdi. Backend olmadigi icin
   elle yaziyoruz. Yapisi, backend'den gelen verinin yapisiyla ayni
   tutuldu - boylece sonradan Socket.IO baglaninca sadece verinin
   geldigi yer degisecek.
   ========================================================================= */

/* Kullanicinin karti iki yerden turetiyor: avatar bas harfleri ve
   renk tonu. Manuel yazmak yerine fonksiyonla uretiyoruz. */
const CURRENT_USER = {
  id: 'u1',
  name: 'Sen',
  role: 'Proje Sahibi',
  tone: 'teal',
  status: 'online'
};

const USERS = [
  { id: 'u1', name: 'Sen',          role: 'Proje Sahibi',   tone: 'teal',   status: 'online'  },
  { id: 'u2', name: 'Muhammed Yilmaz', role: 'Backend Dev',   tone: 'blue',   status: 'online'  },
  { id: 'u3', name: 'Ahmet Kaya',   role: 'Frontend Dev',   tone: 'violet', status: 'online'  },
  { id: 'u4', name: 'Elif Demir',   role: 'Tasarim',        tone: 'rose',   status: 'idle'    },
  { id: 'u5', name: 'Can Ozturk',   role: 'DevOps',         tone: 'amber',  status: 'offline' }
];

/* Kanallar. Her kanal kendi mesaj listesini tasir.
   Gercek projede mesajlar tek bir listede ve kanal id'si ile ayrilirdi;
   simdilik kanal bazinda tutmak frontend tarafinda daha okunakli. */
const CHANNELS = [
  {
    id: 'general',
    name: 'general',
    topic: 'Proje genelinde duyurular ve gunluk sohbet.',
    description: 'Projedeki genel duyurular, planlar ve herkesin gorebilecegi konusmalar.',
    messages: [
      { id: 'g1', authorId: 'u2', time: '10:42', text: 'Bugun Local Chat projesinin backend kismina baslayacagim. Once sunucu tarafini kurup kanallari olusturacagiz.' },
      { id: 'g2', authorId: 'u3', time: '10:43', text: 'Tamam, Socket.IO kismini da sonra ekleriz. Once temel sohbet akisi calissin.' },
      { id: 'g3', authorId: 'u1', time: '10:45', text: 'Dogru yaklasim. Onceligimiz calisan bir MVP, sonra ozellik ekleriz.' },
      { id: 'g4', authorId: 'u2', time: '10:47', text: 'Sunucu ayakta. Port 3000 uzerinde yanit veriyor, localhost uzerinden baglandim.', code: 'Sunucu http://localhost:3000 adresinde calisiyor.\nGET / -> 200 OK' },
      { id: 'g5', authorId: 'u4', time: '11:02', text: 'Arayuz tasarimi hazir. Koyu tema, sidebar ve mesaj alani yerlesimi tamamlandi.' },
      { id: 'g6', authorId: 'u3', time: '11:05', text: 'Gorunteledim, gercek bir uygulama gibi duruyor. Composer kismi cok iyi olmus.' },
      { id: 'g7', authorId: 'u4', time: '11:08', text: 'Cok tesekkurler. Bir sonraki adimda mobil uyumlulugu kontrol edelim.' },
      { id: 'g8', authorId: 'u1', time: '11:15', text: 'Onayliyorum. Yarin kanal gecislerini ve mesaj gondermeyi birlikte yapariz.' },
      { id: 'g9', authorId: 'u5', time: '11:20', text: 'Yerel agda guvenlik duvari port 3000 uzerini kisitliyor, gerekirse birlikte bakariz.' }
    ]
  },
  {
    id: 'work',
    name: 'work',
    topic: 'Yalnizca proje isleri, kod ve teknik tartismalar.',
    description: 'Kod incelemeleri, hata takibi ve teknik kararlar. Dis projeyle ilgili konusma icin kullanilir.',
    messages: [
      { id: 'w1', authorId: 'u2', time: '09:15', text: 'Dosya yapisini iki katmana ayirdim: src sunucu, public frontend. Boylece bagimlilik yonu belli olur.', code: 'local_chat/\n├── public/\n│   ├── index.html\n│   ├── style.css\n│   └── app.js\n└── src/\n    └── server.js' },
      { id: 'w2', authorId: 'u3', time: '09:22', text: 'Mantikli. public klasorunu statik servis etmek de cok basit oluyor.' },
      { id: 'w3', authorId: 'u2', time: '09:31', text: 'Evet, express.static ile tek satirda cozuluyor. index.html de otomatik olarak kok adreste servis ediliyor.' },
      { id: 'w4', authorId: 'u5', time: '10:10', text: 'Bir oneri: package.json icinde start scripti olustur. Her seferinde node src/server.js yazmak yerine npm start desen.' },
      { id: 'w5', authorId: 'u1', time: '10:12', text: 'Eklendi. npm start artik sunucuyu ayaga kaldiriyor.' },
      { id: 'w6', authorId: 'u3', time: '11:40', text: 'Mesaj gonderme ozelligi su an sadece frontend tarafinda calisiyor, sayfa yenilenince kayboluyor.' },
      { id: 'w7', authorId: 'u2', time: '11:44', text: 'Beklenen davranis bu. Backend baglantisi bir sonraki asamada Socket.IO ile gelecek.' },
      { id: 'w8', authorId: 'u1', time: '11:50', text: 'Dogru, simdilik arayuz tarafini oturtalim. Ag katmani ayrica ele alinacak.' }
    ]
  },
  {
    id: 'random',
    name: 'random',
    topic: 'Is ile ilgisiz sohbet, kahve, muzikal, spor.',
    description: 'Proje disi her sey. Kahve onayi, hava durumu, oyun ve muzikal sohbetleri.',
    messages: [
      { id: 'r1', authorId: 'u4', time: '13:20', text: 'Lunch icin yakinlarin guzel bir yer buldum, akikamole sokakta.' },
      { id: 'r2', authorId: 'u3', time: '13:25', text: 'Ben de geliyorum. Toplanti 15 te bittiyse uygun.' },
      { id: 'r3', authorId: 'u5', time: '13:31', text: 'Bende yarim saat gecikme olur, bir sefer daha masaya birakin.' },
      { id: 'r4', authorId: 'u2', time: '13:48', text: 'Bugun 28 derece, yuruyus icin ideal. Lakin ogle sicak, sonra serinliyor.' },
      { id: 'r5', authorId: 'u3', time: '17:05', text: 'Projenin arayuzu gercekten profesyonel oldu, eline saglik.' },
      { id: 'r6', authorId: 'u1', time: '17:20', text: 'Hedef tam da buydu. Simdi altyapi kismina gecmeye karar verdik.' }
    ]
  }
];


/* =========================================================================
   2. DURUM (STATE)
   -------------------------------------------------------------------------
   Uygulamanin su anki durumu tek bir nesnede tutulur.
   Neden? Degisiklikler tek yerde toplanir, kodun hangi durumu
   etkiledigini gormek kolaylasir. (Sonraki asamada bu kismi
   Socket.IO baglantisi ile sunucudan beslenecek sekilde
   degistirecegiz.)
   ========================================================================= */
const state = {
  activeChannelId: 'general',   // acik olan kanal
  activeUserId: null,           // secili kullanici (detay karti icin)
  drafts: {},                   // kanal -> yarim kalan yazi
  drawer: null                  // acik drawer: 'sidebar' | 'members' | null
};


/* =========================================================================
   3. DOM REFERANSLARI
   -------------------------------------------------------------------------
   document.getElementById() her cagrildiginda tarayici HTML'in tamamini
   bastan arar. Bu degerleri bir kez alip saklamak, ozellikle
   saniyede onlarca kez cagrilan kodda performans farki yaratir
   ve kodu daha okunakli kilar.
   ========================================================================= */
const el = {
  channelList:   document.getElementById('channelList'),
  dmList:        document.getElementById('dmList'),
  memberList:    document.getElementById('memberList'),
  messageList:   document.getElementById('messageList'),
  channelTitle:  document.getElementById('channelTitle'),
  channelTopic:  document.getElementById('channelTopic'),
  onlineCount:   document.getElementById('onlineCount'),
  messageInput:  document.getElementById('messageInput'),
  sendButton:    document.getElementById('sendButton'),
  sidebar:       document.getElementById('sidebar'),
  members:       document.getElementById('members'),
  scrim:         document.getElementById('scrim'),
  openSidebar:   document.getElementById('openSidebar'),
  toggleMembers: document.getElementById('toggleMembers'),
  closeMembers:  document.getElementById('closeMembers'),
  userCard:      document.getElementById('userCard'),
  profileName:   document.getElementById('profileName'),
  profileInitials: document.getElementById('profileInitials')
};


/* =========================================================================
   4. YARDIMCI FONKSIYONLAR
   ========================================================================= */

/* -- Guvenli metin koyma --
   innerHTML ile HTML uretiyoruz. Kullanici mesaji bu HTML'in icine
   giriyor. escapeHtml olmazsa biri "<b>test</b>" yazdiginda ekranda
   <b> metni degil, kalin yazi gorunurdi. Bu, kucuk bir yazim hatasi
   degil, guvenlik acigi. O yuzden her kullanici metnini
   escapeHtml'den geciriyoruz. */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')      // & -> &amp;  (ilk sirada!)
    .replace(/</g, '&lt;')       // < -> &lt;
    .replace(/>/g, '&gt;')       // > -> &gt;
    .replace(/"/g, '&quot;')     // " -> &quot;
    .replace(/'/g, '&#39;');     // ' -> &#39;
}

/* -- SVG ikon uretici --
   index.html icindeki <symbol> tanimlarini tekrar tekrar yazmak yerine,
   ismini verip olusturuyoruz. */
function icon(name, extraClass = '') {
  return `<svg class="icon ${extraClass}" aria-hidden="true"><use href="#i-${name}" /></svg>`;
}

/* -- Avatar uretici --
   Harici gorsel dosyasi yerine kullanicinin adindan bas harf
   uretiyoruz. Adindan sadece bas harfler: "Muhammed Yilmaz" -> "MY" */
function avatarHtml(user, sizeClass = '') {
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return `
    <span class="avatar ${sizeClass}" data-tone="${user.tone}">
      <span class="avatar__text">${escapeHtml(initials)}</span>
      <span class="status status--${user.status}"></span>
    </span>`;
}

/* -- Kullanici bulucu --
   Mesajlarda sadece id tutuyoruz (authorId: 'u2'), ismi degil.
   Sebebi: kullanici adi degisse mesajlar degismesin. Veriyi tek
   yerde tutmak, tekrar ve tutarsizlik onler. */
function findUser(id) {
  return USERS.find((user) => user.id === id) || USERS[0];
}

function activeChannel() {
  return CHANNELS.find((channel) => channel.id === state.activeChannelId) || CHANNELS[0];
}

function onlineCount() {
  return USERS.filter((user) => user.status === 'online').length;
}

/* -- Anlik saat --
   Yeni gonderilen mesaja damgalanacak zaman. */
function nowTime() {
  return new Date().toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}


/* =========================================================================
   5. RENDER FONKSIYONLARI
   -------------------------------------------------------------------------
   "Render" = veriyi ekrana cizmek. Her render fonksiyonu bir
   konteyneri (liste/alan) bosaltip yeniden doldurur.
   ========================================================================= */

/* -- Kanallar -- */
function renderChannels() {
  el.channelList.innerHTML = CHANNELS.map((channel) => {
    const isActive = channel.id === state.activeChannelId;
    return `
      <li>
        <button class="nav-item ${isActive ? 'is-active' : ''}"
                type="button"
                data-channel="${channel.id}"
                aria-current="${isActive ? 'true' : 'false'}">
          ${icon('hash', 'nav-item__icon')}
          <span class="nav-item__name">${escapeHtml(channel.name)}</span>
          <span class="nav-item__meta">${channel.messages.length}</span>
        </button>
      </li>`;
  }).join('');
}

/* -- Direct Messages --
   Kendimizi listede gostermeyiz, sadece diger kullanicilar. */
function renderDirectMessages() {
  const others = USERS.filter((user) => user.id !== CURRENT_USER.id);

  el.dmList.innerHTML = others.map((user) => {
    const isActive = user.id === state.activeUserId;
    const isOffline = user.status === 'offline';
    return `
      <li>
        <button class="nav-item ${isActive ? 'is-active' : ''}"
                type="button"
                data-user="${user.id}">
          ${avatarHtml(user, 'avatar--sm')}
          <span class="nav-item__name">${escapeHtml(user.name)}</span>
          ${isOffline ? '' : `<span class="status status--${user.status}"></span>`}
        </button>
      </li>`;
  }).join('');
}

/* -- Uye paneli --
   Once cevrimici, sonra cevrimdisi. Siralama, veri tabanindan
   degil, gorunurluk durumundan turetiyor. */
function renderMembers() {
  const online = USERS.filter((user) => user.status === 'online');
  const offline = USERS.filter((user) => user.status !== 'online');

  function memberItem(user) {
    const isActive = user.id === state.activeUserId;
    return `
      <li>
        <button class="member ${isActive ? 'is-active' : ''}"
                type="button"
                data-user="${user.id}">
          ${avatarHtml(user)}
          <span class="member__meta">
            <span class="member__name ${user.status === 'offline' ? 'member__name--offline' : ''}">
              ${escapeHtml(user.name)}${user.id === CURRENT_USER.id ? ' (sen)' : ''}
            </span>
            <span class="member__role">${escapeHtml(user.role)}</span>
          </span>
          <span class="status status--${user.status}"></span>
        </button>
      </li>`;
  }

  el.memberList.innerHTML = `
    <section class="member-group member-group--online">
      <h3 class="member-group__title">Cevrimici &mdash; ${online.length}</h3>
      <ul class="nav-list">${online.map(memberItem).join('')}</ul>
    </section>
    <section class="member-group member-group--offline">
      <h3 class="member-group__title">Cevrimdisi &mdash; ${offline.length}</h3>
      <ul class="nav-list">${offline.map(memberItem).join('')}</ul>
    </section>`;
}

/* -- Kanal basligi -- */
function renderHeader() {
  const channel = activeChannel();
  el.channelTitle.textContent = channel.name;
  el.channelTopic.textContent = channel.topic;
  el.onlineCount.textContent = `${onlineCount()} cevrimici`;
}

/* -- Mesajlar --
   Iki seviyeli bir yapi var:
     1) Kanal tanitim blogu (kanal adi ve aciklamasi)
     2) Tarih ayirici ("Bugun")
     3) Mesaj gruplari
   Ayni kullanicinin ardisik mesajlari tek grupta toplanir; boylece
   her satira isim yazmaya gerek kalmaz. */
function renderMessages() {
  const channel = activeChannel();

  // Mesajlari grupla: onceki mesajla ayni yazar mi?
  const groups = [];
  for (const message of channel.messages) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.authorId === message.authorId) {
      lastGroup.messages.push(message);
    } else {
      groups.push({ authorId: message.authorId, messages: [message] });
    }
  }

  const groupsHtml = groups.map((group) => `
    <div class="msg-group">
      ${group.messages.map((message, index) => messageHtml(message, index === 0)).join('')}
    </div>`).join('');

  el.messageList.innerHTML = `
    <section class="channel-intro">
      <h2 class="channel-intro__title">
        <span class="channel-intro__mark">${icon('hash')}</span>
        ${escapeHtml(channel.name)}
      </h2>
      <p class="channel-intro__desc">${escapeHtml(channel.description)}</p>
    </section>
    <div class="day-divider">Bugun</div>
    ${groupsHtml}`;

  // Yeni mesajlar hep en altta gorunsun
  el.messageList.scrollTop = el.messageList.scrollHeight;
}

/* -- Tek mesajin HTML'i --
   isFirst = grubun ilk mesaji mi?
     evet  -> avatar + kullanici adi + zaman
     hayir -> avatar yerine uzerine gelince gorunen zaman (Slack davranisi) */
function messageHtml(message, isFirst) {
  const author = findUser(message.authorId);
  const isMe = author.id === CURRENT_USER.id;

  const codeHtml = message.code
    ? `<pre class="msg__code">${escapeHtml(message.code)}</pre>`
    : '';

  const textHtml = `<div class="msg__text">${escapeHtml(message.text)}</div>`;

  if (isFirst) {
    return `
      <article class="msg msg--start">
        <div class="msg__gutter">${avatarHtml(author, 'avatar--lg')}</div>
        <div class="msg__body">
          <div class="msg__head">
            <span class="msg__author ${isMe ? 'msg__author--me' : ''}">${escapeHtml(author.name)}</span>
            <time class="msg__time">${escapeHtml(message.time)}</time>
          </div>
          ${textHtml}
          ${codeHtml}
        </div>
      </article>`;
  }

  return `
    <article class="msg">
      <div class="msg__gutter">
        <span class="msg__hover-time">${escapeHtml(message.time)}</span>
      </div>
      <div class="msg__body">${textHtml}${codeHtml}</div>
    </article>`;
}

/* -- Alt profil karti -- */
function renderProfile() {
  el.profileName.textContent = CURRENT_USER.name;
  el.profileInitials.textContent = 'S';
}

/* -- Kullanici detay karti -- */
function renderUserCard() {
  if (!state.activeUserId) {
    el.userCard.hidden = true;
    el.userCard.innerHTML = '';
    return;
  }

  const user = findUser(state.activeUserId);
  const statusText = {
    online: 'Cevrimici',
    idle: 'Diger uygulamalarda',
    offline: 'Cevrimdisi'
  }[user.status];

  el.userCard.innerHTML = `
    <button class="icon-btn icon-btn--ghost user-card__close" type="button" data-close-card aria-label="Kapat">
      ${icon('x', 'icon--sm')}
    </button>
    <div class="user-card__head">
      ${avatarHtml(user, 'avatar--xl')}
      <div>
        <div class="user-card__name">${escapeHtml(user.name)}</div>
        <div class="user-card__role">${escapeHtml(user.role)}</div>
      </div>
    </div>
    <div class="user-card__grid">
      <div class="user-card__row">${icon('at', 'icon--sm')} ${escapeHtml(user.name.replace(/\s/g, '').toLowerCase())}</div>
      <div class="user-card__row">${icon('hash', 'icon--sm')} ${escapeHtml(user.role)}</div>
      <div class="user-card__row">
        <span class="status status--${user.status}"></span> ${escapeHtml(statusText)}
      </div>
    </div>`;

  el.userCard.hidden = false;
}

/* -- Hepsini tek noktadan cagir --
   Bu sayede her degisiklikten sonra "tum ekrani guncelle" diyebiliriz
   ve hangi parcalarin etkilendigini takip etmemize gerek kalmaz. */
function renderAll() {
  renderChannels();
  renderDirectMessages();
  renderMembers();
  renderHeader();
  renderMessages();
  renderProfile();
  renderUserCard();
}


/* =========================================================================
   6. ETKILESIM (EVENT) YONETIMI
   -------------------------------------------------------------------------
   OLAY DEVRI (event delegation) kullaniyoruz:
   Liste kacirilirsa 50 kullanicilik bir listeye 50 listener eklemek
   yerine, listenin kendisine TEK listener birakiriz ve hangi ogeye
   tiklandigini event.target.closest() ile buluruz.
   ========================================================================= */

/* -- Kanal secimi --
   data-channel ozelligi olan butona tiklaninca calisir. */
el.channelList.addEventListener('click', (event) => {
  const item = event.target.closest('[data-channel]');
  if (!item) return;

  const channelId = item.dataset.channel;

  // Yazmaya yarim kalmis metni sakla (kanal degisince kaybolmasin)
  state.drafts[state.activeChannelId] = el.messageInput.value;

  state.activeChannelId = channelId;
  state.activeUserId = null;

  // Kanala ozel yarim yaziyi geri yukle
  el.messageInput.value = state.drafts[channelId] || '';

  renderAll();
  closeDrawer();
  updateSendButton();
  el.messageInput.focus();
});

/* -- Kullanici secimi (DM listesi ve uye paneli ortak davranis) -- */
function handleUserPick(event) {
  const item = event.target.closest('[data-user]');
  if (!item) return;

  const userId = item.dataset.user;

  // Ayni kullaniciya tekrar tiklandiysa karti kapat (toggle)
  state.activeUserId = state.activeUserId === userId ? null : userId;

  renderAll();
}

el.dmList.addEventListener('click', handleUserPick);
el.memberList.addEventListener('click', handleUserPick);

/* -- Kullanici kartindaki kapatma butonu -- */
el.userCard.addEventListener('click', (event) => {
  if (event.target.closest('[data-close-card]')) {
    state.activeUserId = null;
    renderAll();
  }
});

/* -- Detay kartina disaridan tiklama kapatir --
   Ama menu/panel disindaki her tiklamada degil: sadece gercekten
   baska bir yere tiklandiginda. */
document.addEventListener('click', (event) => {
  if (!state.activeUserId) return;
  if (event.target.closest('#userCard')) return;
  if (event.target.closest('[data-user]')) return;

  state.activeUserId = null;
  renderUserCard();
  renderChannels();
  renderDirectMessages();
  renderMembers();
});

/* -- Mesaj gonderme -- */
function sendMessage() {
  const channel = activeChannel();
  const text = el.messageInput.value.trim();   // trim(): bastaki/sondaki bosluklari siler

  // Bos mesaj gonderilmez
  if (!text) return;

  channel.messages.push({
    id: `local-${Date.now()}`,
    authorId: CURRENT_USER.id,
    time: nowTime(),
    text: text
  });

  el.messageInput.value = '';
  state.drafts[channel.id] = '';

  // Kanal listesi de guncellensin: kanal basindaki mesaj sayisi degisti
  renderAll();
  updateSendButton();
  el.messageInput.focus();
}

el.sendButton.addEventListener('click', sendMessage);

/* -- Enter ile gonderme --
   Shift+Enter yeni satir ekler (cok satirli mesaj icin).
   event.shiftKey kontrolu ile ayirt ediyoruz. */
el.messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();   // Enter'in varsayilan form gonderme davranisini engelle
    sendMessage();
  }
});

/* -- Gonder butonunun durumu --
   Kutu bosken buton soluk gorunur; boylece kullanici neden
   gonderemedigini ek bir mesaj vermeden anlar. */
function updateSendButton() {
  const hasText = el.messageInput.value.trim().length > 0;
  el.sendButton.disabled = !hasText;
}

el.messageInput.addEventListener('input', updateSendButton);


/* =========================================================================
   7. MOBIL DRAWER
   -------------------------------------------------------------------------
   Masaustunde panel ve sidebar her zaman gorunur; drawer mantigi
   yalnizca 1080px / 768px altinda CSS ile gosterilir.
   JS tarafinda ayni class'i ekleyip cikariyoruz; boylece tek bir
   kod yolu hem masaustunu hem mobili yonlendiriyor.
   ========================================================================= */
const sidebarBp = window.matchMedia('(max-width: 768px)');
const membersBp = window.matchMedia('(max-width: 1080px)');

function openDrawer(which) {
  state.drawer = which;

  el.sidebar.classList.toggle('is-open', which === 'sidebar');
  el.members.classList.toggle('is-open', which === 'members');
  el.toggleMembers.classList.toggle('is-on', which === 'members');

  // Perde sadece panelin gercekten drawer oldugu ekranlarda gorunsun
  const isDrawerWidth =
    (which === 'sidebar' && sidebarBp.matches) ||
    (which === 'members' && membersBp.matches);

  el.scrim.hidden = !isDrawerWidth;
}

function closeDrawer() {
  state.drawer = null;
  el.sidebar.classList.remove('is-open');
  el.members.classList.remove('is-open');
  el.toggleMembers.classList.remove('is-on');
  el.scrim.hidden = true;
}

el.openSidebar.addEventListener('click', () => openDrawer('sidebar'));
el.toggleMembers.addEventListener('click', () => openDrawer('members'));
el.closeMembers.addEventListener('click', closeDrawer);
el.scrim.addEventListener('click', closeDrawer);

// Esc ile kapatma - klavye kullanicilari icin standart beklenti
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  closeDrawer();
  state.activeUserId = null;
  renderUserCard();
  renderChannels();
  renderDirectMessages();
  renderMembers();
});


/* =========================================================================
   8. BASLATMA
   -------------------------------------------------------------------------
   Sayfa yuklendikten sonra bir kez calisir. Burada sirasiyla:
     1) Profil bilgisi doldurulur
     2) Tum arayuz cizilir
     3) Buton durumu ayarlanir
     4) Inputa odaklanilir
   ========================================================================= */
renderProfile();
renderAll();
updateSendButton();
el.messageInput.focus();

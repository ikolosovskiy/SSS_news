import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync('research/article.json','utf8'));
const template=fs.readFileSync('research/reference-shell.html','utf8');
const head=template.slice(0,template.indexOf('  <main id="project-main">'))
 .replace(/<title>[\s\S]*?<\/title>/,`<title>${data.title} — Стабілізейшен Суппорт Сервісез</title>`)
 .replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${data.paragraphs[0]}">`)
 .replace('<link rel="stylesheet" href="style.css">','<link rel="stylesheet" href="base.css"><link rel="stylesheet" href="style.css">')
 .replace('class="current" aria-current="page"','')
 .replace('<a href="https://sss-ua.org/news/">Новини</a>','<a href="https://sss-ua.org/news/" class="current" aria-current="page">Новини</a>');
const footer=template.slice(template.indexOf('  <footer class="site-footer">'));
const p=(i,cls='')=>`<p class="${cls}" data-source-paragraph="${i}">${data.paragraphs[i]}</p>`;
const image=(url)=>`assets/images/${url.split('/').pop()}`;
const source='https://sss-ua.org/news/ponad-1000-liudey-zareiestruvalysia-dlia-otrymannia-hroshovoi-dopomohy-vid-uvkb-oon/';
const gallery=data.images.slice(1).map((url,i)=>`<li class="gallery-slide" aria-label="Фото ${i+1} з 6"><img src="${image(url)}" alt="Робота мобільної команди в громаді — фото ${i+1}" width="856" height="570" loading="lazy"></li>`).join('');
const main=`
<main id="project-main">
 <article class="news-article" aria-labelledby="news-title">
  <header class="news-heading wrap">
   <nav class="breadcrumbs" aria-label="Навігаційний ланцюжок"><a href="https://sss-ua.org/">Головна</a><span aria-hidden="true">/</span><a href="https://sss-ua.org/news/">Новини</a></nav>
   <div class="news-heading-grid"><div class="news-kicker" data-enter><span class="eyebrow">Новини</span><span class="date-label">Дата публікації</span><time datetime="2026-10-30">${data.date}</time><span class="kicker-line" aria-hidden="true"></span></div>
   <h1 id="news-title" data-enter>${data.title}</h1></div>
   <div class="news-cover" data-enter><img src="${image(data.images[0])}" alt="Працівниці мобільної команди реєструють людей для отримання грошової допомоги" width="856" height="450" fetchpriority="high"></div>
  </header>
  <div class="article-layout wrap">
   <aside class="article-sidebar"><div class="sidebar-project"><span class="eyebrow">Проєкт</span><a href="${data.project.url}">${data.project.title}<span class="project-link-arrow" aria-hidden="true">↗</span></a></div><div class="share-tools"><span class="eyebrow">Поділитися</span><div class="share-buttons"><a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(source)}" target="_blank" rel="noopener noreferrer" aria-label="Поділитися у Facebook">f</a><a href="https://t.me/share/url?url=${encodeURIComponent(source)}" target="_blank" rel="noopener noreferrer" aria-label="Поділитися у Telegram">↗</a><button type="button" class="copy-link" aria-label="Копіювати посилання">⧉</button></div><span class="copy-status" role="status"></span></div></aside>
   <div class="article-body">
    ${p(0,'article-lead')}${p(1)}<div class="article-quote"><span class="quote-mark" aria-hidden="true">“</span>${p(2)}</div>${p(3)}${p(4)}
    <section class="news-gallery" aria-label="Фото роботи мобільних команд">${p(5)}<div class="gallery-frame"><ul class="gallery-track" tabindex="0" aria-label="Карусель фотографій">${gallery}</ul></div><div class="gallery-controls"><span class="gallery-count" aria-live="polite"><b>01</b><span aria-hidden="true"> / </span>06</span><div class="gallery-dots" aria-label="Вибрати фото">${data.images.slice(1).map((_,i)=>`<button type="button" aria-label="Показати фото ${i+1}" aria-pressed="${i===0}" data-slide="${i}"><span></span></button>`).join('')}</div><div class="gallery-arrows"><button type="button" class="gallery-prev" aria-label="Попереднє фото">←</button><button type="button" class="gallery-next" aria-label="Наступне фото">→</button></div></div></section>
    <div class="article-partner">${p(6)}</div>
    <div class="article-end"><a href="https://sss-ua.org/news/" class="all-news">← Усі новини</a><a href="#sss-project" class="back-top" aria-label="На початок сторінки">↑</a></div>
   </div>
  </div>
 </article>
</main>`;
fs.writeFileSync('index.html',head+main+footer);
console.log('Built index.html; original seven paragraphs preserved verbatim.');


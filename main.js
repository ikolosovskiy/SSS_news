(() => {
 const root=document.querySelector('.sss-project');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const menu=root.querySelector('.menu-toggle'), dialog=root.querySelector('.project-menu');
 let previousOverflow='';
 const close=()=>{if(dialog.open)dialog.close()};
 menu.addEventListener('click',()=>{if(dialog.open)return close();previousOverflow=document.body.style.overflow;dialog.showModal();document.body.style.overflow='hidden';menu.setAttribute('aria-expanded','true')});
 dialog.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;menu.setAttribute('aria-expanded','false')});
 root.querySelector('.menu-close').addEventListener('click',close);
 root.querySelector('.header-search').addEventListener('click',()=>{if(!dialog.open)menu.click();dialog.querySelector('input').focus()});
 const track=root.querySelector('.gallery-track'), slides=[...root.querySelectorAll('.gallery-slide')];
 const dots=[...root.querySelectorAll('[data-slide]')],prev=root.querySelector('.gallery-prev'),next=root.querySelector('.gallery-next');
 let index=0;
 function update(){index=Math.max(0,Math.min(slides.length-1,Math.round(track.scrollLeft/track.clientWidth)));dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===index)));prev.disabled=index===0;next.disabled=index===slides.length-1;root.querySelector('.gallery-count b').textContent=String(index+1).padStart(2,'0')}
 function go(i,keyboard=false){track.scrollTo({left:Math.max(0,Math.min(slides.length-1,i))*track.clientWidth,behavior:reduced.matches||keyboard?'instant':'smooth'})}
 prev.addEventListener('click',event=>go(index-1,event.detail===0));next.addEventListener('click',event=>go(index+1,event.detail===0));
 dots.forEach((dot,i)=>dot.addEventListener('click',event=>go(i,event.detail===0)));
 track.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();go(index+(event.key==='ArrowRight'?1:-1),true)}});
 track.addEventListener('scroll',update,{passive:true});new ResizeObserver(()=>go(index,true)).observe(track);update();
 root.querySelector('.copy-link').addEventListener('click',async()=>{const status=root.querySelector('.copy-status');try{await navigator.clipboard.writeText('https://sss-ua.org/news/ponad-1000-liudey-zareiestruvalysia-dlia-otrymannia-hroshovoi-dopomohy-vid-uvkb-oon/');status.textContent='Посилання скопійовано'}catch{status.textContent='Не вдалося скопіювати посилання'}});
 root.querySelector('.back-top').addEventListener('click',event=>{event.preventDefault();root.scrollIntoView({behavior:reduced.matches||event.detail===0?'instant':'smooth'});if(event.detail===0){menu.focus({preventScroll:true})}});
 const progress=document.createElement('div');progress.className='reading-line';progress.setAttribute('aria-hidden','true');root.append(progress);
 let queued=false;function renderProgress(){const article=root.querySelector('.news-article');const length=article.offsetTop+article.offsetHeight-innerHeight;progress.style.transform=`scaleX(${Math.max(0,Math.min(1,scrollY/length))})`;queued=false}
 addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(renderProgress)}},{passive:true});addEventListener('resize',renderProgress);renderProgress();
})();

const money=n=>'$'+new Intl.NumberFormat('es-CO').format(n)+' COP';
const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
fetch('./catalog.json').then(r=>r.json()).then(products=>{
  const hero=products.find(p=>p.name.toLowerCase().includes('bola flower'))||products.find(p=>p.name.toLowerCase().includes('margarita'))||products[0];
  const picks=products.filter(p=>['siempre floral','decora tus espacios','enciende la navidad'].includes(p.category)).slice(0,8);
  document.querySelector('#heroImage').src=hero.image; document.querySelector('#processImage').src=products.find(p=>p.category==='mascotas')?.image||hero.image;
  document.querySelector('#productGrid').innerHTML=picks.map((p,i)=>'<article class="u-card"><a href="./index.html#producto/'+encodeURIComponent(p.id)+'"><img src="'+p.image+'" alt="'+esc(p.name)+'"><div class="meta"><span>'+String(i+1).padStart(2,'0')+' / '+esc(p.categoryLabel)+'</span><span>'+money(p.price)+'</span></div><h3>'+esc(p.name)+'</h3><p>explorar pieza ↗</p></a></article>').join('');
});

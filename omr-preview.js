const money = n => '$' + new Intl.NumberFormat('es-CO').format(n) + ' COP';
const escapeHtml = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
fetch('./catalog.json').then(r => r.json()).then(products => {
  const hero = products.find(p => p.name.toLowerCase().includes('margarita')) || products[0];
  const picks = products.filter(p => p.category === 'siempre floral' || p.category === 'aromatiza cada espacio').slice(0, 4);
  document.querySelector('#heroImage').src = hero.image;
  document.querySelector('#featureImage').src = hero.image;
  document.querySelector('#featureName').textContent = hero.name;
  document.querySelector('#featurePrice').textContent = money(hero.price);
  document.querySelector('#featureDescription').textContent = hero.description;
  document.querySelector('#featureMore').href = './index.html#producto/' + encodeURIComponent(hero.id);
  document.querySelector('#featureAdd').addEventListener('click', () => { window.location.href = './index.html#producto/' + encodeURIComponent(hero.id); });
  document.querySelector('#productGrid').innerHTML = picks.map(p => '<article class="product-card"><a href="./index.html#producto/' + encodeURIComponent(p.id) + '"><img src="' + p.image + '" alt="' + escapeHtml(p.name) + '"><div class="meta"><span>' + escapeHtml(p.categoryLabel) + '</span><span>' + money(p.price) + '</span></div><h3>' + escapeHtml(p.name) + '</h3><p>ver detalle ↗</p></a></article>').join('');
});

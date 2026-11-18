let products = [];
const state = { filter: "all", query: "", cart: [], selected: null, detailQty: 1 };
const money = value => "$" + new Intl.NumberFormat("es-CO").format(value || 0) + " COP";
const productById = id => products.find(p => p.id === id);
const escapeHtml = value => String(value || "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
function categoryPills() {
  const categories = [...new Map(products.map(p => [p.category, p.categoryLabel])).entries()];
  document.querySelector("#filterPills").innerHTML = '<button class="pill active" data-filter="all">Todas <span>' + products.length + '</span></button>' + categories.map(([id, label]) => '<button class="pill" data-filter="' + id + '">' + escapeHtml(label) + ' <span>' + products.filter(p => p.category === id).length + '</span></button>').join("");
  document.querySelectorAll(".pill").forEach(button => button.addEventListener("click", () => { document.querySelectorAll(".pill").forEach(item => item.classList.remove("active")); button.classList.add("active"); state.filter = button.dataset.filter; renderProducts(); }));
}
function renderProducts() {
  const grid = document.querySelector("#productGrid"), query = state.query.toLowerCase();
  const list = products.filter(p => (state.filter === "all" || p.category === state.filter) && (p.name + " " + p.categoryLabel).toLowerCase().includes(query));
  grid.innerHTML = list.map(p => '<article class="product-card"><button class="product-image" data-detail="' + encodeURIComponent(p.id) + '" aria-label="Ver detalle de ' + escapeHtml(p.name) + '"><img src="' + p.image + '" alt="' + escapeHtml(p.name) + '" loading="lazy" onerror="this.style.display=\'none\'"></button><div class="product-info"><span class="product-category">' + escapeHtml(p.categoryLabel) + '</span><h3>' + escapeHtml(p.name) + '</h3><div class="price">' + money(p.price) + '</div><p class="availability">' + escapeHtml(p.availability || "Disponible") + '</p><button class="button button-primary add-product" data-detail="' + encodeURIComponent(p.id) + '">Ver producto</button></div></article>').join("") || "<p>No encontramos productos con esa búsqueda.</p>";
  grid.querySelectorAll("[data-detail]").forEach(button => button.addEventListener("click", () => openProduct(decodeURIComponent(button.dataset.detail))));
}
function renderCart() {
  const items = document.querySelector("#cartItems");
  document.querySelector(".cart-count").textContent = state.cart.reduce((n, item) => n + item.qty, 0);
  items.innerHTML = state.cart.length ? state.cart.map(item => '<div class="cart-row"><img src="' + item.product.image + '" alt="' + escapeHtml(item.product.name) + '"><div><h3>' + escapeHtml(item.product.name) + '</h3><p>' + escapeHtml(item.fragrance) + ' · ' + money(item.product.price) + '</p><p>Cantidad: ' + item.qty + '</p></div><button data-remove="' + item.product.id + '" aria-label="Eliminar">×</button></div>').join("") : '<p class="empty-cart">Tu carrito está vacío.</p>';
  items.querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => { state.cart = state.cart.filter(item => item.product.id !== button.dataset.remove); renderCart(); }));
  const total = state.cart.reduce((n, item) => n + item.product.price * item.qty, 0);
  document.querySelector("#cartTotal").textContent = money(total); document.querySelector("#checkoutButton").disabled = !state.cart.length;
}
function openCart() { document.querySelector("#cartDrawer").classList.add("open"); document.querySelector("#drawerBackdrop").classList.add("open"); document.querySelector("#cartDrawer").setAttribute("aria-hidden", "false"); }
function closeCart() { document.querySelector("#cartDrawer").classList.remove("open"); document.querySelector("#drawerBackdrop").classList.remove("open"); document.querySelector("#cartDrawer").setAttribute("aria-hidden", "true"); }
function openProduct(id, updateUrl = true) {
  const product = productById(id); if (!product) return;
  state.selected = product; state.detailQty = 1;
  document.querySelector("#detailImage").src = product.image; document.querySelector("#detailImage").alt = product.name; document.querySelector("#detailName").textContent = product.name;
  document.querySelector("#detailCategory").textContent = product.categoryLabel; document.querySelector("#detailPrice").textContent = money(product.price); document.querySelector("#detailDescription").textContent = product.description;
  document.querySelector("#detailAvailability").textContent = product.availability || "Disponible"; document.querySelector("#detailQty").textContent = "1";
  if (updateUrl) history.pushState({ product: id }, "", "#producto/" + encodeURIComponent(id));
  document.querySelector("#productModal").classList.add("open"); document.querySelector("#productModal").setAttribute("aria-hidden", "false");
}
function closeProduct(updateUrl = true) { document.querySelector("#productModal").classList.remove("open"); document.querySelector("#productModal").setAttribute("aria-hidden", "true"); state.selected = null; if (updateUrl && location.hash.startsWith("#producto/")) history.pushState({}, "", location.pathname + location.search); }
function syncProductRoute() { const match = location.hash.match(/^#producto\/(.+)$/); if (match) openProduct(decodeURIComponent(match[1]), false); else closeProduct(false); }
function addSelectedToCart() {
  if (!state.selected) return;
  const fragrance = document.querySelector("#detailFragrance").value, color = document.querySelector("#detailColor").value.trim();
  const existing = state.cart.find(item => item.product.id === state.selected.id && item.fragrance === fragrance && item.color === color);
  if (existing) existing.qty += state.detailQty; else state.cart.push({ product: state.selected, qty: state.detailQty, fragrance, color });
  renderCart(); closeProduct(); openCart();
}
async function init() {
  const response = await fetch("./catalog.json"); products = await response.json();
  const heroProduct = products.find(product => product.name.toLowerCase().includes("bola flower")) || products[0];
  const processProduct = products.find(product => product.category === "mascotas") || products[1] || products[0];
  document.querySelector("#heroImage").src = heroProduct.image;
  document.querySelector("#processImage").src = processProduct.image;
  categoryPills(); renderProducts(); renderCart(); syncProductRoute();
  document.querySelector("#searchInput").addEventListener("input", event => { state.query = event.target.value; renderProducts(); });
  document.querySelector("#cartButton").addEventListener("click", openCart); document.querySelector("#closeCart").addEventListener("click", closeCart); document.querySelector("#drawerBackdrop").addEventListener("click", closeCart);
  document.querySelector("#closeProduct").addEventListener("click", () => closeProduct()); document.querySelector("#productModal").addEventListener("click", event => { if (event.target.id === "productModal") closeProduct(); });
  document.querySelector("#detailAdd").addEventListener("click", addSelectedToCart);
  document.querySelector("#increaseQty").addEventListener("click", () => { state.detailQty += 1; document.querySelector("#detailQty").textContent = state.detailQty; });
  document.querySelector("#decreaseQty").addEventListener("click", () => { state.detailQty = Math.max(1, state.detailQty - 1); document.querySelector("#detailQty").textContent = state.detailQty; });
  document.querySelector("#checkoutButton").addEventListener("click", () => alert("Checkout preparado: conecta aquí la pasarela de pago y la creación del pedido."));
  document.querySelector(".menu-toggle").addEventListener("click", event => { const nav = document.querySelector(".main-nav"); nav.classList.toggle("open"); event.currentTarget.setAttribute("aria-expanded", nav.classList.contains("open")); });
  document.querySelector("#searchButton").addEventListener("click", () => { document.querySelector("#searchInput").focus(); document.querySelector("#comprar").scrollIntoView({ behavior: "smooth" }); });
  document.querySelectorAll("[data-category-link]").forEach(link => link.addEventListener("click", () => {
    state.filter = link.dataset.categoryLink;
    document.querySelectorAll(".pill").forEach(pill => pill.classList.toggle("active", pill.dataset.filter === state.filter));
    renderProducts();
  }));
  window.addEventListener("popstate", syncProductRoute); window.addEventListener("hashchange", syncProductRoute);
}
init().catch(error => { console.error(error); document.querySelector("#productGrid").innerHTML = "<p>No se pudo cargar el catálogo. Revisa la conexión local.</p>"; });

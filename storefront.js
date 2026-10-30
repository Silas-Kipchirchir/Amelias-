(() => {
  const cfg = window.AMELIAS_CONFIG;
  const db = window.AMELIAS_DB;
  const fallbackProducts = [
    {id:"sample-1",name:"Elegant Rose Bouquets",description:"Romantic rose arrangements for heartfelt gifts and unforgettable moments.",image_url:"https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=900&q=85",category:"Flower Bouquets",is_new:false,is_active:true,price:null,label:"A favourite"},
    {id:"sample-2",name:"Luxury Arrangements",description:"Beautiful statement pieces that add elegance, texture and colour to your space.",image_url:"https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=900&q=85",category:"Rose Arrangements",is_new:true,is_active:true,price:null,label:"Signature style"},
    {id:"sample-3",name:"Romantic Pink Roses",description:"Soft, graceful floral gifts for anniversaries, birthdays and special surprises.",image_url:"https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=900&q=85",category:"Flower Bouquets",is_new:false,is_active:true,price:null,label:""},
    {id:"sample-4",name:"Decorative Flowers",description:"Give your favourite corners a fresh, welcoming and elegant floral touch.",image_url:"https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=900&q=85",category:"Home Décor",is_new:false,is_active:true,price:null,label:""},
    {id:"sample-5",name:"Home & Office Décor",description:"Floral accents and decorative touches for calm, polished interiors.",image_url:"https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=85",category:"Home Décor",is_new:false,is_active:true,price:null,label:""},
    {id:"sample-6",name:"Special Occasion Flowers",description:"Floral designs to make your celebrations feel even more personal.",image_url:"https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=85",category:"Event Décor",is_new:false,is_active:true,price:null,label:""}
  ];
  const $ = id => document.getElementById(id);
  const wa = (message) => window.open(`https://wa.me/${cfg.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  const safe = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function productCard(p) {
    const price = p.price !== null && p.price !== undefined && p.price !== "" ? `<div class="product-price">KSh ${Number(p.price).toLocaleString("en-KE")}</div>` : "";
    const label = p.is_new ? "New arrival" : (p.label || p.category || "Amelia's pick");
    return `<article class="product-card"><div class="product-image"><img src="${safe(p.image_url || fallbackProducts[0].image_url)}" alt="${safe(p.name)}" loading="lazy"><span class="product-label">${safe(label)}</span></div><div class="product-body"><h3>${safe(p.name)}</h3><p>${safe(p.description)}</p>${price}<button class="btn order-btn" type="button" data-product="${safe(p.name)}">Enquire on WhatsApp ↗</button></div></article>`;
  }
  function renderProducts(products) {
    const active = products.filter(p => p.is_active !== false);
    const arrivals = active.filter(p => p.is_new);
    $("newArrivalsGrid").innerHTML = arrivals.length ? arrivals.map(productCard).join("") : `<div class="empty-state">New pieces are on the way. Please check back soon.</div>`;
    $("collectionGrid").innerHTML = active.length ? active.map(productCard).join("") : `<div class="empty-state">Our collection is being refreshed. Please check back shortly.</div>`;
    document.querySelectorAll(".order-btn").forEach(btn => btn.addEventListener("click", () => wa(`Hello Amelia's Flowers & Decor! I'm interested in "${btn.dataset.product}". Kindly share the available designs and prices.`)));
  }
  async function loadProducts() {
    if (!db) { renderProducts(fallbackProducts); return; }
    const {data,error} = await db.from("products").select("*").eq("is_active",true).order("created_at",{ascending:false});
    if (error) { console.error(error); renderProducts(fallbackProducts); return; }
    renderProducts(data || []);
  }
  async function loadSettings() {
    if (!db) return;
    const {data,error} = await db.from("store_settings").select("key,value");
    if (error || !data) return;
    const settings = Object.fromEntries(data.map(x => [x.key,x.value]));
    const phone = settings.phone_display || cfg.PHONE_DISPLAY;
    const tel = settings.phone_tel || cfg.PHONE_TEL;
    const whatsapp = (settings.whatsapp_number || cfg.WHATSAPP_NUMBER).replace(/\D/g,"");
    const email = settings.email || cfg.EMAIL;
    $("phoneLink").textContent = phone; $("phoneLink").href = `tel:${tel}`;
    $("whatsappLink").textContent = whatsapp; $("whatsappLink").href = `https://wa.me/${whatsapp}`;
    $("footerPhone").textContent = phone; $("footerPhone").href = `tel:${tel}`;
    $("footerWhatsapp").href = `https://wa.me/${whatsapp}`;
    $("floatingWhatsapp").href = `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hello Amelia's Flowers & Decor! I'd like to make an enquiry.")}`;
    if (email) { $("emailLink").textContent = email; $("emailLink").href = `mailto:${email}`; }
  }
  const menu = $("menuToggle"), nav = $("navigation");
  menu.addEventListener("click", () => { const open = nav.classList.toggle("open"); menu.textContent = open ? "×" : "☰"; menu.setAttribute("aria-expanded",String(open)); document.body.classList.toggle("menu-open",open); });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { nav.classList.remove("open"); menu.textContent="☰"; menu.setAttribute("aria-expanded","false"); document.body.classList.remove("menu-open"); }));
  document.querySelectorAll("[data-occasion]").forEach(card => card.addEventListener("click", () => { $("interest").value = card.dataset.occasion; }));
  $("enquiryForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = $("name").value.trim(); if (!name) { $("name").focus(); return; }
    const message = ["Hello Amelia's Flowers & Decor!","",`My name is ${name}.`,`My phone number: ${$("phone").value.trim() || "Not provided"}`,`I'm interested in: ${$("interest").value}`,"","My message:",$("details").value.trim() || "I would like to make an enquiry.","","Thank you!"].join("\n");
    wa(message);
  });
  $("year").textContent = new Date().getFullYear();
  loadProducts(); loadSettings();
})();
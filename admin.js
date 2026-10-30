(() => {
  const db = window.AMELIAS_DB;
  const $ = id => document.getElementById(id);
  let products = [], editingImageUrl = "";
  const message = (id,text,isError=false) => { const el=$(id); el.textContent=text; el.style.color=isError?"#a3344b":"#6e6570"; };
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function configCheck() {
    if (!db) { $("loginMessage").textContent = "Connect Supabase first: edit assets/js/config.js and follow README.md. Admin features remain locked until configured."; $("loginMessage").classList.add("error-text"); return false; }
    return true;
  }
  function showDashboard(user) { $("loginPanel").hidden=true; $("dashboard").hidden=false; $("adminEmail").value=user.email || ""; loadAll(); }
  async function checkSession() {
    if (!configCheck()) return;
    const {data} = await db.auth.getSession();
    if (data.session) showDashboard(data.session.user);
  }
  $("loginForm").addEventListener("submit",async e=>{
    e.preventDefault(); if (!configCheck()) return;
    message("loginMessage","Signing in…");
    const {data,error}=await db.auth.signInWithPassword({email:$("adminEmail").value.trim(),password:$("adminPassword").value});
    if(error) return message("loginMessage",error.message,true);
    showDashboard(data.user);
  });
  $("logoutBtn").addEventListener("click",async()=>{await db.auth.signOut(); $("dashboard").hidden=true; $("loginPanel").hidden=false;});
  async function loadAll() { await loadProducts(); await loadSettings(); }
  async function loadProducts() {
    const {data,error}=await db.from("products").select("*").order("created_at",{ascending:false});
    if(error) { $("adminProductList").innerHTML=`<p class="error-text">Could not load products: ${escapeHtml(error.message)}</p>`; return; }
    products=data||[]; $("totalProducts").textContent=products.length; $("newCount").textContent=products.filter(p=>p.is_new).length; $("activeCount").textContent=products.filter(p=>p.is_active).length;
    $("adminProductList").innerHTML=products.length?products.map(p=>`<article class="admin-product"><img src="${escapeHtml(p.image_url||"")}" alt=""><div class="admin-product-info"><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.category||"Uncategorised")} ${p.price!==null&&p.price!==""?"· KSh "+Number(p.price).toLocaleString("en-KE"):""}</small><div class="product-tags">${p.is_new?'<span>New arrival</span>':""}${p.is_active?'<span class="tag-live">Visible</span>':'<span class="tag-off">Hidden</span>'}</div></div><div class="admin-product-actions"><button class="mini-btn" data-edit="${p.id}">Edit</button><button class="mini-btn" data-toggle="${p.id}">${p.is_active?"Hide":"Publish"}</button><button class="mini-btn danger" data-delete="${p.id}">Delete</button></div></article>`).join(""):`<div class="empty-state">No products yet. Add your first product using the form.</div>`;
    document.querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>editProduct(b.dataset.edit)));
    document.querySelectorAll("[data-toggle]").forEach(b=>b.addEventListener("click",()=>toggleProduct(b.dataset.toggle)));
    document.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>deleteProduct(b.dataset.delete)));
  }
  function editProduct(id) {
    const p=products.find(x=>x.id===id); if(!p)return;
    $("productId").value=p.id; $("productName").value=p.name; $("productDescription").value=p.description||""; $("productPrice").value=p.price??""; $("productCategory").value=p.category||"Other"; $("isNew").checked=!!p.is_new; $("isActive").checked=!!p.is_active; editingImageUrl=p.image_url||"";
    $("editorTitle").textContent="Edit product"; $("saveProductBtn").textContent="Update product";
    $("imagePreview").hidden=!editingImageUrl; $("imagePreview").innerHTML=editingImageUrl?`<img src="${escapeHtml(editingImageUrl)}" alt="Current product image">`:"";
    document.querySelector(".editor-panel").scrollIntoView({behavior:"smooth",block:"start"});
  }
  function resetForm() { $("productForm").reset(); $("productId").value=""; editingImageUrl=""; $("editorTitle").textContent="Add a product"; $("saveProductBtn").textContent="Save product"; $("imagePreview").hidden=true; $("imagePreview").innerHTML=""; message("formMessage",""); }
  $("resetForm").addEventListener("click",resetForm);
  $("productImage").addEventListener("change",()=>{const f=$("productImage").files[0];if(!f){$("imagePreview").hidden=true;return;}if(f.size>5*1024*1024){message("formMessage","Image is larger than 5 MB.",true);$("productImage").value="";return;}const url=URL.createObjectURL(f);$("imagePreview").hidden=false;$("imagePreview").innerHTML=`<img src="${url}" alt="Image preview">`;});
  async function uploadImage(file) {
    if(!file)return editingImageUrl;
    const ext=file.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg";
    const path=`${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const {error}=await db.storage.from("product-images").upload(path,file,{upsert:false,contentType:file.type});
    if(error)throw error;
    const {data}=db.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  }
  $("productForm").addEventListener("submit",async e=>{
    e.preventDefault(); const id=$("productId").value;
    const btn=$("saveProductBtn"); btn.disabled=true; btn.textContent="Saving…"; message("formMessage","Saving product…");
    try {
      const image_url=await uploadImage($("productImage").files[0]);
      const payload={name:$("productName").value.trim(),description:$("productDescription").value.trim(),price:$("productPrice").value?Number($("productPrice").value):null,category:$("productCategory").value,image_url,is_new:$("isNew").checked,is_active:$("isActive").checked};
      const result=id?await db.from("products").update(payload).eq("id",id):await db.from("products").insert(payload);
      if(result.error)throw result.error;
      message("formMessage",id?"Product updated successfully.":"Product added successfully."); resetForm(); await loadProducts();
    } catch(err) { message("formMessage",err.message||"Could not save product.",true); }
    finally {btn.disabled=false;btn.textContent=id?"Update product":"Save product";}
  });
  async function toggleProduct(id) {const p=products.find(x=>x.id===id);if(!p)return;const {error}=await db.from("products").update({is_active:!p.is_active}).eq("id",id);if(error)alert(error.message);else loadProducts();}
  async function deleteProduct(id) {const p=products.find(x=>x.id===id);if(!p||!confirm(`Delete "${p.name}"? This cannot be undone.`))return;const {error}=await db.from("products").delete().eq("id",id);if(error)alert(error.message);else loadProducts();}
  $("refreshBtn").addEventListener("click",loadProducts);
  async function loadSettings() {
    const {data,error}=await db.from("store_settings").select("key,value");
    if(error)return;
    const s=Object.fromEntries((data||[]).map(x=>[x.key,x.value]));
    $("storePhone").value=s.phone_display||window.AMELIAS_CONFIG.PHONE_DISPLAY||"";
    $("storeEmail").value=s.email||window.AMELIAS_CONFIG.EMAIL||"";
    $("storeWhatsapp").value=s.whatsapp_number||window.AMELIAS_CONFIG.WHATSAPP_NUMBER||"";
  }
  $("settingsForm").addEventListener("submit",async e=>{
    e.preventDefault();const rows=[{key:"phone_display",value:$("storePhone").value.trim()},{key:"email",value:$("storeEmail").value.trim()},{key:"whatsapp_number",value:$("storeWhatsapp").value.replace(/\D/g,"")}];
    const {error}=await db.from("store_settings").upsert(rows,{onConflict:"key"});
    message("settingsMessage",error?error.message:"Store contact details saved.",!!error);
  });
  checkSession();
})();
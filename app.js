
function sureyyaPriceHTML(value) {
 const price=String(value || "Fiyat sorunuz");
 const match=price.match(/^Tam:\s*(.+?)\s*[·|]\s*Az:\s*(.+)$/i);
 if(match) return `<span class="price price-split"><span class="price-option"><small>TAM</small><strong>${match[1]}</strong></span><span class="price-option"><small>AZ</small><strong>${match[2]}</strong></span></span>`;
 return `<span class="price price-single">${price}</span>`;
}
let menuData = JSON.parse(JSON.stringify(window.DEFAULT_MENU_DATA || []));

function prepareMenu(data){
  const copy = JSON.parse(JSON.stringify(Array.isArray(data) ? data : []));
  return copy
    .filter(c => c && c.active !== false)
    .map(c => {
      if (Array.isArray(c.products)) c.products = c.products.filter(p => p && p.active !== false);
      if (Array.isArray(c.subcategories)) {
        c.subcategories = c.subcategories
          .filter(s => s && s.active !== false)
          .map(s => ({...s, products:(s.products || []).filter(p => p && p.active !== false)}));
      }
      return c;
    });
}

menuData = prepareMenu(menuData);

const categoryGrid=document.getElementById("categoryGrid");
const topScroller=document.getElementById("topCategoryScroller");
const productView=document.getElementById("productView");
const productGrid=document.getElementById("productGrid");
const productHeader=document.getElementById("productHeader");
const sectionTitle=document.getElementById("sectionTitle");
const sectionKicker=document.getElementById("sectionKicker");
const sectionText=document.getElementById("sectionText");
const backButton=document.getElementById("backButton");

let activeMain=null;


function countItems(c){

  if(c.subcategories){
    return c.subcategories.reduce((n,s)=>n+s.products.length,0);
  }

  return c.products.length;

}


function renderTopCats(){

  topScroller.innerHTML=menuData.map((c,i)=>`

    <button class="top-cat ${c.name==="Mutfak"?"active":""}" data-i="${i}">

      <img src="${c.image}" alt="${c.name}">

      <span class="top-cat-copy">
        <strong>${c.name}</strong>
        <span>${countItems(c)} ürün</span>
      </span>

    </button>

  `).join("");


  topScroller
    .querySelectorAll(".top-cat")
    .forEach(b=>b.onclick=()=>openCategory(+b.dataset.i));

}


function renderMainCategories(){

  activeMain=null;

  backButton.classList.add("hidden");
  backButton.onclick=renderMainCategories;

  sectionKicker.textContent="SÜREYYA KAFE";
  sectionTitle.textContent="Menü";
  sectionText.textContent="Kategorini seç, favorini keşfet.";

  categoryGrid.classList.remove("hidden");
  productView.classList.add("hidden");

  categoryGrid.className="feature-grid";


  categoryGrid.innerHTML=menuData.map((c,i)=>`

    <button class="feature-card" data-i="${i}">

      <img src="${c.image}" alt="${c.name}">

      <span class="feature-copy">

        <strong>${c.name}</strong>

        <i></i>

        <small>
          ${countItems(c)} ürün • Süreyya Kafe seçkisi
        </small>

      </span>

      <span class="feature-go">›</span>

    </button>

  `).join("");


  categoryGrid
    .querySelectorAll(".feature-card")
    .forEach(b=>b.onclick=()=>openCategory(+b.dataset.i));

}


function highlightTop(i){

  topScroller
    .querySelectorAll(".top-cat")
    .forEach((el,idx)=>{
      el.classList.toggle("active",idx===i);
    });

}


function openCategory(i){

  const c=menuData[i];

  backButton.classList.remove("hidden");
  backButton.onclick=renderMainCategories;

  activeMain=i;

  highlightTop(i);


  if(c.subcategories){

    openKitchen(c);

    return;

  }


  categoryGrid.classList.add("hidden");

  productView.classList.remove("hidden");

  sectionKicker.textContent="SÜREYYA MENÜ";
  sectionTitle.textContent=c.name;
  sectionText.textContent=`${c.products.length} ürünlük Süreyya Kafe seçkisi.`;

  productHeader.style.backgroundImage=`url("${c.image}")`;


  productHeader.innerHTML=`

    <div>

      <small>${c.products.length} ÜRÜN</small>

      <strong>${c.name}</strong>

    </div>

  `;


  productGrid.className="product-grid";


  productGrid.innerHTML=c.products.map(item=>`

    <article class="product">

      <img src="${item.image}" alt="${item.name}">

      <div class="product-info">

        <h3>${item.name}</h3>

        <p>SÜREYYA KAFE</p>

      </div>

      ${sureyyaPriceHTML(item.price)}

    </article>

  `).join("");


  document
    .getElementById("menuArea")
    .scrollIntoView({
      behavior:"smooth"
    });

}


function openKitchen(c){

  backButton.classList.remove("hidden");

  backButton.onclick=renderMainCategories;

  categoryGrid.classList.add("hidden");

  productView.classList.remove("hidden");

  sectionKicker.textContent="LEZZET DOLU";
  sectionTitle.textContent="Mutfak";
  sectionText.textContent="Özenle hazırlanan lezzetler, keyifli anlara eşlik eder.";

  productHeader.style.backgroundImage=`url("${c.image}")`;


  productHeader.innerHTML=`

    <div>

      <small>SÜREYYA KAFE</small>

      <strong>Mutfak</strong>

    </div>

  `;


  productGrid.className="kitchen-grid";


  productGrid.innerHTML=c.subcategories.map((s,i)=>`

    <button class="kitchen-card" data-sub="${i}">

      <img src="${s.image}" alt="${s.name}">

      <span class="kitchen-copy">

        <strong>${s.name}</strong>

        <i></i>

        <small>${s.subtitle}</small>

      </span>

      <span class="kitchen-go">›</span>

    </button>

  `).join("");


  productGrid
    .querySelectorAll(".kitchen-card")
    .forEach(b=>b.onclick=()=>openSubcategory(+b.dataset.sub));


  document
    .getElementById("menuArea")
    .scrollIntoView({
      behavior:"smooth"
    });

}


function openSubcategory(index){

  const kitchen=menuData[activeMain];

  backButton.classList.remove("hidden");

  backButton.onclick=()=>openKitchen(kitchen);


  const s=kitchen.subcategories[index];


  sectionKicker.textContent="MUTFAK";
  sectionTitle.textContent=s.name;
  sectionText.textContent=s.subtitle;

  productHeader.style.backgroundImage=`url("${s.image}")`;


  productHeader.innerHTML=`

    <div>

      <small>${s.products.length} ÜRÜN</small>

      <strong>${s.name}</strong>

    </div>

  `;


  productGrid.className="product-grid";


  productGrid.innerHTML=s.products.map(item=>`

    <article class="product">

      <img src="${item.image}" alt="${item.name}">

      <div class="product-info">

        <h3>${item.name}</h3>

        <p class="description">
          ${item.desc}
        </p>

      </div>

      ${sureyyaPriceHTML(item.price)}

    </article>

  `).join("");


  document
    .getElementById("menuArea")
    .scrollIntoView({
      behavior:"smooth"
    });

}


document.getElementById("homeButton").onclick=renderMainCategories;

document.getElementById("menuButton").onclick=renderMainCategories;

document.getElementById("locationButton").onclick=()=>{ alert("Konum bağlantısı işletme tarafından eklenecek."); };

document.getElementById("instagramButton").onclick=()=>{ alert("Instagram bağlantısı işletme tarafından eklenecek."); };

const bottomLogo=document.querySelector(".bottom-logo");
if(bottomLogo){
  bottomLogo.onclick=renderMainCategories;
}

document.getElementById("menuToggle").onclick=renderMainCategories;

document.getElementById("searchButton").onclick=()=>{
  document
    .getElementById("infoModal")
    .classList.remove("hidden");
};


const modal=document.getElementById("infoModal");


document.getElementById("closeModal").onclick=()=>{
  modal.classList.add("hidden");
};


modal.onclick=e=>{

  if(e.target===modal){
    modal.classList.add("hidden");
  }

};
function renderAll(){
  renderTopCats();
  renderMainCategories();
}

renderAll();

if (window.roofDb) {
  window.roofDb.ref("menu").on("value", snapshot => {
    const remote = snapshot.val();
    if (Array.isArray(remote) && remote.length) {
      menuData = prepareMenu(window.sureyyaFixMenuImages(remote));
      renderAll();
    }
  }, error => console.warn("Firebase menu okunamadı; yerel menü kullanılıyor.", error));
}

window.addEventListener("load",()=>setTimeout(()=>document.getElementById("loader").classList.add("hide"),1100));

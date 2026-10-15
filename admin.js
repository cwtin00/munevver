if (!window.roofAuth || !window.roofDb) {
  document.addEventListener("DOMContentLoaded", () => {
    const msg = document.getElementById("loginMsg");
    if (msg) msg.textContent = "Yönetim paneli için Süreyya Kafe'ye ait yeni Firebase bağlantısı gereklidir. Roof Cafe verileri güvenlik için kullanılmıyor.";
  });
} else {
const loginView =
  document.getElementById("loginView");

const panelView =
  document.getElementById("panelView");

const editor =
  document.getElementById("editor");

const panelMsg =
  document.getElementById("panelMsg");

const adminSearch =
  document.getElementById("adminSearch");

const quickCategoryNav =
  document.getElementById("quickCategoryNav");

const adminNoResults =
  document.getElementById("adminNoResults");


let adminMenu = [];
let currentSearch = "";
let openCategories = new Set([0]);


const clone = x =>
  JSON.parse(
    JSON.stringify(x)
  );


function defaults() {

  const m =
    clone(
      window.DEFAULT_MENU_DATA || []
    );


  m.forEach(c => {

    if (
      c.active === undefined
    ) {
      c.active = true;
    }


    (
      c.products || []
    ).forEach(p => {

      if (
        p.active === undefined
      ) {
        p.active = true;
      }


      if (
        p.price === undefined
      ) {
        p.price = "BOŞ";
      }

    });


    (
      c.subcategories || []
    ).forEach(s => {

      if (
        s.active === undefined
      ) {
        s.active = true;
      }


      (
        s.products || []
      ).forEach(p => {

        if (
          p.active === undefined
        ) {
          p.active = true;
        }


        if (
          p.price === undefined
        ) {
          p.price = "BOŞ";
        }

      });

    });

  });


  return m;

}


function normalizeKey(value = "") {

  return String(value)
    .trim()
    .toLocaleLowerCase("tr-TR");

}


function sameMenuItem(remoteItem, localItem) {

  if(!remoteItem || !localItem) {
    return false;
  }

  return normalizeKey(remoteItem.name) === normalizeKey(localItem.name);

}


function prepareNewItem(item) {

  const copy = clone(item);

  if(copy.active === undefined) {
    copy.active = true;
  }

  if(
    copy.products &&
    Array.isArray(copy.products)
  ) {
    copy.products = copy.products.map(prepareNewItem);
  }

  if(
    copy.subcategories &&
    Array.isArray(copy.subcategories)
  ) {
    copy.subcategories = copy.subcategories.map(prepareNewItem);
  }

  if(
    !copy.products &&
    !copy.subcategories &&
    copy.price === undefined
  ) {
    copy.price = "BOŞ";
  }

  return copy;

}


function buildMissingOnlySync(remoteMenu, localMenu) {

  const merged = clone(
    Array.isArray(remoteMenu)
      ? remoteMenu
      : []
  );

  const updates = {};
  let addedProducts = 0;
  let addedSubcategories = 0;
  let addedCategories = 0;


  // Repair old category-wide image placeholders already stored in Firebase.
  const localByName = new Map(localMenu.map(c => [normalizeKey(c.name), c]));
  merged.forEach((remoteCategory, ci) => {
    const localCategory = localByName.get(normalizeKey(remoteCategory.name));
    if (!localCategory) return;
    const legacy = path => !path || /(?:yemeklerkategori|icecekkategori|tatlilarkategori|corbalarkategori|kurabiyelervetatlilarkategori)\.webp$/i.test(path);
    if (legacy(remoteCategory.image) && remoteCategory.image !== localCategory.image) {
      remoteCategory.image = localCategory.image;
      updates[`menu/${ci}/image`] = localCategory.image;
    }
    const localProducts = new Map((localCategory.products || []).map(p => [normalizeKey(p.name), p]));
    (remoteCategory.products || []).forEach((remoteProduct, pi) => {
      const wanted = localProducts.get(normalizeKey(remoteProduct.name));
      if (wanted && legacy(remoteProduct.image) && remoteProduct.image !== wanted.image) {
        remoteProduct.image = wanted.image;
        updates[`menu/${ci}/products/${pi}/image`] = wanted.image;
      }
    });
  });

  localMenu.forEach(localCategory => {

    let ci = merged.findIndex(
      remoteCategory =>
        sameMenuItem(
          remoteCategory,
          localCategory
        )
    );


    if(ci === -1) {

      ci = merged.length;

      const newCategory =
        prepareNewItem(localCategory);

      merged.push(newCategory);

      updates[`menu/${ci}`] =
        newCategory;

      addedCategories += 1;

      return;

    }


    const remoteCategory =
      merged[ci];


    if(
      Array.isArray(localCategory.products)
    ) {

      if(!Array.isArray(remoteCategory.products)) {
        remoteCategory.products = [];
      }


      localCategory.products.forEach(localProduct => {

        const exists =
          remoteCategory.products.some(
            remoteProduct =>
              sameMenuItem(
                remoteProduct,
                localProduct
              )
          );


        if(!exists) {

          const pi =
            remoteCategory.products.length;

          const newProduct =
            prepareNewItem(localProduct);

          remoteCategory.products.push(
            newProduct
          );

          updates[
            `menu/${ci}/products/${pi}`
          ] = newProduct;

          addedProducts += 1;

        }

      });

    }


    if(
      Array.isArray(localCategory.subcategories)
    ) {

      if(!Array.isArray(remoteCategory.subcategories)) {
        remoteCategory.subcategories = [];
      }


      localCategory.subcategories.forEach(localSubcategory => {

        let si =
          remoteCategory.subcategories.findIndex(
            remoteSubcategory =>
              sameMenuItem(
                remoteSubcategory,
                localSubcategory
              )
          );


        if(si === -1) {

          si =
            remoteCategory.subcategories.length;

          const newSubcategory =
            prepareNewItem(localSubcategory);

          remoteCategory.subcategories.push(
            newSubcategory
          );

          updates[
            `menu/${ci}/subcategories/${si}`
          ] = newSubcategory;

          addedSubcategories += 1;

          return;

        }


        const remoteSubcategory =
          remoteCategory.subcategories[si];

        if(!Array.isArray(remoteSubcategory.products)) {
          remoteSubcategory.products = [];
        }


        (
          localSubcategory.products || []
        ).forEach(localProduct => {

          const exists =
            remoteSubcategory.products.some(
              remoteProduct =>
                sameMenuItem(
                  remoteProduct,
                  localProduct
                )
            );


          if(!exists) {

            const pi =
              remoteSubcategory.products.length;

            const newProduct =
              prepareNewItem(localProduct);

            remoteSubcategory.products.push(
              newProduct
            );

            updates[
              `menu/${ci}/subcategories/${si}/products/${pi}`
            ] = newProduct;

            addedProducts += 1;

          }

        });

      });

    }

  });


  return {
    merged,
    updates,
    addedProducts,
    addedSubcategories,
    addedCategories
  };

}


function esc(s = "") {

  return String(s).replace(

    /[&<>"]/g,

    m => ({

      "&": "&amp;",

      "<": "&lt;",

      ">": "&gt;",

      '"': "&quot;"

    }[m])

  );

}


function render() {

  editor.innerHTML =
    adminMenu.map(

      (
        c,
        ci
      ) => {

        const productCount =
          c.subcategories

            ? c.subcategories.reduce(
                (
                  total,
                  sub
                ) =>
                  total +
                  (
                    sub.products || []
                  ).length,

                0
              )

            : (
                c.products || []
              ).length;


        return `

          <section
            class="category ${openCategories.has(ci) ? "is-open" : ""}"
            data-ci="${ci}"
            data-search="${esc(c.name || "")}"
          >

            <div
              class="category-header"
            >

              <div
                class="category-name"
              >

                <span
                  class="category-index"
                >
                  ${
                    ci + 1
                  }
                </span>

                <div>

                  <h3>
                    ${
                      esc(
                        c.name
                      )
                    }
                  </h3>

                  <span>
                    ${
                      productCount
                    }
                    ürün
                  </span>

                </div>

              </div>


              <div
                class="category-settings"
              >

                <label
                  class="switch"
                >

                  <input
                    type="checkbox"
                    data-f="active"
                    ${
                      c.active !== false
                        ? "checked"
                        : ""
                    }
                  >

                  Kategori aktif

                </label>

                <button type="button" class="category-toggle" data-toggle-category="${ci}">${openCategories.has(ci) ? "Kapat" : "Aç"}</button>

              </div>

            </div>


            <div
              class="category-body"
            >

              <div
                class="category-fields"
              >

                <input
                  data-f="name"
                  value="${
                    esc(
                      c.name
                    )
                  }"
                  placeholder="Kategori adı"
                >

              </div>


              ${
                c.subcategories

                  ? c.subcategories
                      .map(
                        (
                          s,
                          si
                        ) =>
                          subHTML(
                            s,
                            ci,
                            si
                          )
                      )
                      .join("")

                  : `

                    <div
                      class="product-section"
                    >

                      <div
                        class="product-section-title"
                      >

                        <h4>
                          Ürünler
                        </h4>

                        <span
                          class="product-count"
                        >
                          ${
                            (
                              c.products || []
                            ).length
                          }
                          ÜRÜN
                        </span>

                      </div>


                      <div
                        class="product-list"
                      >

                        ${
                          (
                            c.products || []
                          )
                            .map(
                              (
                                p,
                                pi
                              ) =>
                                prodHTML(
                                  p,
                                  ci,
                                  null,
                                  pi
                                )
                            )
                            .join("")
                        }

                      </div>

                      <div class="section-actions">
                        <button type="button" class="add-product-btn" data-add-product data-ci="${ci}">+ Yeni Ürün Ekle</button>
                      </div>

                    </div>

                  `
              }

            </div>

          </section>

        `;

      }

    ).join("");


  bind();
  renderQuickCategoryNav();
  applySearchFilter();

}


function subHTML(
  s,
  ci,
  si
) {

  return `

    <div
      class="subcategory-block"
      data-ci="${ci}"
      data-si="${si}"
      data-search="${esc(`${s.name || ""} ${s.subtitle || ""}`)}"
    >

      <div
        class="subcategory-header"
      >

        <div>

          <span
            class="eyebrow"
          >
            MUTFAK
          </span>

          <h4>
            ${
              esc(
                s.name
              )
            }
          </h4>

        </div>


        <label
          class="switch"
        >

          <input
            type="checkbox"
            data-sf="active"
            ${
              s.active !== false
                ? "checked"
                : ""
            }
          >

          Aktif

        </label>

      </div>


      <div
        class="subcategory-fields"
      >

        <input
          data-sf="name"
          value="${
            esc(
              s.name
            )
          }"
          placeholder="Alt kategori adı"
        >


        <input
          data-sf="subtitle"
          value="${
            esc(
              s.subtitle || ""
            )
          }"
          placeholder="Alt kategori açıklaması"
        >

      </div>


      <div
        class="product-section"
      >

        <div
          class="product-section-title"
        >

          <h4>
            Ürünler
          </h4>

          <span
            class="product-count"
          >
            ${
              (
                s.products || []
              ).length
            }
            ÜRÜN
          </span>

        </div>


        <div
          class="product-list"
        >

          ${
            (
              s.products || []
            )
              .map(
                (
                  p,
                  pi
                ) =>
                  prodHTML(
                    p,
                    ci,
                    si,
                    pi
                  )
              )
              .join("")
          }

        </div>

        <div class="section-actions">
          <button type="button" class="add-product-btn" data-add-product data-ci="${ci}" data-si="${si}">+ Yeni Ürün Ekle</button>
        </div>

      </div>

    </div>

  `;

}


function prodHTML(
  p,
  ci,
  si,
  pi
) {

  return `

    <div
      class="product-card"
      data-ci="${ci}"
      data-si="${
        si === null
          ? ""
          : si
      }"
      data-pi="${pi}"
      data-search="${esc(`${p.name || ""} ${p.price || ""} ${p.desc || ""}`)}"
    >

      <div class="product-order-controls">

        <button
          type="button"
          class="order-btn"
          data-move="up"
          title="Yukarı taşı"
          aria-label="Ürünü yukarı taşı"
        >↑</button>

        <button
          type="button"
          class="order-btn"
          data-move="down"
          title="Aşağı taşı"
          aria-label="Ürünü aşağı taşı"
        >↓</button>

      </div>


      <div
        class="product-main"
      >

        <input
          data-pf="name"
          value="${
            esc(
              p.name
            )
          }"
          placeholder="Ürün adı"
        >

      </div>


      <div
        class="product-price"
      >

        <input
          data-pf="price"
          value="${
            esc(
              p.price || "BOŞ"
            )
          }"
          placeholder="Fiyat"
        >

      </div>


      <div
        class="product-media"
      >

        <input
          data-pf="image"
          value="${
            esc(
              p.image || ""
            )
          }"
          placeholder="Görsel yolu (örn: image/yeniurun.webp)"
        >

      </div>


      <label
        class="switch"
      >

        <input
          type="checkbox"
          data-pf="active"
          ${
            p.active !== false
              ? "checked"
              : ""
          }
        >

        Aktif

      </label>


      ${
        p.desc !== undefined

          ? `

            <textarea
              class="product-description"
              data-pf="desc"
              placeholder="Ürün açıklaması"
            >${
              esc(
                p.desc || ""
              )
            }</textarea>

          `

          : ""
      }

      <div class="product-actions">
        <button type="button" class="danger-btn" data-remove-product="1">Ürünü Sil</button>
      </div>

    </div>

  `;

}


function renderQuickCategoryNav() {

  if(!quickCategoryNav) return;

  quickCategoryNav.innerHTML = adminMenu.map((c, ci) => `
    <button
      type="button"
      class="quick-chip ${openCategories.has(ci) ? "active" : ""}"
      data-jump-category="${ci}"
    >${esc(c.name || `Kategori ${ci + 1}`)}</button>
  `).join("");

  quickCategoryNav
    .querySelectorAll("[data-jump-category]")
    .forEach(btn => {
      btn.onclick = () => {
        const ci = +btn.dataset.jumpCategory;
        openCategories = new Set([ci]);
        render();
        const target = editor.querySelector(`.category[data-ci="${ci}"]`);
        if(target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      };
    });

}


function applySearchFilter() {

  const q = normalizeKey(currentSearch);
  const categories = [...editor.querySelectorAll(".category")];

  let visibleCategories = 0;

  categories.forEach(section => {

    if(!q) {
      section.style.display = "";

      section.querySelectorAll(".product-card, .subcategory-block, .product-section").forEach(el => {
        el.style.display = "";
      });

      if(openCategories.has(+section.dataset.ci)) {
        section.classList.add("is-open");
      } else {
        section.classList.remove("is-open");
      }

      return;
    }

    const categoryMatch = normalizeKey(section.dataset.search || "").includes(q);

    let sectionVisible = categoryMatch;

    section.querySelectorAll('.product-card').forEach(card => {
      const cardMatch = categoryMatch || normalizeKey(card.dataset.search || "").includes(q);
      card.style.display = cardMatch ? "" : "none";
      if(cardMatch) sectionVisible = true;
    });

    section.querySelectorAll('.subcategory-block').forEach(sub => {
      const subMatch = categoryMatch || normalizeKey(sub.dataset.search || "").includes(q);
      let subVisible = subMatch;
      const visibleCards = [...sub.querySelectorAll('.product-card')].filter(card => card.style.display !== 'none').length;
      if(visibleCards > 0) subVisible = true;
      sub.style.display = subVisible ? "" : "none";
      if(subVisible) sectionVisible = true;
    });

    section.querySelectorAll('.category-body > .product-section').forEach(prodSection => {
      const visibleCards = [...prodSection.querySelectorAll('.product-card')].filter(card => card.style.display !== 'none').length;
      const showSection = categoryMatch || visibleCards > 0;
      prodSection.style.display = showSection ? "" : "none";
      if(showSection) sectionVisible = true;
    });

    section.style.display = sectionVisible ? "" : "none";
    section.classList.toggle('is-open', sectionVisible);

    if(sectionVisible) visibleCategories += 1;

  });

  if(adminNoResults) {
    adminNoResults.classList.toggle('hidden', visibleCategories !== 0 || !q);
  }

}


function bind() {

  editor
    .querySelectorAll(
      "[data-f]"
    )
    .forEach(el => {

      el.oninput = () => {

        const c =
          adminMenu[
            +el
              .closest(
                ".category"
              )
              .dataset
              .ci
          ];


        c[
          el.dataset.f
        ] =
          el.type === "checkbox"

            ? el.checked

            : el.value;

      };

    });


  editor
    .querySelectorAll(
      "[data-sf]"
    )
    .forEach(el => {

      el.oninput = () => {

        const box =
          el.closest(
            "[data-si]"
          );


        const s =
          adminMenu[
            +box.dataset.ci
          ]
            .subcategories[
              +box.dataset.si
            ];


        s[
          el.dataset.sf
        ] =
          el.type === "checkbox"

            ? el.checked

            : el.value;

      };

    });


  editor
    .querySelectorAll(
      "[data-move]"
    )
    .forEach(btn => {

      btn.onclick = () => {

        const row =
          btn.closest(
            "[data-pi]"
          );

        const ci =
          +row.dataset.ci;

        const pi =
          +row.dataset.pi;

        const si =
          row.dataset.si;

        const products =
          si === ""

            ? adminMenu[ci].products

            : adminMenu[ci]
                .subcategories[+si]
                .products;

        const target =
          btn.dataset.move === "up"

            ? pi - 1

            : pi + 1;

        if(
          target < 0 ||
          target >= products.length
        ) {
          return;
        }

        [
          products[pi],
          products[target]
        ] = [
          products[target],
          products[pi]
        ];

        render();

      };

    });


  editor
    .querySelectorAll(
      "[data-pf]"
    )
    .forEach(el => {

      el.oninput = () => {

        const row =
          el.closest(
            "[data-pi]"
          );


        const ci =
          +row.dataset.ci;


        const pi =
          +row.dataset.pi;


        const si =
          row.dataset.si;


        const p =
          si === ""

            ? adminMenu[
                ci
              ]
                .products[
                  pi
                ]

            : adminMenu[
                ci
              ]
                .subcategories[
                  +si
                ]
                .products[
                  pi
                ];


        p[
          el.dataset.pf
        ] =
          el.type === "checkbox"

            ? el.checked

            : el.value;

      };

    });


  editor
    .querySelectorAll(
      "[data-toggle-category]"
    )
    .forEach(btn => {

      btn.onclick = () => {

        const ci = +btn.dataset.toggleCategory;

        if(openCategories.has(ci)) {
          openCategories.delete(ci);
        } else {
          openCategories.add(ci);
        }

        render();

      };

    });


  editor
    .querySelectorAll(
      "[data-add-product]"
    )
    .forEach(btn => {

      btn.onclick = () => {

        const ci = +btn.dataset.ci;
        const siRaw = btn.dataset.si;

        const newProduct = {
          name: "Yeni Ürün",
          price: "0 TL",
          image: "image/ornek.webp",
          desc: "",
          active: true
        };

        if (siRaw === undefined || siRaw === "") {
          if (!Array.isArray(adminMenu[ci].products)) adminMenu[ci].products = [];
          adminMenu[ci].products.push(newProduct);
        } else {
          const si = +siRaw;
          if (!Array.isArray(adminMenu[ci].subcategories[si].products)) adminMenu[ci].subcategories[si].products = [];
          adminMenu[ci].subcategories[si].products.push(newProduct);
        }

        render();
        panelMsg.textContent = "Yeni ürün eklendi. Bilgilerini doldurup kaydetmeyi unutma.";
      };

    });


  editor
    .querySelectorAll(
      "[data-remove-product]"
    )
    .forEach(btn => {

      btn.onclick = () => {

        const row = btn.closest("[data-pi]");
        const ci = +row.dataset.ci;
        const pi = +row.dataset.pi;
        const si = row.dataset.si;

        const products = si === ""
          ? adminMenu[ci].products
          : adminMenu[ci].subcategories[+si].products;

        products.splice(pi, 1);

        render();
        panelMsg.textContent = "Ürün listeden kaldırıldı. Firebase'e göndermek için kaydet.";
      };

    });

}


document
  .getElementById(
    "loginForm"
  )
  .onsubmit =
  async e => {

    e.preventDefault();


    document
      .getElementById(
        "loginMsg"
      )
      .textContent =
      "Giriş yapılıyor...";


    try {

      await roofAuth
        .signInWithEmailAndPassword(

          document
            .getElementById(
              "email"
            )
            .value
            .trim(),

          document
            .getElementById(
              "password"
            )
            .value

        );


      document
        .getElementById(
          "loginMsg"
        )
        .textContent = "";

    }

    catch(err) {

      document
        .getElementById(
          "loginMsg"
        )
        .textContent =
        "Giriş başarısız: " +
        err.message;

    }

  };


document
  .getElementById(
    "logoutBtn"
  )
  .onclick =
  () =>
    roofAuth.signOut();


document
  .getElementById(
    "saveBtn"
  )
  .onclick =
  async () => {

    panelMsg.textContent =
      "Kaydediliyor...";


    try {

      await roofDb
        .ref(
          "menu"
        )
        .set(
          adminMenu
        );


      panelMsg.textContent =
        "✓ Menü Firebase’e kaydedildi. Yayındaki site artık bu veriyi kullanır; yeniden deploy edilse de veriler kalır.";

    }

    catch(e) {

      panelMsg.textContent =
        "Kayıt hatası: " +
        e.message;

    }

  };


roofAuth
  .onAuthStateChanged(

    async user => {

      if(!user) {

        loginView
          .classList
          .remove(
            "hidden"
          );


        panelView
          .classList
          .add(
            "hidden"
          );


        return;

      }


      loginView
        .classList
        .add(
          "hidden"
        );


      panelView
        .classList
        .remove(
          "hidden"
        );


      document
        .getElementById(
          "statusText"
        )
        .textContent =
        "Bağlı: " +
        user.email;


      try {

        const snap =
          await roofDb
            .ref(
              "menu"
            )
            .once(
              "value"
            );


        if(
          snap.exists() &&
          Array.isArray(
            snap.val()
          )
        ) {

          const remoteMenu =
            snap.val();

          // Existing Firebase menu is authoritative. Never overwrite it on a deploy.
          adminMenu = remoteMenu;
          panelMsg.textContent = "✓ Firebase menüsü yüklendi. Mevcut ürünleriniz korundu.";

        }

        else {

          adminMenu =
            defaults();

        }


        render();

      }

      catch(e) {

        adminMenu = [];
        render();
        panelMsg.textContent = "Firebase veritabanı okunamadı. Veri kaybını önlemek için kayıt yapmayın: " + e.message;

      }

    }

  );
}

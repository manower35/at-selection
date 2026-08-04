/* ==========================================================================
   AT SELECTION — Main Interactivity Script
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initFaqAccordion();
  initLightbox();
  loadProductsCatalog();
});

/* --------------------------------------------------------------------------
   1. MOBILE DRAWER NAVIGATION
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const hamburgerBtn = document.querySelector(".hamburger-button");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("active");
    });

    const mobileLinks = mobileMenu.querySelectorAll("a");
    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("active");
      });
    });
  }
}

/* --------------------------------------------------------------------------
   2. FAQ ACCORDION WITH MUTUAL EXCLUSION
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqContainer = document.querySelector(".faq-content");
  if (!faqContainer) return;

  faqContainer.addEventListener("click", (e) => {
    const groupHeader = e.target.closest(".faq-group-header");
    if (!groupHeader) return;

    const group = groupHeader.parentElement;
    const groupBody = group.querySelector(".faq-group-body");
    const icon = groupHeader.querySelector("i");

    // Close other open groups
    const otherGroups = faqContainer.querySelectorAll(".faq-group");
    otherGroups.forEach((otherGroup) => {
      if (otherGroup !== group) {
        const otherBody = otherGroup.querySelector(".faq-group-body");
        const otherIcon = otherGroup.querySelector(".faq-group-header i");
        if (otherBody) otherBody.classList.remove("open");
        if (otherIcon) {
          otherIcon.classList.remove("fa-minus");
          otherIcon.classList.add("fa-plus");
        }
      }
    });

    // Toggle current group
    if (groupBody) {
      groupBody.classList.toggle("open");
      if (icon) {
        icon.classList.toggle("fa-plus");
        icon.classList.toggle("fa-minus");
      }
    }
  });
}

/* --------------------------------------------------------------------------
   3. PRODUCTS CATALOG LOADER & CATEGORY FILTERING
   -------------------------------------------------------------------------- */
let allProducts = [];

async function loadProductsCatalog() {
  const gridContainer = document.getElementById("product-grid");
  if (!gridContainer) return;

  try {
    const response = await fetch("data/products.json");
    if (!response.ok) throw new Error("Failed to load catalog data");
    allProducts = await response.json();
    renderProducts(allProducts);
    setupFilterPills();
    setupSearchInput();
  } catch (error) {
    console.error("Error loading products:", error);
    gridContainer.innerHTML = `<p class="text-muted text-center py-10">Unable to load catalog. Please check server connection.</p>`;
  }
}

function renderProducts(products) {
  const gridContainer = document.getElementById("product-grid");
  if (!gridContainer) return;

  if (products.length === 0) {
    gridContainer.innerHTML = `<p class="text-muted text-center py-10">No matching garment designs found.</p>`;
    return;
  }

  gridContainer.innerHTML = products
    .map(
      (p) => `
    <div class="product-card" data-category="${p.category}">
      <div class="product-img-wrapper" onclick="handleOpenLightbox(${p.id})">
        <span class="product-category-tag">${p.category}</span>
        <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy" />
      </div>
      <div class="product-body">
        <div>
          <div class="product-header">
            <span class="badge-dno">${p.design_no}</span>
            <span class="text-gold font-bold text-SM">${p.price_label}</span>
          </div>
          <h3 class="product-title">${p.name}</h3>
          <p class="product-spec"><i class="fa-solid fa-layer-group text-gold"></i> <strong>Set Ratio:</strong> ${p.size_ratio}</p>
          <p class="product-spec"><i class="fa-solid fa-shirt text-gold"></i> <strong>Fabric:</strong> ${p.fabric_type}</p>
        </div>
        <div class="product-footer">
          <div class="qty-control">
            <label class="text-SM text-muted">Sets Req:</label>
            <input type="number" min="1" value="1" id="qty-${p.id}" class="qty-input" />
          </div>
          <button onclick="handleAddProductToCart(${p.id})" class="btn btn-gold btn-block text-SM">
            <i class="fa-solid fa-cart-plus"></i> Add to Quote Cart
          </button>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

function setupFilterPills() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const selectedCategory = btn.getAttribute("data-filter");
      if (selectedCategory === "all") {
        renderProducts(allProducts);
      } else {
        const filtered = allProducts.filter((p) => p.category === selectedCategory);
        renderProducts(filtered);
      }
    });
  });
}

function setupSearchInput() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = allProducts.filter(
      (p) =>
        p.design_no.toLowerCase().includes(query) ||
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.fabric_type.toLowerCase().includes(query)
    );
    renderProducts(filtered);
  });
}

// Global handler so inline onclick calls work cleanly
window.handleAddProductToCart = function (productId) {
  const product = allProducts.find((p) => p.id === productId);
  const qtyInput = document.getElementById(`qty-${productId}`);
  const setsCount = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

  if (product && window.QuotationCart) {
    window.QuotationCart.addItem({
      id: product.id,
      design_no: product.design_no,
      name: product.name,
      size_ratio: product.size_ratio,
      fabric_type: product.fabric_type,
      image: product.image,
      sets_count: setsCount,
    });
  }
};

/* --------------------------------------------------------------------------
   5. LIGHTBOX MODAL EVENT HANDLERS
   -------------------------------------------------------------------------- */
function initLightbox() {
  const modal = document.getElementById("lightbox-modal");
  const closeBtn = document.getElementById("lightbox-close-btn");

  if (!modal) return;

  if (closeBtn) {
    closeBtn.addEventListener("click", closeLightbox);
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeLightbox();
    }
  });
}

window.handleOpenLightbox = function (productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  const modal = document.getElementById("lightbox-modal");
  const modalImg = document.getElementById("lightbox-img");
  const caption = document.getElementById("lightbox-caption");

  if (modal && modalImg && caption) {
    modalImg.src = product.image;
    caption.innerHTML = `<strong class="text-gold" style="font-size: 16px;">${product.design_no}</strong> — ${product.name} (${product.category})`;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
  }
};

function closeLightbox() {
  const modal = document.getElementById("lightbox-modal");
  if (modal) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }
}

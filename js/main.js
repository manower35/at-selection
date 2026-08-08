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
    const response = await fetch(`data/products.json?v=${Date.now()}`, { cache: "no-store" });
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
    gridContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: rgba(255,255,255,0.02); border: 1px dashed rgba(212,175,55,0.3); border-radius: 12px;">
        <i class="fa-solid fa-box-open text-gold" style="font-size: 44px; margin-bottom: 15px;"></i>
        <h3 class="text-gold font-serif text-MD">AT SELECTION Catalog Ready</h3>
        <p class="text-SM text-muted" style="margin-top: 6px;">All sample items permanently removed. Ready to display your fresh stock photos!</p>
      </div>
    `;
    return;
  }

  // Group products by category
  const categoryOrder = [
    "Crop Top & Choli",
    "Frock & Dresses",
    "Plazo & Sharara",
    "Western Wear",
    "Independence Special"
  ];

  const grouped = {};
  products.forEach((p) => {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  });

  // Build HTML with section headers per category
  let html = "";
  const categories = categoryOrder.filter((c) => grouped[c]);
  // Add any remaining categories not in the predefined order
  Object.keys(grouped).forEach((c) => {
    if (!categories.includes(c)) categories.push(c);
  });

  categories.forEach((cat) => {
    const items = grouped[cat];
    if (!items || items.length === 0) return;

    // Category Section Header (full-width)
    html += `
    <div class="category-section-header" style="grid-column: 1 / -1; padding: 20px 0 12px 0; margin-top: 10px; border-bottom: 2px solid rgba(212,175,55,0.4);">
      <h3 style="font-family: 'Playfair Display', serif; font-size: 22px; color: #D4AF37; display: flex; align-items: center; gap: 10px; margin: 0;">
        <i class="fa-solid fa-folder-open" style="font-size: 20px; opacity: 0.8;"></i>
        ${cat}
        <span style="font-size: 13px; font-weight: 400; color: rgba(255,255,255,0.5); font-family: 'Inter', sans-serif;">(${items.length} Designs)</span>
      </h3>
    </div>`;

    // Product cards for this category
    items.forEach((p) => {
      html += `
    <div class="product-card" data-category="${p.category}">
      <div class="product-img-wrapper" onclick="handleOpenLightbox(${p.id})">
        <span class="product-category-tag">${p.category}</span>
        <span class="zoom-hint-badge"><i class="fa-solid fa-magnifying-glass-plus"></i> Hover to Zoom</span>
        <img src="${p.image}?v=20260808" alt="${p.name}" class="product-img" loading="lazy" onerror="this.onerror=null; this.src='images/ats_logo.jpg';" />
      </div>
      <div class="product-body" style="text-align: center; padding: 14px 12px;">
        <div style="margin-bottom: 8px;">
          <span class="badge-dno" style="font-size: 14px; padding: 4px 12px;">Code-${p.design_no}</span>
        </div>
        <p class="text-muted text-SM" style="margin-bottom: 4px; font-weight: 500;">Category: ${p.category}</p>
        <p class="text-gold font-bold text-SM" style="margin-bottom: 10px;">Size: ${p.size_ratio}</p>
        <div class="product-footer" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.08);">
          <div class="qty-control" style="justify-content: center; margin-bottom: 10px;">
            <label class="text-SM text-muted">Sets Req:</label>
            <input type="number" min="1" value="1" id="qty-${p.id}" class="qty-input" />
          </div>
          <button onclick="handleAddProductToCart(${p.id})" class="btn btn-gold btn-block text-SM">
            <i class="fa-solid fa-cart-plus"></i> + Add to Quote Cart
          </button>
        </div>
      </div>
    </div>`;
    });
  });

  gridContainer.innerHTML = html;
}

/* --------------------------------------------------------------------------
   INTERACTIVE HOVER MAGNIFIER ZOOM EVENT LISTENERS
   -------------------------------------------------------------------------- */
document.addEventListener("mousemove", (e) => {
  const wrapper = e.target.closest(".product-img-wrapper");
  if (!wrapper) return;
  const img = wrapper.querySelector(".product-img");
  if (!img) return;

  const rect = wrapper.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;

  img.style.transformOrigin = `${x}% ${y}%`;
});

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
    modalImg.onerror = function() {
      this.onerror = null;
      this.src = 'images/ats_logo.jpg';
    };
    modalImg.src = product.image + '?v=20260808';
    caption.innerHTML = `
      <div style="text-align: center;">
        <strong class="text-gold" style="font-size: 16px;">${product.design_no}</strong> — ${product.name} (${product.category})
        <div style="margin-top: 10px;">
          <a href="https://wa.me/918019924400?text=Hi%20Syed%20Ahmer,%20I%20want%20to%20see%20${encodeURIComponent(product.design_no)}%20(${encodeURIComponent(product.name)})%20on%20a%20Live%20WhatsApp%20Video%20Call." target="_blank" class="btn btn-whatsapp text-SM" style="display: inline-flex; padding: 6px 14px;">
            <i class="fa-solid fa-video"></i> View ${product.design_no} on Live Video Call
          </a>
        </div>
      </div>
    `;
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



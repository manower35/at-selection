
/* ==========================================================================
   AT SELECTION — Main Interactivity Script
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initFaqAccordion();
  initLightbox();
  initHeroSlider();
  loadProductsCatalog();
  initReviewsCarousel();
  initFloatingSocialBar();
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
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: rgba(212,175,55,0.04); border: 1px dashed rgba(212,175,55,0.35); border-radius: 14px;">
        <i class="fa-solid fa-magnifying-glass-chart text-gold" style="font-size: 46px; margin-bottom: 16px; opacity: 0.9;"></i>
        <h3 class="text-gold font-serif text-LG" style="margin-bottom: 6px;">No Matching Designs Found</h3>
        <p class="text-SM text-muted" style="margin: 8px auto 20px auto; max-width: 500px; line-height: 1.5;">
          Try searching by <strong>Design Code</strong> (e.g. <em>SN12147295, MC30362402, SIN07, 12480</em>), <strong>Category</strong> (<em>Frocks, Western, Crop Top, Plazo</em>), or <strong>Size</strong> (<em>24x34, 22x32</em>).
        </p>
        <button onclick="window.atsResetSearch()" class="btn btn-gold" style="padding: 10px 24px; font-weight: 700; border-radius: 8px;">
          <i class="fa-solid fa-arrows-rotate"></i> View All 109 Designs
        </button>
      </div>
    `;
    return;
  }

  // Group products by category
  const categoryOrder = [
    "2Pc Set",
    "Crop Top & Choli",
    "Frock & Dresses",
    "Pattu & Ethnic",
    "Plazo & Sharara",
    "Western Wear",
    "Festive Special"
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
      <div class="product-img-wrapper" onclick="handleOpenLightbox('${p.id}')">
        <span class="product-category-tag">${p.category}</span>
        <img src="${p.image}?v=20260818_clean" alt="${p.name}" class="product-img" loading="lazy" onerror="this.onerror=null; this.src='images/ats_logo.jpg';" />
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
          <div style="margin-top: 6px; display: flex; gap: 6px;">
            <button onclick="handleAddProductToCart('${p.id}')" class="btn btn-gold text-SM" style="flex: 1; padding: 9px 8px; font-weight: 700;">
              <i class="fa-solid fa-cart-plus"></i> + Quote
            </button>
            <button onclick="handleDownloadImage('${p.image}', 'AT_SELECTION_Code_${p.design_no}.jpg')" class="btn text-SM" style="background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.4); color: #D4AF37; padding: 9px 10px; font-weight: 600;" title="Download HD Photo">
              <i class="fa-solid fa-download"></i> HD
            </button>
          </div>
        </div>
      </div>
    </div>`;
    });
  });

  gridContainer.innerHTML = html;
}

function setupFilterPills() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const searchInputs = document.querySelectorAll(".search-sync-input, #search-input");
  const clearButtons = document.querySelectorAll(".nav-search-clear-btn, .mobile-search-clear-btn, #catalog-search-clear-btn");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Clear search inputs when explicitly clicking category tab
      searchInputs.forEach((input) => (input.value = ""));
      clearButtons.forEach((b) => (b.style.display = "none"));

      const selectedCategory = btn.getAttribute("data-filter");
      if (selectedCategory === "all") {
        renderProducts(allProducts);
      } else if (selectedCategory === "Festive Special") {
        const filtered = allProducts.filter(
          (p) =>
            p.category === "Festive Special" ||
            (p.name && p.name.toLowerCase().includes("festive")) ||
            (p.description && p.description.toLowerCase().includes("festive")) ||
            (p.fabric_type && p.fabric_type.toLowerCase().includes("zari"))
        );
        renderProducts(filtered);
      } else {
        const filtered = allProducts.filter((p) => p.category === selectedCategory);
        renderProducts(filtered);
      }
    });
  });
}

// Intelligent Normalized Text Helper
function normalizeAtsSearchStr(str) {
  if (!str) return "";
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function setupSearchInput() {
  const searchInputs = document.querySelectorAll(".search-sync-input, #search-input");
  const clearButtons = document.querySelectorAll(".nav-search-clear-btn, .mobile-search-clear-btn, #catalog-search-clear-btn");
  const filterBtns = document.querySelectorAll(".filter-btn");

  if (!searchInputs.length) return;

  function performFilter(rawQuery, sourceElement) {
    const query = rawQuery.toLowerCase().trim();
    const cleanQ = normalizeAtsSearchStr(query);

    // Sync query across all search inputs
    searchInputs.forEach((input) => {
      if (input !== sourceElement) {
        input.value = rawQuery;
      }
    });

    // Toggle clear buttons
    clearButtons.forEach((btn) => {
      btn.style.display = query.length > 0 ? "flex" : "none";
    });

    // If query is empty, show all products
    if (!query) {
      renderProducts(allProducts);
      return;
    }

    // Reset filter pills to "All" when actively searching
    filterBtns.forEach((b) => {
      if (b.getAttribute("data-filter") === "all") {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });

    // Extract search tokens (split by spaces, dashes, commas, asterisks)
    const tokens = query.split(/[\s,\-_*]+/).filter((t) => t.length > 0);

    // Intelligent Multi-Keyword & Normalized Search
    const filtered = allProducts.filter((p) => {
      const dno = (p.design_no || "").toLowerCase();
      const cleanDno = normalizeAtsSearchStr(dno);
      const name = (p.name || "").toLowerCase();
      const cat = (p.category || "").toLowerCase();
      const cleanCat = normalizeAtsSearchStr(cat);
      const fabric = (p.fabric_type || "").toLowerCase();
      const size = (p.size_ratio || "").toLowerCase();
      const cleanSize = normalizeAtsSearchStr(size);
      const colors = (Array.isArray(p.colors) ? p.colors.join(" ") : "").toLowerCase();
      const desc = (p.description || "").toLowerCase();

      // Build rich searchable text block
      let fullText = `${dno} ${cleanDno} ${name} ${cat} ${cleanCat} ${fabric} ${size} ${cleanSize} ${colors} ${desc}`;

      // Category Synonyms & Aliases expansion
      if (query.includes("frock") || query.includes("dress") || query.includes("gown")) {
        if (cat.includes("frock")) fullText += " frocks dresses gowns party bombay";
      }
      if (query.includes("crop") || query.includes("choli") || cleanQ.includes("croptop") || query.includes("lehenga")) {
        if (cat.includes("crop")) fullText += " crop top choli croptop lehenga skirt";
      }
      if (query.includes("western") || query.includes("pant") || query.includes("suit") || query.includes("blazer") || query.includes("cargo") || query.includes("denim") || query.includes("coord")) {
        if (cat.includes("western") || cat.includes("2pc")) fullText += " western wear 2pc suit coat co-ord cargo denim";
      }
      if (query.includes("plazo") || query.includes("sharara") || query.includes("palazzo") || query.includes("gharara")) {
        if (cat.includes("plazo")) fullText += " plazo sharara palazzo kurti gharara";
      }
      if (query.includes("pattu") || query.includes("ethnic") || query.includes("langa") || query.includes("traditional")) {
        if (cat.includes("pattu")) fullText += " pattu ethnic traditional langa pavada silk";
      }
      if (query.includes("2pc") || query.includes("2 piece") || query.includes("two piece") || query.includes("set")) {
        if (cat.includes("2pc")) fullText += " 2pc 2 piece set pair top pant";
      }

      // 1. Direct design code match (exact or normalized substring)
      if (cleanQ && (cleanDno.includes(cleanQ) || cleanQ.includes(cleanDno))) {
        return true;
      }

      // 2. All tokens must match somewhere in the enriched text
      return tokens.every((t) => {
        const cleanT = normalizeAtsSearchStr(t);
        return fullText.includes(t) || (cleanT && fullText.includes(cleanT));
      });
    });

    renderProducts(filtered);

    // If typing from top or mobile navbar, smooth scroll down to catalog lookbook
    if (query.length >= 2 && sourceElement && (sourceElement.classList.contains("nav-search-input") || sourceElement.classList.contains("mobile-search-input"))) {
      const catalogSec = document.getElementById("catalog");
      if (catalogSec) {
        const rect = catalogSec.getBoundingClientRect();
        if (rect.top > 300 || rect.top < -300) {
          catalogSec.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  }

  // Attach input event listeners
  searchInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      performFilter(e.target.value, e.target);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const catalogSec = document.getElementById("catalog");
        if (catalogSec) {
          catalogSec.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });

  // Attach clear button event listeners
  clearButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      searchInputs.forEach((input) => {
        input.value = "";
      });
      clearButtons.forEach((b) => (b.style.display = "none"));
      renderProducts(allProducts);
    });
  });

  // Global reset helper
  window.atsResetSearch = function () {
    searchInputs.forEach((input) => (input.value = ""));
    clearButtons.forEach((b) => (b.style.display = "none"));
    filterBtns.forEach((b) => {
      if (b.getAttribute("data-filter") === "all") b.classList.add("active");
      else b.classList.remove("active");
    });
    renderProducts(allProducts);
  };
}

// Global handler so inline onclick calls work cleanly
window.handleAddProductToCart = function (productId) {
  const product = allProducts.find((p) => String(p.id) === String(productId));
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

window.handleDirectWhatsAppInquiry = function (productId) {
  const product = allProducts.find((p) => String(p.id) === String(productId));
  if (!product) return;

  const qtyInput = document.getElementById(`qty-${productId}`);
  const setsCount = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
  const origin = (window.location.origin && !window.location.origin.startsWith("file")) 
    ? window.location.origin 
    : "https://at-selection.vercel.app";
  const fullImgUrl = product.image.startsWith("http") ? product.image : `${origin}/${product.image}`;

  let msg = `*NEW B2B WHOLESALE INQUIRY - AT SELECTION*\n`;
  msg += `------------------------------------\n`;
  msg += `*Design Code:* Code-${product.design_no}\n`;
  msg += `*Item:* ${product.name}\n`;
  msg += `*Category:* ${product.category}\n`;
  msg += `*Size Ratio:* ${product.size_ratio}\n`;
  msg += `*Quantity Required:* *${setsCount} Set(s)*\n`;
  msg += `*Photo Preview:* ${fullImgUrl}\n\n`;
  msg += `Please confirm stock availability, available color sets, and wholesale price.`;

  const primaryLine = "919701515477"; // Syed Ahmer
  const encoded = encodeURIComponent(msg);
  const apiWaUrl = `https://api.whatsapp.com/send?phone=${primaryLine}&text=${encoded}`;
  const directWaUrl = `https://wa.me/${primaryLine}?text=${encoded}`;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    window.location.href = apiWaUrl;
  } else {
    const newWin = window.open(directWaUrl, "_blank", "noopener,noreferrer");
    if (!newWin || newWin.closed || typeof newWin.closed === "undefined") {
      window.location.href = directWaUrl;
    }
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
  const product = allProducts.find((p) => String(p.id) === String(productId));
  if (!product) return;

  const modal = document.getElementById("lightbox-modal");
  const modalImg = document.getElementById("lightbox-img");
  const caption = document.getElementById("lightbox-caption");

  if (modal && modalImg && caption) {
    modalImg.onerror = function() {
      this.onerror = null;
      this.src = 'images/ats_logo.jpg';
    };
    modalImg.src = product.image + '?v=20260818_clean';
    caption.innerHTML = `
      <div style="text-align: center;">
        <strong class="text-gold" style="font-size: 16px;">Code-${product.design_no}</strong> — ${product.name} (${product.category})
        <div style="margin-top: 10px; display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
          <a href="https://wa.me/919701515477?text=Hi%20Syed%20Ahmer,%20I%20want%20to%20see%20${encodeURIComponent(product.design_no)}%20(${encodeURIComponent(product.name)})%20on%20a%20Live%20WhatsApp%20Video%20Call." target="_blank" class="btn btn-whatsapp text-SM" style="display: inline-flex; padding: 7px 14px;">
            <i class="fa-solid fa-video"></i> Live Video Call
          </a>
          <button onclick="handleDownloadImage('${product.image}', 'AT_SELECTION_Code_${product.design_no}.jpg')" class="btn text-SM" style="background: #D4AF37; color: #000; font-weight: 700; padding: 7px 14px; display: inline-flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-download"></i> Download HD Photo
          </button>
        </div>
      </div>
    `;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
  }
};

window.handleDownloadImage = function (imagePath, filename) {
  if (!imagePath) return;
  const link = document.createElement("a");
  link.href = imagePath;
  link.download = filename || "AT_SELECTION_Product_Photo.jpg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function closeLightbox() {
  const modal = document.getElementById("lightbox-modal");
  if (modal) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }
}

/* --------------------------------------------------------------------------
   6. 5-SECOND AUTO-ROTATING HERO COLLECTION CAROUSEL
   -------------------------------------------------------------------------- */
function initHeroSlider() {
  const sliderContainer = document.getElementById("hero-slider");
  if (!sliderContainer) return;

  const slides = sliderContainer.querySelectorAll(".hero-slide");
  const dots = sliderContainer.querySelectorAll(".slider-dot");
  const prevBtn = document.getElementById("slider-prev-btn");
  const nextBtn = document.getElementById("slider-next-btn");
  const progressFill = document.getElementById("slider-progress-fill");

  if (!slides || slides.length === 0) return;

  let currentSlide = 0;
  const totalSlides = slides.length;

  if (totalSlides <= 1) {
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
    if (progressFill && progressFill.parentElement) progressFill.parentElement.style.display = "none";
    return;
  }
  const INTERVAL_MS = 3000; // Fast 3-second auto-rolling interval
  let slideTimer = null;
  let progressAnimation = null;
  let progressStart = 0;

  function showSlide(index) {
    // Wrap around index
    currentSlide = (index + totalSlides) % totalSlides;

    // Update slides
    slides.forEach((slide, i) => {
      if (i === currentSlide) {
        slide.classList.add("active");
      } else {
        slide.classList.remove("active");
      }
    });

    // Update dot indicators
    dots.forEach((dot, i) => {
      if (i === currentSlide) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });

    // Restart progress bar animation
    resetProgress();
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  function resetProgress() {
    if (progressFill) {
      progressFill.style.transition = "none";
      progressFill.style.width = "0%";
      void progressFill.offsetWidth; // Force reflow
      progressFill.style.transition = `width ${INTERVAL_MS}ms linear`;
      progressFill.style.width = "100%";
    }
  }

  function startAutoPlay() {
    stopAutoPlay();
    resetProgress();
    slideTimer = setInterval(nextSlide, INTERVAL_MS);
  }

  function stopAutoPlay() {
    if (slideTimer) {
      clearInterval(slideTimer);
      slideTimer = null;
    }
    if (progressFill) {
      progressFill.style.transition = "none";
      progressFill.style.width = "0%";
    }
  }

  // Button Click Handlers
  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      nextSlide();
      startAutoPlay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      prevSlide();
      startAutoPlay();
    });
  }

  // Dot Indicator Handlers
  dots.forEach((dot) => {
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      const targetIndex = parseInt(dot.getAttribute("data-slide")) || 0;
      showSlide(targetIndex);
      startAutoPlay();
    });
  });

  // Pause on Mouse Hover / Resume on Leave
  sliderContainer.addEventListener("mouseenter", stopAutoPlay);
  sliderContainer.addEventListener("mouseleave", startAutoPlay);

  // Mobile Touch Swipe Support
  let touchStartX = 0;
  let touchEndX = 0;

  sliderContainer.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoPlay();
  }, { passive: true });

  sliderContainer.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diffX = touchStartX - touchEndX;
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        nextSlide(); // Swiped left -> next
      } else {
        prevSlide(); // Swiped right -> prev
      }
    }
    startAutoPlay();
  }, { passive: true });

  // Initial Startup
  showSlide(0);
  startAutoPlay();
}

/* --------------------------------------------------------------------------
   7. REVIEWS CAROUSEL INFINITE SCROLL
   -------------------------------------------------------------------------- */
function initReviewsCarousel() {
  const track = document.getElementById("reviews-track");
  if (!track) return;
  
  // Clone children for infinite scroll
  const children = Array.from(track.children);
  children.forEach(child => {
    const clone = child.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
}

/* --------------------------------------------------------------------------
   8. FLOATING SOCIAL BAR ANIMATION
   -------------------------------------------------------------------------- */
function initFloatingSocialBar() {
  const socialBar = document.getElementById("floating-social-bar");
  if (!socialBar) return;
  
  setTimeout(() => {
    socialBar.classList.add("show");
  }, 2000);
}

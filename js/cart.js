/* ==========================================================================
   AT SELECTION — Wholesale Quotation Cart & WhatsApp Generator
   ========================================================================== */

const LOCAL_STORAGE_KEY = "ats_wholesale_quotation_cart";

class WholesaleCart {
  constructor() {
    this.items = [];
    this.init();
  }

  init() {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        this.items = JSON.parse(saved);
      } catch (e) {
        this.items = [];
      }
    }
    this.updateCartBadge();
  }

  save() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.items));
    this.updateCartBadge();
    this.renderCartItems();
  }

  addItem(newItem) {
    const existingIndex = this.items.findIndex((i) => String(i.id) === String(newItem.id));
    if (existingIndex > -1) {
      this.items[existingIndex].sets_count += newItem.sets_count;
    } else {
      this.items.push(newItem);
    }
    this.save();
    this.openCartDrawer();
    this.showToast(`Added ${newItem.design_no} (${newItem.sets_count} Set) to Quote Cart!`);
  }

  removeItem(id) {
    this.items = this.items.filter((item) => String(item.id) !== String(id));
    this.save();
  }

  updateSetsCount(id, newCount) {
    if (newCount <= 0) {
      this.removeItem(id);
      return;
    }
    const item = this.items.find((i) => String(i.id) === String(id));
    if (item) {
      item.sets_count = newCount;
      this.save();
    }
  }

  clearCart() {
    this.items = [];
    this.save();
  }

  getTotalSets() {
    return this.items.reduce((sum, i) => sum + (i.sets_count || 1), 0);
  }

  updateCartBadge() {
    const totalSets = this.getTotalSets();
    const badges = document.querySelectorAll(".cart-count-badge");
    badges.forEach((badge) => {
      badge.textContent = totalSets;
    });

    const headerSub = document.getElementById("cart-header-subtitle");
    if (headerSub) {
      headerSub.textContent = `${totalSets} Design Set${totalSets === 1 ? '' : 's'} Selected`;
    }

    const mobileBar = document.getElementById("mobile-floating-cart-bar");
    const mobileCount = document.getElementById("mobile-floating-count");
    if (mobileBar) {
      if (totalSets > 0) {
        mobileBar.style.display = "block";
        if (mobileCount) mobileCount.textContent = `${totalSets} Set${totalSets === 1 ? '' : 's'}`;
      } else {
        mobileBar.style.display = "none";
      }
    }

    const btnLabels = document.querySelectorAll(".cart-whatsapp-btn-label, #cart-whatsapp-btn-label");
    btnLabels.forEach((btnLabel) => {
      btnLabel.textContent = `Send WhatsApp Order (${totalSets} Set${totalSets === 1 ? '' : 's'})`;
    });
  }

  openCartDrawer() {
    const overlay = document.getElementById("cart-drawer-overlay");
    if (overlay) {
      overlay.classList.add("active");
      document.body.classList.add("cart-open");
      const socialBar = document.getElementById("floating-social-bar");
      if (socialBar) {
        socialBar.style.setProperty("display", "none", "important");
      }
      const mobileFloatingCart = document.getElementById("mobile-floating-cart-bar");
      if (mobileFloatingCart) {
        mobileFloatingCart.style.setProperty("display", "none", "important");
      }
      this.renderCartItems();
    }
  }

  closeCartDrawer() {
    const overlay = document.getElementById("cart-drawer-overlay");
    if (overlay) {
      overlay.classList.remove("active");
      document.body.classList.remove("cart-open");
      const socialBar = document.getElementById("floating-social-bar");
      if (socialBar) {
        socialBar.style.removeProperty("display");
      }
      const mobileFloatingCart = document.getElementById("mobile-floating-cart-bar");
      if (mobileFloatingCart && this.getTotalSets() > 0) {
        mobileFloatingCart.style.display = "block";
      }
    }
  }

  renderCartItems() {
    const container = document.getElementById("cart-items-container");
    const emptyMsg = document.getElementById("cart-empty-msg");
    const formSection = document.getElementById("cart-form-section");
    const footerSection = document.getElementById("cart-footer-section");

    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = "";
      if (emptyMsg) emptyMsg.style.display = "block";
      if (formSection) formSection.style.display = "none";
      if (footerSection) footerSection.style.display = "none";
      this.updateCartBadge();
      return;
    }

    if (emptyMsg) emptyMsg.style.display = "none";
    if (formSection) formSection.style.display = "block";
    if (footerSection) footerSection.style.display = "block";

    container.innerHTML = this.items
      .map(
        (item) => `
      <div class="cart-item-row">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.onerror=null; this.src='images/ats_logo.jpg';" />
        <div style="flex: 1; min-width: 0;">
          <p style="font-weight: 700; color: #D4AF37; margin: 0 0 2px 0;">Code-${item.design_no}</p>
          <p style="color: #fff; font-weight: 500; font-size: 11px; line-height: 1.3; margin: 0 0 4px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</p>
          <p style="color: #a1a1aa; font-size: 11px; margin: 0 0 6px 0;">Size: <strong style="color: #e4e4e7;">${item.size_ratio}</strong></p>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button onclick="QuotationCart.updateSetsCount('${item.id}', ${item.sets_count - 1})" style="background: #27272a; color: #fff; border: 1px solid rgba(255,255,255,0.15); width: 26px; height: 26px; border-radius: 4px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;">-</button>
            <span style="font-weight: 700; color: #D4AF37; min-width: 55px; text-align: center;">${item.sets_count} Set(s)</span>
            <button onclick="QuotationCart.updateSetsCount('${item.id}', ${item.sets_count + 1})" style="background: #27272a; color: #fff; border: 1px solid rgba(255,255,255,0.15); width: 26px; height: 26px; border-radius: 4px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;">+</button>
          </div>
        </div>
        <button onclick="QuotationCart.removeItem('${item.id}')" style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; width: 28px; height: 28px; border-radius: 6px; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; align-self: flex-start;">✕</button>
      </div>
    `
      )
      .join("");

    this.updateCartBadge();
  }

  generateWhatsAppMessage() {
    const shopName = document.getElementById("quote-shop-name")?.value.trim() || "";
    const city = document.getElementById("quote-city")?.value.trim() || "";
    const phone = document.getElementById("quote-phone")?.value.trim() || "";

    if (this.items.length === 0) {
      alert("Your quotation cart is empty. Please add designs from the catalog.");
      return null;
    }

    let message = `*NEW B2B WHOLESALE INQUIRY - AT SELECTION*\n`;
    message += `------------------------------------\n`;
    if (shopName) message += `*Shop/Firm:* ${shopName}\n`;
    if (city) message += `*City/Hub:* ${city}\n`;
    if (phone) message += `*Phone:* ${phone}\n`;
    message += `\n*Requested Design Sets (${this.getTotalSets()} Sets Total):*\n\n`;

    const origin = "https://www.atselection.in";

    this.items.forEach((item, index) => {
      const cleanImgPath = item.image.startsWith("/") ? item.image.substring(1) : item.image;
      const fullImgUrl = item.image.startsWith("http") ? item.image : `${origin}/${cleanImgPath}`;
      message += `${index + 1}. *Code: ${item.design_no}* (${item.name})\n`;
      message += `   • Size Ratio: ${item.size_ratio}\n`;
      message += `   • Quantity: *${item.sets_count} Set(s)*\n`;
      message += `   • 📸 *View Photo:* ${fullImgUrl}\n\n`;
    });

    message += `Please confirm stock availability, size colors, and wholesale pricing.`;
    return message;
  }

  sendWhatsAppInquiry() {
    const text = this.generateWhatsAppMessage();
    if (!text) return;

    const primaryLine = "919701515477"; // Syed Ahmer / AT Selection Primary Wholesale Line
    const encoded = encodeURIComponent(text);
    const apiWaUrl = `https://api.whatsapp.com/send?phone=${primaryLine}&text=${encoded}`;
    const directWaUrl = `https://wa.me/${primaryLine}?text=${encoded}`;

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      // On mobile devices, assigning location directly opens the WhatsApp app without popup blockers
      window.location.href = apiWaUrl;
    } else {
      // On desktop, try opening a new tab; fallback to location navigation if blocked
      const newWin = window.open(directWaUrl, "_blank", "noopener,noreferrer");
      if (!newWin || newWin.closed || typeof newWin.closed === "undefined") {
        window.location.href = directWaUrl;
      }
    }
  }

  showToast(message) {
    let toast = document.getElementById("ats-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "ats-toast";
      toast.style.cssText = `
        position: fixed; bottom: 20px; right: 20px;
        background: #D4AF37; color: #000; padding: 12px 20px;
        border-radius: 8px; font-weight: 700; font-size: 13px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5); z-index: 9999;
        transition: opacity 0.3s ease, transform 0.3s ease;
        opacity: 0; transform: translateY(10px);
        pointer-events: none;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
    }, 2500);
  }
}

// Global instance initialization
window.QuotationCart = new WholesaleCart();

document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("open-cart-btn");
  const closeBtn = document.getElementById("close-cart-btn");
  const overlay = document.getElementById("cart-drawer-overlay");

  if (openBtn) openBtn.addEventListener("click", () => window.QuotationCart.openCartDrawer());
  if (closeBtn) closeBtn.addEventListener("click", () => window.QuotationCart.closeCartDrawer());
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) window.QuotationCart.closeCartDrawer();
    });
  }
});

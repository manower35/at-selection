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
    const existingIndex = this.items.findIndex((i) => i.id === newItem.id);
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
    this.items = this.items.filter((item) => item.id !== id);
    this.save();
  }

  updateSetsCount(id, newCount) {
    if (newCount <= 0) {
      this.removeItem(id);
      return;
    }
    const item = this.items.find((i) => i.id === id);
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
    return this.items.reduce((sum, i) => sum + i.sets_count, 0);
  }

  updateCartBadge() {
    const badges = document.querySelectorAll(".cart-count-badge");
    const totalSets = this.getTotalSets();
    badges.forEach((badge) => {
      badge.textContent = totalSets;
    });
  }

  openCartDrawer() {
    const overlay = document.getElementById("cart-drawer-overlay");
    if (overlay) {
      overlay.classList.add("active");
      this.renderCartItems();
    }
  }

  closeCartDrawer() {
    const overlay = document.getElementById("cart-drawer-overlay");
    if (overlay) {
      overlay.classList.remove("active");
    }
  }

  renderCartItems() {
    const container = document.getElementById("cart-items-container");
    const emptyMsg = document.getElementById("cart-empty-msg");
    const formSection = document.getElementById("cart-form-section");

    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = "";
      if (emptyMsg) emptyMsg.style.display = "block";
      if (formSection) formSection.style.display = "none";
      return;
    }

    if (emptyMsg) emptyMsg.style.display = "none";
    if (formSection) formSection.style.display = "block";

    container.innerHTML = this.items
      .map(
        (item) => `
      <div class="cart-item-row">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
        <div style="flex: 1;">
          <p style="font-weight: 700; color: #D4AF37;">${item.design_no}</p>
          <p style="color: #fff; font-weight: 500;">${item.name}</p>
          <p style="color: #a1a1aa; font-size: 11px;">Size Ratio: ${item.size_ratio}</p>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
            <button onclick="QuotationCart.updateSetsCount(${item.id}, ${item.sets_count - 1})" style="background: #27272a; color: #fff; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer;">-</button>
            <span style="font-weight: 700; color: #D4AF37;">${item.sets_count} Set(s)</span>
            <button onclick="QuotationCart.updateSetsCount(${item.id}, ${item.sets_count + 1})" style="background: #27272a; color: #fff; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer;">+</button>
          </div>
        </div>
        <button onclick="QuotationCart.removeItem(${item.id})" style="background: none; border: none; color: #ef4444; font-size: 16px; cursor: pointer;">✕</button>
      </div>
    `
      )
      .join("");
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

    this.items.forEach((item, index) => {
      message += `${index + 1}. *${item.design_no}* (${item.name})\n`;
      message += `   • Size Ratio: ${item.size_ratio}\n`;
      message += `   • Quantity: *${item.sets_count} Set(s)*\n\n`;
    });

    message += `Please confirm stock availability, size colors, and wholesale pricing.`;
    return message;
  }

  sendWhatsAppInquiry() {
    const text = this.generateWhatsAppMessage();
    if (!text) return;

    const primaryLine = "918019924400"; // Syed Ahmer / AT Selection Primary Wholesale Line
    const whatsappUrl = `https://wa.me/${primaryLine}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
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

// Wishlist page functionality

function renderWishlist() {
  const container = qs('#wishlistContent');
  if (!container) return;
  
  if (state.wishlist.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 0;">
        <h3>Your wishlist is empty</h3>
        <p class="muted">Save items you love to your wishlist</p>
        <a href="index.html#products" class="btn primary">Start Shopping</a>
      </div>
    `;
    return;
  }
  
  const wishlistProducts = state.products.filter(p => state.wishlist.includes(p.id));
  
  container.innerHTML = `
    <div class="wishlist-actions" style="margin:20px 0;">
      <p>${wishlistProducts.length} item${wishlistProducts.length !== 1 ? 's' : ''} in your wishlist</p>
      <button class="btn" onclick="clearWishlist()">Clear All</button>
    </div>
    <div class="wishlist-grid">
      ${wishlistProducts.map(product => `
        <div class="wishlist-item card">
          <button class="remove-wishlist" onclick="removeFromWishlist('${product.id}')" title="Remove from wishlist">✕</button>
          <img src="${product.image}" alt="${product.name}" onclick="viewProduct('${product.id}')" style="cursor:pointer;">
          <div class="body">
            <h3 onclick="viewProduct('${product.id}')" style="cursor:pointer;">${product.name}</h3>
            <p class="muted">${product.category}</p>
            <div class="rating">
              <span class="stars">${renderStars(product.rating || 0)}</span>
              <span class="muted">(${product.reviews || 0})</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:12px;">
              <span class="price">${fmt.format(product.price)}</span>
              <button class="btn ${product.stock === 0 ? 'disabled' : ''}" 
                      onclick="addToCartFromWishlist('${product.id}')"
                      ${product.stock === 0 ? 'disabled' : ''}>
                ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
            ${product.stock === 0 ? '<div class="out-of-stock" style="margin-top:8px;padding:4px 8px;background:#f8d7da;color:#721c24;border-radius:4px;font-size:.8rem;">Out of Stock</div>' : ''}
            ${product.stock > 0 && product.stock <= 5 ? '<div class="low-stock" style="margin-top:8px;padding:4px 8px;background:#fff3cd;color:#856404;border-radius:4px;font-size:.8rem;">Only ' + product.stock + ' left!</div>' : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function removeFromWishlist(productId) {
  const index = state.wishlist.indexOf(productId);
  if (index > -1) {
    state.wishlist.splice(index, 1);
    saveWishlist();
    renderWishlist();
  }
}

function clearWishlist() {
  if (confirm('Are you sure you want to clear your entire wishlist?')) {
    state.wishlist = [];
    saveWishlist();
    renderWishlist();
  }
}

function addToCartFromWishlist(productId) {
  addToCart(productId);
  // Optionally remove from wishlist after adding to cart
  // removeFromWishlist(productId);
}

// Initialize wishlist page
document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  renderWishlist();
  renderCart();
});

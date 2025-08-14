const GH_CURRENCY = 'GHS';
const NAIRA_CURRENCY = 'NGN';

const state = {
  products: [],
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
  savedForLater: JSON.parse(localStorage.getItem('savedForLater') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('wishlist') || '[]'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  orders: JSON.parse(localStorage.getItem('orders') || '[]'),
  reviews: JSON.parse(localStorage.getItem('reviews') || '{}'),
  recentlyViewed: JSON.parse(localStorage.getItem('recentlyViewed') || '[]'),
  comparison: JSON.parse(localStorage.getItem('comparison') || '[]'),
  appliedDiscount: JSON.parse(localStorage.getItem('appliedDiscount') || 'null'),
  shippingCost: 0,
  filter: 'all',
  searchQuery: '',
  sortBy: 'name',
  priceRange: [0, 1000],
};

const fmt = new Intl.NumberFormat('en-GH', { style: 'currency', currency: GH_CURRENCY });

function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

async function loadProducts(){
  showLoadingState();
  try {
    const res = await fetch('products.json');
    state.products = await res.json();
    console.log('Products loaded:', state.products.length);
    hideLoadingState();
  } catch (error) {
    console.error('Error loading products:', error);
    hideLoadingState();
    showToast('Failed to load products', 'error');
  }
}

// Loading States
function showLoadingState() {
  const grid = qs('#productGrid');
  if (grid) {
    grid.innerHTML = Array(6).fill(0).map(() => `
      <div class="skeleton-card">
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text" style="width:60%"></div>
      </div>
    `).join('');
  }
}

function hideLoadingState() {
  // Loading state will be replaced by actual content
}

// Toast Notifications
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;cursor:pointer;font-size:1.2rem;">&times;</button>
    </div>
  `;

  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 100);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Image Zoom Functionality
function initImageZoom() {
  qsa('.image-zoom-container').forEach(container => {
    const img = container.querySelector('img');
    let isZoomed = false;

    container.addEventListener('click', (e) => {
      e.preventDefault();
      isZoomed = !isZoomed;
      container.classList.toggle('zoomed', isZoomed);

      if (isZoomed) {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        img.style.transformOrigin = `${x * 100}% ${y * 100}%`;
      } else {
        img.style.transformOrigin = 'center';
      }
    });

    container.addEventListener('mousemove', (e) => {
      if (isZoomed) {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        img.style.transformOrigin = `${x * 100}% ${y * 100}%`;
      }
    });
  });
}

// Infinite Scroll
let isLoadingMore = false;
let currentPage = 1;
const itemsPerPage = 12;

function initInfiniteScroll() {
  window.addEventListener('scroll', () => {
    if (isLoadingMore) return;

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 1000) {
      loadMoreProducts();
    }
  });
}

function loadMoreProducts() {
  if (isLoadingMore) return;

  isLoadingMore = true;
  const loadMoreEl = qs('#loadMore');
  if (loadMoreEl) {
    loadMoreEl.classList.add('loading');
    loadMoreEl.innerHTML = '<div class="spinner"></div> Loading more products...';
  }

  // Simulate API call
  setTimeout(() => {
    // In a real app, this would fetch more products from the server
    currentPage++;
    isLoadingMore = false;

    if (loadMoreEl) {
      loadMoreEl.classList.remove('loading');
      loadMoreEl.innerHTML = 'Load More';
    }

    showToast('More products loaded!', 'success');
  }, 1000);
}

// Enhanced Product Gallery
function openImageGallery(productId, imageIndex = 0) {
  const product = state.products.find(p => p.id === productId);
  if (!product || !product.images) return;

  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
    <div class="modal-content image-gallery-modal">
      <button class="close-modal" onclick="this.closest('.modal').remove()">✕</button>
      <div class="gallery-main">
        <img src="${product.images[imageIndex]}" alt="${product.name}" id="galleryMainImage">
        <button class="gallery-nav gallery-prev" onclick="changeGalleryImage(-1)">‹</button>
        <button class="gallery-nav gallery-next" onclick="changeGalleryImage(1)">›</button>
      </div>
      <div class="gallery-thumbnails">
        ${product.images.map((img, i) => `
          <img src="${img}" alt="${product.name}" class="gallery-thumb ${i === imageIndex ? 'active' : ''}"
               onclick="setGalleryImage(${i})">
        `).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Store current state
  modal.currentImageIndex = imageIndex;
  modal.productImages = product.images;
}

function changeGalleryImage(direction) {
  const modal = qs('.image-gallery-modal').closest('.modal');
  const currentIndex = modal.currentImageIndex;
  const images = modal.productImages;

  let newIndex = currentIndex + direction;
  if (newIndex < 0) newIndex = images.length - 1;
  if (newIndex >= images.length) newIndex = 0;

  setGalleryImage(newIndex);
}

function setGalleryImage(index) {
  const modal = qs('.image-gallery-modal').closest('.modal');
  modal.currentImageIndex = index;

  qs('#galleryMainImage').src = modal.productImages[index];

  qsa('.gallery-thumb').forEach((thumb, i) => {
    thumb.classList.toggle('active', i === index);
  });
}

// Smooth Animations
function animateElement(element, animationClass) {
  element.classList.add(animationClass);
  element.addEventListener('animationend', () => {
    element.classList.remove(animationClass);
  }, { once: true });
}

// Enhanced Add to Cart with Animation
function addToCartWithAnimation(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  addToCart(productId);

  // Show success animation
  showToast(`${product.name} added to cart!`, 'success');

  // Animate cart icon
  const cartBtn = qs('#openCartBtn');
  animateElement(cartBtn, 'bounce-in');
}

// Social Sharing Functions
function shareProduct(platform, productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const url = `${window.location.origin}/product.html?id=${productId}`;
  const title = `Check out this ${product.name} from Akwaaba Threads`;
  const description = `${product.description} - Only ${fmt.format(product.price)}`;

  let shareUrl;

  switch (platform) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`;
      break;
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&hashtags=GhanaianFashion,AfricanWear,KenteStyle`;
      break;
    case 'whatsapp':
      shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
      break;
    case 'pinterest':
      shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(description)}&media=${encodeURIComponent(window.location.origin + product.image)}`;
      break;
  }

  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }
}

function copyProductLink(productId) {
  const url = `${window.location.origin}/product.html?id=${productId}`;

  navigator.clipboard.writeText(url).then(() => {
    showToast('Product link copied to clipboard!', 'success');
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast('Product link copied to clipboard!', 'success');
  });
}

// SEO and Analytics
function trackProductView(productId) {
  // Google Analytics tracking (if implemented)
  if (typeof gtag !== 'undefined') {
    gtag('event', 'view_item', {
      currency: 'GHS',
      value: state.products.find(p => p.id === productId)?.price || 0,
      items: [{
        item_id: productId,
        item_name: state.products.find(p => p.id === productId)?.name || '',
        item_category: state.products.find(p => p.id === productId)?.category || '',
        quantity: 1
      }]
    });
  }

  // Custom analytics
  const analytics = JSON.parse(localStorage.getItem('analytics') || '{}');
  analytics.productViews = analytics.productViews || {};
  analytics.productViews[productId] = (analytics.productViews[productId] || 0) + 1;
  localStorage.setItem('analytics', JSON.stringify(analytics));
}

function trackPurchase(orderData) {
  // Google Analytics tracking
  if (typeof gtag !== 'undefined') {
    gtag('event', 'purchase', {
      transaction_id: orderData.id,
      value: orderData.total,
      currency: 'GHS',
      items: orderData.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category || '',
        quantity: item.qty,
        price: item.price
      }))
    });
  }
}

// Blog functionality (basic)
function loadBlogPosts() {
  const blogPosts = [
    {
      id: 'kente-history',
      title: 'The Rich History of Kente Cloth',
      excerpt: 'Discover the cultural significance and royal heritage of Ghana\'s most iconic textile.',
      image: 'assets/images/blog/kente-history.jpg',
      date: '2024-01-15',
      author: 'Ama Osei'
    },
    {
      id: 'styling-ankara',
      title: 'How to Style Ankara Prints for Modern Life',
      excerpt: 'Tips and tricks for incorporating vibrant Ankara patterns into your everyday wardrobe.',
      image: 'assets/images/blog/styling-ankara.jpg',
      date: '2024-01-10',
      author: 'Kwame Asante'
    },
    {
      id: 'adinkra-symbols',
      title: 'Understanding Adinkra Symbols and Their Meanings',
      excerpt: 'Learn about the wisdom and philosophy behind traditional Adinkra symbols.',
      image: 'assets/images/blog/adinkra-symbols.jpg',
      date: '2024-01-05',
      author: 'Kofi Mensah'
    }
  ];

  return blogPosts;
}

// Newsletter with better validation
function subscribeToNewsletter(email) {
  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email address', 'error');
    return false;
  }

  const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
  if (subscribers.includes(email)) {
    showToast('You are already subscribed to our newsletter', 'info');
    return false;
  }

  subscribers.push(email);
  localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));

  // Track subscription
  if (typeof gtag !== 'undefined') {
    gtag('event', 'newsletter_signup', {
      method: 'website'
    });
  }

  showToast('Thank you for subscribing! Check your email for a welcome message.', 'success');
  return true;
}

// Advanced Search Features
function showSearchSuggestions(query) {
  const suggestions = generateSearchSuggestions(query);
  const container = qs('#searchSuggestions');

  if (!container || suggestions.length === 0) {
    hideSearchSuggestions();
    return;
  }

  container.innerHTML = suggestions.map(suggestion => `
    <div class="search-suggestion" onclick="selectSuggestion('${suggestion.text}', '${suggestion.type}')">
      <span class="suggestion-icon">${suggestion.icon}</span>
      <div class="suggestion-text">
        <div>${suggestion.text}</div>
        <div class="suggestion-category">${suggestion.category}</div>
      </div>
    </div>
  `).join('');

  container.style.display = 'block';
}

function hideSearchSuggestions() {
  const container = qs('#searchSuggestions');
  if (container) {
    container.style.display = 'none';
  }
}

function generateSearchSuggestions(query) {
  const suggestions = [];
  const lowerQuery = query.toLowerCase();

  // Product name suggestions
  state.products.forEach(product => {
    if (product.name.toLowerCase().includes(lowerQuery)) {
      suggestions.push({
        text: product.name,
        type: 'product',
        category: 'Product',
        icon: '🛍️'
      });
    }
  });

  // Category suggestions
  const categories = [...new Set(state.products.map(p => p.category))];
  categories.forEach(category => {
    if (category.toLowerCase().includes(lowerQuery)) {
      suggestions.push({
        text: category,
        type: 'category',
        category: 'Category',
        icon: '📂'
      });
    }
  });

  // Tag suggestions
  const allTags = state.products.flatMap(p => p.tags || []);
  const uniqueTags = [...new Set(allTags)];
  uniqueTags.forEach(tag => {
    if (tag.toLowerCase().includes(lowerQuery)) {
      suggestions.push({
        text: tag,
        type: 'tag',
        category: 'Style',
        icon: '🏷️'
      });
    }
  });

  // Popular searches
  const popularSearches = ['kente', 'ankara', 'traditional', 'modern', 'formal', 'casual'];
  popularSearches.forEach(search => {
    if (search.includes(lowerQuery) && !suggestions.find(s => s.text.toLowerCase() === search)) {
      suggestions.push({
        text: search,
        type: 'popular',
        category: 'Popular',
        icon: '🔥'
      });
    }
  });

  return suggestions.slice(0, 8); // Limit to 8 suggestions
}

function selectSuggestion(text, type) {
  qs('#searchInput').value = text;
  hideSearchSuggestions();

  if (type === 'category') {
    state.filter = text;
    qsa('.chip').forEach(c => c.classList.remove('is-active'));
    const categoryChip = qs(`[data-filter="${text}"]`);
    if (categoryChip) {
      categoryChip.classList.add('is-active');
    }
  }

  updateSearch(text);
}

// AI-Powered Recommendations
function generateAIRecommendations(userId = null) {
  // Simple recommendation algorithm based on:
  // 1. Recently viewed products
  // 2. Cart items
  // 3. Popular products
  // 4. User's purchase history

  const recommendations = new Set();

  // Based on recently viewed
  state.recentlyViewed.forEach(productId => {
    const product = state.products.find(p => p.id === productId);
    if (product) {
      // Find similar products (same category, similar price range)
      const similar = state.products.filter(p =>
        p.id !== productId &&
        p.category === product.category &&
        Math.abs(p.price - product.price) <= 50
      );
      similar.slice(0, 2).forEach(p => recommendations.add(p));
    }
  });

  // Based on cart items
  state.cart.forEach(cartItem => {
    const product = state.products.find(p => p.id === cartItem.id);
    if (product) {
      // Complementary products
      const complementary = state.products.filter(p =>
        p.id !== cartItem.id &&
        (p.category !== product.category || p.tags?.some(tag => product.tags?.includes(tag)))
      );
      complementary.slice(0, 1).forEach(p => recommendations.add(p));
    }
  });

  // Popular products (high rating, many reviews)
  const popular = state.products
    .filter(p => p.rating >= 4.5 && p.reviews >= 10)
    .sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews))
    .slice(0, 3);
  popular.forEach(p => recommendations.add(p));

  // New arrivals
  const newProducts = state.products.filter(p => p.isNew).slice(0, 2);
  newProducts.forEach(p => recommendations.add(p));

  return Array.from(recommendations).slice(0, 6);
}

function renderAIRecommendations() {
  const recommendations = generateAIRecommendations();

  if (recommendations.length === 0) return;

  const container = qs('#productGrid')?.parentElement;
  if (!container) return;

  // Check if recommendations section already exists
  let recommendationsSection = qs('#aiRecommendations');
  if (!recommendationsSection) {
    recommendationsSection = document.createElement('section');
    recommendationsSection.id = 'aiRecommendations';
    recommendationsSection.className = 'ai-recommendations';
    recommendationsSection.innerHTML = `
      <h3><span class="ai-icon">🤖</span> Recommended for You</h3>
      <div class="recommendations-grid" id="recommendationsGrid"></div>
    `;
    container.appendChild(recommendationsSection);
  }

  const grid = qs('#recommendationsGrid');
  grid.innerHTML = recommendations.map(product => `
    <article class="card">
      <div style="position:relative;">
        <img src="${product.image}" alt="${product.name}" onclick="viewProduct('${product.id}')" style="cursor:pointer;">
        ${product.isNew ? '<span class="badge-new" style="position:absolute;top:8px;left:8px;">NEW</span>' : ''}
      </div>
      <div class="body">
        <h4 onclick="viewProduct('${product.id}')" style="cursor:pointer;margin:0 0 4px;">${product.name}</h4>
        <div class="rating">
          <span class="stars">${renderStars(product.rating || 0)}</span>
          <span class="muted">(${product.reviews || 0})</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;">
          <span class="price">${fmt.format(product.price)}</span>
          <button class="btn" onclick="addToCart('${product.id}')">Add to Cart</button>
        </div>
      </div>
    </article>
  `).join('');
}

// Simple Chatbot
function initChatbot() {
  const chatbotHTML = `
    <div class="chatbot">
      <button class="chatbot-toggle" onclick="toggleChatbot()">💬</button>
      <div class="chatbot-window" id="chatbotWindow">
        <div class="chatbot-header">
          <span>Akwaaba Assistant</span>
          <button onclick="toggleChatbot()" style="background:none;border:none;color:#fff;cursor:pointer;">✕</button>
        </div>
        <div class="chatbot-messages" id="chatbotMessages">
          <div class="chatbot-message bot">
            Hello! I'm here to help you find the perfect Ghanaian fashion. What are you looking for today?
          </div>
        </div>
        <div class="chatbot-input">
          <input type="text" id="chatbotInput" placeholder="Ask me anything..." onkeypress="if(event.key==='Enter') sendChatMessage()">
          <button onclick="sendChatMessage()">➤</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', chatbotHTML);
}

function toggleChatbot() {
  const window = qs('#chatbotWindow');
  window.classList.toggle('open');
}

function sendChatMessage() {
  const input = qs('#chatbotInput');
  const message = input.value.trim();
  if (!message) return;

  // Add user message
  addChatMessage(message, 'user');
  input.value = '';

  // Generate bot response
  setTimeout(() => {
    const response = generateChatResponse(message);
    addChatMessage(response, 'bot');
  }, 500);
}

function addChatMessage(message, sender) {
  const container = qs('#chatbotMessages');
  const messageEl = document.createElement('div');
  messageEl.className = `chatbot-message ${sender}`;
  messageEl.textContent = message;
  container.appendChild(messageEl);
  container.scrollTop = container.scrollHeight;
}

function generateChatResponse(message) {
  const lowerMessage = message.toLowerCase();

  // Simple keyword-based responses
  if (lowerMessage.includes('kente')) {
    return "Kente is a traditional Ghanaian cloth! We have beautiful Kente shirts and accessories. Would you like to see our Kente collection?";
  } else if (lowerMessage.includes('ankara')) {
    return "Ankara prints are vibrant and beautiful! Check out our Ankara dresses and headwraps. They're perfect for any occasion.";
  } else if (lowerMessage.includes('size') || lowerMessage.includes('sizing')) {
    return "Our sizes range from XS to XXL. Each product page has detailed size information. Need help with a specific item?";
  } else if (lowerMessage.includes('shipping')) {
    return "We offer free shipping within Accra for orders over GHS 200! Delivery takes 1-2 business days. Check our shipping page for more details.";
  } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
    return "Our prices range from GHS 50 to GHS 500. We often have sales and discount codes available. Would you like to see our current deals?";
  } else if (lowerMessage.includes('traditional')) {
    return "We specialize in traditional Ghanaian fashion! From smocks to Adinkra caps, we have authentic pieces that celebrate our heritage.";
  } else {
    return "I'd be happy to help! You can browse our products by category, search for specific items, or ask me about sizing, shipping, or our cultural pieces.";
  }
}

function renderProducts(){
  const grid = qs('#productGrid');
  if(!grid) {
    console.error('Product grid element not found');
    return;
  }

  console.log('Rendering products:', state.products?.length || 0);

  if (!state.products || state.products.length === 0) {
    grid.innerHTML = '<p>No products available</p>';
    return;
  }

  let items = state.products.filter(p => {
    const matchesFilter = state.filter==='all' || p.category===state.filter;
    const matchesSearch = !state.searchQuery ||
      p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      (p.tags && p.tags.some(tag => tag.toLowerCase().includes(state.searchQuery.toLowerCase())));
    const matchesPrice = p.price >= state.priceRange[0] && p.price <= state.priceRange[1];
    return matchesFilter && matchesSearch && matchesPrice;
  });

  // Sort products
  items.sort((a, b) => {
    switch(state.sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'newest': return b.id.localeCompare(a.id);
      default: return a.name.localeCompare(b.name);
    }
  });

  grid.innerHTML = items.map(p => `
    <article class="card">
      <div style="position:relative;">
        <img src="${p.image}" alt="${p.name}" style="cursor:pointer;" onclick="viewProduct('${p.id}')">

        <!-- Product Badges -->
        <div class="product-badges">
          ${p.isNew ? '<span class="badge-new">NEW</span>' : ''}
          ${p.isOnSale ? '<span class="badge-sale">SALE</span>' : ''}
          ${p.isFeatured ? '<span class="badge-featured">FEATURED</span>' : ''}
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <button class="quick-action-btn" onclick="quickView('${p.id}')" title="Quick View">👁️</button>
          <button class="quick-action-btn ${isInWishlist(p.id) ? 'active' : ''}"
                  data-wishlist="${p.id}" title="Add to Wishlist">
            ${isInWishlist(p.id) ? '❤️' : '🤍'}
          </button>
          <button class="quick-action-btn" onclick="addToComparison('${p.id}')" title="Compare">⚖️</button>
        </div>

        ${p.stock === 0 ? '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.8);color:#fff;padding:4px 8px;border-radius:4px;font-size:.8rem;">Out of Stock</div>' : ''}
        ${p.stock > 0 && p.stock <= 5 ? '<div style="position:absolute;bottom:8px;left:8px;background:#ff6b35;color:#fff;padding:2px 6px;border-radius:4px;font-size:.7rem;">Only ${p.stock} left</div>' : ''}
      </div>
      <div class="body">
        <h3 style="cursor:pointer;" onclick="viewProduct('${p.id}')">${p.name}</h3>
        <p class="muted">${p.category}</p>
        <div class="rating">
          <span class="stars">${renderStars(p.rating || 0)}</span>
          <span class="muted">(${p.reviews || 0})</span>
        </div>

        <!-- Color variants -->
        ${p.colors && p.colors.length > 1 ? `
          <div class="color-selector">
            <div class="color-options">
              ${p.colors.slice(0,3).map(color => `
                <div class="color-option" style="background:${getColorCode(color)}"
                     title="${color}" onclick="selectVariant('${p.id}', '${color}')"></div>
              `).join('')}
              ${p.colors.length > 3 ? `<span class="muted">+${p.colors.length - 3} more</span>` : ''}
            </div>
          </div>
        ` : ''}

        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div>
            ${p.originalPrice ? `<span class="muted" style="text-decoration:line-through;">${fmt.format(p.originalPrice)}</span>` : ''}
            <span class="price">${fmt.format(p.price)}</span>
          </div>
          <button class="btn ${p.stock === 0 ? 'disabled' : ''}"
                  data-add="${p.id}"
                  ${p.stock === 0 ? 'disabled' : ''}>
            ${p.stock === 0 ? 'Out of Stock' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  `).join('');

  renderRecentlyViewed();
}

function saveCart(){ localStorage.setItem('cart', JSON.stringify(state.cart)); }
function saveSavedForLater(){ localStorage.setItem('savedForLater', JSON.stringify(state.savedForLater)); }
function saveDiscount(){ localStorage.setItem('appliedDiscount', JSON.stringify(state.appliedDiscount)); }

function cartCount(){ return state.cart.reduce((n,i)=>n+i.qty,0); }
function cartSubtotal(){ return state.cart.reduce((s,i)=>s + (i.price * i.qty),0); }

function calculateDiscount(subtotal) {
  if (!state.appliedDiscount) return 0;

  const discount = state.appliedDiscount;
  if (discount.type === 'percentage') {
    return Math.min(subtotal * (discount.value / 100), discount.maxDiscount || subtotal);
  } else if (discount.type === 'fixed') {
    return Math.min(discount.value, subtotal);
  }
  return 0;
}

function calculateTotal() {
  const subtotal = cartSubtotal();
  const discount = calculateDiscount(subtotal);
  return subtotal - discount + state.shippingCost;
}

// Discount codes
const discountCodes = {
  'WELCOME10': { type: 'percentage', value: 10, minOrder: 100, maxDiscount: 50 },
  'GHANA20': { type: 'percentage', value: 20, minOrder: 200, maxDiscount: 100 },
  'FREESHIP': { type: 'shipping', value: 0 },
  'SAVE50': { type: 'fixed', value: 50, minOrder: 150 },
  'NEWCUSTOMER': { type: 'percentage', value: 15, minOrder: 0, maxDiscount: 75 }
};

function applyDiscount() {
  const code = qs('#discountCode').value.toUpperCase();
  const messageEl = qs('#discountMessage');
  const subtotal = cartSubtotal();

  if (!code) {
    messageEl.textContent = 'Please enter a discount code';
    messageEl.className = 'discount-message error';
    return;
  }

  const discount = discountCodes[code];
  if (!discount) {
    messageEl.textContent = 'Invalid discount code';
    messageEl.className = 'discount-message error';
    return;
  }

  if (discount.minOrder && subtotal < discount.minOrder) {
    messageEl.textContent = `Minimum order of ${fmt.format(discount.minOrder)} required`;
    messageEl.className = 'discount-message error';
    return;
  }

  if (state.appliedDiscount && state.appliedDiscount.code === code) {
    messageEl.textContent = 'Discount already applied';
    messageEl.className = 'discount-message error';
    return;
  }

  state.appliedDiscount = { ...discount, code };
  saveDiscount();

  if (discount.type === 'shipping') {
    state.shippingCost = 0;
    messageEl.textContent = 'Free shipping applied!';
  } else {
    const discountAmount = calculateDiscount(subtotal);
    messageEl.textContent = `Discount applied: ${fmt.format(discountAmount)} off`;
  }
  messageEl.className = 'discount-message success';

  renderCart();
}

function removeDiscount() {
  state.appliedDiscount = null;
  saveDiscount();
  qs('#discountCode').value = '';
  qs('#discountMessage').textContent = '';
  renderCart();
}

function calculateShipping() {
  const location = qs('#shippingLocation').value;
  const costEl = qs('#shippingCost');

  // Don't apply shipping if free shipping discount is active
  if (state.appliedDiscount && state.appliedDiscount.type === 'shipping') {
    state.shippingCost = 0;
    costEl.textContent = 'Free shipping applied!';
    costEl.style.color = 'var(--green)';
    renderCart();
    return;
  }

  const shippingRates = {
    'accra': 15,
    'greater-accra': 25,
    'other-regions': 35,
    'international': 50 // Base rate, varies by country
  };

  if (location && shippingRates[location]) {
    state.shippingCost = shippingRates[location];
    costEl.textContent = `Shipping: ${fmt.format(state.shippingCost)}`;
    costEl.style.color = 'var(--muted)';

    // Free shipping thresholds
    const subtotal = cartSubtotal();
    const freeShippingThresholds = {
      'accra': 200,
      'greater-accra': 300,
      'other-regions': 400
    };

    if (freeShippingThresholds[location] && subtotal >= freeShippingThresholds[location]) {
      state.shippingCost = 0;
      costEl.textContent = 'Free shipping (order qualifies)!';
      costEl.style.color = 'var(--green)';
    }
  } else {
    state.shippingCost = 0;
    costEl.textContent = '';
  }

  renderCart();
}

function renderCart(){
  qs('#cartCount').textContent = cartCount();
  const subtotal = cartSubtotal();
  const discount = calculateDiscount(subtotal);
  const total = calculateTotal();

  qs('#cartSubtotal').textContent = fmt.format(subtotal);
  qs('#cartTotal').textContent = fmt.format(total);

  // Show/hide discount line
  const discountLine = qs('#discountLine');
  if (discount > 0) {
    discountLine.style.display = 'flex';
    qs('#discountAmount').textContent = `-${fmt.format(discount)}`;
  } else {
    discountLine.style.display = 'none';
  }

  // Show/hide shipping line
  const shippingLine = qs('#shippingLine');
  if (state.shippingCost > 0) {
    shippingLine.style.display = 'flex';
    qs('#shippingAmount').textContent = fmt.format(state.shippingCost);
  } else if (qs('#shippingLocation').value) {
    shippingLine.style.display = 'flex';
    qs('#shippingAmount').textContent = 'Free';
    qs('#shippingAmount').style.color = 'var(--green)';
  } else {
    shippingLine.style.display = 'none';
  }

  const wrap = qs('#cartItems');
  if(state.cart.length===0){
    wrap.innerHTML = '<p class="muted">Your cart is empty.</p>';
    // Hide totals when cart is empty
    qs('.totals').style.display = 'none';
    return;
  }

  qs('.totals').style.display = 'block';
  wrap.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h4>${item.name}</h4>
        <div class="muted">${fmt.format(item.price)} each</div>
        ${item.selectedSize ? `<div class="muted">Size: ${item.selectedSize}</div>` : ''}
        ${item.selectedColor ? `<div class="muted">Color: ${item.selectedColor}</div>` : ''}
      </div>
      <div class="qty">
        <button data-dec="${item.id}">−</button>
        <span>${item.qty}</span>
        <button data-inc="${item.id}">+</button>
        <button onclick="saveForLater('${item.id}')" title="Save for later" style="margin-left:8px;background:none;border:none;cursor:pointer;">💾</button>
        <button data-del="${item.id}" title="Remove" style="margin-left:4px">✕</button>
      </div>
    </div>
  `).join('');

  renderSavedForLater();
}

function saveForLater(itemId) {
  const item = state.cart.find(i => i.id === itemId);
  if (!item) return;

  // Remove from cart
  state.cart = state.cart.filter(i => i.id !== itemId);

  // Add to saved for later
  const existingSaved = state.savedForLater.find(i => i.id === itemId);
  if (existingSaved) {
    existingSaved.qty += item.qty;
  } else {
    state.savedForLater.push(item);
  }

  saveCart();
  saveSavedForLater();
  renderCart();
}

function moveToCart(itemId) {
  const item = state.savedForLater.find(i => i.id === itemId);
  if (!item) return;

  // Remove from saved for later
  state.savedForLater = state.savedForLater.filter(i => i.id !== itemId);

  // Add to cart
  const existingCart = state.cart.find(i => i.id === itemId);
  if (existingCart) {
    existingCart.qty += item.qty;
  } else {
    state.cart.push(item);
  }

  saveCart();
  saveSavedForLater();
  renderCart();
}

function renderSavedForLater() {
  const container = qs('#savedForLater');
  const itemsContainer = qs('#savedItems');

  if (state.savedForLater.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  itemsContainer.innerHTML = state.savedForLater.map(item => `
    <div class="saved-item">
      <img src="${item.image}" alt="${item.name}">
      <div style="flex:1;">
        <div>${item.name}</div>
        <div class="muted">${fmt.format(item.price)} • Qty: ${item.qty}</div>
      </div>
      <button class="move-to-cart" onclick="moveToCart('${item.id}')">Move to Cart</button>
      <button onclick="removeSavedItem('${item.id}')" style="background:none;border:none;color:#999;cursor:pointer;margin-left:8px;">✕</button>
    </div>
  `).join('');
}

function removeSavedItem(itemId) {
  state.savedForLater = state.savedForLater.filter(i => i.id !== itemId);
  saveSavedForLater();
  renderSavedForLater();
}

function addToCart(id){
  const p = state.products.find(x=>x.id===id);
  if(!p) return;
  const found = state.cart.find(x=>x.id===id);
  if(found) found.qty += 1; else state.cart.push({id:p.id,name:p.name,price:p.price,image:p.image,qty:1});
  saveCart(); renderCart();
}
function inc(id){ const it = state.cart.find(i=>i.id===id); if(it){ it.qty++; saveCart(); renderCart(); } }
function dec(id){ const it = state.cart.find(i=>i.id===id); if(it){ it.qty--; if(it.qty<=0){ state.cart = state.cart.filter(i=>i.id!==id);} saveCart(); renderCart(); } }
function delItem(id){ state.cart = state.cart.filter(i=>i.id!==id); saveCart(); renderCart(); }

function openCart(){ qs('#cartDrawer').classList.add('open'); qs('#cartDrawer').setAttribute('aria-hidden','false'); }
function closeCart(){ qs('#cartDrawer').classList.remove('open'); qs('#cartDrawer').setAttribute('aria-hidden','true'); }

function attachEvents(){
  document.addEventListener('click', (e)=>{
    const t = e.target;
    if(t.matches('[data-add]')) addToCart(t.getAttribute('data-add'));
    if(t.matches('[data-inc]')) inc(t.getAttribute('data-inc'));
    if(t.matches('[data-dec]')) dec(t.getAttribute('data-dec'));
    if(t.matches('[data-del]')) delItem(t.getAttribute('data-del'));
    if(t.matches('[data-wishlist]')) toggleWishlist(t.getAttribute('data-wishlist'));
    if(t.id==='openCartBtn') openCart();
    if(t.id==='closeCartBtn') closeCart();
    if(t.matches('.chip')){
      qsa('.chip').forEach(c=>c.classList.remove('is-active'));
      t.classList.add('is-active');
      state.filter = t.dataset.filter;
      renderProducts();
    }
    if(t.matches('.size-option')){
      const parent = t.closest('.size-selector') || t.closest('.quick-view-info');
      if(parent) {
        parent.querySelectorAll('.size-option').forEach(s=>s.classList.remove('selected'));
        t.classList.add('selected');
      }
    }
    if(t.matches('.color-option')){
      const parent = t.closest('.color-selector') || t.closest('.quick-view-info');
      if(parent) {
        parent.querySelectorAll('.color-option').forEach(c=>c.classList.remove('selected'));
        t.classList.add('selected');
      }
    }
    if(t.id==='checkoutBtn') checkout();
    if(t.id==='applyDiscountBtn') applyDiscount();

    // Close modals when clicking outside
    if(t.matches('.modal') && !t.matches('.modal-content')) {
      qsa('.modal.show').forEach(modal => {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
      });
    }
  });

  // Enhanced search input with autocomplete
  const searchInput = qs('#searchInput');
  if(searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value;

      if (query.length > 1) {
        searchTimeout = setTimeout(() => {
          updateSearch(query);
          showSearchSuggestions(query);
        }, 200);
      } else {
        hideSearchSuggestions();
        updateSearch('');
      }
    });

    searchInput.addEventListener('focus', () => {
      if (searchInput.value.length > 1) {
        showSearchSuggestions(searchInput.value);
      }
    });

    searchInput.addEventListener('blur', () => {
      // Delay hiding to allow clicking on suggestions
      setTimeout(() => hideSearchSuggestions(), 200);
    });
  }

  // Review form
  const reviewForm = qs('#reviewForm');
  if(reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const productId = getProductFromUrl();
      const rating = qs('.star-rating .active:last-child')?.dataset.rating || 5;
      const name = qs('#reviewerName').value;
      const text = qs('#reviewText').value;

      if(name && text) {
        submitReview(productId, rating, name, text);
        reviewForm.reset();
        qsa('.star-rating span').forEach(s => s.classList.remove('active'));
      }
    });
  }

  // Star rating
  qsa('.star-rating span').forEach(star => {
    star.addEventListener('click', () => {
      const rating = parseInt(star.dataset.rating);
      qsa('.star-rating span').forEach((s, i) => {
        s.classList.toggle('active', i < rating);
      });
    });
  });

  // Newsletter signup
  const newsletterForm = qs('#newsletterForm');
  if(newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = qs('#newsletterEmail').value;

      // Save to localStorage (in real app, send to server)
      const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
      if(!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
        alert('Thank you for subscribing to our newsletter!');
        qs('#newsletterEmail').value = '';
      } else {
        alert('You are already subscribed to our newsletter.');
      }
    });
  }
}

function updatePriceFilter(value) {
  const [min, max] = value.split(',').map(Number);
  updatePriceRange(min, max);
}

function saveProducts() {
  // In a real app, this would sync with server
  localStorage.setItem('products', JSON.stringify(state.products));
}

function renderProductReviews(productId) {
  const container = qs('#reviewsContainer');
  if (!container) return;

  const productReviews = state.reviews[productId] || [];

  if (productReviews.length === 0) {
    container.innerHTML = '<p class="muted">No reviews yet. Be the first to review this product!</p>';
    return;
  }

  container.innerHTML = productReviews.map(review => `
    <div class="review">
      <div class="review-header">
        <div>
          <div class="reviewer-name">${review.name}</div>
          <div class="stars">${renderStars(review.rating)}</div>
        </div>
        <div class="review-date">${new Date(review.date).toLocaleDateString()}</div>
      </div>
      <p>${review.text}</p>
    </div>
  `).join('');
}

function renderRelatedProducts(category, excludeId) {
  const container = qs('#relatedProducts');
  if (!container) return;

  const related = state.products
    .filter(p => p.category === category && p.id !== excludeId)
    .slice(0, 4);

  container.innerHTML = related.map(p => `
    <article class="card">
      <img src="${p.image}" alt="${p.name}" onclick="viewProduct('${p.id}')" style="cursor:pointer;">
      <div class="body">
        <h3 onclick="viewProduct('${p.id}')" style="cursor:pointer;">${p.name}</h3>
        <p class="muted">${p.category}</p>
        <div class="rating">
          <span class="stars">${renderStars(p.rating || 0)}</span>
          <span class="muted">(${p.reviews || 0})</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <span class="price">${fmt.format(p.price)}</span>
          <button class="btn" onclick="addToCart('${p.id}')">Add to cart</button>
        </div>
      </div>
    </article>
  `).join('');
}

function checkout(){
  const email = qs('#checkoutEmail').value || '';
  if(!email || !email.includes('@')){ alert('Enter a valid email for your receipt.'); return; }
  if(state.cart.length===0){ alert('Your cart is empty.'); return; }

  const amountGHS = Math.round(cartSubtotal()*100); // pesewas
  const ref = 'AT-'+Date.now();

  if(!window.PAYSTACK_PUBLIC_KEY || window.PAYSTACK_PUBLIC_KEY.includes('YOUR_')){
    alert('Set your Paystack public key in index.html before testing checkout.');
    return;
  }

  const handler = PaystackPop.setup({
    key: window.PAYSTACK_PUBLIC_KEY,
    email,
    amount: amountGHS, // amount in pesewas
    currency: GH_CURRENCY,
    ref,
    metadata: {
      custom_fields: state.cart.map(i=>({
        display_name: i.name,
        variable_name: i.id,
        value: `x${i.qty}`
      }))
    },
    callback: function(response){
      // Create order record
      const order = {
        id: ref,
        userId: state.user?.id || 'guest',
        items: [...state.cart],
        total: cartSubtotal(),
        status: 'pending',
        date: new Date().toISOString(),
        paymentRef: response.reference,
        email: email,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
      };

      state.orders.push(order);
      saveOrders();

      alert('Payment complete! Reference: ' + response.reference);
      state.cart = []; saveCart(); renderCart(); closeCart();
    },
    onClose: function(){ /* user closed */ }
  });
  handler.openIframe();
}

// Utility functions
function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = '★'.repeat(fullStars);
  if (hasHalfStar) stars += '☆';
  return stars.padEnd(5, '☆');
}

function isInWishlist(productId) {
  return state.wishlist.includes(productId);
}

function saveWishlist() {
  localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
}

function saveUser() {
  localStorage.setItem('user', JSON.stringify(state.user));
}

function saveOrders() {
  localStorage.setItem('orders', JSON.stringify(state.orders));
}

function saveReviews() {
  localStorage.setItem('reviews', JSON.stringify(state.reviews));
}

function saveRecentlyViewed() {
  localStorage.setItem('recentlyViewed', JSON.stringify(state.recentlyViewed));
}

function saveComparison() {
  localStorage.setItem('comparison', JSON.stringify(state.comparison));
}

// Color mapping for variants
function getColorCode(colorName) {
  const colors = {
    'Black': '#000000',
    'White': '#FFFFFF',
    'Navy': '#000080',
    'Brown': '#8B4513',
    'Charcoal': '#36454F',
    'Cream': '#F5F5DC',
    'Multi-color': 'linear-gradient(45deg, #EF3340, #FDB913, #009739)',
    'Multi-pack': 'linear-gradient(45deg, #EF3340, #FDB913, #009739)'
  };
  return colors[colorName] || '#cccccc';
}

// Recently viewed products
function addToRecentlyViewed(productId) {
  const index = state.recentlyViewed.indexOf(productId);
  if (index > -1) {
    state.recentlyViewed.splice(index, 1);
  }
  state.recentlyViewed.unshift(productId);
  state.recentlyViewed = state.recentlyViewed.slice(0, 6); // Keep only 6 items
  saveRecentlyViewed();
}

function renderRecentlyViewed() {
  const container = qs('#recentlyViewedItems');
  if (!container || state.recentlyViewed.length === 0) return;

  const recentProducts = state.recentlyViewed
    .map(id => state.products.find(p => p.id === id))
    .filter(Boolean);

  if (recentProducts.length > 0) {
    qs('#recentlyViewed').style.display = 'block';
    container.innerHTML = recentProducts.map(p => `
      <article class="card">
        <img src="${p.image}" alt="${p.name}" onclick="viewProduct('${p.id}')" style="cursor:pointer;">
        <div class="body">
          <h4 onclick="viewProduct('${p.id}')" style="cursor:pointer;margin:0;">${p.name}</h4>
          <span class="price">${fmt.format(p.price)}</span>
        </div>
      </article>
    `).join('');
  }
}

// Quick view functionality
function quickView(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const content = qs('#quickViewContent');
  content.innerHTML = `
    <div class="quick-view-images">
      <img src="${product.images[0]}" alt="${product.name}" class="quick-view-main-image" id="quickViewMainImage">
      <div class="quick-view-thumbnails">
        ${product.images.map((img, i) => `
          <img src="${img}" alt="${product.name}" class="quick-view-thumbnail ${i === 0 ? 'active' : ''}"
               onclick="changeQuickViewImage('${img}', this)">
        `).join('')}
      </div>
    </div>
    <div class="quick-view-info">
      <h2>${product.name}</h2>
      <div class="rating">
        <span class="stars">${renderStars(product.rating)}</span>
        <span class="muted">(${product.reviews} reviews)</span>
      </div>
      <div class="price" style="font-size:1.3rem;margin:8px 0;">
        ${product.originalPrice ? `<span class="muted" style="text-decoration:line-through;">${fmt.format(product.originalPrice)}</span> ` : ''}
        ${fmt.format(product.price)}
      </div>
      <p>${product.description}</p>

      ${product.colors && product.colors.length > 1 ? `
        <div class="color-selector">
          <label><strong>Color:</strong></label>
          <div class="color-options">
            ${product.colors.map(color => `
              <div class="color-option" style="background:${getColorCode(color)}"
                   title="${color}" onclick="selectQuickViewVariant('${product.id}', '${color}')"></div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="size-selector">
        <label><strong>Size:</strong></label>
        <div class="size-options">
          ${product.sizes.map(size => `
            <button class="size-option" data-size="${size}">${size}</button>
          `).join('')}
        </div>
      </div>

      <div class="quick-view-actions">
        <button class="btn primary" onclick="addToCart('${product.id}'); closeModal('quickViewModal')">Add to Cart</button>
        <button class="btn" onclick="viewProduct('${product.id}')">View Details</button>
        <button class="btn wishlist-btn" onclick="toggleWishlist('${product.id}')">
          ${isInWishlist(product.id) ? '❤️ Remove' : '🤍 Add to Wishlist'}
        </button>
      </div>
    </div>
  `;

  showModal('quickViewModal');
}

function changeQuickViewImage(src, thumbnail) {
  qs('#quickViewMainImage').src = src;
  qsa('.quick-view-thumbnail').forEach(t => t.classList.remove('active'));
  thumbnail.classList.add('active');
}

function selectQuickViewVariant(productId, color) {
  const product = state.products.find(p => p.id === productId);
  const variant = product.variants?.find(v => v.color === color);
  if (variant) {
    qs('#quickViewMainImage').src = variant.image;
  }
  qsa('.color-option').forEach(c => c.classList.remove('selected'));
  event.target.classList.add('selected');
}

// Product comparison functionality
function addToComparison(productId) {
  if (state.comparison.includes(productId)) {
    alert('Product already in comparison');
    return;
  }

  if (state.comparison.length >= 4) {
    alert('You can compare up to 4 products at a time');
    return;
  }

  state.comparison.push(productId);
  saveComparison();
  updateComparisonBar();

  if (state.comparison.length === 1) {
    showComparisonBar();
  }
}

function removeFromComparison(productId) {
  const index = state.comparison.indexOf(productId);
  if (index > -1) {
    state.comparison.splice(index, 1);
    saveComparison();
    updateComparisonBar();

    if (state.comparison.length === 0) {
      hideComparisonBar();
    }
  }
}

function clearComparison() {
  state.comparison = [];
  saveComparison();
  hideComparisonBar();
  closeModal('comparisonModal');
}

function showComparisonBar() {
  const bar = qs('#comparisonBar');
  if (!bar) {
    // Create comparison bar if it doesn't exist
    const comparisonBar = document.createElement('div');
    comparisonBar.id = 'comparisonBar';
    comparisonBar.className = 'comparison-bar';
    comparisonBar.innerHTML = `
      <div class="container" style="display:flex;align-items:center;justify-content:space-between;">
        <div class="comparison-items" id="comparisonItems"></div>
        <div>
          <button class="btn primary" onclick="showComparison()">Compare (${state.comparison.length})</button>
          <button class="btn" onclick="clearComparison()">Clear</button>
        </div>
      </div>
    `;
    document.body.appendChild(comparisonBar);
  }
  qs('#comparisonBar').classList.add('show');
}

function hideComparisonBar() {
  const bar = qs('#comparisonBar');
  if (bar) {
    bar.classList.remove('show');
  }
}

function updateComparisonBar() {
  const container = qs('#comparisonItems');
  if (!container) return;

  const compareProducts = state.comparison
    .map(id => state.products.find(p => p.id === id))
    .filter(Boolean);

  container.innerHTML = compareProducts.map(p => `
    <div class="comparison-item-mini">
      <img src="${p.image}" alt="${p.name}">
      <span>${p.name}</span>
      <button onclick="removeFromComparison('${p.id}')" style="background:none;border:none;color:#999;cursor:pointer;">✕</button>
    </div>
  `).join('');

  // Update button text
  const compareBtn = qs('#comparisonBar .btn.primary');
  if (compareBtn) {
    compareBtn.textContent = `Compare (${state.comparison.length})`;
  }
}

function showComparison() {
  const compareProducts = state.comparison
    .map(id => state.products.find(p => p.id === id))
    .filter(Boolean);

  if (compareProducts.length < 2) {
    alert('Add at least 2 products to compare');
    return;
  }

  const content = qs('#comparisonContent');
  content.innerHTML = compareProducts.map(p => `
    <div class="comparison-item">
      <img src="${p.image}" alt="${p.name}">
      <h4>${p.name}</h4>
      <div class="price">${fmt.format(p.price)}</div>
      <div class="rating">
        <span class="stars">${renderStars(p.rating)}</span>
        <span class="muted">(${p.reviews})</span>
      </div>
      <div class="muted">${p.category}</div>
      <div style="margin:8px 0;">
        <strong>Sizes:</strong> ${p.sizes.join(', ')}
      </div>
      <div style="margin:8px 0;">
        <strong>Stock:</strong> ${p.stock > 0 ? `${p.stock} available` : 'Out of stock'}
      </div>
      <div style="margin:8px 0;">
        <strong>Features:</strong>
        <ul style="font-size:.8rem;margin:4px 0;padding-left:16px;">
          ${p.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
      <button class="btn primary" onclick="addToCart('${p.id}'); closeModal('comparisonModal')">Add to Cart</button>
      <button class="comparison-remove" onclick="removeFromComparison('${p.id}')">Remove</button>
    </div>
  `).join('');

  showModal('comparisonModal');
}

// Variant selection
function selectVariant(productId, color) {
  const product = state.products.find(p => p.id === productId);
  const variant = product.variants?.find(v => v.color === color);
  if (variant) {
    // Update the main product image
    const productCard = event.target.closest('.card');
    const mainImage = productCard.querySelector('img');
    if (mainImage) {
      mainImage.src = variant.image;
    }
  }
}

// Wishlist functions
function toggleWishlist(productId) {
  const index = state.wishlist.indexOf(productId);
  if (index > -1) {
    state.wishlist.splice(index, 1);
  } else {
    state.wishlist.push(productId);
    showModal('wishlistModal');
  }
  saveWishlist();
  renderProducts();
}

// Search and filter functions
function updateSearch(query) {
  state.searchQuery = query;
  renderProducts();
}

function updateSort(sortBy) {
  state.sortBy = sortBy;
  renderProducts();
}

function updatePriceRange(min, max) {
  state.priceRange = [min, max];
  renderProducts();
}

// Product detail functions
function viewProduct(productId) {
  addToRecentlyViewed(productId);
  window.location.href = `product.html?id=${productId}`;
}

function getProductFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function renderProductDetail() {
  const productId = getProductFromUrl();
  if (!productId) return;

  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  qs('#breadcrumbProduct').textContent = product.name;
  document.title = `${product.name} — Akwaaba Threads`;

  const container = qs('#productDetailContent');
  if (!container) return;

  container.innerHTML = `
    <div class="image-gallery">
      <img src="${product.images[0]}" alt="${product.name}" class="main-image" id="mainImage">
      <div class="thumbnail-grid">
        ${product.images.map((img, i) => `
          <img src="${img}" alt="${product.name}" class="thumbnail ${i === 0 ? 'active' : ''}"
               onclick="changeMainImage('${img}', this)">
        `).join('')}
      </div>
    </div>
    <div class="product-info">
      <h1>${product.name}</h1>
      <div class="rating">
        <span class="stars">${renderStars(product.rating)}</span>
        <span class="muted">(${product.reviews} reviews)</span>
      </div>
      <div class="price" style="font-size:1.5rem;margin:12px 0;">${fmt.format(product.price)}</div>

      <div class="stock-info ${product.stock === 0 ? 'out-of-stock' : product.stock <= 5 ? 'low-stock' : 'in-stock'}">
        ${product.stock === 0 ? 'Out of Stock' :
          product.stock <= 5 ? `Only ${product.stock} left in stock!` :
          'In Stock'}
      </div>

      <div class="size-selector">
        <label><strong>Size:</strong></label>
        <div class="size-options">
          ${product.sizes.map(size => `
            <button class="size-option" data-size="${size}">${size}</button>
          `).join('')}
        </div>
      </div>

      <div class="quantity-selector">
        <label><strong>Quantity:</strong></label>
        <button class="qty-btn" onclick="changeQuantity(-1)">−</button>
        <input type="number" class="qty-input" id="productQuantity" value="1" min="1" max="${product.stock}">
        <button class="qty-btn" onclick="changeQuantity(1)">+</button>
      </div>

      <div class="product-actions">
        <button class="btn primary" onclick="addToCartFromDetail('${product.id}')"
                ${product.stock === 0 ? 'disabled' : ''}>
          ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
        <button class="btn wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}"
                onclick="toggleWishlist('${product.id}')">
          ${isInWishlist(product.id) ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
        </button>
      </div>

      <div class="social-sharing">
        <h4>Share this product</h4>
        <div class="share-buttons">
          <button class="share-btn facebook" onclick="shareProduct('facebook', '${product.id}')">
            📘 Facebook
          </button>
          <button class="share-btn twitter" onclick="shareProduct('twitter', '${product.id}')">
            🐦 Twitter
          </button>
          <button class="share-btn whatsapp" onclick="shareProduct('whatsapp', '${product.id}')">
            💬 WhatsApp
          </button>
          <button class="share-btn copy" onclick="copyProductLink('${product.id}')">
            🔗 Copy Link
          </button>
        </div>
      </div>

      <div class="product-description">
        <h3>Description</h3>
        <p>${product.description}</p>

        <h4>Features</h4>
        <ul class="features-list">
          ${product.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  renderProductReviews(productId);
  renderRelatedProducts(product.category, productId);
}

function changeMainImage(src, thumbnail) {
  qs('#mainImage').src = src;
  qsa('.thumbnail').forEach(t => t.classList.remove('active'));
  thumbnail.classList.add('active');
}

function changeQuantity(delta) {
  const input = qs('#productQuantity');
  const newValue = parseInt(input.value) + delta;
  const max = parseInt(input.max);
  if (newValue >= 1 && newValue <= max) {
    input.value = newValue;
  }
}

function addToCartFromDetail(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product || product.stock === 0) return;

  const selectedSize = qs('.size-option.selected')?.dataset.size;
  if (product.sizes.length > 1 && !selectedSize) {
    alert('Please select a size');
    return;
  }

  const quantity = parseInt(qs('#productQuantity').value);

  for (let i = 0; i < quantity; i++) {
    addToCart(productId);
  }

  // Update stock
  product.stock -= quantity;
  saveProducts();
  renderProductDetail();
}

// Review functions
function submitReview(productId, rating, name, text) {
  if (!state.reviews[productId]) {
    state.reviews[productId] = [];
  }

  const review = {
    id: Date.now().toString(),
    rating: parseInt(rating),
    name: name,
    text: text,
    date: new Date().toISOString()
  };

  state.reviews[productId].push(review);
  saveReviews();

  // Update product rating and review count
  const product = state.products.find(p => p.id === productId);
  if (product) {
    const reviews = state.reviews[productId];
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    product.rating = Math.round(avgRating * 10) / 10;
    product.reviews = reviews.length;
    saveProducts();
  }

  renderProductReviews(productId);
  renderProductDetail();
}

// Modal functions
function showModal(modalId) {
  const modal = qs(`#${modalId}`);
  if (modal) {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
  }
}

function closeModal(modalId) {
  const modal = qs(`#${modalId}`);
  if (modal) {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  }
}

async function main(){
  qs('#year').textContent = new Date().getFullYear();
  attachEvents();
  await loadProducts();

  // Check if we're on product detail page
  if (window.location.pathname.includes('product.html')) {
    renderProductDetail();
  } else {
    renderProducts();
  }

  renderCart();

  // Initialize modern UI features
  initImageZoom();
  initInfiniteScroll();
  initChatbot();

  // Render AI recommendations after initial load
  setTimeout(() => {
    renderAIRecommendations();
  }, 1000);

  // Add fade-in animation to main content
  const main = qs('main');
  if (main) {
    animateElement(main, 'fade-in');
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}


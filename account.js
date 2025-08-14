// Account management functionality

function showLoginSection() {
  qs('#loginSection').style.display = 'block';
  qs('#accountSection').style.display = 'none';
}

function showAccountSection() {
  qs('#loginSection').style.display = 'none';
  qs('#accountSection').style.display = 'block';
  loadUserProfile();
  loadOrderHistory();
}

function showAccountTab(tabName) {
  // Hide all tabs
  qsa('.account-tab').forEach(tab => tab.style.display = 'none');
  qsa('.account-nav button').forEach(btn => btn.classList.remove('active'));

  // Show selected tab
  qs(`#${tabName}Tab`).style.display = 'block';
  event.target.classList.add('active');

  // Load tab-specific content
  if (tabName === 'loyalty') {
    loadLoyaltyData();
  } else if (tabName === 'referrals') {
    loadReferralData();
  }
}

function login(email, password) {
  // Simple demo login - in real app, validate against server
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    state.user = { ...user };
    delete state.user.password; // Don't store password in state
    saveUser();
    showAccountSection();
    return true;
  }
  return false;
}

function register(userData) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Check if email already exists
  if (users.find(u => u.email === userData.email)) {
    return { success: false, message: 'Email already registered' };
  }
  
  // Add new user
  const newUser = {
    id: Date.now().toString(),
    ...userData,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  // Auto login
  state.user = { ...newUser };
  delete state.user.password;
  saveUser();
  showAccountSection();
  
  return { success: true };
}

function logout() {
  state.user = null;
  saveUser();
  showLoginSection();
}

function loadUserProfile() {
  if (!state.user) return;
  
  qs('#profileName').value = state.user.name || '';
  qs('#profileEmail').value = state.user.email || '';
  qs('#profilePhone').value = state.user.phone || '';
}

function updateProfile(profileData) {
  if (!state.user) return;
  
  // Update user data
  Object.assign(state.user, profileData);
  saveUser();
  
  // Update in users array
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userIndex = users.findIndex(u => u.id === state.user.id);
  if (userIndex > -1) {
    Object.assign(users[userIndex], profileData);
    localStorage.setItem('users', JSON.stringify(users));
  }
}

function loadOrderHistory() {
  if (!state.user) return;
  
  const userOrders = state.orders.filter(order => order.userId === state.user.id);
  const container = qs('#orderHistory');
  
  if (userOrders.length === 0) {
    container.innerHTML = '<p class="muted">No orders yet. <a href="index.html#products">Start shopping!</a></p>';
    return;
  }
  
  container.innerHTML = userOrders.map(order => `
    <div class="order-item">
      <div class="order-header">
        <div>
          <strong>Order #${order.id}</strong>
          <div class="muted">${new Date(order.date).toLocaleDateString()}</div>
        </div>
        <div>
          <div class="order-status ${order.status}">${order.status.toUpperCase()}</div>
          <div><strong>${fmt.format(order.total)}</strong></div>
        </div>
      </div>
      <div class="order-items">
        ${order.items.map(item => `
          <div style="display:flex;align-items:center;gap:8px;margin:4px 0;">
            <img src="${item.image}" alt="${item.name}" style="width:40px;height:40px;border-radius:4px;">
            <span>${item.name} x${item.qty}</span>
          </div>
        `).join('')}
      </div>
      <div style="margin-top:8px;">
        <button class="btn" onclick="trackOrder('${order.id}')">Track Order</button>
        ${order.status === 'delivered' ? `<button class="btn" onclick="reorder('${order.id}')">Reorder</button>` : ''}
      </div>
    </div>
  `).join('');
}

function trackOrder(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (!order) return;
  
  alert(`Order #${orderId} Status: ${order.status.toUpperCase()}\n\nEstimated delivery: ${order.estimatedDelivery || 'TBD'}`);
}

function reorder(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (!order) return;
  
  // Add all items from the order back to cart
  order.items.forEach(item => {
    const product = state.products.find(p => p.id === item.id);
    if (product && product.stock > 0) {
      for (let i = 0; i < item.qty; i++) {
        addToCart(item.id);
      }
    }
  });
  
  alert('Items added to cart!');
  renderCart();
}

// Loyalty Points System
function calculateLoyaltyPoints(orderTotal) {
  // 1 point per GHS spent, bonus points for higher tiers
  const basePoints = Math.floor(orderTotal);
  const tier = getUserTier();
  const multiplier = tier === 'Gold' ? 2 : tier === 'Silver' ? 1.5 : 1;
  return Math.floor(basePoints * multiplier);
}

function getUserTier() {
  if (!state.user) return 'Bronze';
  const totalSpent = state.user.totalSpent || 0;
  if (totalSpent >= 1000) return 'Gold';
  if (totalSpent >= 500) return 'Silver';
  return 'Bronze';
}

function loadLoyaltyData() {
  if (!state.user) return;

  const points = state.user.loyaltyPoints || 0;
  const pointsValue = points * 0.05; // 1 point = GHS 0.05
  const tier = getUserTier();
  const totalSpent = state.user.totalSpent || 0;

  qs('#pointsBalance').textContent = `${points} points`;
  qs('#pointsValue').textContent = `Worth ${fmt.format(pointsValue)}`;
  qs('#membershipTier').textContent = tier;

  // Calculate tier progress
  let nextTierThreshold, progress;
  if (tier === 'Bronze') {
    nextTierThreshold = 500;
    progress = (totalSpent / nextTierThreshold) * 100;
    qs('#tierProgressText').textContent = `Spend ${fmt.format(nextTierThreshold - totalSpent)} more to reach Silver`;
  } else if (tier === 'Silver') {
    nextTierThreshold = 1000;
    progress = ((totalSpent - 500) / (nextTierThreshold - 500)) * 100;
    qs('#tierProgressText').textContent = `Spend ${fmt.format(nextTierThreshold - totalSpent)} more to reach Gold`;
  } else {
    progress = 100;
    qs('#tierProgressText').textContent = 'You\'ve reached the highest tier!';
  }

  qs('#tierProgress').style.width = `${Math.min(progress, 100)}%`;

  // Load points history
  loadPointsHistory();
  loadRewards();
}

function loadPointsHistory() {
  const history = state.user.pointsHistory || [];
  const container = qs('#pointsHistory');

  if (history.length === 0) {
    container.innerHTML = '<p class="muted">No points history yet.</p>';
    return;
  }

  container.innerHTML = history.slice(-10).reverse().map(entry => `
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;">
      <div>
        <div>${entry.description}</div>
        <div class="muted">${new Date(entry.date).toLocaleDateString()}</div>
      </div>
      <div style="color:${entry.points > 0 ? 'var(--green)' : 'var(--red)'};">
        ${entry.points > 0 ? '+' : ''}${entry.points} points
      </div>
    </div>
  `).join('');
}

function loadRewards() {
  const rewards = [
    { id: 'discount-10', name: '10% Off Next Order', cost: 100, type: 'discount', value: 10 },
    { id: 'free-shipping', name: 'Free Shipping', cost: 50, type: 'shipping' },
    { id: 'discount-20', name: '20% Off Next Order', cost: 200, type: 'discount', value: 20 },
    { id: 'gift-card-50', name: 'GHS 50 Gift Card', cost: 1000, type: 'gift_card', value: 50 },
    { id: 'exclusive-item', name: 'Exclusive Kente Bookmark', cost: 150, type: 'item' }
  ];

  const userPoints = state.user.loyaltyPoints || 0;
  const container = qs('#rewardsGrid');

  container.innerHTML = rewards.map(reward => `
    <div class="reward-item">
      <h5>${reward.name}</h5>
      <div class="reward-cost">${reward.cost} points</div>
      <button class="reward-btn ${userPoints < reward.cost ? 'disabled' : ''}"
              onclick="redeemReward('${reward.id}')"
              ${userPoints < reward.cost ? 'disabled' : ''}>
        ${userPoints < reward.cost ? 'Not enough points' : 'Redeem'}
      </button>
    </div>
  `).join('');
}

function redeemReward(rewardId) {
  // Implementation for reward redemption
  alert('Reward redeemed! Check your email for details.');
}

// Referral System
function generateReferralCode() {
  if (!state.user) return '';
  return `${state.user.name.toUpperCase().replace(/\s+/g, '').slice(0, 4)}${state.user.id.slice(-4)}`;
}

function loadReferralData() {
  if (!state.user) return;

  const referralCode = generateReferralCode();
  const referrals = state.user.referrals || [];
  const totalEarnings = referrals.reduce((sum, ref) => sum + (ref.earned || 0), 0);

  qs('#referralCode').textContent = referralCode;
  qs('#totalReferrals').textContent = referrals.length;
  qs('#referralEarnings').textContent = fmt.format(totalEarnings);

  loadReferralHistory();
}

function copyReferralCode() {
  const code = qs('#referralCode').textContent;
  navigator.clipboard.writeText(code).then(() => {
    alert('Referral code copied to clipboard!');
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('Referral code copied to clipboard!');
  });
}

function loadReferralHistory() {
  const referrals = state.user.referrals || [];
  const container = qs('#referralHistory');

  if (referrals.length === 0) {
    container.innerHTML = '<p class="muted">No referrals yet. Start sharing your code!</p>';
    return;
  }

  container.innerHTML = referrals.map(referral => `
    <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #eee;">
      <div>
        <div><strong>${referral.friendName}</strong></div>
        <div class="muted">Joined ${new Date(referral.date).toLocaleDateString()}</div>
        <div class="muted">Status: ${referral.status}</div>
      </div>
      <div style="text-align:right;">
        <div style="color:var(--green);">${fmt.format(referral.earned || 0)}</div>
        <div class="muted">earned</div>
      </div>
    </div>
  `).join('');
}

function addLoyaltyPoints(points, description) {
  if (!state.user) return;

  state.user.loyaltyPoints = (state.user.loyaltyPoints || 0) + points;
  state.user.pointsHistory = state.user.pointsHistory || [];
  state.user.pointsHistory.push({
    points,
    description,
    date: new Date().toISOString()
  });

  saveUser();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Login form
  qs('#loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = qs('#loginEmail').value;
    const password = qs('#loginPassword').value;
    
    if (login(email, password)) {
      alert('Login successful!');
    } else {
      alert('Invalid email or password');
    }
  });
  
  // Register form
  qs('#registerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const userData = {
      name: qs('#registerName').value,
      email: qs('#registerEmail').value,
      password: qs('#registerPassword').value,
      phone: qs('#registerPhone').value
    };
    
    const result = register(userData);
    if (result.success) {
      alert('Registration successful!');
    } else {
      alert(result.message);
    }
  });
  
  // Profile form
  qs('#profileForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const profileData = {
      name: qs('#profileName').value,
      email: qs('#profileEmail').value,
      phone: qs('#profilePhone').value
    };
    
    updateProfile(profileData);
    alert('Profile updated successfully!');
  });
  
  // Check if user is logged in
  if (state.user) {
    showAccountSection();
  } else {
    showLoginSection();
  }
});

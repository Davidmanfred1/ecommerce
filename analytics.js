// Analytics Dashboard Functionality

function loadAnalyticsData() {
  const analytics = JSON.parse(localStorage.getItem('analytics') || '{}');
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
  
  // Calculate key metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalCustomers = users.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Update metric cards
  qs('#totalRevenue').textContent = fmt.format(totalRevenue);
  qs('#totalOrders').textContent = totalOrders;
  qs('#totalCustomers').textContent = totalCustomers;
  qs('#avgOrderValue').textContent = fmt.format(avgOrderValue);
  
  // Calculate changes (mock data for demo)
  qs('#revenueChange').textContent = '+12.5%';
  qs('#ordersChange').textContent = '+8.3%';
  qs('#customersChange').textContent = '+15.2%';
  qs('#aovChange').textContent = '+3.7%';
  
  // Load other analytics
  loadTopProducts(orders);
  loadCustomerInsights(users, orders);
  loadProductPerformance(analytics);
  loadMarketingPerformance(subscribers, analytics);
  loadRecentActivity(orders);
}

function loadTopProducts(orders) {
  const productSales = {};
  
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.id]) {
        productSales[item.id] = {
          name: item.name,
          quantity: 0,
          revenue: 0
        };
      }
      productSales[item.id].quantity += item.qty;
      productSales[item.id].revenue += item.price * item.qty;
    });
  });
  
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  
  const container = qs('#topProducts');
  container.innerHTML = topProducts.map((product, index) => `
    <div class="top-product-item">
      <div class="product-rank">${index + 1}</div>
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-stats">
          ${product.quantity} sold • ${fmt.format(product.revenue)}
        </div>
      </div>
    </div>
  `).join('');
}

function loadCustomerInsights(users, orders) {
  const newCustomers = users.filter(user => {
    const joinDate = new Date(user.createdAt);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return joinDate > thirtyDaysAgo;
  }).length;
  
  const returningCustomers = users.filter(user => {
    const userOrders = orders.filter(order => order.userId === user.id);
    return userOrders.length > 1;
  }).length;
  
  const retentionRate = users.length > 0 ? (returningCustomers / users.length * 100).toFixed(1) : 0;
  
  qs('#newCustomers').textContent = newCustomers;
  qs('#returningCustomers').textContent = returningCustomers;
  qs('#retentionRate').textContent = `${retentionRate}%`;
}

function loadProductPerformance(analytics) {
  const productViews = analytics.productViews || {};
  const mostViewedId = Object.keys(productViews).reduce((a, b) => 
    productViews[a] > productViews[b] ? a : b, Object.keys(productViews)[0]
  );
  
  const mostViewedProduct = state.products.find(p => p.id === mostViewedId);
  qs('#mostViewed').textContent = mostViewedProduct ? mostViewedProduct.name : 'No data';
  
  // Calculate best selling category
  const categoryStats = {};
  state.products.forEach(product => {
    if (!categoryStats[product.category]) {
      categoryStats[product.category] = 0;
    }
    categoryStats[product.category] += productViews[product.id] || 0;
  });
  
  const bestCategory = Object.keys(categoryStats).reduce((a, b) => 
    categoryStats[a] > categoryStats[b] ? a : b, Object.keys(categoryStats)[0]
  );
  
  qs('#bestCategory').textContent = bestCategory || 'No data';
  
  // Inventory alerts
  const lowStockProducts = state.products.filter(p => p.stock <= 5 && p.stock > 0);
  const outOfStockProducts = state.products.filter(p => p.stock === 0);
  const totalAlerts = lowStockProducts.length + outOfStockProducts.length;
  
  qs('#inventoryAlerts').textContent = totalAlerts;
  if (totalAlerts > 0) {
    qs('#inventoryAlerts').classList.add('alert');
  }
}

function loadMarketingPerformance(subscribers, analytics) {
  qs('#newsletterSubs').textContent = subscribers.length;
  qs('#socialShares').textContent = analytics.socialShares || 0;
  qs('#referralConversions').textContent = analytics.referralConversions || 0;
}

function loadRecentActivity(orders) {
  const recentOrders = orders
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);
  
  const container = qs('#recentActivity');
  container.innerHTML = recentOrders.map(order => `
    <div class="activity-item">
      <div class="activity-icon">🛒</div>
      <div class="activity-content">
        <div class="activity-text">
          Order #${order.id} - ${fmt.format(order.total)}
        </div>
        <div class="activity-time">
          ${new Date(order.date).toLocaleDateString()} ${new Date(order.date).toLocaleTimeString()}
        </div>
      </div>
      <div class="activity-status status-${order.status}">
        ${order.status}
      </div>
    </div>
  `).join('');
}

// Generate sample analytics data for demo
function generateSampleData() {
  const analytics = JSON.parse(localStorage.getItem('analytics') || '{}');
  
  // Generate sample product views
  if (!analytics.productViews) {
    analytics.productViews = {};
    state.products.forEach(product => {
      analytics.productViews[product.id] = Math.floor(Math.random() * 100) + 10;
    });
  }
  
  // Generate sample social shares
  if (!analytics.socialShares) {
    analytics.socialShares = Math.floor(Math.random() * 50) + 20;
  }
  
  // Generate sample referral conversions
  if (!analytics.referralConversions) {
    analytics.referralConversions = Math.floor(Math.random() * 10) + 5;
  }
  
  localStorage.setItem('analytics', JSON.stringify(analytics));
}

// Initialize analytics dashboard
document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  generateSampleData();
  loadAnalyticsData();
  
  // Update data when date range changes
  qs('#dateRange').addEventListener('change', () => {
    loadAnalyticsData();
  });
  
  // Auto-refresh every 30 seconds
  setInterval(loadAnalyticsData, 30000);
});

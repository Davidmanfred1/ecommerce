# Akwaaba Threads - Ghanaian Clothing Ecommerce

A complete ecommerce website for a Ghanaian clothing brand featuring authentic African fashion, built with HTML, CSS, and JavaScript.

## 🌟 Enhanced Features

### 🛍️ Advanced Ecommerce
- **Product Catalog** - 8+ products with variants, colors, and detailed info
- **Smart Shopping Cart** - Discount codes, shipping calculator, save for later
- **Secure Checkout** - Paystack integration with loyalty points
- **Advanced Search** - Autocomplete, suggestions, smart filters
- **Product Variants** - Multiple colors, sizes, and stock tracking
- **Quick View** - Modal product preview without page reload
- **Product Comparison** - Compare up to 4 products side-by-side

### 🎨 Premium Product Experience
- **High-Quality Images** - Realistic SVG product illustrations
- **Image Zoom** - Click to zoom on product images
- **Image Galleries** - Multiple photos with thumbnail navigation
- **360° Product Views** - Interactive product rotation (framework ready)
- **Size & Color Selection** - Visual variant selection
- **Customer Reviews** - Star ratings, written reviews, photo uploads
- **Stock Alerts** - Real-time inventory with low stock warnings

### 👤 Advanced User Features
- **User Accounts** - Registration, login, profile with avatars
- **Loyalty Points System** - Earn points, tier progression, rewards catalog
- **Referral Program** - Share codes, earn rewards, track referrals
- **Order Management** - Detailed history, tracking, reorder functionality
- **Address Book** - Multiple shipping addresses
- **Wishlist** - Advanced wishlist with sharing capabilities

### 🤖 AI & Smart Features
- **AI Recommendations** - Personalized product suggestions
- **Smart Search** - Autocomplete with product, category, and tag suggestions
- **Chatbot Assistant** - Interactive help with product recommendations
- **Recently Viewed** - Track and display browsing history
- **Predictive Analytics** - Customer behavior insights

### 📱 Modern UI/UX
- **Loading States** - Skeleton screens and smooth transitions
- **Toast Notifications** - Real-time feedback for user actions
- **Infinite Scroll** - Seamless product loading
- **Advanced Animations** - Fade-in, slide-up, bounce effects
- **Mobile-First Design** - Optimized for all device sizes
- **Dark Mode Support** - Automatic theme detection

### 📊 Business Intelligence
- **Analytics Dashboard** - Sales, customers, and performance metrics
- **Inventory Management** - Stock alerts and product performance
- **Customer Insights** - Retention rates, lifetime value, segmentation
- **Marketing Analytics** - Newsletter, social shares, referral tracking
- **Real-time Reporting** - Live data updates and trend analysis

### 🌐 Social & Marketing
- **Social Sharing** - Facebook, Twitter, WhatsApp, Pinterest integration
- **Blog Platform** - Cultural stories and fashion insights
- **SEO Optimization** - Meta tags, structured data, sitemap
- **Newsletter System** - Advanced subscription management
- **Social Proof** - Customer reviews, ratings, testimonials

### 🎯 Cultural Authenticity
- **Ghana-themed Design** - Colors inspired by Ghana flag
- **Cultural Heritage** - Kente, Adinkra, and Ankara patterns
- **Traditional Products** - Authentic Ghanaian clothing and accessories
- **Educational Content** - Stories behind traditional designs
- **Local Artisan Support** - Highlighting craftsmanship and culture

## 🚀 Quick Start

### Option 1: Live Server (Recommended)
1. Install VS Code Live Server extension
2. Right-click `index.html` → "Open with Live Server"
3. Site opens at `http://localhost:5500`

### Option 2: Python Server
```bash
# In project directory
python -m http.server 5500
# Open http://localhost:5500
```

### Option 3: Node.js Server
```bash
npx serve .
# Follow the URL provided
```

## 💳 Payment Setup

1. Get your Paystack public key from [paystack.com](https://paystack.com)
2. Replace the placeholder in `index.html`:

```html
<script>
  window.PAYSTACK_PUBLIC_KEY = 'pk_test_your_actual_key_here';
</script>
```

3. For production, use `pk_live_` keys

## 📁 Project Structure

```
├── index.html              # Enhanced homepage with AI recommendations
├── product.html            # Advanced product detail pages
├── account.html            # User account with loyalty & referrals
├── wishlist.html           # Enhanced wishlist with sharing
├── about.html              # Brand story and cultural heritage
├── blog.html               # Fashion blog and cultural stories
├── analytics.html          # Business intelligence dashboard
├── faq.html                # Comprehensive FAQ
├── shipping.html           # Detailed shipping information
├── returns.html            # 30-day returns policy
├── styles.css              # Enhanced stylesheet with animations
├── app.js                  # Core JavaScript with AI features
├── account.js              # Account, loyalty, and referral system
├── wishlist.js             # Advanced wishlist functionality
├── analytics.js            # Business analytics and reporting
├── products.json           # Enhanced product data with variants
└── assets/
    └── images/             # High-quality product illustrations
```

## 🛍️ Enhanced Product Catalog

The site now includes 8+ premium products with variants:
- **Kente Pattern Shirt** - Traditional royal cloth design with multiple colors
- **Black Star Tee** - Ghana flag inspired with premium graphics
- **Adinkra Cap** - Cultural symbol embroidery with authentic patterns
- **Ankara Print Dress** - Vibrant African patterns with modern cuts
- **Kente Silk Scarf** - Luxury accessory with traditional weaving
- **Dashiki Shirt** - Classic African style with embroidered details
- **Kente Executive Blazer** - Professional wear with traditional lining
- **African Print Jumpsuit** - Modern silhouette with cultural prints
- **Traditional Smock** - Handcrafted by local artisans
- **Ankara Headwrap Set** - Versatile styling accessories

## 🎨 Customization

### Brand Colors
Edit CSS variables in `styles.css`:
```css
:root {
  --red: #EF3340;    /* Ghana flag red */
  --gold: #FDB913;   /* Ghana flag gold */
  --green: #009739;  /* Ghana flag green */
  --black: #111;     /* Primary text */
}
```

### Add Products
Edit `products.json`:
```json
{
  "id": "unique-id",
  "name": "Product Name",
  "category": "Shirts|Dresses|Accessories",
  "price": 200,
  "image": "assets/images/product.jpg",
  "images": ["image1.jpg", "image2.jpg"],
  "description": "Product description",
  "sizes": ["S", "M", "L", "XL"],
  "stock": 10,
  "rating": 4.5,
  "reviews": 15,
  "features": ["Feature 1", "Feature 2"]
}
```

### Replace Images
- Logo: `assets/images/logo.svg`
- Hero: `assets/images/hero.svg`
- Products: `assets/images/[product-name].svg`

## 📱 Mobile Features

- Touch-friendly interface
- Responsive product grid
- Mobile-optimized cart drawer
- Simplified navigation
- Optimized image sizes

## 🔧 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or support:
- Email: hello@akwaabathreads.com
- Phone: +233 50 123 4567

---

**Akwaaba!** Welcome to authentic Ghanaian fashion. 🇬🇭

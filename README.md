# LUMIERE | Digital Lookbook & Haute Couture Web Application

A minimalist luxury editorial web application built from Google Stitch designs. Features asymmetrical layouts, monochromatic typography, dynamic shopping bag, real-time wishlist, and full Supabase database integration.

---

## 🌟 Features Included

- **Editorial Homepage (`index.html`)**: Hero feature ("The Winter Anthology"), interactive category navigation, featured editorial grid, and quote statement.
- **Collection Listing (`collection.html`)**: Category filter buttons (All, Dresses, Outerwear, Tailoring, Accessories), live keyword search, price sorting, and dynamic product cards.
- **Dynamic Product Detail (`product.html`)**: URL parameter support (`?id=...`), multi-angle gallery with thumbnail switcher, interactive size selector, color selector, quantity counter, and "Add to Bag".
- **Curated Wishlist (`wishlist.html`)**: Persistent wishlist with local storage & Supabase sync, item removal, and "Move to Bag" action.
- **Interactive Shopping Bag Drawer**: Slide-over cart available on all pages with quantity adjustment, item removal, subtotal calculation, and instant checkout simulation.
- **Supabase Integration**:
  - Pre-built SQL schema (`supabase_schema.sql`) for `products`, `wishlist`, and `orders`.
  - In-app Supabase Settings modal to configure credentials directly or via `.env`.
  - Graceful fallback: Works out of the box even before database keys are entered!
- **1-Click Vercel Deployment**: Configured with `vercel.json` for zero-config publishing.

---

## 🗄️ Supabase Setup (2 Minutes)

1. Go to [supabase.com](https://supabase.com) and create or open your project.
2. In your Supabase dashboard, click **SQL Editor** -> **New Query**.
3. Copy all code from [`supabase_schema.sql`](supabase_schema.sql) and click **Run**.
4. Go to **Project Settings** -> **API**, copy your **Project URL** and **anon public key**.
5. Click the **Supabase** button in the website's top navigation bar (or bottom navigation bar) and paste your credentials. Done!

---

## 🚀 GitHub Push & Vercel Deployment

### Step 1: Commit to Git
Run in terminal:
```bash
git add .
git commit -m "feat: complete LUMIERE luxury lookbook web app with Supabase sync"
```

### Step 2: Push to GitHub
```bash
git branch -M main
git remote add origin https://github.com/shumailanafees1989-droid/stitch_home.git
git push -u origin main --force
```

### Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Select your repository `shumailanafees1989-droid/stitch_home`.
3. Click **Deploy**! (No build configuration needed; it will go live in seconds).

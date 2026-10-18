-- ====================================================================
-- LUMIERE Lookbook - Supabase Database Schema
-- Run this in your Supabase Project -> SQL Editor -> New Query -> Run
-- ====================================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subtitle TEXT,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    formatted_price TEXT NOT NULL,
    description TEXT,
    material TEXT,
    origin TEXT,
    care TEXT,
    images TEXT[] NOT NULL DEFAULT '{}',
    sizes TEXT[] NOT NULL DEFAULT '{}',
    colors JSONB NOT NULL DEFAULT '[]',
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Wishlist Table
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'guest_user',
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- 3. Create Orders / Cart Inquiries Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT,
    customer_email TEXT,
    items JSONB NOT NULL DEFAULT '[]',
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 5. Policies for public access (Read products, insert/delete wishlist for demo)
CREATE POLICY "Public read products" 
ON public.products FOR SELECT USING (true);

CREATE POLICY "Public read wishlist" 
ON public.wishlist FOR SELECT USING (true);

CREATE POLICY "Public insert wishlist" 
ON public.wishlist FOR INSERT WITH CHECK (true);

CREATE POLICY "Public delete wishlist" 
ON public.wishlist FOR DELETE USING (true);

CREATE POLICY "Public insert orders" 
ON public.orders FOR INSERT WITH CHECK (true);

-- 6. Seed Initial High-Fashion Products
INSERT INTO public.products (id, name, subtitle, category, price, formatted_price, description, material, origin, care, images, sizes, colors, featured)
VALUES
(
    'fluid-silk-slip-dress',
    'Fluid Silk Slip Dress',
    'Collection № 04 / L''Essence',
    'Dresses',
    890,
    '$890.00',
    'A masterclass in minimalist draping. This bias-cut silhouette is crafted from 32mm heavy-weight mulberry silk, designed to trace the contours of the body with a liquid-like finish.',
    '100% Mulberry Silk',
    'Milan, Italy',
    'Dry Clean Only',
    ARRAY[
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBPeOLVpYX8AArLWueEhfJVXNpbQaz7kstoCrEOxqvSOtHitciOf7rh0XTkmGBfng81LbBwyNI8nN6Uwjeigmj54y6GXi7lVrideJOLvJooqBZC8YT6oOzO5KfxGa0IlW3mL_sKfrR-lvZwvaiDEJDWDVNxvm-i3u4sTWnARr31MgbskTWV580j6jkuSF4sfoVgHt2w7pyK3gBg5mOwinrDZYriuNtOI3J3N-1_Gnk2qZ3v07OWrSdrGFvceJeL6SPVjAIau24uRzw',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBpkKP_ZyaC5JOQMv4yCwUSrEzhHCgMG37K30xI8JFAPwYTZD2xxmiLgWlWWrF-NnTx5U9a7eHZz3iGmYO5oO5HnaPUusIXeMD9YaJIfRfvbvzOPzpkiPaoLCYmdsQMpu_oCd_hATlq-NJRg-8PI6-Zhn2eHWo0tXc-hC8Zp4odTW9BEY8RbcH8Rb_VCM0XGctYPk2TLprbi3sa6AWOOCaVa2kXe92kAjtuMyB02Qmgh54vj-Z3D5a6i-a_Fdx4_VCryQ4qeTwqPfM'
    ],
    ARRAY['XS', 'S', 'M', 'L'],
    '[{"name": "Obsidian Black", "hex": "#0a0a0a"}, {"name": "Alabaster", "hex": "#f0ede8"}]'::jsonb,
    true
),
(
    'the-archival-trench',
    'The Archival Trench',
    '100% Virgin Wool',
    'Outerwear',
    1240,
    '$1,240.00',
    'An oversized double-breasted silhouette rendered in heavyweight virgin wool twill. Detailed with storm flaps, belted cuffs, and horn buttons.',
    '100% Virgin Wool',
    'Paris, France',
    'Specialist Clean',
    ARRAY[
        'https://lh3.googleusercontent.com/aida-public/AB6AXuApYsvpdRsRuz-CYxlD8bddEP4LDufTAE72JrWLoyMcwX9qz0pmIGHJKxjb4zOio8USQ_HAfaU8tBrxAqI1rdXVhLN1Ac6zZSoyyjTx_ScDvX1IuiGKpKEPewHuDPPi63JxY4U1RgoUEDloXbH9iv6IpdmFUoKruL1--M6NUud8DydhJ15Y8SOwDAaV0BFZZT_tQFxMJIVfil-2ege9S1BUC2pamtu06b7PhYYP4gOTVTIk_f_hQFkRJTxWHNOjNWTnMl6f9Usc8Gk'
    ],
    ARRAY['S', 'M', 'L', 'XL'],
    '[{"name": "Pitch Black", "hex": "#111111"}, {"name": "Oatmeal Melange", "hex": "#d8d3cd"}]'::jsonb,
    true
),
(
    'sculpted-silk-gown',
    'Sculpted Silk Gown',
    'Autumn / Winter ''24',
    'Dresses',
    2450,
    '$2,450.00',
    'An evening masterpiece featuring dramatic structured pleating, draped asymmetric neckline, and hand-finished invisible hems.',
    'Duchess Satin Silk',
    'Como, Italy',
    'Dry Clean Only',
    ARRAY[
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAXjm9gytZ_vcWUwuQtTUMW7UVTAGFj0tPbYXZa_Pb5veWnmekt9H4g_dD1BYk-gKY6P4W-55ImCXo7tVwRNaKQpvRHRVUljk5-ka7xFJ2ESLobdWw0V5tjiat3TloS6UFTRnSSKcqHWnxPfOMt2Vsw3RuLE_afbkAKafGbRUYzU-FlcmWLyW2lf8DFRMjJNXRNqlsZbOj5xklFzvlvKzByQVpQQ_rqhafTiVGiXXLMgdSLRih2uS28gVQmd5l1tiXULhOb5B8fd7Y'
    ],
    ARRAY['XS', 'S', 'M', 'L'],
    '[{"name": "Pure Onyx", "hex": "#080808"}]'::jsonb,
    true
),
(
    'structure-top',
    'Structure Top',
    'Sculpted Canvas',
    'Tailoring',
    480,
    '$480.00',
    'Rigid yet soft textured canvas top with a structured neckline and clean geometric silhouette.',
    'Woven Cotton Canvas',
    'Tokyo, Japan',
    'Hand Wash Cold',
    ARRAY[
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA0Oa5NwuxNmtGKYk7WaR0jE8K3b9rTqYrn1yO9TjTsCHOjLPPLuhtmeAx83GWzo-4tQdxQMexMSuwX4TakbQkoWBZSbmyaazwZ0_E7T3cLvpx1U_90Z137oSKwsRiDM_inKTKkh8OJNqypa9XDVzcQopGQ5NBiBGMS_FVheA9Td6k-7uYYFCVHQZdVcSUX5nvlbZk2mO8Z7i7THNzjbZKf1g-7dNl9i6DsGtFE7X0oUiE8HxQvecuCuk4emIU7Cwg0jvfNzaecQ3w'
    ],
    ARRAY['S', 'M', 'L'],
    '[{"name": "Deep Charcoal", "hex": "#222222"}]'::jsonb,
    false
)
ON CONFLICT (id) DO NOTHING;

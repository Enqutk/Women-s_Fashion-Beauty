import { pool } from "../../config/db";
import type { CreateProductInput, Product, UpdateProductInput } from "./product.model";

type ProductRow = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  image_url: string | null;
  category_id: number;
  category_name: string | null;
  is_on_sale: boolean;
  created_at: string;
  updated_at: string;
};

function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    imageUrl: row.image_url,
    categoryId: row.category_id,
    categoryName: row.category_name,
    isOnSale: row.is_on_sale,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function ensureProductsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      description TEXT,
      price NUMERIC(10,2) NOT NULL CHECK (price > 0),
      image_url TEXT,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      is_on_sale BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS is_on_sale BOOLEAN NOT NULL DEFAULT false;
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS products_category_id_idx
    ON products (category_id);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS products_created_at_idx
    ON products (created_at DESC);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS products_is_on_sale_idx
    ON products (is_on_sale);
  `);

  await pool.query(`
    INSERT INTO products (name, description, price, image_url, category_id, is_on_sale)
    SELECT p.name, p.description, p.price, p.image_url, c.id, p.is_on_sale
    FROM (
      VALUES
        ('Silk Wrap Midi Dress', 'Elegant satin midi dress with soft drape and waist tie.', 79.99::numeric, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80', 'clothing', false),
        ('Tailored Blazer Set', 'Structured blazer and pants set for office or occasion wear.', 119.00::numeric, 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80', 'clothing', true),
        ('Everyday Ribbed Top', 'Stretch ribbed top with premium cotton blend comfort.', 29.50::numeric, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80', 'clothing', false),
        ('Pleated Office Skirt', 'High waist pleated skirt with fluid movement.', 44.00::numeric, 'https://images.unsplash.com/photo-1583496661160-fb5886a13d77?auto=format&fit=crop&w=900&q=80', 'clothing', false),
        ('Cotton Lounge Set', 'Soft two piece cotton set for everyday comfort.', 52.00::numeric, 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80', 'clothing', true),
        ('Relaxed Denim Jacket', 'Classic denim layer with modern relaxed fit.', 65.00::numeric, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80', 'clothing', false),
        ('Floral Summer Maxi', 'Lightweight maxi dress with floral print details.', 73.00::numeric, 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80', 'clothing', false),
        ('Minimal Knit Cardigan', 'Fine knit cardigan for smart layering.', 48.00::numeric, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80', 'clothing', false),
        ('Linen Wide Leg Pants', 'Breathable linen pants with clean tailored line.', 58.00::numeric, 'https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=900&q=80', 'clothing', true),
        ('Square Neck Bodysuit', 'Sleek fitted bodysuit for polished styling.', 34.00::numeric, 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&w=900&q=80', 'clothing', false),

        ('Classic Leather Tote', 'Spacious leather tote for work, travel, and daily essentials.', 95.00::numeric, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80', 'bags', false),
        ('Mini Crossbody Bag', 'Compact crossbody with adjustable strap and gold hardware.', 54.00::numeric, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', 'bags', true),
        ('Woven Summer Handbag', 'Lightweight woven texture handbag with magnetic closure.', 49.99::numeric, 'https://images.unsplash.com/photo-1591561954555-607968c989ab?auto=format&fit=crop&w=900&q=80', 'bags', false),
        ('Structured Mini Satchel', 'Compact satchel with top handle and shoulder strap.', 63.00::numeric, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80', 'bags', false),
        ('Soft Quilted Shoulder Bag', 'Quilted shoulder bag with polished chain detail.', 72.00::numeric, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80', 'bags', true),
        ('Everyday Canvas Tote', 'Durable canvas tote for daily errands and travel.', 39.00::numeric, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80', 'bags', false),
        ('Bucket Bag Classic', 'Modern bucket silhouette with drawstring closure.', 57.00::numeric, 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&w=900&q=80', 'bags', false),
        ('Evening Clutch Satin', 'Satin clutch perfect for formal nights.', 41.00::numeric, 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=900&q=80', 'bags', false),
        ('Top Zip Work Bag', 'Professional top zip bag with laptop compartment.', 88.00::numeric, 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=900&q=80', 'bags', true),
        ('Pebble Grain Crossbody', 'Pebble leather look crossbody for city styling.', 59.00::numeric, 'https://images.unsplash.com/photo-1614179689702-355944cd0918?auto=format&fit=crop&w=900&q=80', 'bags', false),

        ('Pointed Heel Pumps', 'Polished pointed toe pumps for events and office looks.', 68.75::numeric, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80', 'shoes', false),
        ('Street Sneaker White', 'Minimal everyday sneaker with cushioned sole.', 72.00::numeric, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80', 'shoes', true),
        ('Ankle Strap Sandals', 'Comfort strap sandals with soft padded insole.', 45.00::numeric, 'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?auto=format&fit=crop&w=900&q=80', 'shoes', false),
        ('Platform Trainer Beige', 'Chunky platform trainer with lightweight feel.', 76.00::numeric, 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=900&q=80', 'shoes', false),
        ('Leather Loafer Black', 'Smart leather loafer for refined daily outfits.', 69.00::numeric, 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=900&q=80', 'shoes', false),
        ('Mesh Running Shoes', 'Breathable running pair with responsive cushioning.', 64.00::numeric, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80', 'shoes', true),
        ('Slide Sandal Essentials', 'Simple slip on sandal for warm days.', 29.00::numeric, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=900&q=80', 'shoes', false),
        ('Court Sneaker Pastel', 'Soft pastel court sneaker with everyday support.', 58.00::numeric, 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=80', 'shoes', false),
        ('Square Toe Mules', 'Minimal mules with clean square toe profile.', 49.00::numeric, 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=900&q=80', 'shoes', false),
        ('Knit Sock Boots', 'Stretch knit boots with sleek ankle fit.', 83.00::numeric, 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?auto=format&fit=crop&w=900&q=80', 'shoes', true),

        ('Hydrating Face Cream', 'Daily moisturizer with hyaluronic acid for smooth glow.', 24.99::numeric, 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80', 'beauty', false),
        ('Brightening Primer', 'Silky primer that smooths texture and extends makeup wear.', 19.00::numeric, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80', 'beauty', false),
        ('Nourishing Hair Mask', 'Deep conditioning mask for softness and shine.', 22.00::numeric, 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=900&q=80', 'beauty', true),
        ('Lash Defining Mascara', 'Buildable mascara for length and lift.', 17.00::numeric, 'https://images.unsplash.com/photo-1631730359585-38a4935cbec4?auto=format&fit=crop&w=900&q=80', 'beauty', false),
        ('Glow Mist Setting Spray', 'Fine mist setting spray with dewy finish.', 16.50::numeric, 'https://images.unsplash.com/photo-1556229174-5e42a09e45af?auto=format&fit=crop&w=900&q=80', 'beauty', false),
        ('Daily Brow Gel', 'Flexible hold brow gel for natural definition.', 13.00::numeric, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80', 'beauty', false),
        ('Tinted Lip Balm', 'Hydrating lip balm with sheer buildable color.', 12.00::numeric, 'https://images.unsplash.com/photo-1629198735660-e39ea93f5f5d?auto=format&fit=crop&w=900&q=80', 'beauty', false),
        ('Blush Duo Palette', 'Soft matte and satin blush duo for all day color.', 26.00::numeric, 'https://images.unsplash.com/photo-1583241800698-0b3d8a4a7f2e?auto=format&fit=crop&w=900&q=80', 'beauty', true),
        ('Body Glow Oil', 'Lightweight glow oil with subtle radiance.', 21.00::numeric, 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=900&q=80', 'beauty', false),
        ('Repair Night Serum', 'Overnight serum to support smoother skin texture.', 31.00::numeric, 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&w=900&q=80', 'beauty', true),

        ('Velvet Matte Lip Kit', 'Long wear matte lip color with matching liner.', 21.00::numeric, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80', 'makeup', true),
        ('Glow Foundation SPF', 'Buildable medium coverage with natural finish and SPF.', 32.00::numeric, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80', 'makeup', false),
        ('Cream Concealer', 'Lightweight concealer that blends seamlessly.', 18.00::numeric, 'https://images.unsplash.com/photo-1583241800698-0b3d8a4a7f2e?auto=format&fit=crop&w=900&q=80', 'makeup', false),
        ('Satin Finish Powder', 'Micro fine powder to set and blur.', 24.00::numeric, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80', 'makeup', false),
        ('Precision Eyeliner Pen', 'Smudge resistant liner with precise tip.', 14.00::numeric, 'https://images.unsplash.com/photo-1631730359585-38a4935cbec4?auto=format&fit=crop&w=900&q=80', 'makeup', false),
        ('Brow Sculpt Pencil', 'Fine tip pencil for natural brow strokes.', 13.50::numeric, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80', 'makeup', false),
        ('Nude Eyeshadow Quad', 'Four neutral shades in matte and shimmer.', 28.00::numeric, 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80', 'makeup', true),
        ('Soft Blush Stick', 'Blendable cream blush stick for quick glow.', 16.00::numeric, 'https://images.unsplash.com/photo-1571875257727-256c39da42af?auto=format&fit=crop&w=900&q=80', 'makeup', false),
        ('Highlighter Drops', 'Liquid highlighter for luminous finish.', 19.00::numeric, 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=900&q=80', 'makeup', false),
        ('Makeup Setting Spray', 'Weightless mist to lock makeup in place.', 18.50::numeric, 'https://images.unsplash.com/photo-1556229174-5e42a09e45af?auto=format&fit=crop&w=900&q=80', 'makeup', false),

        ('Vitamin C Serum', 'Brightening serum designed to even tone and boost radiance.', 27.50::numeric, 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&w=900&q=80', 'skincare', true),
        ('Gentle Foam Cleanser', 'Daily cleanser that removes impurities without drying skin.', 18.00::numeric, 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80', 'skincare', false),
        ('Hydra Gel Moisturizer', 'Oil free gel moisturizer with cooling hydration.', 23.00::numeric, 'https://images.unsplash.com/photo-1556228453-efd1f03b8c7b?auto=format&fit=crop&w=900&q=80', 'skincare', false),
        ('Peptide Eye Cream', 'Targeted eye cream for smoother under eye area.', 29.00::numeric, 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?auto=format&fit=crop&w=900&q=80', 'skincare', false),
        ('Ceramide Barrier Cream', 'Rich moisturizer to support skin barrier.', 26.00::numeric, 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80', 'skincare', false),
        ('PHA Toner Essence', 'Gentle exfoliating toner for daily renewal.', 21.00::numeric, 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=900&q=80', 'skincare', false),
        ('Overnight Repair Cream', 'Night cream formulated for deeper hydration.', 33.00::numeric, 'https://images.unsplash.com/photo-1629198735660-e39ea93f5f5d?auto=format&fit=crop&w=900&q=80', 'skincare', true),
        ('SPF 50 Daily Shield', 'Light sunscreen with no white cast.', 19.00::numeric, 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=900&q=80', 'skincare', false),
        ('Niacinamide Booster', 'Balancing booster serum for texture and tone.', 24.50::numeric, 'https://images.unsplash.com/photo-1556229174-5e42a09e45af?auto=format&fit=crop&w=900&q=80', 'skincare', false),
        ('Clay Purifying Mask', 'Weekly clay mask for deep pore refresh.', 20.00::numeric, 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?auto=format&fit=crop&w=900&q=80', 'skincare', false),

        ('Rose Oud Perfume', 'Warm rose oud fragrance with rich amber notes.', 64.00::numeric, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80', 'perfume', true),
        ('Citrus Bloom Eau De Parfum', 'Fresh floral citrus blend for everyday elegance.', 58.00::numeric, 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80', 'perfume', false),
        ('Amber Vanilla Mist', 'Soft warm mist with amber and vanilla tones.', 39.00::numeric, 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=900&q=80', 'perfume', false),
        ('Jasmine Noir Elixir', 'Intense jasmine scent with musky depth.', 71.00::numeric, 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=80', 'perfume', true),
        ('Fresh Linen Cologne', 'Clean airy fragrance for day wear.', 42.00::numeric, 'https://images.unsplash.com/photo-1519669011783-4eaa95fa1b7d?auto=format&fit=crop&w=900&q=80', 'perfume', false),
        ('Garden Peony Spray', 'Floral peony blend with light fruity notes.', 49.00::numeric, 'https://images.unsplash.com/photo-1595425964071-3b7c65dd0d9f?auto=format&fit=crop&w=900&q=80', 'perfume', false),
        ('Ocean Breeze Eau', 'Fresh aquatic scent with marine notes.', 45.00::numeric, 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=900&q=80', 'perfume', false),
        ('Velvet Musk Perfume', 'Smooth musk blend with soft powder finish.', 66.00::numeric, 'https://images.unsplash.com/photo-1588405748880-12d1d2a59c75?auto=format&fit=crop&w=900&q=80', 'perfume', true),
        ('Cedar Night Essence', 'Deep woody profile for evening wear.', 62.00::numeric, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80', 'perfume', false),
        ('Sunlit Neroli', 'Bright neroli and citrus signature fragrance.', 55.00::numeric, 'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=900&q=80', 'perfume', false),

        ('Gold Hoop Earrings', 'Polished lightweight hoops for daily styling.', 16.00::numeric, 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80', 'accessories', false),
        ('Oval Sunglasses', 'UV protected retro sunglasses with slim metal frame.', 22.00::numeric, 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=900&q=80', 'accessories', false),
        ('Layered Chain Necklace', 'Two layer chain necklace with minimal design.', 19.00::numeric, 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80', 'accessories', false),
        ('Pearl Stud Set', 'Classic pearl studs for elegant daily wear.', 14.00::numeric, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80', 'accessories', false),
        ('Slim Leather Belt', 'Refined leather belt with polished buckle.', 24.00::numeric, 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=900&q=80', 'accessories', false),
        ('Crystal Hair Clip Pack', 'Decorative clip set for occasion styling.', 12.00::numeric, 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?auto=format&fit=crop&w=900&q=80', 'accessories', false),
        ('Minimal Ring Stack', 'Set of slim rings for layered look.', 18.00::numeric, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80', 'accessories', true),
        ('Canvas Baseball Cap', 'Adjustable cap with clean embroidered logo.', 15.00::numeric, 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80', 'accessories', false),
        ('Silk Hair Scarf', 'Printed silk scarf for hair or bag styling.', 17.00::numeric, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80', 'accessories', false),
        ('Signature Wrist Watch', 'Minimal wrist watch with classic face.', 59.00::numeric, 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80', 'accessories', true)
    ) AS p(name, description, price, image_url, category_name, is_on_sale)
    JOIN categories c ON c.name = p.category_name
    WHERE NOT EXISTS (
      SELECT 1
      FROM products existing
      WHERE LOWER(existing.name) = LOWER(p.name)
    );
  `);
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const { rows } = await pool.query<ProductRow>(
    `INSERT INTO products (name, description, price, image_url, category_id, is_on_sale)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, description, price, image_url, category_id, is_on_sale,
       (SELECT name FROM categories WHERE id = category_id) AS category_name,
       created_at, updated_at`,
    [
      input.name,
      input.description ?? null,
      input.price,
      input.imageUrl ?? null,
      input.categoryId,
      input.isOnSale ?? false,
    ],
  );

  return mapProductRow(rows[0]);
}

export async function listProducts(): Promise<Product[]> {
  const { rows } = await pool.query<ProductRow>(
    `SELECT p.id,
            p.name,
            p.description,
            p.price,
            p.image_url,
            p.category_id,
            p.is_on_sale,
            c.name AS category_name,
            p.created_at,
            p.updated_at
     FROM products p
     JOIN categories c ON c.id = p.category_id
     ORDER BY p.id DESC`,
  );
  return rows.map(mapProductRow);
}

export async function getProductById(id: number): Promise<Product | null> {
  const { rows } = await pool.query<ProductRow>(
    `SELECT p.id,
            p.name,
            p.description,
            p.price,
            p.image_url,
            p.category_id,
            p.is_on_sale,
            c.name AS category_name,
            p.created_at,
            p.updated_at
     FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE p.id = $1
     LIMIT 1`,
    [id],
  );
  return rows[0] ? mapProductRow(rows[0]) : null;
}

export async function updateProduct(
  id: number,
  input: UpdateProductInput,
): Promise<Product | null> {
  const current = await getProductById(id);
  if (!current) {
    return null;
  }

  const { rows } = await pool.query<ProductRow>(
    `UPDATE products
     SET name = $1,
         description = $2,
         price = $3,
         image_url = $4,
         category_id = $5,
         is_on_sale = $6,
         updated_at = NOW()
     WHERE id = $7
     RETURNING id, name, description, price, image_url, category_id, is_on_sale,
       (SELECT name FROM categories WHERE id = category_id) AS category_name,
       created_at, updated_at`,
    [
      input.name ?? current.name,
      input.description ?? current.description,
      input.price ?? current.price,
      input.imageUrl ?? current.imageUrl,
      input.categoryId ?? current.categoryId,
      input.isOnSale ?? current.isOnSale,
      id,
    ],
  );

  return rows[0] ? mapProductRow(rows[0]) : null;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const { rowCount } = await pool.query(`DELETE FROM products WHERE id = $1`, [id]);
  return (rowCount ?? 0) > 0;
}

export async function countProducts(): Promise<number> {
  const { rows } = await pool.query<{ total: string }>(
    `SELECT COUNT(*)::text AS total FROM products`,
  );
  return Number(rows[0]?.total ?? 0);
}

// Mock product & category data for MIP Jewellers

export const categories = [
  { slug: 'earrings',   label: 'Earrings',      image: '/images/product_earrings_1.png',               description: 'Elegant drops to stunning jhumkas' },
  { slug: 'bangles',    label: 'Bangles',        image: '/images/category_bangles_1779203423031.png',    description: 'Traditional kadas to modern stacks' },
  { slug: 'chains',     label: 'Chains',         image: '/images/luxury_gold_hero_1779199654262.png',    description: 'Delicate to bold gold chains' },
  { slug: 'rings',      label: 'Rings',          image: '/images/modern_diamonds_1779199687171.png',     description: 'Solitaires, eternity bands & more' },
  { slug: 'coins-bars', label: 'Coins & Bars',   image: '/images/luxury_gold_hero_1779199654262.png',    description: 'BIS Hallmarked 22KT & 24KT gold' },
  { slug: 'necklaces',  label: 'Necklaces',      image: '/images/bridal_jewellery_1779199671286.png',    description: 'Temple sets to contemporary pendants' },
];

export const products = [
  // Earrings
  { id: 'e1', slug: 'lotus-diamond-drops',      name: 'Lotus Diamond Drops',         category: 'earrings',   image: '/images/product_earrings_1.png',             price: 28500, weight: '3.2g', metal: '18KT Gold', stone: 'Diamond', tag: 'New', gender: 'Women' },
  { id: 'e2', slug: 'classic-jhumka',           name: 'Classic Jhumka',              category: 'earrings',   image: '/images/product_earrings_1.png',             price: 18900, weight: '5.1g', metal: '22KT Gold', stone: null,      tag: null, gender: 'Women' },
  { id: 'e3', slug: 'pearl-drop-studs',         name: 'Pearl Drop Studs',            category: 'earrings',   image: '/images/product_earrings_1.png',             price: 12400, weight: '2.8g', metal: '18KT Gold', stone: 'Pearl',   tag: 'Bestseller', gender: 'Women' },
  { id: 'e4', slug: 'heritage-chandbali',       name: 'Heritage Chandbali',          category: 'earrings',   image: '/images/product_earrings_1.png',              price: 34200, weight: '7.6g', metal: '22KT Gold', stone: null,      tag: null, gender: 'Women' },
  { id: 'e5', slug: 'floral-studs',             name: 'Floral Diamond Studs',        category: 'earrings',   image: '/images/product_earrings_1.png',             price: 22100, weight: '2.1g', metal: '18KT Gold', stone: 'Diamond', tag: null, gender: 'Kids' },
  { id: 'e6', slug: 'temple-jhumka',            name: 'Temple Jhumka',               category: 'earrings',   image: '/images/product_earrings_1.png',              price: 26700, weight: '6.3g', metal: '22KT Gold', stone: null,      tag: 'New', gender: 'Women' },

  // Bangles
  { id: 'b1', slug: 'classic-gold-bangle',      name: 'Classic Plain Bangle Set',    category: 'bangles',    image: '/images/category_bangles_1779203423031.png',  price: 42000, weight: '14.2g', metal: '22KT Gold', stone: null,      tag: 'Bestseller', gender: 'Women' },
  { id: 'b2', slug: 'diamond-bangle',           name: 'Diamond Bangle',              category: 'bangles',    image: '/images/category_bangles_1779203423031.png',  price: 68500, weight: '9.8g',  metal: '18KT Gold', stone: 'Diamond', tag: null, gender: 'Women' },
  { id: 'b3', slug: 'temple-kada',              name: 'Temple Kada',                 category: 'bangles',    image: '/images/category_bangles_1779203423031.png',  price: 55200, weight: '18.4g', metal: '22KT Gold', stone: null,      tag: null, gender: 'Women' },
  { id: 'b4', slug: 'floral-bangle-pair',       name: 'Floral Bangle Pair',          category: 'bangles',    image: '/images/category_bangles_1779203423031.png',  price: 38900, weight: '12.1g', metal: '22KT Gold', stone: null,      tag: 'New', gender: 'Women' },
  { id: 'b5', slug: 'ruby-bangle',             name: 'Ruby Studded Bangle',         category: 'bangles',    image: '/images/category_bangles_1779203423031.png',  price: 49800, weight: '11.6g', metal: '22KT Gold', stone: 'Ruby',    tag: null, gender: 'Women' },
  { id: 'b6', slug: 'antique-bangle',          name: 'Antique Finish Bangle',       category: 'bangles',    image: '/images/category_bangles_1779203423031.png',  price: 33600, weight: '10.4g', metal: '22KT Gold', stone: null,      tag: null, gender: 'Women' },

  // Chains
  { id: 'c1', slug: 'singapore-chain',          name: 'Singapore Chain',             category: 'chains',     image: '/images/luxury_gold_hero_1779199654262.png',  price: 24300, weight: '5.4g',  metal: '22KT Gold', stone: null,      tag: 'Bestseller', gender: 'Women' },
  { id: 'c2', slug: 'box-chain',               name: 'Box Chain',                   category: 'chains',     image: '/images/luxury_gold_hero_1779199654262.png',  price: 19800, weight: '4.2g',  metal: '22KT Gold', stone: null,      tag: null, gender: 'Men' },
  { id: 'c3', slug: 'figaro-chain',            name: 'Figaro Chain',                category: 'chains',     image: '/images/luxury_gold_hero_1779199654262.png',  price: 31400, weight: '7.8g',  metal: '22KT Gold', stone: null,      tag: null, gender: 'Men' },
  { id: 'c4', slug: 'rope-chain',              name: 'Rope Chain',                  category: 'chains',     image: '/images/luxury_gold_hero_1779199654262.png',  price: 27600, weight: '6.5g',  metal: '22KT Gold', stone: null,      tag: 'New', gender: 'Men' },
  { id: 'c5', slug: 'diamond-chain',           name: 'Diamond Station Chain',       category: 'chains',     image: '/images/luxury_gold_hero_1779199654262.png',  price: 45200, weight: '5.1g',  metal: '18KT Gold', stone: 'Diamond', tag: null, gender: 'Women' },
  { id: 'c6', slug: 'cable-chain',             name: 'Cable Chain',                 category: 'chains',     image: '/images/luxury_gold_hero_1779199654262.png',  price: 16900, weight: '3.8g',  metal: '22KT Gold', stone: null,      tag: null, gender: 'Women' },

  // Rings
  { id: 'r1', slug: 'solitaire-diamond-ring',  name: 'Solitaire Diamond Ring',      category: 'rings',      image: '/images/modern_diamonds_1779199687171.png',   price: 52000, weight: '3.4g',  metal: '18KT Gold', stone: 'Diamond', tag: 'Bestseller', gender: 'Women' },
  { id: 'r2', slug: 'cluster-ring',            name: 'Diamond Cluster Ring',        category: 'rings',      image: '/images/modern_diamonds_1779199687171.png',   price: 38700, weight: '4.2g',  metal: '18KT Gold', stone: 'Diamond', tag: null, gender: 'Women' },
  { id: 'r3', slug: 'plain-gold-ring',         name: 'Plain Band Ring',             category: 'rings',      image: '/images/modern_diamonds_1779199687171.png',   price: 14200, weight: '3.8g',  metal: '22KT Gold', stone: null,      tag: null, gender: 'Men' },
  { id: 'r4', slug: 'ruby-ring',              name: 'Ruby Halo Ring',              category: 'rings',      image: '/images/modern_diamonds_1779199687171.png',   price: 29500, weight: '3.6g',  metal: '18KT Gold', stone: 'Ruby',    tag: 'New', gender: 'Women' },
  { id: 'r5', slug: 'eternity-band',          name: 'Diamond Eternity Band',       category: 'rings',      image: '/images/modern_diamonds_1779199687171.png',   price: 64800, weight: '3.2g',  metal: '18KT Gold', stone: 'Diamond', tag: null, gender: 'Women' },
  { id: 'r6', slug: 'temple-ring',            name: 'Temple Ring',                 category: 'rings',      image: '/images/modern_diamonds_1779199687171.png',   price: 18400, weight: '4.8g',  metal: '22KT Gold', stone: null,      tag: null, gender: 'Women' },

  // Coins & Bars
  { id: 'cb1', slug: 'lakshmi-coin-1g',       name: 'Lakshmi Gold Coin 1g',        category: 'coins-bars', image: '/images/luxury_gold_hero_1779199654262.png',  price: 7500,  weight: '1g',    metal: '24KT Gold', stone: null,      tag: null, gender: 'Kids' },
  { id: 'cb2', slug: 'lakshmi-coin-5g',       name: 'Lakshmi Gold Coin 5g',        category: 'coins-bars', image: '/images/luxury_gold_hero_1779199654262.png',  price: 37200, weight: '5g',    metal: '24KT Gold', stone: null,      tag: 'Bestseller', gender: 'Women' },
  { id: 'cb3', slug: 'gold-bar-10g',          name: 'MIP Gold Bar 10g',            category: 'coins-bars', image: '/images/luxury_gold_hero_1779199654262.png',  price: 72800, weight: '10g',   metal: '24KT Gold', stone: null,      tag: null, gender: 'Men' },
  { id: 'cb4', slug: 'gold-bar-20g',          name: 'MIP Gold Bar 20g',            category: 'coins-bars', image: '/images/luxury_gold_hero_1779199654262.png',  price: 144600, weight: '20g', metal: '24KT Gold', stone: null,      tag: null, gender: 'Men' },
  { id: 'cb5', slug: 'ganesh-coin-2g',        name: 'Ganesh Gold Coin 2g',         category: 'coins-bars', image: '/images/luxury_gold_hero_1779199654262.png',  price: 14800, weight: '2g',    metal: '24KT Gold', stone: null,      tag: 'New', gender: 'Kids' },
  { id: 'cb6', slug: 'gold-coin-8g',          name: 'Round Gold Coin 8g',          category: 'coins-bars', image: '/images/luxury_gold_hero_1779199654262.png',  price: 58200, weight: '8g',    metal: '24KT Gold', stone: null,      tag: null, gender: 'Women' },

  // Necklaces
  { id: 'n1', slug: 'temple-necklace',        name: 'Temple Gold Necklace',        category: 'necklaces',  image: '/images/bridal_jewellery_1779199671286.png',  price: 124000, weight: '32.4g', metal: '22KT Gold', stone: null,      tag: 'Bestseller', gender: 'Women' },
  { id: 'n2', slug: 'diamond-pendant-set',    name: 'Diamond Pendant Necklace',    category: 'necklaces',  image: '/images/bridal_jewellery_1779199671286.png',  price: 86500,  weight: '8.2g',  metal: '18KT Gold', stone: 'Diamond', tag: null, gender: 'Women' },
  { id: 'n3', slug: 'ruby-choker',           name: 'Ruby Gold Choker',            category: 'necklaces',  image: '/images/bridal_jewellery_1779199671286.png',  price: 98200,  weight: '24.6g', metal: '22KT Gold', stone: 'Ruby',    tag: 'New', gender: 'Women' },
  { id: 'n4', slug: 'long-gold-chain',       name: 'Opera Length Gold Chain',     category: 'necklaces',  image: '/images/luxury_gold_hero_1779199654262.png',  price: 54300,  weight: '18.8g', metal: '22KT Gold', stone: null,      tag: null, gender: 'Women' },
  { id: 'n5', slug: 'antique-haram',         name: 'Antique Gold Haram',          category: 'necklaces',  image: '/images/bridal_jewellery_1779199671286.png',  price: 188000, weight: '52.4g', metal: '22KT Gold', stone: null,      tag: null, gender: 'Women' },
  { id: 'n6', slug: 'pearl-necklace',        name: 'Pearl & Gold Necklace',       category: 'necklaces',  image: '/images/bridal_jewellery_1779199671286.png',  price: 44800,  weight: '12.1g', metal: '18KT Gold', stone: 'Pearl',   tag: null, gender: 'Women' },
];

export function getProductsByCategory(slug) {
  return products.filter((p) => p.category === slug);
}

export function getProductById(id) {
  return products.find((p) => p.id === id || p.slug === id) || null;
}

export function getCategoryBySlug(slug) {
  return categories.find((c) => c.slug === slug) || null;
}

export function formatPrice(n) {
  return '₹' + n.toLocaleString('en-IN');
}

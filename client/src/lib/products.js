// Mock product & category data for MIP Jewellers

export const categories = [
  { slug: 'earrings',   label: 'Earrings',      image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780594799/mip_jewellers/premium/f5ffadsapwwiyjv2opdx.jpg',               description: 'Elegant drops to stunning jhumkas' },
  { slug: 'bangles',    label: 'Bangles',        image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780594801/mip_jewellers/premium/m62lixzly2olf5lvmvis.jpg',    description: 'Traditional kadas to modern stacks' },
  { slug: 'chains',     label: 'Chains',         image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780594803/mip_jewellers/premium/smamryqbfmzh0zchgnpz.jpg',    description: 'Delicate to bold gold chains' },
  { slug: 'rings',      label: 'Rings',          image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780594804/mip_jewellers/premium/sugbfup0cpqbmw22h9nw.jpg',     description: 'Solitaires, eternity bands & more' },
  { slug: 'coins-bars', label: 'Coins & Bars',   image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780594806/mip_jewellers/premium/sxcv8eebqnbfs3lwpogq.jpg',    description: 'BIS Hallmarked 22KT & 24KT gold' },
  { slug: 'necklaces',  label: 'Necklaces',      image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780594808/mip_jewellers/premium/sr346hvhhh015hgzhxqs.jpg',    description: 'Temple sets to contemporary pendants' },
];

export const products = [
  // Earrings
  { id: 'e1', slug: 'lotus-diamond-drops',      name: 'Lotus Diamond Drops',         category: 'earrings',   image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595267/mip_jewellers/unique/jeu7lmdxmzcyi58iw6qk.jpg',             price: 28500, weight: '3.2g', metal: '18KT Gold', stone: 'Diamond', tag: 'New', gender: 'Women' },
  { id: 'e2', slug: 'classic-jhumka',           name: 'Classic Jhumka',              category: 'earrings',   image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595269/mip_jewellers/unique/rfzeuingral4mxus6vak.jpg',             price: 18900, weight: '5.1g', metal: '22KT Gold', stone: null,      tag: null, gender: 'Women' },
  { id: 'e3', slug: 'pearl-drop-studs',         name: 'Pearl Drop Studs',            category: 'earrings',   image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595271/mip_jewellers/unique/cz52o21im0blbhfmliap.jpg',             price: 12400, weight: '2.8g', metal: '18KT Gold', stone: 'Pearl',   tag: 'Bestseller', gender: 'Women' },
  { id: 'e4', slug: 'heritage-chandbali',       name: 'Heritage Chandbali',          category: 'earrings',   image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595272/mip_jewellers/unique/ec7c0bu6yxz7mc5pi95p.jpg',              price: 34200, weight: '7.6g', metal: '22KT Gold', stone: null,      tag: null, gender: 'Women' },
  { id: 'e5', slug: 'floral-studs',             name: 'Floral Diamond Studs',        category: 'earrings',   image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595274/mip_jewellers/unique/f0qz7ydgzkfqnocycstk.jpg',             price: 22100, weight: '2.1g', metal: '18KT Gold', stone: 'Diamond', tag: null, gender: 'Kids' },
  { id: 'e6', slug: 'temple-jhumka',            name: 'Temple Jhumka',               category: 'earrings',   image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595276/mip_jewellers/unique/ircj1k2mfubalywgwbmq.jpg',              price: 26700, weight: '6.3g', metal: '22KT Gold', stone: null,      tag: 'New', gender: 'Women' },

  // Bangles
  { id: 'b1', slug: 'classic-gold-bangle',      name: 'Classic Plain Bangle Set',    category: 'bangles',    image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595277/mip_jewellers/unique/eqqntvshch19zgboawcm.jpg',  price: 42000, weight: '14.2g', metal: '22KT Gold', stone: null,      tag: 'Bestseller', gender: 'Women' },
  { id: 'b2', slug: 'diamond-bangle',           name: 'Diamond Bangle',              category: 'bangles',    image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595279/mip_jewellers/unique/ly0onmtfsapvou52rbit.jpg',  price: 68500, weight: '9.8g',  metal: '18KT Gold', stone: 'Diamond', tag: null, gender: 'Women' },
  { id: 'b3', slug: 'temple-kada',              name: 'Temple Kada',                 category: 'bangles',    image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595280/mip_jewellers/unique/duipegxqocpzzslnzuhz.jpg',  price: 55200, weight: '18.4g', metal: '22KT Gold', stone: null,      tag: null, gender: 'Women' },
  { id: 'b4', slug: 'floral-bangle-pair',       name: 'Floral Bangle Pair',          category: 'bangles',    image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595282/mip_jewellers/unique/bnqgcsbokbkfkfebkrut.jpg',  price: 38900, weight: '12.1g', metal: '22KT Gold', stone: null,      tag: 'New', gender: 'Women' },
  { id: 'b5', slug: 'ruby-bangle',             name: 'Ruby Studded Bangle',         category: 'bangles',    image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595284/mip_jewellers/unique/qumcee6ejues8wpatljv.jpg',  price: 49800, weight: '11.6g', metal: '22KT Gold', stone: 'Ruby',    tag: null, gender: 'Women' },
  { id: 'b6', slug: 'antique-bangle',          name: 'Antique Finish Bangle',       category: 'bangles',    image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595627/mip_jewellers/seeded/nsunx43nauextcq0p8fn.jpg',  price: 33600, weight: '10.4g', metal: '22KT Gold', stone: null,      tag: null, gender: 'Women' },

  // Chains
  { id: 'c1', slug: 'singapore-chain',          name: 'Singapore Chain',             category: 'chains',     image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780594803/mip_jewellers/premium/smamryqbfmzh0zchgnpz.jpg',  price: 24300, weight: '5.4g',  metal: '22KT Gold', stone: null,      tag: 'Bestseller', gender: 'Women' },
  { id: 'c2', slug: 'box-chain',               name: 'Box Chain',                   category: 'chains',     image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595628/mip_jewellers/seeded/texwfs7jndihoh1b30uz.jpg',  price: 19800, weight: '4.2g',  metal: '22KT Gold', stone: null,      tag: null, gender: 'Men' },
  { id: 'c3', slug: 'figaro-chain',            name: 'Figaro Chain',                category: 'chains',     image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595629/mip_jewellers/seeded/lamgtzt7parcjnhnewnl.jpg',  price: 31400, weight: '7.8g',  metal: '22KT Gold', stone: null,      tag: null, gender: 'Men' },
  { id: 'c4', slug: 'rope-chain',              name: 'Rope Chain',                  category: 'chains',     image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595630/mip_jewellers/seeded/ghoqylgxmarzc7d3vutj.jpg',  price: 27600, weight: '6.5g',  metal: '22KT Gold', stone: null,      tag: 'New', gender: 'Men' },
  { id: 'c5', slug: 'diamond-chain',           name: 'Diamond Station Chain',       category: 'chains',     image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595631/mip_jewellers/seeded/yn2cfnmbynkadfoughsp.jpg',  price: 45200, weight: '5.1g',  metal: '18KT Gold', stone: 'Diamond', tag: null, gender: 'Women' },
  { id: 'c6', slug: 'cable-chain',             name: 'Cable Chain',                 category: 'chains',     image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595632/mip_jewellers/seeded/lfuz192aqicfrk6qgra7.jpg',  price: 16900, weight: '3.8g',  metal: '22KT Gold', stone: null,      tag: null, gender: 'Women' },

  // Rings
  { id: 'r1', slug: 'solitaire-diamond-ring',  name: 'Solitaire Diamond Ring',      category: 'rings',      image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780594804/mip_jewellers/premium/sugbfup0cpqbmw22h9nw.jpg',   price: 52000, weight: '3.4g',  metal: '18KT Gold', stone: 'Diamond', tag: 'Bestseller', gender: 'Women' },
  { id: 'r2', slug: 'cluster-ring',            name: 'Diamond Cluster Ring',        category: 'rings',      image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595632/mip_jewellers/seeded/mia7sey7g5gbmxulkoqm.jpg',   price: 38700, weight: '4.2g',  metal: '18KT Gold', stone: 'Diamond', tag: null, gender: 'Women' },
  { id: 'r3', slug: 'plain-gold-ring',         name: 'Plain Band Ring',             category: 'rings',      image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595633/mip_jewellers/seeded/zg5wo8zw8blytlqndjoz.jpg',   price: 14200, weight: '3.8g',  metal: '22KT Gold', stone: null,      tag: null, gender: 'Men' },
  { id: 'r4', slug: 'ruby-ring',              name: 'Ruby Halo Ring',              category: 'rings',      image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595634/mip_jewellers/seeded/kaldtc50tmjrdpjr02lu.jpg',   price: 29500, weight: '3.6g',  metal: '18KT Gold', stone: 'Ruby',    tag: 'New', gender: 'Women' },
  { id: 'r5', slug: 'eternity-band',          name: 'Diamond Eternity Band',       category: 'rings',      image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595635/mip_jewellers/seeded/hmvtpnn1v9gxwseiv1bl.jpg',   price: 64800, weight: '3.2g',  metal: '18KT Gold', stone: 'Diamond', tag: null, gender: 'Women' },
  { id: 'r6', slug: 'temple-ring',            name: 'Temple Ring',                 category: 'rings',      image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595636/mip_jewellers/seeded/vljrwbuvuoj4xvz1szrq.jpg',   price: 18400, weight: '4.8g',  metal: '22KT Gold', stone: null,      tag: null, gender: 'Women' },

  // Coins & Bars
  { id: 'cb1', slug: 'lakshmi-coin-1g',       name: 'Lakshmi Gold Coin 1g',        category: 'coins-bars', image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780594806/mip_jewellers/premium/sxcv8eebqnbfs3lwpogq.jpg',  price: 7500,  weight: '1g',    metal: '24KT Gold', stone: null,      tag: null, gender: 'Kids' },
  { id: 'cb2', slug: 'lakshmi-coin-5g',       name: 'Lakshmi Gold Coin 5g',        category: 'coins-bars', image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595637/mip_jewellers/seeded/trocadsqp0biypmfou1j.jpg',  price: 37200, weight: '5g',    metal: '24KT Gold', stone: null,      tag: 'Bestseller', gender: 'Women' },
  { id: 'cb3', slug: 'gold-bar-10g',          name: 'MIP Gold Bar 10g',            category: 'coins-bars', image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595638/mip_jewellers/seeded/ognxc8ccrf5koyoenbzo.jpg',  price: 72800, weight: '10g',   metal: '24KT Gold', stone: null,      tag: null, gender: 'Men' },
  { id: 'cb4', slug: 'gold-bar-20g',          name: 'MIP Gold Bar 20g',            category: 'coins-bars', image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595638/mip_jewellers/seeded/zqpqk6zwvianyhkednkg.jpg',  price: 144600, weight: '20g', metal: '24KT Gold', stone: null,      tag: null, gender: 'Men' },
  { id: 'cb5', slug: 'ganesh-coin-2g',        name: 'Ganesh Gold Coin 2g',         category: 'coins-bars', image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595639/mip_jewellers/seeded/zypfan9kle2bvb8ut14p.jpg',  price: 14800, weight: '2g',    metal: '24KT Gold', stone: null,      tag: 'New', gender: 'Kids' },
  { id: 'cb6', slug: 'gold-coin-8g',          name: 'Round Gold Coin 8g',          category: 'coins-bars', image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595640/mip_jewellers/seeded/rrvdmie8hopzsnxgx4z9.jpg',  price: 58200, weight: '8g',    metal: '24KT Gold', stone: null,      tag: null, gender: 'Women' },

  // Necklaces
  { id: 'n1', slug: 'temple-necklace',        name: 'Temple Gold Necklace',        category: 'necklaces',  image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780594808/mip_jewellers/premium/sr346hvhhh015hgzhxqs.jpg',  price: 124000, weight: '32.4g', metal: '22KT Gold', stone: null,      tag: 'Bestseller', gender: 'Women' },
  { id: 'n2', slug: 'diamond-pendant-set',    name: 'Diamond Pendant Necklace',    category: 'necklaces',  image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595641/mip_jewellers/seeded/swdio2iljgtayl7jzt5e.jpg',  price: 86500,  weight: '8.2g',  metal: '18KT Gold', stone: 'Diamond', tag: null, gender: 'Women' },
  { id: 'n3', slug: 'ruby-choker',           name: 'Ruby Gold Choker',            category: 'necklaces',  image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595641/mip_jewellers/seeded/fytfivvlhpfzabgfmnlm.jpg',  price: 98200,  weight: '24.6g', metal: '22KT Gold', stone: 'Ruby',    tag: 'New', gender: 'Women' },
  { id: 'n4', slug: 'long-gold-chain',       name: 'Opera Length Gold Chain',     category: 'necklaces',  image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595642/mip_jewellers/seeded/rqt9ug6r6hljx2hjqwly.jpg',  price: 54300,  weight: '18.8g', metal: '22KT Gold', stone: null,      tag: null, gender: 'Women' },
  { id: 'n5', slug: 'antique-haram',         name: 'Antique Gold Haram',          category: 'necklaces',  image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595643/mip_jewellers/seeded/hc2irl3uvu3lyexwzcha.jpg',  price: 188000, weight: '52.4g', metal: '22KT Gold', stone: null,      tag: null, gender: 'Women' },
  { id: 'n6', slug: 'pearl-necklace',        name: 'Pearl & Gold Necklace',       category: 'necklaces',  image: 'https://res.cloudinary.com/dlnajukqk/image/upload/v1780595644/mip_jewellers/seeded/sfwiohi05m9odozqqcve.jpg',  price: 44800,  weight: '12.1g', metal: '18KT Gold', stone: 'Pearl',   tag: null, gender: 'Women' },
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

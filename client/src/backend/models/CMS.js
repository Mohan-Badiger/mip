import mongoose from 'mongoose';

const HeroSlideSchema = new mongoose.Schema({
  image: { type: String, required: true },
  tag: { type: String, required: true },
  collectionName: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: String },
  cta: { type: String, default: 'Explore' },
  href: { type: String, default: '#' },
  textSide: { type: String, enum: ['left', 'right'], default: 'left' },
  tagColor: { type: String, default: 'text-brand-gold' },
  textColor: { type: String, default: 'text-brand-brown' },
  subtitleColor: { type: String, default: 'text-brand-brown/70' },
  overlay: { type: String, default: 'bg-gradient-to-r from-white/60 via-white/10 to-transparent' }
});

const HomepageSectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  active: { type: Boolean, default: true },
  order: { type: Number, required: true }
});

const CMSSchema = new mongoose.Schema({
  heroSlides: [HeroSlideSchema],
  sections: [HomepageSectionSchema],
  seo: {
    title: { type: String, default: 'MIP Jewellers | Premium Gold & Diamond Collections' },
    description: { type: String, default: 'Discover our exclusive collection of 22K gold, diamond, and platinum jewellery. Shop online or visit our stores.' }
  }
}, { timestamps: true });

export default mongoose.models.CMS || mongoose.model('CMS', CMSSchema);

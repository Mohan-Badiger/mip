import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CMS from '@/lib/models/CMS';
import { logAdminAction } from '@/lib/auditLogger';

const DEFAULT_SECTIONS = [
  { id: "hero", name: "Hero Carousel Slider", type: "Slider", active: true, order: 0 },
  { id: "exquisite", name: "Luxury That Matches Your Style", type: "Grid", active: true, order: 1 },
  { id: "cards", name: "Modern Collections", type: "Grid", active: true, order: 2 },
  { id: "categories", name: "Shop By Category", type: "Grid", active: true, order: 3 },
  { id: "ycollection", name: "Y Collection", type: "Banner", active: true, order: 4 },
  { id: "gender", name: "Shop By Gender", type: "Grid", active: true, order: 5 },
  { id: "plan", name: "MIP My Choice", type: "Banner", active: true, order: 6 },
  { id: "legacy", name: "A Choice You Can Trust", type: "Grid", active: true, order: 7 },
  { id: "newsletter", name: "Join Our MIP Family", type: "Form", active: true, order: 8 }
];

const DEFAULT_SLIDES = [
  {
    image: "/images/hero_slide_2.png",
    tag: "New Collection",
    collectionName: "Aradhana",
    title: "Nature's most graceful bloom,\nset in diamond and gold.",
    cta: "Explore Collection",
    href: "/collections",
    textSide: "left",
    tagColor: "text-brand-gold",
    textColor: "text-brand-brown",
    subtitleColor: "text-brand-brown/70",
    overlay: "bg-gradient-to-r from-white/60 via-white/10 to-transparent"
  },
  {
    image: "/images/hero_slide_1.png",
    tag: "Everyday Elegance",
    collectionName: "Wear it every day,\nlove it forever",
    title: "Diamond jewellery that moves with you",
    price: "Starting from ₹10,000",
    cta: "Shop Now",
    href: "/collections/earrings",
    textSide: "right",
    tagColor: "text-brand-gold",
    textColor: "text-brand-brown",
    subtitleColor: "text-brand-brown/70",
    overlay: "bg-gradient-to-l from-white/65 via-white/15 to-transparent"
  },
  {
    image: "/images/hero_slide_3.png",
    tag: "New Schemes",
    collectionName: "Kanaka Plus",
    title: "Invest once. Redeem in Gold or Silver\nwith no making charges.",
    price: "Start from ₹1,000 / month",
    cta: "Know More",
    href: "/purchase-plan",
    textSide: "left",
    tagColor: "text-brand-gold",
    textColor: "text-brand-brown",
    subtitleColor: "text-brand-brown/70",
    overlay: "bg-gradient-to-r from-white/65 via-white/15 to-transparent"
  },
  {
    image: "/images/hero_slide_4.png",
    tag: "Bridal 2025",
    collectionName: "A Timeless Legacy",
    title: "Handcrafted 916 BIS Hallmarked jewellery\nfor your most precious moments.",
    cta: "View Bridal",
    href: "/collections/necklaces",
    textSide: "right",
    tagColor: "text-yellow-300",
    textColor: "text-white",
    subtitleColor: "text-white/75",
    overlay: "bg-gradient-to-l from-black/55 via-black/20 to-transparent"
  }
];

// Map old admin-style names to correct client-facing headings
const NAME_CORRECTIONS = {
  "Exquisite Collections Overview": "Luxury That Matches Your Style",
  "Collections Card Directory": "Modern Collections",
  "Shop By Category Section": "Shop By Category",
  "Y Collection Spotlight Banner": "Y Collection",
  "Shop By Gender Portal": "Shop By Gender",
  "Purchase & Saving Scheme Banner": "MIP My Choice",
  "Brand Trust & Legacy Block": "A Choice You Can Trust",
  "Newsletter Subscription Form": "Join Our MIP Family"
};

export async function GET(req) {
  try {
    await dbConnect();
    let cms = await CMS.findOne();
    if (!cms) {
      // Create defaults
      cms = await CMS.create({
        heroSlides: DEFAULT_SLIDES,
        sections: DEFAULT_SECTIONS,
        seo: {
          title: 'MIP Jewellers | Premium Gold & Diamond Collections',
          description: 'Discover our exclusive collection of 22K gold, diamond, and platinum jewellery. Shop online or visit our stores.'
        }
      });
    } else {
      // One-time migration: fix old admin-style section names in existing DB data
      let needsSave = false;
      if (cms.sections && cms.sections.length > 0) {
        cms.sections.forEach(section => {
          if (NAME_CORRECTIONS[section.name]) {
            section.name = NAME_CORRECTIONS[section.name];
            needsSave = true;
          }
        });
        if (needsSave) {
          await cms.save();
        }
      }
    }
    return NextResponse.json({ success: true, data: cms });
  } catch (error) {
    console.error('Error fetching CMS data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();

    let cms = await CMS.findOne();
    const originalCMS = cms ? cms.toObject() : {};

    if (!cms) {
      cms = new CMS();
    }

    if (body.heroSlides !== undefined) {
      cms.heroSlides = body.heroSlides;
    }
    if (body.sections !== undefined) {
      cms.sections = body.sections;
    }
    if (body.seo !== undefined) {
      cms.seo = {
        title: body.seo.title || cms.seo?.title || '',
        description: body.seo.description || cms.seo?.description || ''
      };
    }

    const savedCMS = await cms.save();

    // Log admin action
    await logAdminAction(req, {
      action: 'UPDATE',
      entity: 'CMS',
      entityId: savedCMS._id,
      description: 'Updated Homepage CMS layouts, sliders, and SEO attributes',
      changes: {
        original: originalCMS,
        updated: savedCMS.toObject()
      }
    });

    return NextResponse.json({ success: true, data: savedCMS });
  } catch (error) {
    console.error('Error updating CMS data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

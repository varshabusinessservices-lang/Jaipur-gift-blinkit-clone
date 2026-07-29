import { Category, Product, Banner } from '../types';
import { defaultPersonalisationTemplates } from './personalisationTemplates';

export const categoriesData: Category[] = [
  {
    id: 'cat-customised',
    name: 'Customised Gifts',
    slug: 'customised',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500&q=80',
    itemCount: 42,
    desktopBannerUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1200&q=80',
    mobileBannerUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&q=80'
  },
  {
    id: 'cat-no-customised',
    name: 'No Customised',
    slug: 'no-customised',
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80',
    itemCount: 38,
    desktopBannerUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&q=80',
    mobileBannerUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80'
  },
  {
    id: 'cat-jewellery',
    name: 'Jewellery',
    slug: 'jewellery',
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80',
    itemCount: 36,
    desktopBannerUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&q=80',
    mobileBannerUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80'
  },
  {
    id: 'cat-mugs',
    name: 'Mugs',
    slug: 'mugs',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80',
    itemCount: 45,
    desktopBannerUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&q=80',
    mobileBannerUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80'
  },
  {
    id: 'cat-photo-frame',
    name: 'Photo Frame',
    slug: 'photo-frame',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80',
    itemCount: 50,
    desktopBannerUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80',
    mobileBannerUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80'
  },
  {
    id: 'cat-mouse-pad',
    name: 'Mouse Pad',
    slug: 'mouse-pad',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80',
    itemCount: 30,
    desktopBannerUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=1200&q=80',
    mobileBannerUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80'
  },
  {
    id: 'cat-bottle',
    name: 'Bottle',
    slug: 'bottle',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80',
    itemCount: 40,
    desktopBannerUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=1200&q=80',
    mobileBannerUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80'
  }
];

export const bannersData: Banner[] = [
  {
    id: 'banner-1',
    title: 'Customised Photo Frames & Lamps',
    subtitle: 'Express 10-Min Delivery across Jaipur with Free Gift Message',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=80',
    mobileImageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80',
    linkCategory: 'photo-frame',
    badgeText: 'Trending 30% OFF',
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'banner-2',
    title: 'Exquisite Personalised Jewellery',
    subtitle: 'Name engraved pendants & gold-plated bracelets delivered instantly',
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80',
    mobileImageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
    linkCategory: 'jewellery',
    badgeText: 'New Arrivals',
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'banner-3',
    title: 'Magical Photo Mugs & Sipper Bottles',
    subtitle: 'Start your morning with cherished memories in 10 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&q=80',
    mobileImageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
    linkCategory: 'mugs',
    badgeText: 'Best Seller',
    isActive: true,
    sortOrder: 3
  }
];

const defaultReviews = [
  { id: 'rev-1', author: 'Aarav Sharma', rating: 5, comment: 'Absolute perfection! Delivered in less than 12 minutes in Malviya Nagar.', date: '2 days ago' },
  { id: 'rev-2', author: 'Priya Verma', rating: 5, comment: 'The quality of print and packaging is top notch. Loved it!', date: '3 days ago' },
  { id: 'rev-3', author: 'Rohit Meena', rating: 4, comment: 'Super quick delivery and very polite delivery agent. Will order again.', date: '1 week ago' },
  { id: 'rev-4', author: 'Sneha Khandelwal', rating: 5, comment: 'Exquisite gifting experience. The personalisation was accurate to the dot.', date: '2 weeks ago' },
  { id: 'rev-5', author: 'Vikram Singh', rating: 5, comment: 'Best gifting service in Jaipur. 10/10 recommendation!', date: '3 weeks ago' }
];

export const generateProducts = (): Product[] => {
  const list: Product[] = [];
  const categoriesList = [
    { name: 'Customised Gifts', slug: 'customised', tpl: 'SINGLE_PHOTO_NAME' },
    { name: 'No Customised', slug: 'no-customised', tpl: undefined },
    { name: 'Jewellery', slug: 'jewellery', tpl: 'PHOTO_NAME_MESSAGE' },
    { name: 'Mugs', slug: 'mugs', tpl: 'MUG_CUSTOM' },
    { name: 'Photo Frame', slug: 'photo-frame', tpl: 'COUPLE_ANNIVERSARY' },
    { name: 'Mouse Pad', slug: 'mouse-pad', tpl: 'FULLY_CUSTOM' },
    { name: 'Bottle', slug: 'bottle', tpl: 'SINGLE_PHOTO_NAME' }
  ];

  categoriesList.forEach((catObj, catIdx) => {
    // 3 Single Products
    for (let i = 1; i <= 3; i++) {
      const id = `prod-${catIdx}-s-${i}`;
      const slug = `product-${catIdx}-single-${i}`;
      list.push({
        id,
        slug,
        name: `${catObj.name} Signature Item ${i}`,
        subtitle: `Handcrafted premium quality ${catObj.name.toLowerCase()} for your loved ones in Jaipur`,
        description: `Experience the finest craftsmanship with our ${catObj.name} Signature Item ${i}. Each piece is carefully inspected, packed in a luxury gift box, and delivered to your doorstep within 10 minutes. Fully customisable with names, photos, or heartfelt messages.`,
        price: 499 + i * 150,
        originalPrice: 799 + i * 200,
        discountBadge: `${20 + i * 5}% OFF`,
        rating: 4.8,
        reviewCount: 140 + i * 15,
        imageUrl: getCategorySampleImage(catObj.name, i),
        galleryImages: [
          getCategorySampleImage(catObj.name, i),
          getCategorySampleImage(catObj.name, i + 1),
          getCategorySampleImage(catObj.name, i + 2)
        ],
        deliveryTime: '10 mins',
        category: catObj.name,
        isPersonalisable: !!catObj.tpl,
        personalisationTemplateCode: catObj.tpl,
        productType: 'single',
        reviews: defaultReviews,
        bundleProductIds: [],
        stock: 50,
        isFeatured: i === 1,
        isBestSeller: i === 2,
        isSameDayDelivery: true,
        isNewArrival: i === 3
      });
    }

    // 3 Variation Products
    for (let i = 1; i <= 3; i++) {
      const id = `prod-${catIdx}-v-${i}`;
      const slug = `product-${catIdx}-variation-${i}`;
      list.push({
        id,
        slug,
        name: `Deluxe Custom ${catObj.name} Edition ${i}`,
        subtitle: `Multi-option customisable ${catObj.name.toLowerCase()} with premium gift wrap`,
        description: `Our Deluxe Custom ${catObj.name} Edition ${i} offers multiple variant options and exquisite luxury packaging. Ideal for birthdays, anniversaries, and corporate gifting.`,
        price: 799 + i * 200,
        originalPrice: 1199 + i * 250,
        discountBadge: `${25 + i * 5}% OFF`,
        rating: 4.9,
        reviewCount: 210 + i * 25,
        imageUrl: getCategorySampleImage(catObj.name, i + 3),
        galleryImages: [
          getCategorySampleImage(catObj.name, i + 3),
          getCategorySampleImage(catObj.name, i + 4)
        ],
        deliveryTime: '10 mins',
        category: catObj.name,
        isPersonalisable: true,
        personalisationTemplateCode: catObj.tpl || 'SINGLE_PHOTO_NAME',
        productType: 'variation',
        variations: [
          { id: `${id}-v1`, name: 'Standard Edition', price: 799 + i * 200, originalPrice: 1199 + i * 250, stock: 25 },
          { id: `${id}-v2`, name: 'Premium Gift Box Edition', price: 999 + i * 200, originalPrice: 1499 + i * 250, stock: 15 },
          { id: `${id}-v3`, name: 'Royal Gold Luxury Edition', price: 1299 + i * 200, originalPrice: 1899 + i * 250, stock: 10 }
        ],
        reviews: defaultReviews,
        bundleProductIds: [],
        stock: 30,
        isFeatured: true,
        isBestSeller: true,
        isSameDayDelivery: true,
        isNewArrival: false
      });
    }
  });

  // Assign bundle products cross-references
  for (let i = 0; i < list.length; i++) {
    const next1 = list[(i + 1) % list.length].id;
    const next2 = list[(i + 2) % list.length].id;
    list[i].bundleProductIds = [next1, next2];
  }

  return list;
};

function getCategorySampleImage(category: string, index: number): string {
  const map: Record<string, string[]> = {
    'Customised Gifts': [
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500&q=80',
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&q=80',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=500&q=80',
      'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=500&q=80',
      'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=500&q=80'
    ],
    'No Customised': [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&q=80',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80',
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&q=80',
      'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=500&q=80',
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80',
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500&q=80'
    ],
    'Jewellery': [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=500&q=80',
      'https://images.unsplash.com/photo-1611591475283-9b626d7f02d4?w=500&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80'
    ],
    'Mugs': [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80',
      'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=500&q=80',
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500&q=80',
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80',
      'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=500&q=80'
    ],
    'Photo Frame': [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&q=80',
      'https://images.unsplash.com/photo-1533743983669-94fa5c6338dd?w=500&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&q=80'
    ],
    'Mouse Pad': [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80',
      'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=500&q=80',
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80'
    ],
    'Bottle': [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80',
      'https://images.unsplash.com/photo-1589365252845-aa88847995c1?w=500&q=80',
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80',
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80',
      'https://images.unsplash.com/photo-1589365252845-aa88847995c1?w=500&q=80'
    ]
  };
  const list = map[category] || map['Customised Gifts'];
  return list[index % list.length];
}

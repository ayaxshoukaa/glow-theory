import type { ProductRecord } from "@/models/Product";

type SeedProduct = Pick<
  ProductRecord,
  | "slug"
  | "name"
  | "description"
  | "price"
  | "image"
  | "category"
  | "isBestseller"
  | "featured"
>;

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    slug: "dew-drop-hydrating-serum",
    name: "Dew Drop Hydrating Serum",
    description:
      "A feather-light serum that leaves your daily routine feeling fresh and dewy.",
    price: 8.5,
    image: "/images/dew-drop-serum.png",
    category: "Skincare",
    isBestseller: true,
    featured: true,
  },
  {
    slug: "cloud-nine-facial-cleanser",
    name: "Cloud Nine Facial Cleanser",
    description:
      "A gentle, cloud-soft cleanse for an easy start or finish to your day.",
    price: 6,
    image: "/images/cloud-nine-cleanser.png",
    category: "Skincare",
    isBestseller: true,
    featured: true,
  },
  {
    slug: "rosy-glow-lip-oil",
    name: "Rosy Glow Lip Oil",
    description:
      "A glossy, comfortable lip oil with a soft rosy tint for an effortless glow.",
    price: 3.5,
    image: "/images/rosy-glow-lip-oil.png",
    category: "Lip Care",
    isBestseller: true,
    featured: true,
  },
  {
    slug: "sunday-reset-face-mask",
    name: "Sunday Reset Face Mask",
    description:
      "A creamy, feel-good mask for a slower evening and a little time for you.",
    price: 4,
    image: "/images/sunday-reset-mask.png",
    category: "Skincare",
    isBestseller: false,
    featured: false,
  },
  {
    slug: "velvet-skin-body-lotion",
    name: "Velvet Skin Body Lotion",
    description:
      "A soft, comforting body lotion that makes everyday care feel special.",
    price: 5.5,
    image: "/images/velvet-skin-lotion.png",
    category: "Body Care",
    isBestseller: false,
    featured: false,
  },
  {
    slug: "glow-essentials-set",
    name: "The Glow Essentials Set",
    description:
      "A thoughtful edit of Glow Theory favourites, ready for gifting or keeping.",
    price: 15,
    image: "/images/glow-essentials-set.png",
    category: "Gift Sets",
    isBestseller: true,
    featured: true,
  },
];

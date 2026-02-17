export type Category = "Bouncy Castles" | "Water Slides" | "Combos" | "Games";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  priceFrom: number;
  size: string;
  ageRange: string;
  capacity: string;
  description: string;
  includes: string[];
  safetyRules: string[];
  images: string[];      // /images/products/...
  featured?: boolean;
  active: boolean;
  imagePath:string | null; // new field for the original image path 
};

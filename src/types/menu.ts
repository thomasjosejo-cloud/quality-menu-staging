export type OutletType = 'landing' | 'cheers';

export interface ItemVariant {
  id: string; // e.g. "tan1_half", "rc2_chicken"
  name: string; // e.g. "Half", "Full", "Veg", "Egg", "Chicken", "Mixed"
  price: number;
  isVeg?: boolean;
  containsEgg?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number | string;
  description?: string;
  category: string;
  isVeg?: boolean;
  containsEgg?: boolean;
  isChefSpecial?: boolean;
  volume?: string;
  timing?: string;
  spiceLevel?: 1 | 2 | 3; // 1 = Mild, 2 = Medium, 3 = Spicy
  isExpress?: boolean; // Ready in 15 mins (ideal for transit travelers)
  image?: string; // Curated food photography for signature dishes
  flavorProfile?: string; // e.g. "Peaty & Smoky", "Floral & Crisp" for bar items
  variants?: ItemVariant[]; // Portions (Half/Full) or protein choices (Veg/Egg/Chicken/Mixed)
}

export interface MenuSection {
  id: string;
  romanNumeral?: string;
  title: string;
  subtitle?: string;
  timing?: string;
  subsections?: {
    title: string;
    items: MenuItem[];
  }[];
}

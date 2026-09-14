export type OutletType = 'landing' | 'cheers';

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

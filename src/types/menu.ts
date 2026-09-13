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

import { MenuSection, MenuItem } from '@/types/menu';

export const CHEERS_BAR_DATA: MenuSection[] = [
  {
    id: "scotch-whisky",
    romanNumeral: "I",
    title: "Scotch & Premium Whiskey",
    subtitle: "Imported & Fine Blends (Served 60 ML)",
    subsections: [
      {
        title: "Scotch Whisky (60 ML)",
        items: [
          { id: "sw1", name: "Johnnie Walker Black Label", price: 750, volume: "60 ML", category: "Scotch", isChefSpecial: true },
          { id: "sw2", name: "J & B Rare", price: 500, volume: "60 ML", category: "Scotch" },
          { id: "sw3", name: "Teacher's Highland Cream", price: 450, volume: "60 ML", category: "Scotch" },
          { id: "sw4", name: "Johnnie Walker Red Label", price: 400, volume: "60 ML", category: "Scotch" },
        ]
      },
      {
        title: "Premium Whiskey (60 ML)",
        items: [
          { id: "pw1", name: "Jim Beam Bourbon", price: 1300, volume: "60 ML", category: "Whiskey", isChefSpecial: true },
          { id: "pw2", name: "Teacher's Reserve", price: 600, volume: "60 ML", category: "Whiskey" },
          { id: "pw3", name: "Johny & Johny", price: 380, volume: "60 ML", category: "Whiskey" },
        ]
      }
    ]
  },
  {
    id: "indian-whisky",
    romanNumeral: "II",
    title: "Indian Whisky",
    subtitle: "Popular & Reserve Selections (Served 60 ML)",
    subsections: [
      {
        title: "Indian Whisky (60 ML)",
        items: [
          { id: "iw1", name: "Antiquity", price: 350, volume: "60 ML", category: "Indian Whisky" },
          { id: "iw2", name: "Maqintosh Blue", price: 320, volume: "60 ML", category: "Indian Whisky" },
          { id: "iw3", name: "Signature", price: 300, volume: "60 ML", category: "Indian Whisky" },
          { id: "iw4", name: "After Dark", price: 260, volume: "60 ML", category: "Indian Whisky" },
          { id: "iw5", name: "Maqintosh Finest Grain", price: 240, volume: "60 ML", category: "Indian Whisky" },
          { id: "iw6", name: "DSP Black", price: 220, volume: "60 ML", category: "Indian Whisky" },
          { id: "iw7", name: "Mc Dowell's No.1", price: 200, volume: "60 ML", category: "Indian Whisky" },
          { id: "iw8", name: "Green Label", price: 200, volume: "60 ML", category: "Indian Whisky" },
        ]
      }
    ]
  },
  {
    id: "brandy",
    romanNumeral: "III",
    title: "Brandy",
    subtitle: "Selected Premium & Classic Brandies (Served 60 ML)",
    subsections: [
      {
        title: "Brandy Selections (60 ML)",
        items: [
          { id: "br1", name: "Morpheus Blue", price: 380, volume: "60 ML", category: "Brandy", isChefSpecial: true },
          { id: "br2", name: "Antiquity XO", price: 350, volume: "60 ML", category: "Brandy" },
          { id: "br3", name: "Zeus", price: 270, volume: "60 ML", category: "Brandy" },
          { id: "br4", name: "Louis Vernant", price: 270, volume: "60 ML", category: "Brandy" },
          { id: "br5", name: "Morpheus", price: 260, volume: "60 ML", category: "Brandy" },
          { id: "br6", name: "Kyron", price: 250, volume: "60 ML", category: "Brandy" },
          { id: "br7", name: "Caesar Grape", price: 240, volume: "60 ML", category: "Brandy" },
          { id: "br8", name: "Black & Gold", price: 240, volume: "60 ML", category: "Brandy" },
          { id: "br9", name: "Mansion House", price: 200, volume: "60 ML", category: "Brandy" },
          { id: "br10", name: "Mc Dowell's VSOP", price: 200, volume: "60 ML", category: "Brandy" },
          { id: "br11", name: "DSP Black", price: 200, volume: "60 ML", category: "Brandy" },
          { id: "br12", name: "Lemount White", price: 200, volume: "60 ML", category: "Brandy" },
        ]
      }
    ]
  },
  {
    id: "rum-vodka",
    romanNumeral: "IV",
    title: "Rum & Vodka",
    subtitle: "Served 60 ML with complimentary ice & mixers",
    subsections: [
      {
        title: "Rum (60 ML)",
        items: [
          { id: "rum1", name: "Bacardi Guava", price: 320, volume: "60 ML", category: "Rum" },
          { id: "rum2", name: "Bacardi-Limon", price: 290, volume: "60 ML", category: "Rum" },
          { id: "rum3", name: "Bacardi-Plain", price: 290, volume: "60 ML", category: "Rum" },
          { id: "rum4", name: "Bacardi-Black", price: 220, volume: "60 ML", category: "Rum" },
          { id: "rum5", name: "Old Monk", price: 200, volume: "60 ML", category: "Rum", isChefSpecial: true },
          { id: "rum6", name: "Mc Dowell's Celebration", price: 200, volume: "60 ML", category: "Rum" },
        ]
      },
      {
        title: "Vodka (60 ML)",
        items: [
          { id: "vod1", name: "Smirnoff", price: 260, volume: "60 ML", category: "Vodka" },
          { id: "vod2", name: "Magic Moments Verve Lemon", price: 260, volume: "60 ML", category: "Vodka" },
          { id: "vod3", name: "Magic Moments Chocolate", price: 220, volume: "60 ML", category: "Vodka" },
          { id: "vod4", name: "Magic Moments", price: 200, volume: "60 ML", category: "Vodka" },
        ]
      }
    ]
  },
  {
    id: "gin-tequila",
    romanNumeral: "V",
    title: "Gin & Tequila",
    subtitle: "Classic Spirits (Served 60 ML)",
    subsections: [
      {
        title: "Gin & Tequila",
        items: [
          { id: "gt1", name: "Bombay Sapphire Gin", price: 850, volume: "60 ML", category: "Gin", isChefSpecial: true },
          { id: "gt2", name: "Buen Amigo Tequila", price: 650, volume: "60 ML", category: "Tequila", isChefSpecial: true },
        ]
      }
    ]
  },
  {
    id: "beer-wine",
    romanNumeral: "VI",
    title: "Beer & Wine",
    subtitle: "Chilled Bottles, Tin Cans & Wine by the Glass",
    subsections: [
      {
        title: "Chilled Bottled Beers (650 ML / 375 ML)",
        items: [
          { id: "beer1", name: "Budweiser", price: 340, volume: "650 ML", category: "Beer", isChefSpecial: true },
          { id: "beer2", name: "Heineken", price: 320, volume: "650 ML", category: "Beer" },
          { id: "beer3", name: "Bro Code", price: 300, volume: "375 ML", category: "Beer" },
          { id: "beer4", name: "KF Ultra Premium Strong", price: 290, volume: "650 ML", category: "Beer" },
          { id: "beer5", name: "Amstel Strong", price: 280, volume: "650 ML", category: "Beer" },
          { id: "beer6", name: "KF Storm Super Premium Strong", price: 280, volume: "650 ML", category: "Beer" },
          { id: "beer7", name: "KF Blue Ultra Strong", price: 260, volume: "650 ML", category: "Beer" },
          { id: "beer8", name: "KF Strong", price: 260, volume: "650 ML", category: "Beer" },
          { id: "beer9", name: "British Empire Strong", price: 260, volume: "650 ML", category: "Beer" },
          { id: "beer10", name: "Foster's Strong", price: 240, volume: "650 ML", category: "Beer" },
        ]
      },
      {
        title: "Tin Cans (500 ML)",
        items: [
          { id: "tin1", name: "KF Ultra Max - Tin Beer", price: 260, volume: "500 ML", category: "Beer" },
          { id: "tin2", name: "KF Storm - Tin Beer", price: 260, volume: "500 ML", category: "Beer" },
        ]
      },
      {
        title: "Wines (Served 60 ML)",
        items: [
          { id: "wine1", name: "Fratelli - Red Wine", price: 240, volume: "60 ML", category: "Wine", isChefSpecial: true },
          { id: "wine2", name: "Fratelli - White Wine", price: 240, volume: "60 ML", category: "Wine" },
          { id: "wine3", name: "Sidus Port - Red Wine", price: 100, volume: "60 ML", category: "Wine" },
        ]
      }
    ]
  }
];

export const CHEERS_SIGNATURES: MenuItem[] = [
  {
    id: "sig_bar_scotch",
    name: "Johnnie Walker Black Label",
    price: 750,
    volume: "60 ML",
    category: "Scotch & Premium Whiskey",
    flavorProfile: "Rich Smoke & Dried Fruit",
    isChefSpecial: true,
    description: "Iconic master blend of 40+ whiskies aged 12 years with deep vanilla and gentle peat smoke",
    image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "sig_bar_brandy",
    name: "Morpheus Blue XO",
    price: 380,
    volume: "60 ML",
    category: "Brandy",
    flavorProfile: "Velvety Honey & French Oak",
    isChefSpecial: true,
    description: "Blended with matured grape spirits, rich vanilla and warm toasted oak finish",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "sig_bar_beer",
    name: "KF Ultra Draught",
    price: 320,
    volume: "650 ML",
    category: "Beer & Wine",
    flavorProfile: "Crisp & Clean Finish",
    isChefSpecial: true,
    description: "Crafted from golden imported barley for an ultra-smooth, refreshing luxury experience",
    image: "https://images.unsplash.com/photo-1608270195577-f27429188eb2?w=600&auto=format&fit=crop&q=80"
  }
];


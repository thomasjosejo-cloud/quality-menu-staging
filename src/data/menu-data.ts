import { MenuSection, MenuItem } from '@/types/menu';

export const MENU_DATA: MenuSection[] = [
  {
    id: "breakfast",
    romanNumeral: "I",
    title: "Breakfast",
    timing: "7:00 AM – 10:30 AM",
    subsections: [
      {
        title: "Regional Breakfast Specialities",
        items: [
          { id: "b1", name: "Appam with Egg Roast", price: 220, isVeg: false, containsEgg: true, category: "Breakfast" },
          { id: "b2", name: "Appam with Vegetable Stew", price: 200, isVeg: true, category: "Breakfast" },
          { id: "b3", name: "Puttu with Kadala Curry", price: 200, isVeg: true, category: "Breakfast" },
          { id: "b4", name: "Idli with Sambar & Chutneys", price: 200, description: "Served with sambar, coconut chutney and tomato chutney", isVeg: true, category: "Breakfast" },
          { id: "b5", name: "Choice of Dosa", price: 200, description: "Masala / Plain / Ghee / Onion. Served with sambar, coconut chutney and tomato chutney", isVeg: true, category: "Breakfast" },
        ]
      },
      {
        title: "Indian Selections & Continental",
        items: [
          { id: "b6", name: "Poori with Aloo Bhaji", price: 200, isVeg: true, category: "Breakfast" },
          { id: "b7", name: "Paneer / Aloo Paratha", price: 200, description: "Served with yoghurt and pickle", isVeg: true, category: "Breakfast" },
          { id: "b8", name: "Seasonal Fresh Juice", price: 150, isVeg: true, category: "Breakfast" },
          { id: "b9", name: "Fruit Platter", price: 150, isVeg: true, category: "Breakfast" },
          { id: "b10", name: "Choice of Omelette", price: 180, description: "Two-egg omelette served with toast", isVeg: false, containsEgg: true, category: "Breakfast" },
          { id: "b11", name: "Fluffy Pancakes / French Toast", price: 140, description: "Served with honey and melted butter", isVeg: true, category: "Breakfast" },
        ]
      }
    ]
  },
  {
    id: "soups-starters",
    romanNumeral: "II",
    title: "Soups & Starters",
    subsections: [
      {
        title: "Non-Vegetarian Starters",
        items: [
          { id: "s1", name: "Masala Fried Chicken Wings", price: 290, description: "Crispy chicken wings served with a spicy garlic dip", isVeg: false, category: "Starters" },
          { id: "s2", name: "Spicy Calamari Tempura", price: 360, description: "Batter-fried calamari rings served with garlic mayonnaise", isVeg: false, category: "Starters" },
          { id: "s3", name: "Chicken Karuveppila Fry", price: 310, description: "Spiced diced chicken, deep-fried and flavoured with roasted curry leaves", isVeg: false, isChefSpecial: true, category: "Starters" },
          { id: "s4", name: "Stir-Fried Chilli Fish", price: 310, description: "Tender chilli fish tossed with crunchy vegetables", isVeg: false, category: "Starters" },
          { id: "s5", name: "Reshmi Kebab", price: 360, description: "Marinated chicken kebab prepared in a traditional style", isVeg: false, category: "Starters" },
          { id: "s6", name: "Adraki Murgh Tikka", price: 360, description: "Chicken marinated with yoghurt, spices and fresh ginger, then cooked in the tandoor", isVeg: false, category: "Starters" },
        ]
      },
      {
        title: "Vegetarian Starters",
        items: [
          { id: "sv1", name: "Wok-Tossed Chilli Cauliflower", price: 250, description: "Spicy cauliflower stir-fried with spring onion and oriental seasoning", isVeg: true, category: "Starters" },
          { id: "sv2", name: "Mushroom Salt & Pepper", price: 250, description: "Wok-tossed mushrooms seasoned with pepper and oriental spices", isVeg: true, category: "Starters" },
          { id: "sv3", name: "Vegetable Tempura", price: 250, description: "Golden-fried mixed vegetables served with tempura sauce", isVeg: true, category: "Starters" },
          { id: "sv4", name: "Lasooni Paneer Tikka", price: 300, description: "Garlic-marinated paneer cooked in the tandoor with onion, tomato and capsicum", isVeg: true, category: "Starters" },
        ]
      },
      {
        title: "Soups",
        items: [
          { id: "sp1", name: "Choice of Cream Soup", price: 180, description: "Chicken / Tomato / Mushroom. A rich, creamy soup finished with milk", isVeg: true, category: "Soups" },
          { id: "sp2", name: "Creamy Seafood Chowder", price: 200, description: "Shrimp, fish and calamari simmered in a creamy broth with vegetables", isVeg: false, isChefSpecial: true, category: "Soups" },
          { id: "sp3", name: "Malay Chicken Laksa Soup", price: 200, description: "Chicken soup with coconut milk, curry and lemongrass, inspired by Malaysian laksa", isVeg: false, category: "Soups" },
          { id: "sp4", name: "Hot & Sour Chicken Soup", price: 200, description: "A classic Chinese-style hot and sour chicken soup", isVeg: false, category: "Soups" },
          { id: "sp5", name: "Sweet Corn Vegetable Soup", price: 180, description: "Creamy sweet corn soup with vegetables", isVeg: true, category: "Soups" },
          { id: "sp6", name: "Tomato & Lentil Shorba", price: 180, description: "Slow-cooked tomato and lentils infused with fresh coriander", isVeg: true, category: "Soups" },
        ]
      }
    ]
  },
  {
    id: "sandwiches-salads",
    romanNumeral: "III",
    title: "Sandwiches & Salads",
    subsections: [
      {
        title: "Sandwiches & Titbits (Served with Fries & Coleslaw)",
        items: [
          { id: "sw1", name: "Cheesy Grilled Chicken Sandwich", price: 270, description: "Grilled chicken with onion, tomato, lettuce, mayonnaise and cheese on toasted bread", isVeg: false, category: "Sandwiches" },
          { id: "sw2", name: "Fried Chicken Fillet Sandwich", price: 270, description: "Crispy breaded chicken fillet with honey-mustard mayonnaise on grilled bread", isVeg: false, category: "Sandwiches" },
          { id: "sw3", name: "Quality Club Sandwich", price: 290, description: "Grilled chicken, fried egg, cucumber, lettuce, tomato, mayonnaise and cheese layered between toasted bread", isVeg: false, containsEgg: true, isChefSpecial: true, category: "Sandwiches" },
          { id: "sw4", name: "Masala Omelette Sandwich", price: 220, description: "Masala omelette with onion, chilli and tomato served in toasted bread", isVeg: false, containsEgg: true, category: "Sandwiches" },
          { id: "sw5", name: "Cheesy Vegetable Sandwich", price: 200, description: "Grilled sandwich filled with seasoned vegetables, lettuce and cheese", isVeg: true, category: "Sandwiches" },
          { id: "sw6", name: "Cheese & Tomato Sandwich", price: 200, isVeg: true, category: "Sandwiches" },
        ]
      },
      {
        title: "Salads",
        items: [
          { id: "sl1", name: "Classic Shrimp Louie Salad", price: 220, description: "Shrimp, egg and fresh vegetables served with a creamy dressing", isVeg: false, containsEgg: true, category: "Salads" },
          { id: "sl2", name: "BBQ Chicken Salad", price: 200, description: "Barbecue-marinated chicken served with a selection of fresh greens", isVeg: false, category: "Salads" },
          { id: "sl3", name: "Homestyle Caesar Salad", price: 200, description: "Grilled chicken and croutons tossed with Caesar dressing", isVeg: false, category: "Salads" },
          { id: "sl4", name: "Greek Salad", price: 180, description: "Diced vegetables tossed with olive oil dressing and cheese", isVeg: true, category: "Salads" },
          { id: "sl5", name: "Watermelon, Mint & Cheese Salad", price: 180, description: "Watermelon, cheese and fresh mint dressed with olive oil and lemon juice", isVeg: true, category: "Salads" },
          { id: "sl6", name: "Garden Fresh Green Salad", price: 160, isVeg: true, category: "Salads" },
        ]
      }
    ]
  },
  {
    id: "regional-specialities",
    romanNumeral: "IV",
    title: "Regional Specialities",
    subsections: [
      {
        title: "Kerala Heritage Meats & Poultry",
        items: [
          { id: "reg1", name: "Syrian Beef Coconut Fry", price: 350, description: "Slow-cooked beef cubes tossed with coconut flakes and aromatic spices", isVeg: false, isChefSpecial: true, category: "Regional" },
          { id: "reg2", name: "Kuttanadan Beef Roast", price: 350, description: "Tender beef cubes cooked in a rich tomato and onion masala", isVeg: false, category: "Regional" },
          { id: "reg3", name: "Beef Ularthu", price: 350, description: "Slow-roasted beef with coconut flakes and traditional Kerala spices", isVeg: false, category: "Regional" },
          { id: "reg4", name: "Chicken Varatharacha Curry", price: 320, description: "Chicken cooked with spices and a roasted coconut paste", isVeg: false, category: "Regional" },
          { id: "reg5", name: "Malabar Chicken Curry", price: 320, description: "Kerala-style chicken curry finished with coconut milk", isVeg: false, category: "Regional" },
          { id: "reg6", name: "Kozhi Porichathu", price: 320, description: "Spiced marinated chicken, deep-fried and served with salad", isVeg: false, category: "Regional" },
          { id: "reg7", name: "Chicken Mappas / Stew", price: 320, description: "Mild Kerala-style chicken preparation cooked with coconut milk", isVeg: false, category: "Regional" },
          { id: "reg8", name: "Alleppey Fish Curry", price: 340, description: "Fish cooked with raw mango and coconut in a traditional Kerala-style curry", isVeg: false, category: "Regional" },
          { id: "reg9", name: "Kerala Fish Curry", price: 340, description: "Traditional Kerala fish curry prepared with kudampuli and coconut milk", isVeg: false, category: "Regional" },
        ]
      },
      {
        title: "Seafood & Vegetarian",
        items: [
          { id: "reg10", name: "Neymeen Pollichathu", price: 390, description: "Seer fish cooked with tomato and shallot masala, wrapped in banana leaf and grilled", isVeg: false, isChefSpecial: true, category: "Regional" },
          { id: "reg11", name: "Neymeen Tawa Fry", price: 340, description: "Seer fish marinated in a traditional Kerala spice masala and pan-fried", isVeg: false, category: "Regional" },
          { id: "reg12", name: "Chemmeen Fry", price: 480, description: "Shallow-fried prawns tossed with curry leaves and Kerala spices", isVeg: false, category: "Regional" },
          { id: "reg13", name: "Prawns Roast", price: 480, description: "Prawns cooked in a thick, spiced onion and tomato masala", isVeg: false, category: "Regional" },
          { id: "reg14", name: "Kanava Ularthiyathu", price: 400, description: "Stir-fried squid with coconut flakes and traditional Kerala spices", isVeg: false, category: "Regional" },
          { id: "reg15", name: "Seafood Theeyal", price: 400, description: "Mixed seafood cooked in a rich roasted coconut gravy", isVeg: false, category: "Regional" },
          { id: "reg16", name: "Vegetable Stew", price: 240, description: "Mixed vegetables gently cooked with whole spices and coconut milk", isVeg: true, category: "Regional" },
          { id: "reg17", name: "Vendakka Mappas", price: 240, description: "Okra simmered in a mildly spiced coconut-milk gravy", isVeg: true, category: "Regional" },
          { id: "reg18", name: "Kathirikka Masala", price: 240, description: "Eggplant slow-cooked in a roasted coconut gravy", isVeg: true, category: "Regional" },
        ]
      }
    ]
  },
  {
    id: "indian-selection",
    romanNumeral: "V",
    title: "Indian Selection",
    subsections: [
      {
        title: "Curries & Dal",
        items: [
          { id: "ind1", name: "Jhinga Masala", price: 480, description: "Juicy prawns tossed in a robust North Indian masala", isVeg: false, category: "Indian" },
          { id: "ind2", name: "Murgh Tikka Makhani", price: 340, description: "Tandoor-cooked chicken simmered in a rich, buttery tomato gravy", isVeg: false, isChefSpecial: true, category: "Indian" },
          { id: "ind3", name: "Kadai Chicken Masala", price: 340, description: "Spiced chicken cooked with onion, tomato and capsicum in a kadai-style masala", isVeg: false, category: "Indian" },
          { id: "ind4", name: "Murgh Methi Wala", price: 340, description: "Chicken cooked in a creamy gravy flavoured with fenugreek leaves", isVeg: false, category: "Indian" },
          { id: "ind5", name: "Paneer Butter Masala", price: 280, description: "Cottage cheese simmered in a rich makhani gravy", isVeg: true, category: "Indian" },
          { id: "ind6", name: "Kadai Paneer", price: 280, description: "Cottage cheese tossed with onion, capsicum and tomato in a spiced gravy", isVeg: true, category: "Indian" },
          { id: "ind7", name: "Paneer Pasanda", price: 280, description: "Stuffed paneer slices cooked in a smooth, creamy gravy", isVeg: true, category: "Indian" },
          { id: "ind8", name: "Subzi Makhani", price: 250, description: "Mixed vegetables cooked in a creamy tomato gravy", isVeg: true, category: "Indian" },
          { id: "ind9", name: "Jaipuri Bhindi Fry", price: 250, description: "Okra stir-fried with aromatic Indian spices", isVeg: true, category: "Indian" },
          { id: "ind10", name: "Kofta Curry", price: 250, isVeg: true, category: "Indian" },
          { id: "ind11", name: "Dal — Choice of Preparation", price: 200, description: "Dal Fry / Dal Tadka / Lasooni Dal / Adraki Dal. Yellow lentils cooked with seasoning", isVeg: true, category: "Indian" },
        ]
      },
      {
        title: "Biryani of the Day",
        items: [
          { id: "bir1", name: "Thalassery Dum Biryani — Chicken", price: 330, description: "Traditional Kerala-style dum biryani with kaima rice", isVeg: false, isChefSpecial: true, category: "Biryani" },
          { id: "bir2", name: "Thalassery Dum Biryani — Beef", price: 350, description: "Traditional Kerala-style dum biryani with kaima rice", isVeg: false, category: "Biryani" },
          { id: "bir3", name: "Traditional Indian Biryani — Chicken", price: 330, description: "Prepared with fragrant basmati rice", isVeg: false, category: "Biryani" },
          { id: "bir4", name: "Traditional Indian Biryani — Beef", price: 350, description: "Prepared with fragrant basmati rice", isVeg: false, category: "Biryani" },
          { id: "bir5", name: "Traditional Indian Biryani — Vegetable", price: 270, description: "Prepared with fragrant basmati rice and garden vegetables", isVeg: true, category: "Biryani" },
        ]
      }
    ]
  },
  {
    id: "tandoor",
    romanNumeral: "VI",
    title: "Tandoor",
    subsections: [
      {
        title: "Clay Oven Kebabs & Tikka",
        items: [
          { id: "tan1", name: "Tandoori Murgh", price: "₹420 (Half) / ₹750 (Full)", description: "Chicken marinated with yoghurt and spices, then roasted in the tandoor", isVeg: false, isChefSpecial: true, category: "Tandoor" },
          { id: "tan2", name: "Murgh Afghani Kebab", price: 400, description: "Boneless chicken in a mild, creamy marinade, cooked in the tandoor", isVeg: false, category: "Tandoor" },
          { id: "tan3", name: "Chicken Tikka", price: 400, description: "Spiced boneless chicken marinated and roasted in the tandoor", isVeg: false, category: "Tandoor" },
          { id: "tan4", name: "Murgh Malai Kebab", price: 400, description: "Tender chicken marinated in a creamy, mildly spiced cheese mixture", isVeg: false, category: "Tandoor" },
          { id: "tan5", name: "Chicken Tangri Kebab", price: 400, description: "Chicken drumsticks marinated with yoghurt and traditional spices", isVeg: false, category: "Tandoor" },
          { id: "tan6", name: "Paneer Tikka", price: 300, description: "Cottage cheese marinated in tandoori spices and roasted in the tandoor", isVeg: true, category: "Tandoor" },
          { id: "tan7", name: "Tandoori Sabzi", price: 300, description: "Assorted vegetables marinated with spices and roasted in the tandoor", isVeg: true, category: "Tandoor" },
          { id: "tan8", name: "Vegetable Seekh Kebab", price: 300, description: "Seasoned vegetables shaped on skewers and cooked in the tandoor", isVeg: true, category: "Tandoor" },
        ]
      }
    ]
  },
  {
    id: "orient-selection",
    romanNumeral: "VII",
    title: "The Orient Selection",
    subsections: [
      {
        title: "Asian & Indo-Chinese Wok",
        items: [
          { id: "or1", name: "Prawns in Hot Garlic Sauce", price: 460, description: "Prawns tossed in a spicy garlic sauce", isVeg: false, category: "Asian" },
          { id: "or2", name: "Schezwan Chilli Prawns", price: 460, description: "Prawns cooked in a tangy and spicy Schezwan sauce", isVeg: false, category: "Asian" },
          { id: "or3", name: "Fish in Chilli Sauce", price: 330, description: "Batter-fried fish tossed in a spicy chilli sauce", isVeg: false, category: "Asian" },
          { id: "or4", name: "Honey-Glazed Beef with Dry Chillies", price: 350, description: "Sliced beef tossed in a sweet and sticky honey-garlic sauce with dried chillies", isVeg: false, isChefSpecial: true, category: "Asian" },
          { id: "or5", name: "Chilli Garlic Chicken Manchurian", price: 320, description: "Chicken Manchurian tossed with garlic, soy and chilli", isVeg: false, category: "Asian" },
          { id: "or6", name: "Hot Chilli Chicken", price: 320, description: "Crispy chicken tossed in a hot and spicy chilli sauce", isVeg: false, category: "Asian" },
          { id: "or7", name: "Diced Chicken with Ginger Sauce", price: 320, description: "Batter-fried chicken tossed in a ginger, chilli and soy sauce", isVeg: false, category: "Asian" },
          { id: "or8", name: "Dragon Chilli Potato", price: 250, description: "Crispy potatoes tossed in a spicy, tangy and mildly sweet sauce", isVeg: true, category: "Asian" },
          { id: "or9", name: "Chilli Garlic Cauliflower", price: 250, description: "Crispy cauliflower tossed in a chilli-garlic sauce", isVeg: true, category: "Asian" },
          { id: "or10", name: "Cauliflower Manchurian", price: 250, description: "Cauliflower tossed in a garlic and soy-flavoured Manchurian sauce", isVeg: true, category: "Asian" },
        ]
      }
    ]
  },
  {
    id: "international-fare",
    romanNumeral: "VIII",
    title: "International Fare",
    subsections: [
      {
        title: "Steaks & Grills",
        items: [
          { id: "it1", name: "Grilled Chicken with Teriyaki Sauce", price: 450, description: "Served with vegetables and choice of rice or fries", isVeg: false, category: "Continental" },
          { id: "it2", name: "Grilled Chicken with Velouté Sauce", price: 450, description: "Served with creamy pepper, mushroom and garlic sauce", isVeg: false, category: "Continental" },
          { id: "it3", name: "Teriyaki Beef Steak", price: 510, description: "Beef steak marinated in soy-based teriyaki sauce with ginger and garlic", isVeg: false, category: "Continental" },
          { id: "it4", name: "Beef Steak with Pepper Sauce", price: 510, description: "Beef steak served with a rich pepper and mushroom demi-glace", isVeg: false, isChefSpecial: true, category: "Continental" },
          { id: "it5", name: "Grilled Fish with Lemon Garlic Butter Sauce", price: 450, description: "Seasonal grilled fish served with buttered rice and mixed vegetables", isVeg: false, category: "Continental" },
        ]
      },
      {
        title: "Pasta Selection (Served with Garlic Bread)",
        items: [
          { id: "pas1", name: "Seafood Marinara", price: 380, description: "Choice of Penne or Spaghetti with seafood in rich marinara sauce", isVeg: false, category: "Pasta" },
          { id: "pas2", name: "Barbecue Chicken Pasta", price: 340, description: "Pasta tossed with chicken in a smoky, barbecue sauce", isVeg: false, category: "Pasta" },
          { id: "pas3", name: "Chicken Alfredo", price: 340, description: "Pasta with chicken in a rich and creamy Alfredo sauce", isVeg: false, category: "Pasta" },
          { id: "pas4", name: "Chicken Arrabbiata", price: 340, description: "Pasta with chicken in a spicy tomato and garlic sauce", isVeg: false, category: "Pasta" },
          { id: "pas5", name: "Beef / Chicken Stroganoff", price: 420, description: "Tender beef or chicken cooked with mushrooms in a creamy sauce", isVeg: false, category: "Pasta" },
          { id: "pas6", name: "Creamy Mushroom Pasta", price: 280, isVeg: true, category: "Pasta" },
          { id: "pas7", name: "Arrabbiata Pasta", price: 280, isVeg: true, category: "Pasta" },
          { id: "pas8", name: "Cheesy Alfredo Pasta", price: 280, isVeg: true, category: "Pasta" },
          { id: "pas9", name: "Tomato & Vegetable Pasta", price: 280, isVeg: true, category: "Pasta" },
        ]
      }
    ]
  },
  {
    id: "breads-rice",
    romanNumeral: "IX",
    title: "Breads & Rice",
    subsections: [
      {
        title: "Rice & Noodles",
        items: [
          { id: "rc1", name: "Nasi Goreng", price: 270, description: "Indonesian-style fried rice with Asian sauces and prawn crackers", isVeg: false, category: "Rice" },
          { id: "rc2", name: "Fried Rice (Veg / Egg / Chicken / Mixed)", price: "₹200 / ₹220 / ₹250", isVeg: true, category: "Rice" },
          { id: "rc3", name: "Schezwan Fried Rice (Veg / Egg / Chicken / Mixed)", price: "₹200 / ₹220 / ₹250", isVeg: true, category: "Rice" },
          { id: "rc4", name: "Mie Goreng", price: 270, description: "Indonesian fried noodles with Asian sauces and prawn crackers", isVeg: false, category: "Noodles" },
          { id: "rc5", name: "Noodles (Veg / Egg / Chicken / Mixed)", price: "₹200 / ₹220 / ₹250", isVeg: true, category: "Noodles" },
          { id: "rc6", name: "Schezwan Noodles (Veg / Egg / Chicken / Mixed)", price: "₹200 / ₹220 / ₹250", isVeg: true, category: "Noodles" },
          { id: "rc7", name: "Pulao (Vegetable / Peas / Jeera)", price: 190, isVeg: true, category: "Rice" },
          { id: "rc8", name: "Curd Rice", price: 180, isVeg: true, category: "Rice" },
          { id: "rc9", name: "Steamed Rice", price: 150, isVeg: true, category: "Rice" },
        ]
      },
      {
        title: "Indian Breads",
        items: [
          { id: "br1", name: "Kerala Paratha", price: 50, isVeg: true, category: "Breads" },
          { id: "br2", name: "Chapati", price: 35, isVeg: true, category: "Breads" },
          { id: "br3", name: "Phulka", price: 30, isVeg: true, category: "Breads" },
          { id: "br4", name: "Cheese Naan / Garlic Naan", price: 60, isVeg: true, category: "Breads" },
          { id: "br5", name: "Naan / Roti", price: 50, isVeg: true, category: "Breads" },
          { id: "br6", name: "Kulcha", price: 60, isVeg: true, category: "Breads" },
        ]
      }
    ]
  },
  {
    id: "desserts-beverages",
    romanNumeral: "X",
    title: "Desserts & Beverages",
    subsections: [
      {
        title: "Evening Snacks (3:00 PM – 7:00 PM)",
        items: [
          { id: "sn1", name: "Banana Fritters (Pazham Pori)", price: 150, isVeg: true, isChefSpecial: true, category: "Snacks", timing: "3:00 PM – 7:00 PM" },
          { id: "sn2", name: "Cutlets — Vegetable (with French Fries)", price: 150, isVeg: true, category: "Snacks", timing: "3:00 PM – 7:00 PM" },
          { id: "sn3", name: "Cutlets — Chicken / Beef (with French Fries)", price: 190, isVeg: false, category: "Snacks", timing: "3:00 PM – 7:00 PM" },
          { id: "sn4", name: "Pakora (Vegetable / Onion / Paneer)", price: "₹150 / ₹190", isVeg: true, category: "Snacks", timing: "3:00 PM – 7:00 PM" },
        ]
      },
      {
        title: "Desserts",
        items: [
          { id: "ds1", name: "Gulab Jamun", price: 150, isVeg: true, category: "Desserts" },
          { id: "ds2", name: "Carrot Halwa", price: 150, isVeg: true, category: "Desserts" },
          { id: "ds3", name: "Fruit Salad", price: 150, isVeg: true, category: "Desserts" },
          { id: "ds4", name: "Fruit Salad with Ice Cream", price: 220, isVeg: true, category: "Desserts" },
          { id: "ds5", name: "Choice of Ice Cream", price: 170, isVeg: true, category: "Desserts" },
          { id: "ds6", name: "Fried Ice Cream", price: 250, isVeg: true, isChefSpecial: true, category: "Desserts" },
        ]
      },
      {
        title: "Beverages",
        items: [
          { id: "bv1", name: "Freshly Squeezed Fruit Juice", price: 150, description: "Please ask for available selection", isVeg: true, category: "Beverages" },
          { id: "bv2", name: "Milkshakes (Chocolate / Strawberry / Banana / Vanilla)", price: 200, description: "Served with ice cream", isVeg: true, category: "Beverages" },
          { id: "bv3", name: "Cold Coffee", price: 200, isVeg: true, category: "Beverages" },
          { id: "bv4", name: "Fresh Lime Soda / Water", price: 70, isVeg: true, category: "Beverages" },
          { id: "bv5", name: "Tea / Coffee", price: 75, isVeg: true, category: "Beverages" },
          { id: "bv6", name: "Hot Chocolate", price: 130, isVeg: true, category: "Beverages" },
          { id: "bv7", name: "Hot Milk / Horlicks / Boost", price: 120, isVeg: true, category: "Beverages" },
        ]
      }
    ]
  }
];

export const LANDING_SIGNATURES: MenuItem[] = [
  {
    id: "sig_fish_curry",
    name: "Alleppey Fish Curry",
    price: 340,
    description: "Kingfish simmered with raw mango, cocum, thick coconut milk & roasted spices",
    category: "Regional Specialities",
    isVeg: false,
    isChefSpecial: true,
    spiceLevel: 2,
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "sig_biryani",
    name: "Thalassery Dum Biryani",
    price: 330,
    description: "Fragrant Kaima rice layered with tender marinated chicken, golden shallots & Malabar ghee",
    category: "Biryani of the Day",
    isVeg: false,
    isChefSpecial: true,
    spiceLevel: 2,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "sig_beef_fry",
    name: "Syrian Beef Coconut Fry",
    price: 350,
    description: "Slow-roasted beef with fresh coconut chips, crushed Malabar black pepper & curry leaves",
    category: "Regional Specialities",
    isVeg: false,
    isChefSpecial: true,
    spiceLevel: 3,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "sig_tandoori",
    name: "Tandoori Murgh",
    price: 420,
    description: "Clay oven roasted chicken marinated in Kashmiri degi mirch, hung curd & royal cumin",
    category: "Tandoor",
    isVeg: false,
    isChefSpecial: true,
    spiceLevel: 2,
    image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
  }
];


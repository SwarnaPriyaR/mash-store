// src/data/products.js
// Master product catalogue — add / remove products here.
// qty       : initial stock count
// basePrice : the permanent price before any sale discount
// fit       : "Regular" | "Oversized"  — used by the filter on the Products page

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Phantom Wave",
    basePrice: 849,
    price: 849,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    tags: ["Graphic", "Unisex"],
    fit: "Regular",
    qty: 20,
    description:
      "Cut from 100% ring-spun cotton, the Phantom Wave tee features a hand-drawn ocean motif screen-printed with water-based inks. Relaxed fit. Double-stitched hem. Available in S–3XL.",
    reviews: [
      { user: "Arjun M.",  rating: 5, text: "Feels luxurious and fits perfectly. The print is stunning." },
      { user: "Priya S.",  rating: 4, text: "Great quality, slightly large — order one size down." },
    ],
  },
  {
    id: 2,
    name: "Urban Cipher",
    basePrice: 999,
    price: 999,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    tags: ["Streetwear", "Oversized"],
    fit: "Oversized",
    qty: 15,
    description:
      "Bold typographic print on a heavyweight 220 GSM cotton canvas. Dropped shoulders, box fit. Garment-washed for a lived-in softness straight out of the bag.",
    reviews: [
      { user: "Karan P.", rating: 5, text: "Absolutely love the oversized cut. Real streetwear energy." },
      { user: "Sneha R.", rating: 5, text: "The wash gives it such a premium feel. Already bought two." },
    ],
  },
  {
    id: 3,
    name: "Minimal Arc",
    basePrice: 699,
    price: 699,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
    tags: ["Minimal", "Essential"],
    fit: "Regular",
    qty: 4,
    description:
      "The anti-logo tee. Clean lines, subtle tonal arc embroidery at the chest. Slim fit, mid-weight 180 GSM. Pairs with everything, competes with nothing.",
    reviews: [
      { user: "Divya K.", rating: 4, text: "Understated elegance. My go-to for meetings and weekends alike." },
    ],
  },
  {
    id: 4,
    name: "Neon Bloom",
    basePrice: 1099,
    price: 1099,
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80",
    tags: ["Graphic", "Bold"],
    fit: "Oversized",
    qty: 12,
    description:
      "Reactive-dye florals explode across a jet-black base. Limited drop. 200 GSM combed cotton. Each piece varies slightly — no two are identical.",
    reviews: [
      { user: "Rahul V.",  rating: 5, text: "Head-turner. Got three compliments the first day I wore it." },
      { user: "Ananya T.", rating: 4, text: "Colours are even more vivid IRL. Very happy." },
    ],
  },
  {
    id: 5,
    name: "Desert Drift",
    basePrice: 799,
    price: 799,
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
    tags: ["Vintage", "Relaxed"],
    fit: "Regular",
    qty: 3,
    description:
      "Sun-bleached sand tones meet vintage athletic typography. Enzyme-washed for softness. Relaxed fit with ribbed crewneck and double-stitched sleeves.",
    reviews: [
      { user: "Meera J.",  rating: 5, text: "Softest tee I own. The colour is exactly like the photo." },
      { user: "Vikram N.", rating: 4, text: "Vintage look nailed it. Would love more colour options." },
    ],
  },
  {
    id: 6,
    name: "Grid Punk",
    basePrice: 949,
    price: 949,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4f6bfb?w=600&q=80",
    tags: ["Streetwear", "Graphic"],
    fit: "Oversized",
    qty: 8,
    description:
      "Industrial grid print with distressed edges. Screen-printed on 220 GSM cotton. Boxy cut, raw-edged sleeve hems. For those who wear their attitude.",
    reviews: [
      { user: "Aarav S.", rating: 5, text: "Edgy without being try-hard. Perfect weight for Chennai weather too." },
    ],
  },
];

export default INITIAL_PRODUCTS;

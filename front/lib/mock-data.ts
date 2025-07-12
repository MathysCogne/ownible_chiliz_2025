import {
  IconMusic,
  IconSoccerField,
  IconShirt,
  IconHome,
} from "@tabler/icons-react"

export type Asset = {
  id: number;
  name: string;
  category: string;
  type: string;
  price: number;
  change: number;
};

export const assets: Asset[] = [
  {
    id: 1,
    name: 'ZywOo',
    category: 'Player Shares',
    type: 'E-Sport',
    price: 150.75,
    change: 2.5,
  },
  {
    id: 2,
    name: 's1mple',
    category: 'Player Shares',
    type: 'E-Sport',
    price: 180.2,
    change: -1.2,
  },
  {
    id: 3,
    name: 'Daft Punk - Discovery Vinyl',
    category: 'Album Rights',
    type: 'Music',
    price: 520.0,
    change: -5.8,
  },
  {
    id: 4,
    name: 'VIP Box @ Accor Arena',
    category: 'Event Access',
    type: 'Real Estate',
    price: 2500,
    change: 18.1,
  },
  {
    id: 5,
    name: 'Signed "Metronomy" T-Shirt',
    category: 'Merchandise',
    type: 'Merch',
    price: 85.5,
    change: 12.3,
  },
  {
    id: 6,
    name: 'Aphex Twin - Selected Ambient Works',
    category: 'Album Rights',
    type: 'Music',
    price: 750.0,
    change: 0.5,
  },
  {
    id: 7,
    name: 'Courtside Seats @ Roland Garros',
    category: 'Event Access',
    type: 'E-Sport',
    price: 1200.0,
    change: -2.1,
  },
  {
    id: 8,
    name: 'OG Supporter Scarf',
    category: 'Merchandise',
    type: 'Merch',
    price: 45.0,
    change: 33.3,
  },
];

export const portfolioAssets: PortfolioAsset[] = [
  { ...assets[0], quantity: 10, avgBuyPrice: 140.5 },
  { ...assets[3], quantity: 2, avgBuyPrice: 90.0 },
  { ...assets[2], quantity: 1, avgBuyPrice: 450.0 },
]

export const getAssetIcon = (type: Asset["type"]) => {
  switch (type) {
    case "E-Sport":
      return IconSoccerField
    case "Music":
      return IconMusic
    case "Merch":
      return IconShirt
    case "Real Estate":
      return IconHome
  }
} 
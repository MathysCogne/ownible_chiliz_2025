import {
  IconMusic,
  IconHome,
  IconDeviceGamepad2,
  IconBallFootball,
} from "@tabler/icons-react"

export type Asset = {
  id: number;
  name: string;
  category: string;
  type: string;
  price: number;
  change: number;
  volume24h: number;
  totalFragments: number;
  ownedFragments: number;
};

export type PortfolioAsset = Asset & {
  quantity: number;
  avgBuyPrice: number;
};

export const assets: Asset[] = [
  {
    id: 1,
    name: 'ZywOo',
    category: 'Player Shares',
    type: 'E-Sport',
    price: 150.75,
    change: 2.5,
    volume24h: 1_200_000,
    totalFragments: 1000,
    ownedFragments: 350,
  },
  {
    id: 2,
    name: 's1mple',
    category: 'Player Shares',
    type: 'E-Sport',
    price: 180.2,
    change: -1.2,
    volume24h: 950_000,
    totalFragments: 1000,
    ownedFragments: 850,
  },
  {
    id: 3,
    name: 'Daft Punk - Discovery Vinyl',
    category: 'Album Rights',
    type: 'Music',
    price: 520.0,
    change: -5.8,
    volume24h: 500_000,
    totalFragments: 500,
    ownedFragments: 120,
  },
  {
    id: 4,
    name: 'VIP Box @ Accor Arena',
    category: 'Event Access',
    type: 'Real Estate',
    price: 2500,
    change: 18.1,
    volume24h: 3_500_000,
    totalFragments: 100,
    ownedFragments: 99,
  },
  {
    id: 5,
    name: 'Signed "Metronomy" T-Shirt',
    category: 'Merchandise',
    type: 'Sport',
    price: 85.5,
    change: 12.3,
    volume24h: 150_000,
    totalFragments: 250,
    ownedFragments: 75,
  },
  {
    id: 6,
    name: 'Aphex Twin - Selected Ambient Works',
    category: 'Album Rights',
    type: 'Music',
    price: 750.0,
    change: 0.5,
    volume24h: 450_000,
    totalFragments: 500,
    ownedFragments: 480,
  },
  {
    id: 7,
    name: 'Courtside Seats @ Roland Garros',
    category: 'Event Access',
    type: 'Sport',
    price: 1200.0,
    change: -2.1,
    volume24h: 2_100_000,
    totalFragments: 200,
    ownedFragments: 50,
  },
  {
    id: 8,
    name: 'OG Supporter Scarf',
    category: 'Merchandise',
    type: 'Sport',
    price: 45.0,
    change: 33.3,
    volume24h: 80_000,
    totalFragments: 500,
    ownedFragments: 210,
  },
];

export const portfolioAssets: PortfolioAsset[] = [
  { ...assets[0], quantity: 10, avgBuyPrice: 140.5 },
  { ...assets[3], quantity: 2, avgBuyPrice: 90.0 },
  { ...assets[2], quantity: 1, avgBuyPrice: 450.0 },
]

export const getAssetIcon = (type: Asset["type"]) => {
  switch (type) {
    case "Sport":
      return IconBallFootball
    case "E-Sport":
      return IconDeviceGamepad2
    case "Music":
      return IconMusic
    case "Real Estate":
      return IconHome
    default:
      return IconBallFootball
  }
} 
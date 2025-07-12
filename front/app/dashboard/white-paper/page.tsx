import { NextPage } from 'next';
import {
  IconAward,
  IconChartInfographic,
  IconCoins,
  IconDiamond,
  IconFileText,
  IconFlame,
  IconGauge,
  IconListCheck,
  IconRocket,
  IconTargetArrow,
  IconUsers,
} from '@tabler/icons-react';
import Image from 'next/image';

const WhitePaperPage: NextPage = () => {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center p-3">
            <Image src="/logo.png" alt="Ownible" width={32} height={32} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Ownible White Paper
          </h1>
          <p className="mt-4 text-lg text-neutral-400">
            Bridging Fan Passion with Real-World Asset Investment on the Chiliz Chain.
          </p>
        </header>

        <main className="space-y-12">
          <Section title="Introduction" icon={<IconRocket className="h-6 w-6" />}>
            <p>
              Ownible is a pioneering decentralized platform built on the Chiliz Chain, dedicated to tokenizing Real World Assets (RWA) from the vibrant worlds of sports and entertainment. Our core mission is to empower fans, providing them with a seamless and transparent way to invest in, collect, and interact with digital representations of tangible assets. Imagine owning a fraction of the rights to a classic album, a piece of iconic sports memorabilia, or exclusive access to premier events—Ownible makes this a reality.
            </p>
          </Section>

          <Section title="The Problem" icon={<IconTargetArrow className="h-6 w-6" />}>
            <p>
              In the current landscape, the connection between a fan and the objects of their passion is often passive. There is no simple, liquid, or verifiable method to claim a true stake in the moments, talents, or experiences they cherish. The market for collectibles and unique experiences remains highly centralized, fragmented, and inaccessible to the average enthusiast. This illiquidity and lack of verifiable ownership creates a barrier between fans and the value they help create. Ownible directly addresses this by fractionalizing assets into transparent, tradable tokens that maintain an unbreakable link to their real-world counterparts.
            </p>
          </Section>

          <Section title="Our Solution" icon={<IconDiamond className="h-6 w-6" />}>
            <p>
              Every asset on the Ownible platform—be it a rare collectible, VIP event access, or music copyright—is meticulously represented as an ERC-1155 token on the Chiliz Chain. This standard was chosen for its efficiency in managing both fungible and non-fungible tokens under a single contract.
            </p>
            <p className="mt-4">Each token encapsulates:</p>
            <ul className="mt-4 ml-4 list-disc space-y-2 text-neutral-300">
              <li>An immutable IPFS link to detailed metadata and high-resolution imagery.</li>
              <li>Embedded compliance attributes, such as lock-up periods or KYC/AML requirements.</li>
              <li>A precise record of the fractional ownership percentage it represents.</li>
            </ul>
            <p className="mt-4">
              This architecture allows users to securely buy, sell, or hold these asset fragments using their native CHZ wallet, creating a liquid and accessible secondary market.
            </p>
          </Section>

          <Section title="Core Features" icon={<IconListCheck className="h-6 w-6" />}>
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FeatureItem icon={<IconAward className="text-red-400" />} text="Immersive, gamified interface (marketplace, lobbies, portfolio)." />
              <FeatureItem icon={<IconChartInfographic className="text-red-400" />} text="Diverse categories: E-Sport, Sports, Music, and Real Estate." />
              <FeatureItem icon={<IconCoins className="text-red-400" />} text="Token fragment mechanics (e.g., 1/1000, 1/500)." />
              <FeatureItem icon={<IconGauge className="text-red-400" />} text="Key performance indicators (% change, popularity, volume)." />
              <FeatureItem icon={<IconUsers className="text-red-400" />} text="Full WalletConnect integration for seamless CHZ transactions." />
            </ul>
          </Section>

          <Section title="Use Cases" icon={<IconFlame className="h-6 w-6" />}>
            <ul className="ml-4 list-disc space-y-2 text-neutral-300">
              <li>Purchase 2% of the master rights for a rare Daft Punk vinyl record.</li>
              <li>Own a fractional share of a VIP box for a decisive Champions League match.</li>
              <li>Invest in a tokenized e-sports trophy tied to the performance of your favorite player, like ZywOo.</li>
              <li>Trade asset fragments on the secondary market or receive exclusive rewards for your loyalty.</li>
            </ul>
          </Section>
          
          <Section title="Roadmap" icon={<IconRocket className="h-6 w-6" />}>
          <div className="relative pl-6 after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-neutral-700">
            <RoadmapItem phase="Q2 2024" title="MVP Launch on Testnet" description="Launch of the core marketplace with token fragment trading functionality." done />
            <RoadmapItem phase="Q3 2024" title="FanTrust Reputation System" description="Implementation of a system to reward active and loyal community members." />
            <RoadmapItem phase="Q4 2024" title="Collectible Mascot Drops (Spicy NFTs)" description="Introduction of platform-native collectibles to enhance user engagement." />
            <RoadmapItem phase="Q1 2025" title="RWA-Compliant Smart Contracts" description="Deployment of fully audited smart contracts for mainnet launch." />
            <RoadmapItem phase="Q2 2025" title="Oracle Integration" description="Integration with decentralized oracles for real-time, dynamic asset valuation." />
           </div>
          </Section>

          <Section title="Conclusion" icon={<IconFileText className="h-6 w-6" />}>
            <p>
              Ownible stands at the intersection of fan passion and decentralized finance. By leveraging the speed, security, and scalability of the Chiliz Chain, we are creating a new paradigm for asset ownership in the sports and entertainment industries. We invite you to join us in building the future of decentralized fandom.
            </p>
          </Section>
        </main>
      </div>
    </div>
  );
};

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Section = ({ title, icon, children }: SectionProps) => (
  <section>
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 text-red-500">
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
    </div>
    <div className=" border-l border-neutral-800 pl-6 pb-4">
        <div className="prose prose-invert max-w-none prose-p:text-neutral-300 prose-ul:text-neutral-300">
            {children}
        </div>
    </div>
  </section>
);

interface FeatureItemProps {
  icon: React.ReactNode;
  text: string;
}

const FeatureItem = ({ icon, text }: FeatureItemProps) => (
  <div className="flex items-center gap-3 rounded-lg bg-neutral-800/50 p-3">
    <div className="flex-shrink-0">{icon}</div>
    <span className="text-neutral-300">{text}</span>
  </div>
);

interface RoadmapItemProps {
    phase: string;
    title: string;
    description: string;
    done?: boolean;
}

const RoadmapItem = ({ phase, title, description, done = false }: RoadmapItemProps) => (
    <div className="relative pl-8 py-2 after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-neutral-700">
        <div className={`absolute -left-4 top-2 flex h-8 w-8 items-center justify-center rounded-full ${done ? 'bg-red-500' : 'bg-neutral-800 border-2 border-neutral-700'}`}>
            {done ? <IconListCheck className="h-5 w-5 text-white" /> : <IconRocket className="h-5 w-5 text-neutral-400"/>}
        </div>
        <p className="text-sm font-semibold text-neutral-400">{phase}</p>
        <h4 className="font-bold text-white">{title}</h4>
        <p className="text-sm text-neutral-300">{description}</p>
    </div>
)


export default WhitePaperPage; 
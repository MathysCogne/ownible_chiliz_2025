# 🏆 Chiliz Wallet Integration

Système de connexion wallet intégré pour la blockchain Chiliz avec des composants shadcn/ui.

## ✨ Fonctionnalités

- 🔒 **Connexion sécurisée** : Support MetaMask, WalletConnect et autres wallets
- 💰 **Balance en temps réel** : Affichage du solde CHZ 
- 🌐 **Intégration réseau** : Configuration automatique pour Chiliz
- 🎨 **UI moderne** : Interface avec composants shadcn/ui
- 📱 **Responsive** : Compatible mobile et desktop
- 🔔 **Notifications** : Toast pour les actions utilisateur

## 🏗️ Architecture

```
├── lib/wallet-config.ts          # Configuration wagmi/viem
├── contexts/wallet-context.tsx   # Contexte React pour l'état wallet
├── components/
│   ├── wallet/
│   │   ├── wallet-button.tsx     # Bouton principal de connexion
│   │   ├── wallet-modal.tsx      # Modal de sélection wallet
│   │   └── index.ts              # Exports
│   └── providers.tsx             # Providers React
└── app/
    ├── layout.tsx               # Layout avec header
    └── page.tsx                 # Page d'accueil démonstrative
```

## 🚀 Utilisation

### Bouton de connexion
```tsx
import { WalletButton } from '@/components/wallet'

export function Header() {
  return (
    <header>
      <WalletButton />
    </header>
  )
}
```

### Hook wallet
```tsx
import { useWallet } from '@/contexts/wallet-context'

export function MyComponent() {
  const { 
    isConnected, 
    address, 
    balance, 
    connect, 
    disconnect,
    network 
  } = useWallet()

  return (
    <div>
      {isConnected ? (
        <p>Connecté: {address}</p>
      ) : (
        <button onClick={() => connect()}>Se connecter</button>
      )}
    </div>
  )
}
```

## ⚙️ Configuration

### Variables d'environnement (optionnel)
Créez `.env.local` pour WalletConnect :
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=votre_project_id
```

### Réseau Chiliz
- **Chain ID**: 88888
- **Symbole**: CHZ
- **RPC**: https://rpc.ankr.com/chiliz
- **Explorer**: https://scan.chiliz.com

## 🎯 Composants disponibles

- `WalletButton` : Bouton principal avec états (déconnecté/connecté/chargement)
- `WalletModal` : Modal de sélection des wallets
- `useWallet` : Hook pour accéder à l'état du wallet

## 📱 États de l'interface

1. **Déconnecté** : Bouton "Connect Wallet"
2. **Connexion** : Loader avec "Connecting..."
3. **Connecté** : Avatar + adresse + balance + menu dropdown

## 🛠️ Technologies utilisées

- **wagmi** : Hooks React pour Ethereum
- **viem** : Librairie TypeScript pour Ethereum
- **@tanstack/react-query** : Gestion d'état serveur
- **shadcn/ui** : Composants UI
- **lucide-react** : Icônes
- **sonner** : Notifications toast

## 🎨 Personnalisation

Les composants utilisent les tokens de design shadcn/ui et peuvent être personnalisés via :
- Variables CSS (couleurs, espacements)
- Classes Tailwind
- Variants des composants shadcn

L'intégration est maintenant prête ! 🚀 
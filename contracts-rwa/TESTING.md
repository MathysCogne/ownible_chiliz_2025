# RWA1155 Smart Contract - Guide de Test

## 🚀 Configuration Initiale

1. **Créer le fichier `.env`** :
```bash
cp .env.example .env
```

2. **Configurer votre clé privée** dans `.env` :
```
PRIVATE_KEY=your_private_key_here
DEPLOYED_CONTRACT_ADDRESS=0xcAd8bFBDF935084f9247A851cFb57dC8b26e2Fe0
```

## 🧪 Tests Disponibles

### 1. Tests Unitaires Locaux
```bash
npm test
```
- Teste toutes les fonctionnalités du contrat
- Vérifie les permissions et la sécurité
- Teste les opérations batch

### 2. Tests sur le Contrat Déployé
```bash
npm run test:contract
```
- Teste le contrat déployé sur Chiliz
- Vérifie les fonctionnalités de base
- Confirme que le contrat fonctionne

### 3. Tests Avancés avec Scénarios Réels
```bash
npm run test:advanced
```
- Crée différents types de RWA sportifs
- Teste les transferts entre utilisateurs
- Simule des revenus et des parts

### 4. Mint de Tokens RWA
```bash
npm run mint
```
- Crée des tokens RWA exemples
- Types : fan tokens, droits de naming, droits d'image
- Métadonnées complètes

## 📊 Types de RWA Testés

### 1. Fan Token Revenue (20% de part)
- Revenus des fan tokens
- Merchandising
- Contenu digital

### 2. Stadium Naming Rights (5% de part)
- Droits de naming exclusifs
- Contrat de 10 ans
- Valeur élevée

### 3. Player Image Rights (10% de part)
- Droits d'image de joueurs
- Publicité et endorsements
- Merchandising

### 4. Merchandise Sales (15% de part)
- Ventes de produits officiels
- Distribution mondiale
- Éditions limitées

## 🔧 Commandes de Débogage

### Vérifier les Balances
```bash
npx hardhat console --network chiliz
```

### Interagir avec le Contrat
```javascript
const rwa = await ethers.getContractAt("RWA1155", "0xcAd8bFBDF935084f9247A851cFb57dC8b26e2Fe0");
const balance = await rwa.balanceOf("YOUR_ADDRESS", 1);
console.log("Balance:", balance.toString());
```

## 📈 Métriques de Performance

Les tests incluent :
- ✅ Déploiement et configuration
- ✅ Minting de tokens RWA
- ✅ Transferts et opérations batch
- ✅ Gestion des métadonnées
- ✅ Calculs de revenus simulés
- ✅ Vérification des permissions

## 🏆 Prêt pour le Hackathon !

Votre contrat RWA1155 est maintenant entièrement testé et prêt pour le hackathon Chiliz avec :
- Smart contract sécurisé
- Tests complets
- Exemples de RWA sportifs
- Métadonnées riches
- Scripts de déploiement

Bonne chance pour le hackathon ! 🌶️

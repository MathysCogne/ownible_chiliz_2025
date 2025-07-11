const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration blockchain (READ-ONLY)
const provider = new ethers.providers.JsonRpcProvider('https://spicy-rpc.chiliz.com');

// Contract configuration (READ-ONLY)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0xcAd8bFBDF935084f9247A851cFb57dC8b26e2Fe0';
const CONTRACT_ABI = [
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function balanceOfBatch(address[] memory accounts, uint256[] memory ids) view returns (uint256[])",
  "function getRWA(uint256 tokenId) view returns (string memory rwaType, uint256 percent, string memory metadataURI)",
  "function uri(uint256 tokenId) view returns (string memory)",
  "function owner() view returns (address)",
  "function isApprovedForAll(address account, address operator) view returns (bool)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

// Routes

// 🏠 Health check
app.get('/', (req, res) => {
  res.json({
    message: 'RWA1155 API is running (READ-ONLY)',
    contract: CONTRACT_ADDRESS,
    network: 'Chiliz Spicy Testnet',
    status: 'healthy'
  });
});

// 📊 Get contract info
app.get('/contract/info', async (req, res) => {
  try {
    const owner = await contract.owner();
    res.json({
      address: CONTRACT_ADDRESS,
      owner: owner,
      network: 'Chiliz Spicy Testnet',
      chainId: 88888
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 💰 Get balance
app.get('/balance/:address/:tokenId', async (req, res) => {
  try {
    const { address, tokenId } = req.params;
    const balance = await contract.balanceOf(address, tokenId);
    
    res.json({
      address: address,
      tokenId: tokenId,
      balance: balance.toString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📊 Get batch balances
app.post('/balances/batch', async (req, res) => {
  try {
    const { addresses, tokenIds } = req.body;
    
    if (!addresses || !tokenIds || addresses.length !== tokenIds.length) {
      return res.status(400).json({ error: 'Addresses and tokenIds arrays must have same length' });
    }

    const balances = await contract.balanceOfBatch(addresses, tokenIds);
    
    res.json({
      balances: balances.map(b => b.toString())
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔍 Get RWA data
app.get('/rwa/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const rwaData = await contract.getRWA(tokenId);
    
    res.json({
      tokenId: tokenId,
      rwaType: rwaData.rwaType,
      percent: rwaData.percent.toString(),
      metadataURI: rwaData.metadataURI
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🌐 Get token URI
app.get('/uri/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const uri = await contract.uri(tokenId);
    
    res.json({
      tokenId: tokenId,
      uri: uri
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📋 Get all user tokens
app.get('/user/:address/tokens', async (req, res) => {
  try {
    const { address } = req.params;
    const maxTokenId = 10; // Ajuste selon tes besoins
    
    const tokenIds = Array.from({ length: maxTokenId }, (_, i) => i + 1);
    const addresses = Array(maxTokenId).fill(address);
    
    const balances = await contract.balanceOfBatch(addresses, tokenIds);
    
    const userTokens = [];
    for (let i = 0; i < tokenIds.length; i++) {
      if (balances[i].gt(0)) {
        try {
          const rwaData = await contract.getRWA(tokenIds[i]);
          userTokens.push({
            tokenId: tokenIds[i],
            balance: balances[i].toString(),
            rwaType: rwaData.rwaType,
            percent: rwaData.percent.toString(),
            metadataURI: rwaData.metadataURI
          });
        } catch (error) {
          // Token doesn't exist, skip
        }
      }
    }
    
    res.json({
      address: address,
      tokens: userTokens
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 RWA1155 API running on port ${PORT}`);
  console.log(`📝 Contract: ${CONTRACT_ADDRESS}`);
  console.log(`🌐 Network: Chiliz Spicy Testnet`);
  console.log(`🔍 Mode: READ-ONLY (no wallet needed)`);
});
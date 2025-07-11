const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration blockchain
const provider = new ethers.providers.JsonRpcProvider('https://spicy-rpc.chiliz.com');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract configuration
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0xcAd8bFBDF935084f9247A851cFb57dC8b26e2Fe0';
const CONTRACT_ABI = [
  "function mintRWA(address to, uint256 amount, string memory rwaType, uint256 percent, string memory metadataURI) external",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function balanceOfBatch(address[] memory accounts, uint256[] memory ids) view returns (uint256[])",
  "function getRWA(uint256 tokenId) view returns (string memory rwaType, uint256 percent, string memory metadataURI)",
  "function uri(uint256 tokenId) view returns (string memory)",
  "function owner() view returns (address)",
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) external",
  "function setApprovalForAll(address operator, bool approved) external",
  "function isApprovedForAll(address account, address operator) view returns (bool)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

// Routes

// 🏠 Health check
app.get('/', (req, res) => {
  res.json({
    message: 'RWA1155 API is running',
    contract: CONTRACT_ADDRESS,
    network: 'Chiliz Spicy Testnet'
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

// 🎯 Mint RWA token
app.post('/mint', async (req, res) => {
  try {
    const { to, amount, rwaType, percent, metadataURI } = req.body;
    
    if (!to || !amount || !rwaType || !percent || !metadataURI) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const tx = await contract.mintRWA(to, amount, rwaType, percent, metadataURI);
    const receipt = await tx.wait();
    
    res.json({
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
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

// 🔄 Transfer token
app.post('/transfer', async (req, res) => {
  try {
    const { from, to, tokenId, amount } = req.body;
    
    if (!from || !to || !tokenId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const tx = await contract.safeTransferFrom(from, to, tokenId, amount, '0x');
    const receipt = await tx.wait();
    
    res.json({
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
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
});

// Test script
const API_BASE = 'http://localhost:3001';
const TEST_ADDRESS = '0xcAd8bFBDF935084f9247A851cFb57dC8b26e2Fe0'; // Ton adresse

async function testAPI() {
  try {
    console.log('🧪 Testing RWA1155 API...\n');

    // 1. Health check
    console.log('1. Health Check');
    const health = await axios.get(`${API_BASE}/`);
    console.log('✅', health.data.message);

    // 2. Contract info
    console.log('\n2. Contract Info');
    const info = await axios.get(`${API_BASE}/contract/info`);
    console.log('✅ Contract:', info.data.address);
    console.log('✅ Owner:', info.data.owner);

    // 3. Balance check
    console.log('\n3. Balance Check');
    const balance = await axios.get(`${API_BASE}/balance/${TEST_ADDRESS}/1`);
    console.log('✅ Balance:', balance.data.balance);

    // 4. User tokens
    console.log('\n4. User Tokens');
    const tokens = await axios.get(`${API_BASE}/user/${TEST_ADDRESS}/tokens`);
    console.log('✅ User has', tokens.data.tokens.length, 'tokens');

    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAPI();
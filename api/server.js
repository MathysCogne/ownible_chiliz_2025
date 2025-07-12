const express = require('express');
const { ethers, JsonRpcProvider, Wallet, Contract, parseEther, formatEther } = require('ethers');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// const corsOptions = {
//   origin: 'http://localhost:3000',
//   optionsSuccessStatus: 200 // For legacy browser support
// };
app.use(cors()); // Allow all origins for debugging
app.use(express.json());

// Configuration blockchain
const provider = new JsonRpcProvider('https://spicy-rpc.chiliz.com');
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);

// Contract configuration
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0xcAd8bFBDF935084f9247A851cFb57dC8b26e2Fe0';
const CONTRACT_ABI = [
  "event ApprovalForAll(address indexed account, address indexed operator, bool approved)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)",
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "event URI(string value, uint256 indexed id)",
  "constructor()",
  "function addToWhitelist(uint256 tokenId, address[] calldata users) external",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function balanceOfBatch(address[] memory accounts, uint256[] memory ids) view returns (uint256[])",
  "function buyRwa(uint256 tokenId, uint256 amount) payable",
  "function claimRevenue(uint256 tokenId) external",
  "function depositRevenue(uint256 tokenId) payable",
  "function getClaimableRevenue(uint256 tokenId, address user) view returns (uint256)",
  "function getRWA(uint256 tokenId) view returns (tuple(string rwaType, uint256 percent, string metadataURI, string legalDocURI, uint256 lockupEndDate, bool complianceRequired, uint256 price))",
  "function isApprovedForAll(address account, address operator) view returns (bool)",
  "function isWhitelisted(uint256 tokenId, address user) view returns (bool)",
  "function lastTokenId() view returns (uint256)",
  "function mintRWA(address to, uint256 amount, string memory rwaType, uint256 percent, string memory metadataURI, string memory legalDocURI, uint256 lockupEndDate, bool complianceRequired, uint256 price) external returns (uint256)",
  "function owner() view returns (address)",
  "function removeFromWhitelist(uint256 tokenId, address[] calldata users) external",
  "function rwaMetadata(uint256) view returns (string rwaType, uint256 percent, string metadataURI, string legalDocURI, uint256 lockupEndDate, bool complianceRequired, uint256 price)",
  "function safeBatchTransferFrom(address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) external",
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) external",
  "function setApprovalForAll(address operator, bool approved) external",
  "function setURI(uint256 tokenId, string memory newuri) external",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",
  "function totalSupply(uint256) view returns (uint256)",
  "function totalRevenueDeposited(uint256) view returns (uint256)",
  "function uri(uint256 tokenId) view returns (string memory)"
];

const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

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
    const { 
        to,
        amount,
        rwaType,
        percent,
        metadataURI,
        legalDocURI = '', // default to empty
        lockupEndDate = 0, // default to no lockup
        complianceRequired = false, // default to false
        price = 0 // default to not for sale
    } = req.body;
    
    if (!to || !amount || !rwaType || !percent || !metadataURI) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const priceInWei = parseEther(price.toString());
    const tx = await contract.mintRWA(to, amount, rwaType, percent, metadataURI, legalDocURI, lockupEndDate, complianceRequired, priceInWei);
    const receipt = await tx.wait();
    
    // We can get the tokenId from the event emitted by the contract
    const event = receipt.events?.find(e => e.event === 'TransferSingle');
    const tokenId = event ? event.args.id.toNumber() : null;

    res.json({
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      tokenId: tokenId
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

// --- Marketplace Route ---
app.get('/rwa/marketplace', async (req, res) => {
    try {
        // For now, we fetch all tokens and filter. In production, this would be optimized.
        const lastId = await contract.lastTokenId();
        const maxTokenId = Number(lastId);
        if (maxTokenId === 0) {
            return res.json([]);
        }

        const allRwas = [];
        for (let i = 1; i <= maxTokenId; i++) {
            const rwaData = await contract.getRWA(i);
            if (rwaData.price > 0) { // Only list items with a price
                allRwas.push({
                    tokenId: i,
                    rwaType: rwaData.rwaType,
                    percent: rwaData.percent.toString(),
                    metadataURI: rwaData.metadataURI,
                    legalDocURI: rwaData.legalDocURI,
                    lockupEndDate: rwaData.lockupEndDate.toString(),
                    complianceRequired: rwaData.complianceRequired,
                    price: formatEther(rwaData.price)
                });
            }
        }
        res.json(allRwas);
    } catch (error) {
        const errorMessage = `[${new Date().toISOString()}] Marketplace Error: ${error.stack}\n`;
        fs.appendFileSync('api_error.log', errorMessage);
        console.error("Error in /rwa/marketplace:", error);
        res.status(500).json({ error: 'Internal Server Error. See api_error.log for details.' });
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
      metadataURI: rwaData.metadataURI,
      legalDocURI: rwaData.legalDocURI,
      lockupEndDate: rwaData.lockupEndDate.toString(),
      complianceRequired: rwaData.complianceRequired,
      price: formatEther(rwaData.price)
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
    const lastId = await contract.lastTokenId();
    const maxTokenId = Number(lastId);

    if (maxTokenId === 0) {
        return res.json({ address: address, tokens: [] });
    }
    
    const tokenIds = Array.from({ length: maxTokenId }, (_, i) => i + 1);
    const addresses = Array(maxTokenId).fill(address);
    
    const balances = await contract.balanceOfBatch(addresses, tokenIds);
    
    const userTokens = [];
    for (let i = 0; i < tokenIds.length; i++) {
      if (balances[i].gt(0)) {
        try {
          const rwaData = await contract.getRWA(tokenIds[i]);
          const metadata = {
            legalDocURI: rwaData.legalDocURI,
            lockupEndDate: rwaData.lockupEndDate.toString(),
            complianceRequired: rwaData.complianceRequired
          }

          userTokens.push({
            tokenId: tokenIds[i],
            balance: balances[i].toString(),
            rwaType: rwaData.rwaType,
            percent: rwaData.percent.toString(),
            metadataURI: rwaData.metadataURI,
            ...metadata
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


// --- Buy Route ---
app.post('/rwa/buy', async (req, res) => {
    try {
        const { tokenId, amount, price } = req.body;
        if (!tokenId || !amount || !price) {
            return res.status(400).json({ error: 'tokenId, amount, and price are required' });
        }

        // The user's wallet (signer) must be used to call buyRwa, not the server's wallet.
        // This endpoint should ideally just verify the transaction after the user initiates it.
        // For now, we'll simulate this, but this is a critical security point.
        // A real implementation requires the front-end to create and send the transaction.
        
        // This is a placeholder for what should be a front-end driven transaction
        console.log(`Received buy request for ${amount} of token ${tokenId} at ${price} CHZ each.`);
        res.status(501).json({ 
            message: 'Not implemented. This must be a client-side transaction.',
            details: 'The user wallet must sign the buyRwa transaction.'
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// --- Whitelist Routes ---

app.post('/whitelist/add', async (req, res) => {
    try {
        const { tokenId, users } = req.body;
        if (!tokenId || !users || !Array.isArray(users)) {
            return res.status(400).json({ error: 'Missing tokenId or users array' });
        }
        const tx = await contract.addToWhitelist(tokenId, users);
        await tx.wait();
        res.json({ success: true, transactionHash: tx.hash });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/whitelist/remove', async (req, res) => {
    try {
        const { tokenId, users } = req.body;
        if (!tokenId || !users || !Array.isArray(users)) {
            return res.status(400).json({ error: 'Missing tokenId or users array' });
        }
        const tx = await contract.removeFromWhitelist(tokenId, users);
        await tx.wait();
        res.json({ success: true, transactionHash: tx.hash });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/whitelist/:tokenId/:address', async (req, res) => {
    try {
        const { tokenId, address } = req.params;
        const isWhitelisted = await contract.isWhitelisted(tokenId, address);
        res.json({ tokenId, address, isWhitelisted });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// --- Revenue Routes ---

app.post('/revenue/deposit/:tokenId', async (req, res) => {
    try {
        const { tokenId } = req.params;
        const { amount } = req.body; // amount in CHZ
        if (!amount) {
            return res.status(400).json({ error: 'Amount is required' });
        }
        const tx = await contract.depositRevenue(tokenId, { value: parseEther(amount) });
        await tx.wait();
        res.json({ success: true, transactionHash: tx.hash });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/revenue/claimable/:tokenId/:address', async (req, res) => {
    try {
        const { tokenId, address } = req.params;
        const claimableAmount = await contract.getClaimableRevenue(tokenId, address);
        res.json({
            tokenId,
            address,
            claimableAmount: formatEther(claimableAmount)
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
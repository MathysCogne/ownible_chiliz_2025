export const rwaContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xbC582C561Ba3d267f39606af68CCF36029a1D12E';

export const rwaContractAbi = [
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
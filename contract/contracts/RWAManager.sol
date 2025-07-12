// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract RWAManager is ERC1155, ERC1155Holder {
    struct Asset {
        string name;
        string category;
        uint256 valuation;
        uint256 totalFragments;
        bool isNFT;
        bool isTransferable;
        uint256 remainingFragments;
        address owner;
        string metadataURI; // ← Nouveau champ IPFS
        string imageURI;    // ← Nouveau champ pour l'image
    }

    mapping(uint256 => Asset) public assets;
    mapping(address => bool) public authorizedIssuers;
    mapping(uint256 => mapping(address => uint256)) public fragmentBalances;

    address public admin;
    string public baseURI;
    uint256 private _currentAssetId = 1;

    event AssetCreated(uint256 indexed assetId, string name, uint256 valuation, string metadataURI);
    event FragmentsPurchased(uint256 indexed assetId, address indexed buyer, uint256 amount);
    event MetadataUpdated(uint256 indexed assetId, string newMetadataURI);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedIssuers[msg.sender], "Not authorized");
        _;
    }

    constructor(string memory _baseURI) ERC1155(_baseURI) {
        admin = msg.sender;
        baseURI = _baseURI;
        authorizedIssuers[msg.sender] = true;
    }

    function createAsset(
        string memory name,
        string memory category,
        uint256 valuation,
        uint256 totalFragments,
        bool isNFT,
        bool isTransferable,
        string memory metadataURI,  // ← Nouveau paramètre
        string memory imageURI      // ← Nouveau paramètre
    ) external onlyAuthorized {
        require(valuation > 0 && totalFragments > 0, "Invalid parameters");
        require(bytes(metadataURI).length > 0, "Metadata URI required");

        uint256 assetId = _currentAssetId;
        _currentAssetId++;

        assets[assetId] = Asset({
            name: name,
            category: category,
            valuation: valuation,
            totalFragments: totalFragments,
            isNFT: isNFT,
            isTransferable: isTransferable,
            remainingFragments: totalFragments,
            owner: address(0),
            metadataURI: metadataURI,
            imageURI: imageURI
        });

        _mint(address(this), assetId, totalFragments, "");

        emit AssetCreated(assetId, name, valuation, metadataURI);
    }

    // Nouvelle fonction pour récupérer l'URI d'un token
    function uri(uint256 tokenId) public view override returns (string memory) {
        require(tokenId < _currentAssetId, "Token does not exist");
        return assets[tokenId].metadataURI;
    }

    // Nouvelle fonction pour mettre à jour les métadonnées
    function updateMetadata(uint256 assetId, string memory newMetadataURI) external {
        require(assetId < _currentAssetId, "Asset does not exist");
        require(assets[assetId].owner == msg.sender || msg.sender == admin, "Not authorized");
        
        assets[assetId].metadataURI = newMetadataURI;
        emit MetadataUpdated(assetId, newMetadataURI);
    }

    function buyFragments(uint256 assetId, uint256 amount) external payable {
        require(amount > 0, "Amount must be greater than 0"); // Nouvelle validation
        Asset storage asset = assets[assetId];
        require(asset.remainingFragments >= amount, "Not enough fragments");
        require(asset.isTransferable, "Asset not transferable");
        require(msg.value >= (asset.valuation * amount) / asset.totalFragments, "Underpayment");

        asset.remainingFragments -= amount;
        fragmentBalances[assetId][msg.sender] += amount;

        _safeTransferFrom(address(this), msg.sender, assetId, amount, "");

        // Refund overpayment
        uint256 expected = (asset.valuation * amount) / asset.totalFragments;
        if (msg.value > expected) {
            payable(msg.sender).transfer(msg.value - expected);
        }

        emit FragmentsPurchased(assetId, msg.sender, amount);
    }

    function buyFullOwnership(uint256 assetId) external payable {
        Asset storage asset = assets[assetId];
        require(asset.owner == address(0), "Already owned");
        require(asset.remainingFragments == asset.totalFragments, "Fragments already sold");
        require(msg.value >= asset.valuation, "Insufficient payment");

        asset.owner = msg.sender;
        asset.remainingFragments = 0;

        _safeTransferFrom(address(this), msg.sender, assetId, asset.totalFragments, "");

        if (msg.value > asset.valuation) {
            payable(msg.sender).transfer(msg.value - asset.valuation);
        }
    }

    function getFragmentBalance(uint256 assetId, address user) external view returns (uint256) {
        return fragmentBalances[assetId][user];
    }

    function addAuthorizedIssuer(address issuer) external onlyAdmin {
        authorizedIssuers[issuer] = true;
    }

    function removeAuthorizedIssuer(address issuer) external onlyAdmin {
        authorizedIssuers[issuer] = false;
    }

    function getAssetCount() external view returns (uint256) {
        return _currentAssetId - 1;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, ERC1155Holder) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

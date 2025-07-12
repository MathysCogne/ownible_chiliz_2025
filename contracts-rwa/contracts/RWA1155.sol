// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RWA1155 is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct RWAData {
        string rwaType;         // Ex: "Droit musical", "Merch"
        uint256 percent;        // Pourcentage de propriété représenté
        string metadataURI;     // Lien vers le JSON de métadonnées (IPFS)
        string legalDocURI;     // Lien vers le document légal
        uint256 lockupEndDate;  // Timestamp de fin de blocage
        bool complianceRequired; // Le KYC/Whitelist est-il actif pour ce token ?
        uint256 price;          // Price per token in wei (CHZ)
    }

    mapping(uint256 => RWAData) public rwaMetadata;
    mapping(uint256 => uint256) public totalSupply;
    mapping(uint256 => mapping(address => bool)) public whitelist;
    
    // Revenue tracking
    mapping(uint256 => uint256) public totalRevenueDeposited;
    mapping(uint256 => mapping(address => uint256)) public claimedRevenue;

    constructor() ERC1155("") {}

    function setURI(uint256 tokenId, string memory newuri) public onlyOwner {
        require(_tokenIds.current() > 0 && tokenId <= _tokenIds.current(), "RWA1155: URI set for nonexistent token");
        rwaMetadata[tokenId].metadataURI = newuri;
    }

    function mintRWA(
        address to,
        uint256 amount,
        string memory rwaType,
        uint256 percent,
        string memory metadataURI,
        string memory legalDocURI,
        uint256 lockupEndDate,
        bool complianceRequired,
        uint256 price
    ) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        rwaMetadata[newItemId] = RWAData({
            rwaType: rwaType,
            percent: percent,
            metadataURI: metadataURI,
            legalDocURI: legalDocURI,
            lockupEndDate: lockupEndDate,
            complianceRequired: complianceRequired,
            price: price
        });

        _mint(to, newItemId, amount, "");
        totalSupply[newItemId] += amount;

        return newItemId;
    }

    // --- Whitelist Management ---
    function addToWhitelist(uint256 tokenId, address[] calldata users) public onlyOwner {
        for (uint i = 0; i < users.length; i++) {
            whitelist[tokenId][users[i]] = true;
        }
    }

    function removeFromWhitelist(uint256 tokenId, address[] calldata users) public onlyOwner {
        for (uint i = 0; i < users.length; i++) {
            whitelist[tokenId][users[i]] = false;
        }
    }

    function isWhitelisted(uint256 tokenId, address user) public view returns (bool) {
        return whitelist[tokenId][user];
    }

    // --- Revenue Management ---
    function depositRevenue(uint256 tokenId) public payable onlyOwner {
        require(_tokenIds.current() > 0 && tokenId <= _tokenIds.current(), "RWA1155: Deposit for nonexistent token");
        require(msg.value > 0, "RWA1155: Deposit must be greater than zero");
        totalRevenueDeposited[tokenId] += msg.value;
    }

    function getClaimableRevenue(uint256 tokenId, address user) public view returns (uint256) {
        uint256 userBalance = balanceOf(user, tokenId);
        if (userBalance == 0) {
            return 0;
        }

        uint256 totalTokenSupply = totalSupply[tokenId];
        if (totalTokenSupply == 0) {
            return 0;
        }

        uint256 totalDeposited = totalRevenueDeposited[tokenId];
        uint256 userEntitlement = (totalDeposited * userBalance) / totalTokenSupply;
        uint256 alreadyClaimed = claimedRevenue[tokenId][user];
        
        if (userEntitlement <= alreadyClaimed) {
            return 0;
        }

        return userEntitlement - alreadyClaimed;
    }

    function claimRevenue(uint256 tokenId) public {
        uint256 claimableAmount = getClaimableRevenue(tokenId, msg.sender);
        require(claimableAmount > 0, "RWA1155: No revenue to claim");

        claimedRevenue[tokenId][msg.sender] += claimableAmount;
        
        (bool success, ) = msg.sender.call{value: claimableAmount}("");
        require(success, "RWA1155: Transfer failed");
    }

    function buyRwa(uint256 tokenId, uint256 amount) public payable {
        RWAData storage rwa = rwaMetadata[tokenId];
        require(rwa.price > 0, "RWA1155: This token is not for sale");
        
        uint256 requiredAmount = rwa.price * amount;
        require(msg.value == requiredAmount, "RWA1155: Incorrect amount of CHZ sent");

        // Use the internal transfer function to ensure all checks are performed
        _safeTransferFrom(owner(), msg.sender, tokenId, amount, "");

        // Forward payment to the owner
        (bool success, ) = owner().call{value: msg.value}("");
        require(success, "RWA1155: Payment transfer failed");
    }

    function lastTokenId() public view returns (uint256) {
        return _tokenIds.current();
    }


    // --- Core Logic Override ---
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override {
        for (uint i = 0; i < ids.length; i++) {
            uint256 tokenId = ids[i];
            RWAData storage rwa = rwaMetadata[tokenId];

            // 1. Check Lock-up period
            // The owner/operator can bypass the lock-up to distribute tokens initially.
            if (from != owner() && from != address(0) && block.timestamp < rwa.lockupEndDate) {
                revert("RWA1155: Token is locked");
            }

            // 2. Check Compliance / Whitelist
            // Transfer is allowed if:
            // - Compliance is not required for this token
            // - The sender is the owner (initial distribution)
            // - The receiver is on the whitelist
            // - It's a burn or mint operation
            if (
                rwa.complianceRequired &&
                from != owner() &&
                to != address(0) &&
                from != address(0) &&
                !isWhitelisted(tokenId, to)
            ) {
                revert("RWA1155: Receiver not whitelisted for this token");
            }
        }
        
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        require(_tokenIds.current() > 0 && tokenId <= _tokenIds.current(), "RWA1155: URI query for nonexistent token");
        return rwaMetadata[tokenId].metadataURI;
    }

    function getRWA(uint256 tokenId) public view returns (RWAData memory) {
        require(_tokenIds.current() > 0 && tokenId <= _tokenIds.current(), "RWA1155: RWA query for nonexistent token");
        return rwaMetadata[tokenId];
    }
}

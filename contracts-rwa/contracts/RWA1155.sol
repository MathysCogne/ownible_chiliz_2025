// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RWA1155 is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct RWAData {
        string rwaType;
        uint256 percent;
        string metadataURI;
    }

    mapping(uint256 => RWAData) public rwaMetadata;

    constructor() ERC1155("") {}

    function mintRWA(
        address to,
        uint256 amount,
        string memory rwaType,
        uint256 percent,
        string memory metadataURI
    ) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        rwaMetadata[newItemId] = RWAData({
            rwaType: rwaType,
            percent: percent,
            metadataURI: metadataURI
        });

        _mint(to, newItemId, amount, "");

        return newItemId;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return rwaMetadata[tokenId].metadataURI;
    }

    function getRWA(uint256 tokenId) public view returns (RWAData memory) {
        return rwaMetadata[tokenId];
    }
}

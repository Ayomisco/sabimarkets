// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SabiMarket.sol";

/// @title SabiMarketFactory - Creates and indexes prediction markets
/// @notice Deployed once. Creates SabiMarket instances for each prediction question.
contract SabiMarketFactory is Ownable {
    // --- State ---
    address public collateralToken; // USDC address
    address public feeRecipient;    // Where trading fees go

    address[] public allMarkets;
    mapping(address => bool) public isMarket;
    mapping(string => address[]) public marketsByCategory;

    // Authorized resolvers (can resolve markets)
    mapping(address => bool) public resolvers;

    // --- Events ---
    event MarketCreated(
        address indexed market,
        string question,
        string category,
        uint256 endTime,
        address resolver,
        uint256 index
    );
    event ResolverUpdated(address indexed resolver, bool authorized);
    event FeeRecipientUpdated(address indexed newRecipient);

    constructor(address _collateralToken, address _feeRecipient) Ownable(msg.sender) {
        require(_collateralToken != address(0), "Invalid collateral");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        collateralToken = _collateralToken;
        feeRecipient = _feeRecipient;
        resolvers[msg.sender] = true;
    }

    /// @notice Create a new prediction market
    function createMarket(
        string calldata _question,
        string calldata _category,
        string calldata _imageUri,
        uint256 _endTime,
        address _resolver
    ) external onlyOwner returns (address) {
        require(_resolver != address(0), "Invalid resolver");
        require(resolvers[_resolver], "Resolver not authorized");

        SabiMarket market = new SabiMarket(
            collateralToken,
            _question,
            _category,
            _imageUri,
            _endTime,
            _resolver,
            feeRecipient
        );

        address marketAddr = address(market);
        allMarkets.push(marketAddr);
        isMarket[marketAddr] = true;
        marketsByCategory[_category].push(marketAddr);

        emit MarketCreated(marketAddr, _question, _category, _endTime, _resolver, allMarkets.length - 1);

        return marketAddr;
    }

    // --- Admin ---

    function setResolver(address _resolver, bool _authorized) external onlyOwner {
        resolvers[_resolver] = _authorized;
        emit ResolverUpdated(_resolver, _authorized);
    }

    function setFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid address");
        feeRecipient = _newRecipient;
        emit FeeRecipientUpdated(_newRecipient);
    }

    // --- View ---

    function getMarketCount() external view returns (uint256) {
        return allMarkets.length;
    }

    function getMarkets(uint256 _offset, uint256 _limit) external view returns (address[] memory) {
        uint256 total = allMarkets.length;
        if (_offset >= total) {
            return new address[](0);
        }
        uint256 end = _offset + _limit;
        if (end > total) end = total;
        uint256 count = end - _offset;

        address[] memory result = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = allMarkets[_offset + i];
        }
        return result;
    }

    function getMarketsByCategory(string calldata _category) external view returns (address[] memory) {
        return marketsByCategory[_category];
    }
}

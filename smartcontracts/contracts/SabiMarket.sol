// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title SabiMarket - A single prediction market
/// @notice Binary (YES/NO) prediction market with USDC collateral
contract SabiMarket is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // --- State ---
    address public factory;
    IERC20 public collateralToken; // USDC
    string public question;
    string public category;
    string public imageUri;
    uint256 public endTime;
    uint256 public createdAt;
    address public resolver; // address that can resolve the market

    enum Outcome { UNRESOLVED, YES, NO, INVALID }
    Outcome public outcome;
    bool public resolved;

    uint256 public totalYesShares;
    uint256 public totalNoShares;
    uint256 public totalCollateral;

    // Fee in basis points (100 = 1%)
    uint256 public constant FEE_BPS = 100; // 1%
    uint256 public constant BPS = 10_000;
    address public feeRecipient;
    uint256 public feesCollected;

    mapping(address => uint256) public yesShares;
    mapping(address => uint256) public noShares;
    mapping(address => bool) public hasClaimed;

    // --- Events ---
    event SharesPurchased(address indexed buyer, bool isYes, uint256 amount, uint256 cost);
    event SharesSold(address indexed seller, bool isYes, uint256 amount, uint256 payout);
    event MarketResolved(Outcome outcome);
    event WinningsClaimed(address indexed user, uint256 amount);

    modifier onlyResolver() {
        require(msg.sender == resolver, "Only resolver");
        _;
    }

    modifier notResolved() {
        require(!resolved, "Market resolved");
        _;
    }

    modifier isResolved() {
        require(resolved, "Market not resolved");
        _;
    }

    constructor(
        address _collateralToken,
        string memory _question,
        string memory _category,
        string memory _imageUri,
        uint256 _endTime,
        address _resolver,
        address _feeRecipient
    ) {
        require(_endTime > block.timestamp, "End time must be future");
        factory = msg.sender;
        collateralToken = IERC20(_collateralToken);
        question = _question;
        category = _category;
        imageUri = _imageUri;
        endTime = _endTime;
        resolver = _resolver;
        feeRecipient = _feeRecipient;
        createdAt = block.timestamp;
    }

    /// @notice Buy YES or NO shares. 1 share = 1 USDC collateral backing.
    /// @dev Uses constant-product-like pricing: price = shares_of_side / total_shares
    function buyShares(bool _isYes, uint256 _amount) external nonReentrant notResolved {
        require(block.timestamp < endTime, "Market ended");
        require(_amount > 0, "Amount must be > 0");

        // Calculate fee
        uint256 fee = (_amount * FEE_BPS) / BPS;
        uint256 netAmount = _amount - fee;

        // Transfer collateral from buyer
        collateralToken.safeTransferFrom(msg.sender, address(this), _amount);

        // Accumulate fee
        feesCollected += fee;

        // Mint shares 1:1 with net collateral
        if (_isYes) {
            yesShares[msg.sender] += netAmount;
            totalYesShares += netAmount;
        } else {
            noShares[msg.sender] += netAmount;
            totalNoShares += netAmount;
        }

        totalCollateral += netAmount;

        emit SharesPurchased(msg.sender, _isYes, netAmount, _amount);
    }

    /// @notice Sell shares back before resolution
    function sellShares(bool _isYes, uint256 _amount) external nonReentrant notResolved {
        require(_amount > 0, "Amount must be > 0");

        if (_isYes) {
            require(yesShares[msg.sender] >= _amount, "Insufficient YES shares");
            yesShares[msg.sender] -= _amount;
            totalYesShares -= _amount;
        } else {
            require(noShares[msg.sender] >= _amount, "Insufficient NO shares");
            noShares[msg.sender] -= _amount;
            totalNoShares -= _amount;
        }

        // Fee on sell
        uint256 fee = (_amount * FEE_BPS) / BPS;
        uint256 payout = _amount - fee;
        feesCollected += fee;
        totalCollateral -= _amount;

        collateralToken.safeTransfer(msg.sender, payout);

        emit SharesSold(msg.sender, _isYes, _amount, payout);
    }

    /// @notice Resolver sets the final outcome
    function resolve(Outcome _outcome) external onlyResolver notResolved {
        require(_outcome != Outcome.UNRESOLVED, "Invalid outcome");
        outcome = _outcome;
        resolved = true;
        emit MarketResolved(_outcome);
    }

    /// @notice Winners claim their share of the collateral pool
    function claimWinnings() external nonReentrant isResolved {
        require(!hasClaimed[msg.sender], "Already claimed");

        uint256 userPayout = 0;

        if (outcome == Outcome.YES) {
            uint256 userShares = yesShares[msg.sender];
            require(userShares > 0, "No winning shares");
            // Payout proportional to share of winning pool
            userPayout = (userShares * totalCollateral) / totalYesShares;
        } else if (outcome == Outcome.NO) {
            uint256 userShares = noShares[msg.sender];
            require(userShares > 0, "No winning shares");
            userPayout = (userShares * totalCollateral) / totalNoShares;
        } else if (outcome == Outcome.INVALID) {
            // Refund proportional to total shares held
            uint256 totalUserShares = yesShares[msg.sender] + noShares[msg.sender];
            require(totalUserShares > 0, "No shares");
            uint256 totalAllShares = totalYesShares + totalNoShares;
            userPayout = (totalUserShares * totalCollateral) / totalAllShares;
        }

        hasClaimed[msg.sender] = true;
        collateralToken.safeTransfer(msg.sender, userPayout);

        emit WinningsClaimed(msg.sender, userPayout);
    }

    /// @notice Withdraw accumulated fees
    function withdrawFees() external {
        require(msg.sender == feeRecipient, "Not fee recipient");
        uint256 amount = feesCollected;
        feesCollected = 0;
        collateralToken.safeTransfer(feeRecipient, amount);
    }

    // --- View Functions ---

    /// @notice Get YES price as a percentage (0-100 scaled to 1e6)
    function getYesPrice() external view returns (uint256) {
        if (totalYesShares + totalNoShares == 0) return 500_000; // 50%
        return (totalYesShares * 1_000_000) / (totalYesShares + totalNoShares);
    }

    /// @notice Get NO price as a percentage (0-100 scaled to 1e6)
    function getNoPrice() external view returns (uint256) {
        if (totalYesShares + totalNoShares == 0) return 500_000; // 50%
        return (totalNoShares * 1_000_000) / (totalYesShares + totalNoShares);
    }

    /// @notice Get market info
    function getMarketInfo()
        external
        view
        returns (
            string memory _question,
            string memory _category,
            string memory _imageUri,
            uint256 _endTime,
            uint256 _totalYes,
            uint256 _totalNo,
            uint256 _totalCollateral,
            bool _resolved,
            Outcome _outcome,
            uint256 _createdAt
        )
    {
        return (
            question,
            category,
            imageUri,
            endTime,
            totalYesShares,
            totalNoShares,
            totalCollateral,
            resolved,
            outcome,
            createdAt
        );
    }

    /// @notice Get a user's position
    function getUserPosition(address _user) external view returns (uint256 _yes, uint256 _no, bool _claimed) {
        return (yesShares[_user], noShares[_user], hasClaimed[_user]);
    }
}

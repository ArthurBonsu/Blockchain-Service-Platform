pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BlockchainServicesCoin is ERC20, Ownable {
    // Token details
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;  // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 200_000_000 * 10**18;  // 200 million initial supply

    // Staking and governance features
    mapping(address => uint256) public stakingBalances;
    mapping(address => uint256) public stakingTimestamps;

    // Events
    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount);

    constructor() ERC20("BlockchainServices", "BCS") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    // Stake tokens for platform governance and rewards
    function stakeTokens(uint256 amount) public {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Transfer tokens to contract
        _transfer(_msgSender(), address(this), amount);
        
        // Update staking balance
        stakingBalances[_msgSender()] += amount;
        stakingTimestamps[_msgSender()] = block.timestamp;
        
        emit TokensStaked(_msgSender(), amount);
    }

    // Unstake tokens
    function unstakeTokens(uint256 amount) public {
        require(stakingBalances[_msgSender()] >= amount, "Insufficient staked balance");
        
        // Calculate potential rewards (simplified)
        uint256 stakingDuration = block.timestamp - stakingTimestamps[_msgSender()];
        uint256 rewards = calculateRewards(amount, stakingDuration);
        
        // Update balances
        stakingBalances[_msgSender()] -= amount;
        
        // Transfer original staked amount and rewards
        _transfer(address(this), _msgSender(), amount);
        _mint(_msgSender(), rewards);
        
        emit TokensUnstaked(_msgSender(), amount);
    }

    // Simple rewards calculation (can be made more complex)
    function calculateRewards(uint256 amount, uint256 stakingDuration) public pure returns (uint256) {
        // Example: 5% annual return
        return (amount * stakingDuration * 5) / (365 days * 100);
    }

    // Platform-specific utility functions
    function governanceVote(uint256 proposalId) public {
        require(stakingBalances[_msgSender()] > 0, "Must stake tokens to vote");
        // Implement voting logic
    }

    // Mint new tokens for specific platform activities (controlled)
    function mintPlatformRewards(address recipient, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(recipient, amount);
    }
}
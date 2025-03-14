// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract MultiEnergyToken is ERC20, Ownable, ReentrancyGuard {
    // Token Types Enum
    enum TokenType {
        ENERGY,
        RENEWABLE,
        CARBON_CREDIT,
        INFRASTRUCTURE,
        UTILITY
    }

    // Token Metadata Struct
    struct TokenMetadata {
        string name;
        string symbol;
        TokenType tokenType;
        uint256 initialSupply;
        uint256 tokenPrice;
        uint256 energyEquivalent; // kWh per token
    }

    // Token Mapping
    mapping(string => TokenMetadata) public tokenRegistry;
    mapping(string => address) public tokenAddresses;

    // Uniswap Router and Factory
    IUniswapV2Router02 public uniswapRouter;
    IUniswapV2Factory public uniswapFactory;

    // Energy and Carbon Tracking
    mapping(address => uint256) public carbonCredits;
    mapping(address => uint256) public energyProduction;
    mapping(address => uint256) public energyConsumption;

    // Price and Conversion Rates
    mapping(string => mapping(string => uint256)) public conversionRates;

    // Events
    event TokenCreated(string indexed symbol, address tokenAddress, TokenType tokenType);
    event EnergyTokenized(address indexed account, uint256 energyAmount, uint256 tokensMinted);
    event TokensConverted(
        address indexed sender, 
        string fromSymbol, 
        string toSymbol, 
        uint256 amount, 
        uint256 convertedAmount
    );
    event CarbonCreditEarned(address indexed account, uint256 credits);

    constructor(
        address _uniswapRouterAddress, 
        address _uniswapFactoryAddress
    ) ERC20("MultiTokenEnergyExchange", "MTEE") {
        uniswapRouter = IUniswapV2Router02(_uniswapRouterAddress);
        uniswapFactory = IUniswapV2Factory(_uniswapFactoryAddress);
    }

    // Create a new token type
    function createToken(
        string memory _name, 
        string memory _symbol, 
        TokenType _tokenType, 
        uint256 _initialSupply, 
        uint256 _tokenPrice,
        uint256 _energyEquivalent
    ) public onlyOwner returns (address) {
        require(tokenAddresses[_symbol] == address(0), "Token symbol already exists");
        
        // Deploy new ERC20 token
        IERC20 newToken = new ERC20(_name, _symbol);
        address tokenAddress = address(newToken);
        
        // Register token metadata
        tokenRegistry[_symbol] = TokenMetadata({
            name: _name,
            symbol: _symbol,
            tokenType: _tokenType,
            initialSupply: _initialSupply,
            tokenPrice: _tokenPrice,
            energyEquivalent: _energyEquivalent
        });
        
        tokenAddresses[_symbol] = tokenAddress;
        
        // Mint initial supply
        ERC20(tokenAddress)._mint(msg.sender, _initialSupply);
        
        emit TokenCreated(_symbol, tokenAddress, _tokenType);
        return tokenAddress;
    }

    // Convert tokens between different types
    function convertTokens(
        string memory _fromSymbol, 
        string memory _toSymbol, 
        uint256 _amount
    ) public nonReentrant {
        address fromTokenAddress = tokenAddresses[_fromSymbol];
        address toTokenAddress = tokenAddresses[_toSymbol];
        
        require(fromTokenAddress != address(0), "From token does not exist");
        require(toTokenAddress != address(0), "To token does not exist");
        
        // Transfer from token
        IERC20(fromTokenAddress).transferFrom(msg.sender, address(this), _amount);
        
        // Calculate conversion rate
        uint256 conversionRate = conversionRates[_fromSymbol][_toSymbol];
        require(conversionRate > 0, "No conversion rate set");
        
        uint256 convertedAmount = _amount * conversionRate;
        
        // Transfer to token
        IERC20(toTokenAddress).transfer(msg.sender, convertedAmount);
        
        emit TokensConverted(msg.sender, _fromSymbol, _toSymbol, _amount, convertedAmount);
    }

    // Set conversion rate between tokens
    function setConversionRate(
        string memory _fromSymbol, 
        string memory _toSymbol, 
        uint256 _rate
    ) public onlyOwner {
        conversionRates[_fromSymbol][_toSymbol] = _rate;
    }

    // Tokenize energy production
    function tokenizeEnergy(uint256 _energyAmount) public {
        // Assume 1 kWh = 1 token for simplicity
        uint256 tokensToMint = _energyAmount;
        
        // Mint energy tokens
        _mint(msg.sender, tokensToMint);
        
        // Track energy production
        energyProduction[msg.sender] += _energyAmount;
        
        emit EnergyTokenized(msg.sender, _energyAmount, tokensToMint);
    }

    // Calculate and award carbon credits
    function calculateCarbonCredits() public {
        uint256 energyProduced = energyProduction[msg.sender];
        uint256 energyConsumed = energyConsumption[msg.sender];
        
        // Simple carbon credit calculation
        // More energy produced than consumed = more credits
        if (energyProduced > energyConsumed) {
            uint256 creditAmount = (energyProduced - energyConsumed) / 10; // Adjust divisor as needed
            carbonCredits[msg.sender] += creditAmount;
            
            emit CarbonCreditEarned(msg.sender, creditAmount);
        }
    }

    // Liquidity pool creation
    function createLiquidityPool(
        string memory _tokenASymbol, 
        string memory _tokenBSymbol,
        uint256 _amountA,
        uint256 _amountB
    ) public {
        address tokenA = tokenAddresses[_tokenASymbol];
        address tokenB = tokenAddresses[_tokenBSymbol];
        
        require(tokenA != address(0), "Token A does not exist");
        require(tokenB != address(0), "Token B does not exist");
        
        // Transfer tokens to contract
        IERC20(tokenA).transferFrom(msg.sender, address(this), _amountA);
        IERC20(tokenB).transferFrom(msg.sender, address(this), _amountB);
        
        // Approve router to spend tokens
        IERC20(tokenA).approve(address(uniswapRouter), _amountA);
        IERC20(tokenB).approve(address(uniswapRouter), _amountB);
        
        // Add liquidity
        uniswapRouter.addLiquidity(
            tokenA,
            tokenB,
            _amountA,
            _amountB,
            0, // Slippage is not a concern in this example
            0,
            msg.sender,
            block.timestamp
        );
    }

    // Utility function to get token details
    function getTokenDetails(string memory _symbol) public view returns (TokenMetadata memory) {
        return tokenRegistry[_symbol];
    }

    // Helper function for safe multiplication
    function mul(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x, "Multiplication overflow");
        return z;
    }

    // Allow receiving ETH
    receive() external payable {}
}
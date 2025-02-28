pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./TokenABC.sol";
import "./TokenXYZ.sol";
import "@uniswap/v2-core/contracts/UniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/UniswapV2Pair.sol";
import "@uniswap/v2-core/contracts/UniswapV2Router02.sol";

contract SwapContract {
address payable admin;
uint256 ratioAX;
bool AcheaperthenX;
uint256 fees;
TokenABC public tokenABC;
TokenXYZ public tokenXYZ;
UniswapV2Router02 public uniswapRouter;

constructor(address _tokenABC, address _tokenXYZ, address _uniswapRouter) {
    admin = payable(msg.sender);
    tokenABC = TokenABC(_tokenABC);
    tokenXYZ = TokenXYZ(_tokenXYZ);
    uniswapRouter = UniswapV2Router02(_uniswapRouter);

    tokenABC.approve(address(this), tokenABC.totalSupply());
    tokenXYZ.approve(address(this), tokenABC.totalSupply());
}

function setTokenAddresses(address _tokenA, address _tokenB) external onlyOwner {
    tokenAAddress = _tokenA;
    tokenBAddress = _tokenB;
}

function getTokenAddresses() external view returns (address, address) {
    return (tokenAAddress, tokenBAddress);
}
modifier onlyAdmin() {
    require(payable(msg.sender) == admin, "Only admin can call this function");
    _;
}

function setRatio(uint256 _ratio) public onlyAdmin {
    ratioAX = _ratio;
}

function getRatio() public view onlyAdmin returns (uint256) {
    return ratioAX;
}

function setFees(uint256 _Fees) public onlyAdmin {
    fees = _Fees;
}

function getFees() public view onlyAdmin returns (uint256) {
    return fees;
}


  function swapTokens(address tokenIn, address tokenOut, uint256 amountIn) public {
        require(tokenIn != tokenOut, "Tokens must be different");
        require(amountIn > 0, "Amount must be greater than zero");

        // Get the pair address
        address pair = uniswapRouter.pairFor(tokenIn, tokenOut);

        // Check if the pair exists
        require(pair != address(0), "Pair does not exist");

        // Approve the router to spend the tokens
        ERC20(tokenIn).approve(address(uniswapRouter), amountIn);

        // Perform the swap
        uint256[] memory amounts = uniswapRouter.swapExactTokensForTokens(
            amountIn,
            0,
            [tokenIn, tokenOut],
            msg.sender,
            block.timestamp
        );

        // Emit the event
        emit TokenSwapped(amountIn, amounts[1]);
    }

    event TokenSwapped(uint256 amountIn, uint256 amountOut);

event eventswapTKA(uint256 indexed swapTKAcounter, uint256 indexed initialamount, uint256 indexed amountafter);

function swapTKA(uint256 amountTKA) public returns (uint256) {
    require(amountTKA > 0, "amountTKA must be greater then zero");
    require(tokenABC.balanceOf(msg.sender) >= amountTKA, "sender doesn't have enough Tokens");

    uint256 exchangeA = mul(amountTKA, ratioAX);
    uint256 exchangeAmount = exchangeA - mul(exchangeA, fees) / 100;

    require(exchangeAmount > 0, "exchange Amount must be greater then zero");
    require(tokenXYZ.balanceOf(address(this)) > exchangeAmount, "currently the exchange doesnt have enough XYZ Tokens, please retry later :=(");

    uint256 _swapTKAcounter = 0;

    tokenABC.transferFrom(msg.sender, address(this), amountTKA);
    tokenXYZ.approve(address(msg.sender), exchangeAmount);
    tokenXYZ.transferFrom(address(this), address(msg.sender), exchangeAmount);

    _swapTKAcounter++;
    emit eventswapTKA(_swapTKAcounter, amountTKA, exchangeAmount);

    return exchangeAmount;
}

event eventswapTKX(uint256 indexed swapTKXcounter, uint256 indexed initialamount, uint256 indexed amountafter);

function swapTKX(uint256 amountTKX) public returns (uint256) {
    require(amountTKX >= ratioAX, "amountTKX must be greater then ratio");
    require(tokenXYZ.balanceOf(msg.sender) >= amountTKX, "sender doesn't have enough Tokens");

    uint256 exchangeA = amountTKX / ratioAX;
    uint256 exchangeAmount = exchangeA - ((exchangeA * fees) / 100);

    require(exchangeAmount > 0, "exchange Amount must be greater then zero");
    require(tokenABC.balanceOf(address(this)) > exchangeAmount, "currently the exchange doesnt have enough XYZ Tokens, please retry later :=(");

    uint256 _swapTKXcounter = 0;

    tokenXYZ.transferFrom(msg.sender, address(this), amountTKX);
    tokenABC.approve(address(msg.sender), exchangeAmount);
    tokenABC.transferFrom(address(this), address(msg.sender), exchangeAmount);

    _swapTKXcounter++;
    emit eventswapTKX(_swapTKXcounter, amountTKX, exchangeAmount);

    return exchangeAmount;
}

function buyTokensABC(uint256 amount) public payable onlyAdmin {
    tokenABC.buyTokens{value: msg.value}(amount);
}

function buyTokensXYZ(uint256 amount) public payable onlyAdmin {
    tokenXYZ.buyTokens{value: msg.value}(amount);
}

function mul(uint256 x, uint256 y) internal pure returns (uint256 z) {
    require(y == 0 || (z = x * y) / y == x, "ds-math-mul-overflow");
}

// Uniswap V2 Functions
function addLiquidity(uint256 amountABC, uint256 amountXYZ) public {
    tokenABC.transferFrom(msg.sender, address(this), amountABC);
    tokenXYZ.transferFrom(msg.sender, address(this), amountXYZ);

    uniswapRouter.addLiquidity(
        address(tokenABC),
        address(tokenXYZ),
        amountABC,
        amountXYZ,
        0,
        0,
        msg.sender,
        block.timestamp
    );
}

function removeLiquidity(uint256 liquidity) public {
    uniswapRouter.removeLiquidity(
        address(tokenABC),
        address(tokenXYZ),
        liquidity,
        0,
        0,
        msg.sender,
        block.timestamp
    );
}

function getAmountToSwap(uint256 amountIn) public view returns (uint256) {
    address[] memory path = new address[](2);
    path[0] = address(tokenABC);
    path[1] = address(tokenXYZ);

    uint256[] memory amounts = uniswapRouter.getAmountsOut(amountIn, path);
    return amounts[1];
}

function swapTokens(uint256 amountIn) public {
    address[] memory path = new address[](2);
    path[0] = address(tokenABC);
    path[1] = address(tokenXYZ);

    uint256[] memory amounts = uniswapRouter.swapExactTokensForTokens(
        amountIn,
        0,
        path,
        msg.sender,
        block.timestamp
    );

    emit TokenSwapped(amountIn, amounts[1]);
}
function swapTokens(uint256 amountIn) public {
address[] memory path = new address2;
path[0] = address(tokenABC);
path[1] = address(tokenXYZ);

uint256[] memory amounts = uniswapRouter.swapExactTokensForTokens(
    amountIn,
    0,
    path,
    msg.sender,
    block.timestamp
);

emit TokenSwapped(amountIn, amounts[1]);

}

event TokenSwapped(uint256 amountIn, uint256 amountOut);

function getReserves() public view returns (uint112, uint112, uint32) {
address pair = uniswapRouter.pairFor(address(tokenABC), address(tokenXYZ));
UniswapV2Pair pairContract = UniswapV2Pair(pair);
(uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast) = pairContract.getReserves();
return (reserve0, reserve1, blockTimestampLast);
}

function getPairAddress() public view returns (address) {
return uniswapRouter.pairFor(address(tokenABC), address(tokenXYZ));
}
}
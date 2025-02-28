pragma solidity ^0.8.0;

interface ISwapContract {
    // Events
    event eventswapTKA(uint256 indexed swapTKAcounter, uint256 indexed initialamount, uint256 indexed amountafter);
    event eventswapTKX(uint256 indexed swapTKXcounter, uint256 indexed initialamount, uint256 indexed amountafter);
    event TokenSwapped(uint256 amountIn, uint256 amountOut);

    // Functions
    function setRatio(uint256 _ratio) external;
    function getRatio() external view returns (uint256);
    function setFees(uint256 _Fees) external;
    function getFees() external view returns (uint256);
    function swapTKA(uint256 amountTKA) external returns (uint256);
    function swapTKX(uint256 amountTKX) external returns (uint256);
    function buyTokensABC(uint256 amount) external payable;
    function buyTokensXYZ(uint256 amount) external payable;
    function addLiquidity(uint256 amountABC, uint256 amountXYZ) external;
    function removeLiquidity(uint256 liquidity) external;
    function getAmountToSwap(uint256 amountIn) external view returns (uint256);
    function swapTokens(uint256 amountIn) external;
    function getReserves() external view returns (uint112, uint112, uint32);
    function getPairAddress() external view returns (address);
}
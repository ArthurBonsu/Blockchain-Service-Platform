pragma solidity ^0.8.0;

interface IPortfolioContract {
    // Events
    event PortfolioCreated(address indexed owner, string indexed portfolioName);
    event TokenAdded(address indexed owner, string indexed token, uint256 amount);
    event TokenRemoved(address indexed owner, string indexed token, uint256 amount);

    // Functions
    function createPortfolio(string memory _name) external;
    function addToken(string memory _token, uint256 _amount) external;
    function removeToken(string memory _token, uint256 _amount) external;
    function getPortfolioDetails() external view returns (string memory, mapping(string => uint256));
}
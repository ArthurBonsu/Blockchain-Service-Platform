
// SPDX-License-Identifier: MIT
pragma solidity 0.8.2;
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import '../contracts/libraries/StringUtils.sol';
contract FileTokenUpgradeableV2 is OwnableUpgradeable,ERC20Upgradeable {
using SafeMathUpgradeable for uint256;
// Inherited variables
mapping (address => uint256) private _balances;
mapping (address => mapping (address => uint256)) private _allowances;
//We set the variables in the correct order to avoid storage collisions
//We dont set the initial value, we set it in the initalizer
uint256 private  _totalSupply;
string private _tokenname;
string private _tokensymbol;
address private _owner;
// Service types here 
string   hybrid;
string basic;
string premium;
bool   basicchosen;
bool   premiumchosen;
bool   hybridchosen;    
bool   setprevrewards;   
string  servicechosen;
uint randNonce;
uint modulus;
uint _payfee;
uint maxWaitTime;
uint256 amounttostake; 
uint prev_gridstaked;    
mapping(address => mapping(bytes32 => bool)) useringridcheck;
mapping(uint => mapping(address => uint)) prev_rewards;
mapping(uint => mapping(address => uint)) usersingridinfodetail;     
mapping(uint => uint) gridsused;
mapping(address => address) usersinallgrid;
mapping(address => bool)paidforgridusage;
//We set into memory for cheaper access
mapping(uint=>Grid) public _filegrids;
mapping(address=>Users)public userlist;
mapping(uint=>UserInfileGridInfo) public usersingridlist;
//  address  owner; 
// We decide to use the mapping instead of the struct approach
struct Grid {
uint  gridid; 
uint256 gridcount;
}
struct Users {
address payable useraddress;
string username;
uint256 userpoint;
uint256 userbalance;
}
struct UserInfileGridInfo{
uint filegridid;
address payable usersingridaddress;
bool gridfunctioning;    
uint256 gridreputationscore; 
uint256 griduserscount;
uint duration;
}
// We set the object for our tracks
Grid  newfilegrid;
Users  newuserregistered;
UserInfileGridInfo  useringridinfo;
// We push into storage 
Grid[] public filegridregistered;
Users[] public usersregistered;
UserInfileGridInfo[] public usersingridinfo;
event Adminset(address _adminset);
event payfeeevent(address payable sender, uint256 amount);
function ownerpick(address __owner )  public   {
// Full initializations
_totalSupply =1000000;
_tokenname ="fileTOKENS";
_tokensymbol= "ENG";
_owner = owner();
_owner = __owner;
__ERC20_init(_tokenname, _tokensymbol);
basic = "basic";
premium = "premium";
hybrid = "hybrid";
basicchosen = false;
premiumchosen = false;
hybridchosen = false;
setprevrewards = false;
servicechosen ="basic";
randNonce =0;
modulus =0;
_payfee=0;
maxWaitTime = 100;
prev_gridstaked=0;   
_balances[_owner] = _totalSupply;
emit Adminset(__owner);
}
// Simple  ERC20Upgradeable function just to prove our concept
// This is the first version of the code
//We will write upgrade the upgrade to our contract 
function payfee(address payable sender, uint256 amount) external payable returns(bool, bytes memory){
// Call returns a boolean value indicating success or failure.
// This is the current recommended method to use.


_owner =owner();
require ( amount >= 10, "Amount not enough to play!");
// (bool sent, bytes memory data) = msg.sender.call{value: _payfee}("");
//   require(sent, "Failed to send Ether");
(bool success,bytes memory data ) = _owner.call{value: _payfee}("");
require(success, "Check the amount sent as well"); 
paidforgridusage[sender]= true;
emit payfeeevent( sender, amount);
return (success,data);
}
//Eventing everything, we wont need events
function registerfileusername(string memory _username, address payable _useraddress) external  returns(string memory, address){
//If we dont want to use the modifier from Ownable.sol
require(msg.sender == _owner , "Caller is not owner");
if (paidforgridusage[_useraddress] == true){
uint256 userbalance =0;
userbalance = balanceOf(_useraddress);
if(usersinallgrid[_useraddress] != _useraddress){
//for player who has ever played before
usersinallgrid[_useraddress] =_useraddress ;
// for registered player
// Storing to memory
newuserregistered = Users(_useraddress,_username, 0,userbalance ); 
userlist[_useraddress].useraddress = _useraddress;
userlist[_useraddress].username = _username;
userlist[_useraddress].userpoint = 0;
userlist[_useraddress].userbalance = userbalance;
// Storing to storage
usersregistered.push(newuserregistered);                        
return (_username,_useraddress );
}
}
}
// Registering grids here
function registergrid(uint _filegridid) external  returns(uint){
uint256 i =0;
i++;
require(msg.sender == _owner , "Caller is not owner");
uint256 filegridcount = 0;
if(gridsused[_filegridid] != _filegridid){
gridsused[_filegridid] = _filegridid;
// Pushing to grids here
newfilegrid = Grid(_filegridid,filegridcount );
// Store into memory 
_filegrids[_filegridid].gridid = _filegridid;
_filegrids[_filegridid].gridcount = i;
filegridregistered.push(newfilegrid);
return (_filegridid);
}
}
// function -check if registered
// function -check if game is registered
//stakeawards
//add to previous winnings
function setfilegridwithuser(uint _filegridid, address payable _fileuseraddress) internal returns(uint, address) {
uint _fileusercount =0;
_fileusercount++;
require(msg.sender == _owner , "Caller is not file Grid owner");
uint __filegridid =0;
__filegridid = _filegridid;
randNonce; 
modulus= 100000000000;
__filegridid = uint(keccak256(abi.encodePacked(block.timestamp,
msg.sender,
randNonce))) % 
modulus; 
require(msg.sender == _owner, "Caller is not owner");
require( usersingridlist[_filegridid].griduserscount < 50 == true, "Only 50 users in each file grid");       
require(usersingridinfodetail[_filegridid][_fileuseraddress] == _filegridid, "User is already a member of grid");      
usersingridinfodetail[_filegridid][_fileuseraddress] = _filegridid;
uint _duration = block.number + maxWaitTime;
useringridinfo = UserInfileGridInfo(_filegridid, _fileuseraddress, false, 0,0, _duration);
usersingridlist[__filegridid].filegridid = _filegridid;
usersingridlist[__filegridid].usersingridaddress = _fileuseraddress;
usersingridlist[__filegridid].gridfunctioning = false;
usersingridlist[__filegridid].gridreputationscore = 0;
usersingridlist[__filegridid].griduserscount = 0;
usersingridlist[__filegridid].duration = _duration;
// Setting into storage
usersingridinfo.push(useringridinfo);
return(_filegridid, _fileuseraddress);  
}
// Checks here 
function _checkuserregistered(address payable _useraddress) public returns (bool ) {
require(usersinallgrid[_useraddress] == _useraddress );
return(true);
}
function _checkgridregistered(uint _filegridid) public returns (bool) {
require(_filegrids[_filegridid].gridid== _filegridid,"file grid id does not exist" );
return(true);
} 
function _checkuseringrid(uint  _filegridid,address _useraddress ) public returns (bool){
require( usersingridlist[_filegridid].usersingridaddress == _useraddress,"User not fouund in grid");
return (true);
}
function selectBasic( ) public virtual  returns(bool)
{ 
if (basicchosen){
basicchosen = true;
return (basicchosen); 
}else{
basicchosen = false;
return (basicchosen);
}         
}
function selectPremium() public virtual  returns(bool)
{ if (premiumchosen){
premiumchosen = true; 
return (premiumchosen);
}else{
premiumchosen = false;
return (premiumchosen);
}         
}
function selectHybrid(  ) public virtual  returns(bool){
if (hybridchosen){
hybridchosen = true;
return (hybridchosen); 
}else{
hybridchosen = false;
return (hybridchosen);
}         
}
function stakeprevrewards( ) public virtual  returns(bool) {
if(setprevrewards) {
setprevrewards =true;
}else{
setprevrewards =false;
}
return (setprevrewards);
}
function choosegridtostake(uint filegridid,address payable _useraddress, uint _amount ) public virtual   returns(uint256){
prev_gridstaked =0;
prev_gridstaked=filegridid;
if (stakeprevrewards( ) ==true ){
amounttostake =0;
amounttostake=_amount;
uint winnings =0;
winnings  =    prev_rewards[filegridid][_useraddress];
require( winnings > amounttostake, " The amount requested is not enough in this grid,please check in another grid");
transfer(_owner, amounttostake);
return( amounttostake);
}
}
event connectogridevent(uint  eventfilegridid, address payable _eventuseraddress, string   _eventservicechosen);
function connecttogrid(uint _filegridid, address payable _fileuseraddresss) internal returns(uint, address, string memory){
string memory _servicechosen; 
// Access Controls
require(msg.sender == _owner , "Caller is not owner");
_checkuserregistered(_fileuseraddresss);
_checkgridregistered( _filegridid);
_checkuseringrid( _filegridid ,_fileuseraddresss ); 
choosegridtostake(prev_gridstaked, _fileuseraddresss,amounttostake );
servicechosen = _servicechosen;
if (selectBasic() == true ){
premiumchosen = false;
hybridchosen = false;
servicechosen = "basic" ;
}
if (selectPremium()== true ){
basicchosen = false;
hybridchosen = false;
servicechosen = "premium" ;
}
if (selectHybrid()== true ){
basicchosen =false;
premiumchosen =false;
servicechosen = "hybrid" ;
}
// We generatae some random id 
uint shuffler = 0;
shuffler= 100000000;
uint _fileindex = 0;
randNonce++; 
_fileindex =   uint(keccak256(abi.encodePacked(block.timestamp,
msg.sender,
randNonce))) % 
shuffler; 
string memory premiumpackage = "premium";    
if (StringUtils.equal(servicechosen, premiumpackage)== true ){
approve( _fileuseraddresss, 100);
transfer(_fileuseraddresss,100);
// _owner.transfer(_theplayeraddress,10000);
balanceOf(_fileuseraddresss);
prev_rewards[_filegridid][_fileuseraddresss] +=100; 
// Whatever file business model is necessary to be built 
}        
emit connectogridevent( _filegridid,  _fileuseraddresss,  servicechosen);
return ( _filegridid,  _fileuseraddresss,  servicechosen);
}
// ERC20 inherited functions
function totalSupply() public view override returns (uint256) {
return _totalSupply;
}
function balanceOf(address account) public view override returns (uint256) {
return _balances[account];
}
function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
_transfer(_msgSender(), recipient, amount);
return true;
}
function allowance(address owner, address spender) public view virtual override returns (uint256) {
return _allowances[owner][spender];
}
function approve(address spender, uint256 amount) public virtual override returns (bool) {
_approve(_msgSender(), spender, amount);
return true;
}
function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
_transfer(sender, recipient, amount);
_approve(sender, _msgSender(), _allowances[sender][_msgSender()].sub(amount, "ERC20: transfer amount exceeds allowance"));
return true;
}
function mint (address account, uint256 amount) external   virtual  returns (address, uint ) {
_mint( msg.sender,  amount);
return(  account,  amount);
}
function burn (address account, uint256 amount) external   virtual returns (address, uint ) {
_burn( msg.sender ,  amount);
return(  account,  amount);
}
}
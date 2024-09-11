//SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.20;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";

contract Accessor is AccessControlEnumerable {
    bytes32 public constant OPERATOR = keccak256("OPERATOR");

    mapping(address => uint256) public userPerMap;

    event PermissionSet(address userAddress, uint256 userPermission);

    constructor(address operator) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR, operator);
    }

    function setPermission(
        address userAddress,
        uint256 userPermission
        ) public onlyRole(OPERATOR)
        returns (bool) {
        userPerMap[userAddress] = userPermission;
        emit PermissionSet(userAddress, userPermission);
        return true;
    }

    function getPermission(address userAddress) public view returns (uint256) {
        return userPerMap[userAddress];
    }

    function grantRoles(
        bytes32 role,
        address account
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(role, account);
    }
}

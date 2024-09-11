//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

library Permission {
    // 使用每位数字来进行权限判断
    modifier Door1(uint256 permission) {
        if (permission % 10 <= 1) {
            revert("reject");
        }
        _;
    }

    modifier Door2(uint256 permission) {
        if (permission / 10 % 10 <= 1) {
            revert("reject");
        }
        _;
    }
}
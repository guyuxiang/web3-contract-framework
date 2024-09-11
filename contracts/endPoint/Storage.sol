//SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.20;

contract Storage {
    Storages public DS;

    // 钻石合约的共享存储合约
    struct Storages {
        string a;
        string b;
        string c;
    }
}
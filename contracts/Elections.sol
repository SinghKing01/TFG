// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
// pragma experimental ABIEncoderV2;

import "./Election.sol";

contract Elections {
    mapping(uint256 => Election) public elections;

    uint256 public electionCount;

    constructor() public {
        electionCount = 0;
    }

    function newElection(
        string memory _title,
        uint256 _numCandidates,
        uint256 _durationInDays,
        string memory _password
    ) public returns (uint256) {
        elections[electionCount] = new Election(
            _title,
            _numCandidates,
            _durationInDays,
            _password
        );
        return electionCount++;
    }

    // function addCandidate(string memory _name, uint256 idElection, string memory _password) public {
    //     elections[idElection].addCandidate(_name, _password);
    // }
}

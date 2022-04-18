// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// pragma experimental ABIEncoderV2;

contract Election {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    string public title;
    mapping(uint256 => Candidate) public candidates;
    uint256 public numCandidates;
    uint256 public actualCandidates;
    mapping(address => bool) public voters;
    uint256 public totalVoters;
    address public owner;

    constructor(string memory _title, uint256 _numCandidates) public {
        title = _title;
        numCandidates = _numCandidates;
        actualCandidates = 0;
        owner = tx.origin;
    }

    function addCandidate(string memory _name) public {
        require(actualCandidates < numCandidates);
        require(tx.origin == owner);
        candidates[actualCandidates++] = Candidate(actualCandidates, _name, 0);
    }

    function vote(uint256 _candidateId) public {
        // require that all candidates are specified
        require(actualCandidates == numCandidates);

        // require that voter hasn't voted yet
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId >= 0 && _candidateId < actualCandidates);

        // update candidate vote Count
        candidates[_candidateId].voteCount++;

        // record that voter has voted
        voters[msg.sender] = true;

        // increment number of total voters
        totalVoters++;
    }
}

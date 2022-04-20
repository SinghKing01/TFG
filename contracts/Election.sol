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
    uint256 public createdTime;
    uint256 public duration;
    bool voteFinished;
    string private password;

    constructor(
        string memory _title,
        uint256 _numCandidates,
        uint256 _duration,
        string memory _password
    ) public {
        title = _title;
        numCandidates = _numCandidates;
        actualCandidates = 0;
        owner = tx.origin;
        createdTime = block.timestamp;
        duration = _duration;
        voteFinished = false;
        password = _password;
    }

    function addCandidate(string memory _name, string memory _password) public {
        bytes32 str1 = keccak256(abi.encodePacked(_password));
        bytes32 str2 = keccak256(abi.encodePacked(password));
        require(str1 == str2);
        require(actualCandidates < numCandidates);
        require(tx.origin == owner);
        require(!voteFinished);
        candidates[actualCandidates++] = Candidate(actualCandidates, _name, 0);
    }

    function vote(uint256 _candidateId, string memory _password) public {
        bytes32 str1 = keccak256(abi.encodePacked(_password));
        bytes32 str2 = keccak256(abi.encodePacked(password));
        require(str1 == str2);
        // require that election is not expred
        require(!voteFinished);

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

        if (totalVoters == 0) {
            createdTime = block.timestamp;
        } else if (block.timestamp >= createdTime + duration) {
            voteFinished = true;
        }

        // increment number of total voters
        totalVoters++;
    }

    function passwordMatch(string memory _password) public view returns (bool) {
        bytes32 str1 = keccak256(abi.encodePacked(_password));
        bytes32 str2 = keccak256(abi.encodePacked(password));
        return str1 == str2;
    }
}

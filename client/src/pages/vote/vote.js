import React from 'react'
import { useState, useEffect } from 'react'
import Navbar from '../../components/navbar/navbar'
import Footer from '../../components/footer/footer'
import { Container, Form, Button } from 'react-bootstrap'
import history from '../../components/history/history'
import Spinner from 'react-bootstrap/Spinner'
import { BiRefresh } from "react-icons/bi";

import getWeb3 from '../../getWeb3'
import Elections from '../../contracts/Elections.json'
import Election from '../../contracts/Election.json'

import Table from '../../components/table/table'

import './vote.css'

const Vote = () => {

    useEffect(() => {
        async function loadData() {
            try {
                // Get network provider and web3 instance.
                setLoading(true)
                const _web3 = await getWeb3();
                if (_web3 === "No web3 instance injected, using Local web3.") {
                    window.alert(
                        "Non-Ethereum browser detected. You should consider trying MetaMask!"
                    );
                }
                setWeb3(_web3)

                // Use web3 to get the user's accounts.
                const accounts = await _web3.eth.getAccounts();
                setAccount(accounts[0])

                // Get the curret network id on metamask
                const networkId = await _web3.eth.net.getId();
                const deployedNetwork = Elections.networks[networkId];
                setNetwork(deployedNetwork)
                setLoading(false)

                // reload page when account or network is changed on metamask
                window.ethereum.on('accountsChanged', (accounts) => {
                    window.location.reload();
                });
                window.ethereum.on('chainChanged', (network) => {
                    window.location.reload();
                });
            } catch (error) {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    // to save current account, network on Metamask
    const [account, setAccount] = useState("")
    const [network, setNetwork] = useState()
    const [networkSupported, setNetworkSupported] = useState(true)
    const [web3, setWeb3] = useState()

    // the page shows form1 until submit1 is false
    const [submit1, setSubmit1] = useState(false)
    // the page shows form2 until submit2 is false
    const [submit2, setSubmit2] = useState(false)
    // if all inputs for the room are valid
    const [validRoomInputs, setValidRoomInputs] = useState(true)
    //  to get and save the election title from the blockchain
    const [electionTitle, setElectionTitle] = useState()
    //  to get and save the election's total candidates from the blockchain
    const [totalCandidates, setTotalCandidates] = useState()
    //  to get and save the election's actual candidates from the blockchain
    const [actualCandidates, setActualCandidates] = useState()
    // to save candidates in form of an array
    const [electionCandidates, setElectionCandidates] = useState()
    // to save the current election address
    const [electionAddress, setElectionAddress] = useState("")
    // to save if the current account has already voted
    const [alreadyVoted, setAlreadyVoted] = useState(false)
    // to check if the selected candidate to cote is valid
    const [validCandidate, setValidCandidate] = useState(true)

    // data and columns has inputs for the table that represents the vote results
    const [data, setData] = useState()
    const [columns, setColumns] = useState()

    // to save the room number, password
    const [roomSaved, setRoomSaved] = useState(false)
    const [roomNum, setRoomNum] = useState(-1)
    const [roomPass, setRoomPass] = useState(-1)

    // this function handles the specified room
    const handleRoom = async (e) => {
        e.preventDefault()
        let roomNumber, password = null;

        // if select network is not supported by the application
        if (network === undefined) {
            setNetworkSupported(false)
            return
        }

        // when we refresh the time in vote page, we won't insert room data again, so we save room number and password
        if (!roomSaved) {
            roomNumber = document.getElementById('roomNumber').value;
            password = document.getElementById('roomPassword').value;
            setRoomNum(roomNumber)
            setRoomPass(password)
            setRoomSaved(true)
        } else {
            roomNumber = roomNum
            password = roomPass
        }

        if (roomNumber >= 0 && password !== "") {
            try {
                // instance of Elections contract
                let elections = new web3.eth.Contract(
                    Elections.abi,
                    network && network.address,
                );

                setLoading(true)

                // to get the address and check if the room exists
                var electionAddr = await elections.methods.elections(roomNumber).call()
                const emptyAddress = /^0x0+$/.test(electionAddr);
                if (emptyAddress) {
                    setValidRoomInputs(false)
                    setRoomSaved(false)
                    setLoading(false)
                    return
                }

                // to check if password is valid
                setElectionAddress(electionAddr)
                let election = await new web3.eth.Contract(Election.abi, electionAddr);
                let passwordMatch = await election.methods.passwordMatch(password).call()
                if (!passwordMatch) {
                    setSubmit1(false)
                    setValidRoomInputs(false)
                    setRoomSaved(false)
                    setLoading(false)
                    return
                }

                // get actual number of candidates assigned, if incomplete user can't vote
                let _actualCandidates = await election.methods.actualCandidates().call()
                let _totalCandidates = await election.methods.numCandidates().call()
                setTotalCandidates(_totalCandidates)
                setActualCandidates(_actualCandidates)

                // load candidates names from electionCandidates variable
                var candidates = []
                var candidate = null
                for (let index = 0; index < _totalCandidates; index++) {
                    candidate = await election.methods.candidates(index).call()
                    candidates.push({ name: candidate.name, id: candidate.id, voteCount: candidate.voteCount })
                }

                // get the time when the election was created
                let createdTime = await election.methods.createdTime().call()
                createdTime = parseInt(createdTime, 10)

                // get the max duration for the voting room
                let duration = await election.methods.duration().call()
                duration = parseInt(duration, 10)

                // get the actual time
                let actualTime = new Date().getTime()
                // convert time from ms to s
                actualTime = (actualTime - (actualTime % 1000)) / 1000;

                // the difference between actual_time and (createdTime + voteDuration) is the remaining time
                let remainingTime = (createdTime + duration) - actualTime
                if (remainingTime < 0) remainingTime = 0
                setRemainingTime(remainingTime)

                // given title for the title 
                let _title = await election.methods.title().call()
                setElectionTitle(_title)

                // Table columns
                const col = [{
                    dataField: 'id',
                    text: 'Candidate ID',
                    sort: true
                }, {
                    dataField: 'name',
                    text: 'Candidate Name'
                }, {
                    dataField: 'count',
                    text: 'Vote Count',
                    sort: true
                }];

                // Table data
                var data = []
                for (let i = 0; i < candidates.length; i++) {
                    data.push({ id: candidates[i].id, name: candidates[i].name, count: candidates[i].voteCount })
                }

                // save columns, data and candidates in global variables
                setColumns(col)
                setData(data)
                setElectionCandidates(candidates)

                setSubmit1(true)
                setLoading(false)
            } catch (error) {
                setLoading(false)
            }
        } else {
            setSubmit1(false)
            setValidRoomInputs(false)
            setRoomSaved(false)
        }

    }

    // true when election time exceeded the max duration
    const [electionExpired, setElectionExpired] = useState(false)
    // time left to vote 
    const [remainingTime, setRemainingTime] = useState()

    // this function handles the selected candidate to vote
    const handleSelectedCandidate = async (e) => {
        e.preventDefault();
        let selectedCandidateID = document.getElementById('selectCandidate').value;
        if (selectedCandidateID === "null") {
            // no candidate selected
            setValidCandidate(false);
        } else {
            setValidCandidate(true);
            // vote candidate web3
            setLoading(true)
            try {
                // instance of the Election contract
                let election = await new web3.eth.Contract(Election.abi, electionAddress);

                // to check if current account has already voted
                // if so, can't vote again and return
                let voted = false
                voted = await election.methods.voters(account).call()
                if (voted) {
                    setAlreadyVoted(true)
                    setLoading(false)
                    return
                }

                // if time expired, can't vote and return
                if (remainingTime === 0) {
                    setElectionExpired(true)
                    setLoading(false)
                    return
                }

                // vote
                await election.methods.vote(selectedCandidateID, roomPass).send({ from: account })
                setSubmit2(true)
            } catch (error) {
                setLoading(false)
            }
            setLoading(false)
        }

    }

    // when true, shows the loading spinner
    const [loading, setLoading] = useState(false)

    // this function converts seconds into a string in DD:HH:MM:SS format
    const secondsToString = (totalseconds) => {
        var day = 86400;
        var hour = 3600;
        var minute = 60;

        var daysout = Math.floor(totalseconds / day);
        var hoursout = Math.floor((totalseconds - daysout * day) / hour);
        var minutesout = Math.floor((totalseconds - daysout * day - hoursout * hour) / minute);
        var secondsout = totalseconds - daysout * day - hoursout * hour - minutesout * minute;

        var ret = (
            daysout + " " + "days " + hoursout + " " + "hours "
            + minutesout.toFixed() + " " + "minutes " +
            secondsout.toFixed() + " " + "seconds ");

        return ret;
    }

    return (
        <div>
            <Navbar account={account} />
            <Container className='main-container'>
                <div className='second-container'>
                    <div className='form-container'>
                        {
                            !loading ? (
                                <Form className='form-div' autoComplete="off">
                                    {
                                        !submit1 ? (
                                            <>
                                                <Form.Group className="mb-3" controlId="roomNumber">
                                                    <Form.Label>Election Room</Form.Label>
                                                    <Form.Control type="number" placeholder="Enter election room number" autoFocus />
                                                </Form.Group>
                                                <Form.Group className="mb-3" controlId="roomPassword">
                                                    <Form.Label>Room Password</Form.Label>
                                                    <Form.Control type="password" placeholder="Enter room password" />
                                                    {
                                                        !validRoomInputs ? (
                                                            <Form.Text className="text-muted">
                                                                Room number or password invalid! Please try again.
                                                            </Form.Text>
                                                        ) : (
                                                            !networkSupported ? (
                                                                <>
                                                                    <Form.Text className="text-muted">
                                                                        Please switch to a supported network. For further information, please visit the home page.
                                                                    </Form.Text>
                                                                </>
                                                            ) : (null)
                                                        )
                                                    }
                                                </Form.Group>
                                                <Button variant="primary" type="submit" onClick={handleRoom}>
                                                    Submit
                                                </Button>
                                            </>
                                        ) : (
                                            totalCandidates !== actualCandidates ? (
                                                <>
                                                    <Form.Group className='mb-3'>
                                                        <Form.Text className="text-muted">
                                                            <p>
                                                                Candidates incomplete for this election. Please provide
                                                                candidates names or try again later.
                                                            </p>
                                                        </Form.Text>
                                                    </Form.Group>
                                                    <Button variant="primary" type="submit" onClick={() => history.push('/add-candidates')}>
                                                        Add candidates
                                                    </Button>
                                                </>
                                            ) : (
                                                !submit2 ? (
                                                    <>
                                                        <Form.Group className='mb-3' controlId='selectCandidate'>
                                                            <div className='table-container'>
                                                                <p>
                                                                    Time left: {secondsToString(remainingTime)}
                                                                    <BiRefresh className='m-2' size="2em" style={{ color: "#0d6efd", cursor: "pointer" }} onClick={handleRoom}></BiRefresh>
                                                                </p>
                                                                <p className='justify-content-center d-flex'>{"Title: " + electionTitle}</p>
                                                                <Table columns={columns} data={data}></Table>
                                                            </div>
                                                            <Form.Label>Select a candidate</Form.Label>
                                                            <Form.Select aria-label="Default select example">
                                                                {
                                                                    (
                                                                        () => {
                                                                            let output = []
                                                                            output.push(<option key={-1} value="null">Select a candidate</option>)
                                                                            electionCandidates.map((candidate, i) => {
                                                                                output.push(<option key={i} value={candidate.id}>{candidate.name}</option>);
                                                                            })
                                                                            return output
                                                                        }
                                                                    )()
                                                                }
                                                            </Form.Select>
                                                            {
                                                                !validCandidate ? (
                                                                    <Form.Text className="text-muted">
                                                                        Please enter a valid room number to vote.
                                                                    </Form.Text>
                                                                ) : (
                                                                    alreadyVoted ? (
                                                                        <Form.Text className="text-muted">
                                                                            You can't participate more than once!
                                                                        </Form.Text>
                                                                    ) : (
                                                                        electionExpired ? (
                                                                            <Form.Text className="text-muted">
                                                                                Election time is out!
                                                                            </Form.Text>
                                                                        ) : (null)
                                                                    )
                                                                )
                                                            }
                                                        </Form.Group>
                                                        <Button variant="primary" type="submit" onClick={handleSelectedCandidate}>
                                                            Vote
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Form.Group className='mb-3'>
                                                        <Form.Label>Candidate voted successfully!</Form.Label>
                                                        <br></br>
                                                        <Button variant="primary" type="submit" onClick={() => history.push('/')}>
                                                            Home
                                                        </Button>
                                                    </Form.Group>
                                                )
                                            )
                                        )
                                    }
                                </Form>
                            ) : (
                                <div>
                                    <div className='justify-content-center d-flex'>
                                        <Spinner animation="border" />
                                    </div>
                                    <br></br>
                                    <p>Interacting with the blockchain. Please wait...</p>
                                </div>
                            )
                        }
                    </div>
                </div >
            </Container >
            <Footer />
        </div >
    )
}

export default Vote
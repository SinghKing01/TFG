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
                setWeb3(_web3)

                // Use web3 to get the user's accounts.
                const accounts = await _web3.eth.getAccounts();
                setAccount(accounts[0])

                // Get the contract instance.
                const networkId = await _web3.eth.net.getId();
                const deployedNetwork = Elections.networks[networkId];
                setNetwork(deployedNetwork)
                setLoading(false)

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

    const [account, setAccount] = useState("")
    const [network, setNetwork] = useState()
    const [web3, setWeb3] = useState()

    const [submit1, setSubmit1] = useState(false)
    const [submit2, setSubmit2] = useState(false)
    const [validRoomInputs, setValidRoomInputs] = useState(true)

    const [totalCandidates, setTotalCandidates] = useState(5)
    const [actualCandidates, setActualCandidates] = useState(5)

    const [electionCandidates, setElectionCandidates] = useState()

    const [electionAddress, setElectionAddress] = useState("")

    const [alreadyVoted, setAlreadyVoted] = useState(false)

    const [validCandidate, setValidCandidate] = useState(true)
    const [data, setData] = useState()
    const [columns, setColumns] = useState()

    const [roomSaved, setRoomSaved] = useState(false)
    const [roomNum, setRoomNum] = useState(-1)
    const [roomPass, setRoomPass] = useState(-1)

    const handleRoom = async (e) => {
        e.preventDefault()
        let roomNumber, password = null;

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
                let elections = new web3.eth.Contract(
                    Elections.abi,
                    network && network.address,
                );

                setLoading(true)
                var electionAddr = await elections.methods.elections(roomNumber).call()
                const emptyAddress = /^0x0+$/.test(electionAddr);
                if (emptyAddress) {
                    setValidRoomInputs(false)
                    setLoading(false)
                    return
                }

                //web3 check if password
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

                let _actualCandidates = await election.methods.actualCandidates().call()
                let _totalCandidates = await election.methods.numCandidates().call()
                setTotalCandidates(_totalCandidates)
                setActualCandidates(_actualCandidates)

                // load candidates names in electionCandidates
                var candidates = []
                var candidate = null
                for (let index = 0; index < _totalCandidates; index++) {
                    candidate = await election.methods.candidates(index).call()
                    candidates.push({ name: candidate.name, id: candidate.id, voteCount: candidate.voteCount })
                }


                let createdTime = await election.methods.createdTime().call()
                createdTime = parseInt(createdTime, 10)

                let duration = await election.methods.duration().call()
                duration = parseInt(duration, 10)

                let actualTime = new Date().getTime()
                actualTime = (actualTime - (actualTime % 1000)) / 1000;

                let remainingTime = (createdTime + duration) - actualTime
                if (remainingTime < 0) remainingTime = 0
                setRemainingTime(remainingTime)

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

                var data = []

                for (let i = 0; i < candidates.length; i++) {
                    data.push({ id: candidates[i].id, name: candidates[i].name, count: candidates[i].voteCount })
                }

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

    const [electionExpired, setElectionExpired] = useState(false)
    const [remainingTime, setRemainingTime] = useState()
    const handleSelectedCandidate = async (e) => {
        e.preventDefault();
        let selectedCandidateID = document.getElementById('selectCandidate').value;
        if (selectedCandidateID === "null") {
            setValidCandidate(false);
        } else {
            setValidCandidate(true);
            // vote candidate web3
            setLoading(true)
            try {
                let election = await new web3.eth.Contract(Election.abi, electionAddress);
                let voted = false
                voted = await election.methods.voters(account).call()

                if (voted) {
                    setAlreadyVoted(true)
                    setLoading(false)
                    return
                }

                if (remainingTime === 0) {
                    setElectionExpired(true)
                    setLoading(false)
                    return
                }

                await election.methods.vote(selectedCandidateID, roomPass).send({ from: account })
                setSubmit2(true)
            } catch (error) {
                setLoading(false)
            }
            setLoading(false)
        }

    }

    const [loading, setLoading] = useState(false)


    const secondsToString = (n) => {
        var day = parseInt(n / (24 * 3600));

        n = n % (24 * 3600);
        var hour = parseInt(n / 3600);

        n %= 3600;
        var minutes = n / 60;

        n %= 60;
        var seconds = n;

        var ret = (
            day + " " + "days " + hour + " " + "hours "
            + minutes.toFixed() + " " + "minutes " +
            seconds.toFixed() + " " + "seconds ");

        return ret
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
                                                    <Form.Control type="number" placeholder="Enter election room number" />
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
                                                            null
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
                                                                    Remaining time: {secondsToString(remainingTime)}
                                                                    <BiRefresh className='m-2' size="2em" style={{ color: "#0d6efd", cursor: "pointer" }} onClick={handleRoom}></BiRefresh>
                                                                </p>
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
                            ) : (<Spinner animation="border" />)
                        }
                    </div>
                </div >
            </Container >
            <Footer />

        </div >
    )
}

export default Vote
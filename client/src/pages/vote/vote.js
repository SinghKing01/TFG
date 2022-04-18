import React from 'react'
import { useState, useEffect } from 'react'
import Navbar from '../../components/navbar/navbar'
import Footer from '../../components/footer/footer'
import { Container, Form, Button } from 'react-bootstrap'
import history from '../../components/history/history'
import Spinner from 'react-bootstrap/Spinner'

import getWeb3 from '../../getWeb3'
import Elections from '../../contracts/Elections.json'
import Election from '../../contracts/Election.json'

import Table from '../../components/table/table'

import './vote.css'

const Vote = () => {

    useEffect(() => {
        async function loadData() {
            window.ethereum.on('accountsChanged', (accounts) => {
                window.location.reload();
            });
            window.ethereum.on('chainChanged', (network) => {
                window.location.reload();
            });

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

    const loadCandidates = () => {
        console.log(electionCandidates)
    }


    const [validCandidate, setValidCandidate] = useState(true)
    const [data, setData] = useState()
    const [columns, setColumns] = useState()
    const handleRoom = async (e) => {
        e.preventDefault()
        let roomNumber = document.getElementById('roomNumber').value;
        let password = document.getElementById('roomPassword').value;

        if (roomNumber >= 0 && password != "") {
            try {
                let elections = new web3.eth.Contract(
                    Elections.abi,
                    network && network.address,
                );
                //web3 check if password

                setLoading(true)
                var electionAddr = await elections.methods.elections(roomNumber).call()
                const emptyAddress = /^0x0+$/.test(electionAddr);
                if (emptyAddress) {
                    setValidRoomInputs(false)
                    setLoading(false)
                    return
                }
                setElectionAddress(electionAddr)
                let election = await new web3.eth.Contract(Election.abi, electionAddr);

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
                    console.log(candidate)
                }

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
        }

    }

    const handleSelectedCandidate = async (e) => {
        e.preventDefault();
        let selectedCandidateID = document.getElementById('selectCandidate').value;
        if (selectedCandidateID == "null") {
            setValidCandidate(false);
        } else {
            setValidCandidate(true);
            // vote candidate web3
            try {
                let election = await new web3.eth.Contract(Election.abi, electionAddress);

                let voted = false
                voted = await election.methods.voters(account).call()

                if (voted) {
                    setAlreadyVoted(true)
                    return
                }

                await election.methods.vote(selectedCandidateID).send({ from: account })
                setSubmit2(true)
            } catch (error) {

            }

        }

    }

    const [loading, setLoading] = useState(false)

    return (
        <div>
            <Navbar />
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
                                            totalCandidates != actualCandidates ? (
                                                <>
                                                    <Form.Group className='mb-3'>
                                                        <Form.Text className="text-muted">
                                                            <p className='justify-content-center d-flex'>
                                                                Candidates incomplete for this election. Please provide
                                                                <br />
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
                                                                    ) : (null)
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
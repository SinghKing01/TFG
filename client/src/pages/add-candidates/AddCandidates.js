import React from 'react'
import { useState, useEffect } from 'react'
import Navbar from '../../components/navbar/navbar'
import Footer from '../../components/footer/footer'
import { Container, Form, Button } from 'react-bootstrap'
import history from '../../components/history/history'
import Spinner from 'react-bootstrap/Spinner'
import './AddCandidates.css'

import getWeb3 from '../../getWeb3'
import Elections from '../../contracts/Elections.json'
import Election from '../../contracts/Election.json'

const AddCandidates = () => {

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
    const [validRoomInputs, setSubmit1Inputs] = useState(true)
    const [isOwner, setIsOwner] = useState(true)
    const [roomPassword, setRoomPassword] = useState()

    const [submit2, setSubmit2] = useState(false)
    const [actualCandidates, setActualCandidates] = useState(-1);
    const [totalCandidates, setTotalCandidates] = useState(-1);
    const [candidatesToAdd, setCandidatesToAdd] = useState("");
    const [candidatesFull, setCandidatesFull] = useState(false)
    const [validCandidatesNumber, setValidCandidatesNumber] = useState(true);
    // var [nameInputs, setNameInputs] = useState();

    const [submit3, setSubmit3] = useState(false)

    const handleRoom = async (e) => {
        e.preventDefault();

        let roomNumber, password = null

        roomNumber = document.querySelectorAll("[control_id=roomNumber]")[0].value
        password = document.querySelectorAll("[control_id=roomPassword]")[0].value

        setRoomPassword(password)

        if (roomNumber >= 0 && password !== "") {
            try {
                let elections = new web3.eth.Contract(
                    Elections.abi,
                    network && network.address,
                );

                //web3 check if valid room number
                setLoading(true)
                var electionAddr = await elections.methods.elections(roomNumber).call()
                const emptyAddress = /^0x0+$/.test(electionAddr);
                if (emptyAddress) {
                    setSubmit1Inputs(false)
                    setLoading(false)
                    return
                }

                //web3 check if is owner
                setElectionAddress(electionAddr)
                let election = await new web3.eth.Contract(Election.abi, electionAddr);
                var electionOwner = await election.methods.owner().call()
                var passwordMatch = await election.methods.passwordMatch(password).call()
                let _actualCandidates = await election.methods.actualCandidates().call()
                let _totalCandidates = await election.methods.numCandidates().call()
                setTotalCandidates(_totalCandidates)
                setActualCandidates(_actualCandidates)

                if (electionOwner === account) {
                    setIsOwner(true)
                    setSubmit1(true)
                } else {
                    setIsOwner(false)
                    setSubmit1(false)
                    setLoading(false)
                    return
                }

                if (!passwordMatch) {
                    setSubmit1(false)
                    setSubmit1Inputs(false)
                    setLoading(false)
                    return
                }

                if (_totalCandidates === _actualCandidates) {
                    setCandidatesFull(true)
                } else {
                    setCandidatesFull(false)
                }

                setLoading(false)
            } catch (error) {
                setLoading(false)
            }
        } else {
            setSubmit1(false)
            setSubmit1Inputs(false)
        }
    }

    const handleCandidatesNumber = (e) => {
        e.preventDefault();
        if (candidatesToAdd <= 0 || candidatesToAdd > (totalCandidates - actualCandidates)) {
            setValidCandidatesNumber(false);
        } else {
            setValidCandidatesNumber(true);
            setSubmit2(true)
        }
    }

    const [electionAddress, setElectionAddress] = useState("")
    const handleCandidatesNames = async (e) => {
        e.preventDefault();

        let names = []
        for (let index = 0; index < candidatesToAdd; index++) {
            let name = document.querySelectorAll("[myattr=candidateName" + index + "]")[0].value
            if (name !== "") names.push(name)
        }
        // nameInputs = names;

        // addCandidates web3
        let election = new web3.eth.Contract(Election.abi, electionAddress);
        setLoading(true)
        try {
            for (let index = 0; index < names.length; index++) {
                await election.methods.addCandidate(names[index], roomPassword).send({ from: account })
            }
            setLoading(false)
        } catch (error) {
            setLoading(false)
        }
        setSubmit3(true)
    }

    const [loading, setLoading] = useState(false)

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
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Election Room</Form.Label>
                                                    <Form.Control type="number" id="roomNumber" control_id="roomNumber" placeholder="Enter election room number" />

                                                    <Form.Label>Room password</Form.Label>
                                                    <Form.Control type="password" id="roomPassword" min="0" control_id="roomPassword" placeholder="Enter password of room" />
                                                    {
                                                        !validRoomInputs ? (
                                                            <Form.Text className="text-muted">
                                                                Room number or password invalid! Please try again.
                                                            </Form.Text>
                                                        ) : (
                                                            !isOwner ? (
                                                                <>
                                                                    <Form.Text className="text-muted">
                                                                        You don't have permissons to add candidates for this
                                                                        <br></br>
                                                                        election.
                                                                    </Form.Text>
                                                                </>
                                                            ) : (null)
                                                        )
                                                    }
                                                </Form.Group>
                                                <Button className='mt-1' variant="primary" type="submit" onClick={(e) => { handleRoom(e) }}>
                                                    Next
                                                </Button>
                                            </>
                                        ) : (
                                            !submit2 ? (
                                                <>
                                                    <p>Pending candidates: {totalCandidates - actualCandidates} of {totalCandidates}</p>
                                                    {
                                                        !candidatesFull ? (
                                                            <>
                                                                <div>
                                                                    <Form.Group className="mb-3" controlId="candidatesNumber">
                                                                        <Form.Label>Number of candidates to add</Form.Label>
                                                                        <Form.Control type="number" min="0" max={totalCandidates - actualCandidates} placeholder="Enter the number of candidates to add" onChange={(e) => {
                                                                            setCandidatesToAdd(e.target.value);
                                                                        }} />
                                                                        {
                                                                            !validCandidatesNumber ? (
                                                                                <Form.Text className="text-muted">
                                                                                    Please enter a valid number.
                                                                                </Form.Text>
                                                                            ) : (null)
                                                                        }
                                                                    </Form.Group>
                                                                </div>
                                                                <Button className='mt-1' variant="primary" type="submit" onClick={(e) => { handleCandidatesNumber(e) }}>
                                                                    Next
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Form.Text className="text-muted">
                                                                    All the candidates are already assigned. You can proceed to vote.
                                                                </Form.Text>
                                                                <br></br>
                                                                <Button className='mt-1' variant="primary" type="submit" onClick={() => history.push('/vote')}>
                                                                    Vote
                                                                </Button>
                                                            </>
                                                        )
                                                    }
                                                </>
                                            ) : (
                                                !submit3 ? (
                                                    <>
                                                        <div className='candidates-scroll'>
                                                            <Form.Group className="mb-3" controlId="candidatesNames">
                                                                {
                                                                    (
                                                                        () => {
                                                                            let inputs = [];
                                                                            for (let index = 0; index < candidatesToAdd; index++) {
                                                                                inputs.push(<Form.Label key={index + " -label"}> Candidate {index}</Form.Label>);
                                                                                inputs.push(<Form.Control className='mb-3' key={index + "-input"} type="text" placeholder={"Enter name of candidate " + index} myattr={"candidateName" + index} />);
                                                                            }
                                                                            return inputs
                                                                        }
                                                                    )()
                                                                }
                                                            </Form.Group>
                                                        </div>
                                                        <Button className='mt-1' variant="primary" type="submit" onClick={(e) => { handleCandidatesNames(e) }}>
                                                            Next
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Form.Group className="mb-3" controlId="candidatesNames">
                                                            <Form.Label>Candidates successfully added.</Form.Label>
                                                        </Form.Group>
                                                        <Button className='mt-1' variant="primary" type="submit" onClick={() => history.push('/vote')}>
                                                            Vote
                                                        </Button>
                                                    </>
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
                                </div>)
                        }
                    </div>
                </div>
            </Container >
            <Footer />
        </div >
    )
}

export default AddCandidates
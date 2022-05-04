import React from 'react'
import { useState, useEffect } from 'react'
import Navbar from '../../components/navbar/navbar'
import Footer from '../../components/footer/footer'
import { Container, Form, Button } from 'react-bootstrap'
import Spinner from 'react-bootstrap/Spinner'
import './NewElection.css'
import history from '../../components/history/history'

import getWeb3 from '../../getWeb3'
import Elections from '../../contracts/Elections.json'

const NewElection = () => {
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

    const [loading, setLoading] = useState(false)

    const [validTitle, setValidTitle] = useState(true);
    const [validNumCandidates, setValidNumCandidates] = useState(true);
    const [validPassword, setValidPassword] = useState(true)
    const [validConfirmation, setValidConfirmation] = useState(true)

    const [account, setAccount] = useState("")
    const [network, setNetwork] = useState()
    const [networkSupported, setNetworkSupported] = useState(true)
    const [web3, setWeb3] = useState()

    const [roomCreated, setRoomCreated] = useState(false)
    const [roomNumber, setRoomNumber] = useState(-1)

    const [validDuration, setValidDuration] = useState(true)
    const handleFormSubmit = async (e) => {
        e.preventDefault()

        let title, numCandidates, password, confirmation, magnitude, units = null
        let valid_t = true
        let valid_n = true
        let valid_p = true
        let valid_p_confirmation = true
        let valid_duration = true

        title = document.getElementById("electionTitle").value
        numCandidates = document.getElementById("candidatesNumber").value
        password = document.getElementById("formBasicPassword").value
        confirmation = document.getElementById("passwordConfirmation").value
        magnitude = document.querySelectorAll("[control_id=magnitude]")[0].value
        units = document.querySelectorAll("[control_id=units]")[0].value

        let duration = null;

        if (network === undefined) {
            setNetworkSupported(false)
            return
        }

        if (magnitude === "null" || units <= 0) {
            setValidDuration(false)
            valid_duration = false
        } else {
            setValidDuration(true)
            valid_duration = true

            if (magnitude === "minutes") {
                duration = units * 60;
            } else if (magnitude === "hours") {
                duration = units * 60 * 60;
            } else if (magnitude === "days") {
                duration = units * 60 * 60 * 24;
            }

        }

        if (title === "") {
            setValidTitle(false)
            valid_t = false
        } else {
            setValidTitle(true)
            valid_t = true
        }

        if (numCandidates <= 0) {
            setValidNumCandidates(false)
            valid_n = false
        } else {
            setValidNumCandidates(true)
            valid_n = true
        }

        if (password === "") {
            setValidPassword(false)
            valid_p = false
        } else {
            setValidPassword(true)
            valid_p = true
        }

        if (password !== confirmation) {
            setValidConfirmation(false)
            valid_p_confirmation = false
        } else {
            setValidConfirmation(true)
            valid_p_confirmation = true
        }

        if (valid_t && valid_n && valid_p && valid_p_confirmation && valid_duration) {
            try {
                //create election web3
                let instance = new web3.eth.Contract(
                    Elections.abi,
                    network && network.address,
                );

                // adding new election
                setLoading(true)
                await instance.methods.newElection(title, numCandidates, duration, password).send({ from: account });
                var totalElections = await instance.methods.electionCount().call()
                setRoomCreated(true)
                setRoomNumber(totalElections - 1)
                setLoading(false)
                console.log(totalElections)
            } catch (error) {
                setLoading(false)
            }
        }
    }

    return (
        <div>
            <Navbar account={account} />
            <Container className='main-container'>
                <div className='second-container'>
                    <div className='form-container'>
                        {
                            !loading ? (
                                !roomCreated ? (
                                    <Form className='form-div' autoComplete="off">
                                        <Form.Group className="mb-3" controlId="electionTitle">
                                            <Form.Label>Election title</Form.Label>
                                            <Form.Control type="string" placeholder="Enter election title" autoFocus />
                                            {
                                                !validTitle ? (
                                                    <Form.Text className="text-muted">
                                                        Please enter a valid title for your election.
                                                    </Form.Text>
                                                ) : (
                                                    null
                                                )
                                            }
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="candidatesNumber">
                                            <Form.Label>Number of candidates</Form.Label>
                                            <Form.Control type="number" min="0" placeholder="Enter number of candidates" />
                                            {
                                                !validNumCandidates ? (
                                                    <Form.Text className="text-muted">
                                                        Please enter a valid number of candidates.
                                                    </Form.Text>
                                                ) : (null)
                                            }
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Duration of election</Form.Label>
                                            <div className='justify-content-between d-flex'>
                                                <Form.Control style={{ height: "38px" }} size='md' type="number" min="0" placeholder="Enter units" control_id="units" />
                                                <Form.Select aria-label="Default select example" control_id="magnitude">
                                                    <option value="null">Select Option</option>
                                                    <option value="minutes">Minutes</option>
                                                    <option value="hours">Hours</option>
                                                    <option value="days">Days</option>
                                                </Form.Select>
                                            </div>
                                            {
                                                !validDuration ? (
                                                    <Form.Text className="text-muted">
                                                        Please enter a valid duration for your election.
                                                    </Form.Text>
                                                ) : (null)
                                            }
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="formBasicPassword">
                                            <Form.Label>Election password</Form.Label>
                                            <Form.Control type="password" placeholder="Enter a password for election room" />
                                            {
                                                !validPassword ? (
                                                    <Form.Text className="text-muted">
                                                        Please enter any password for your election room.
                                                    </Form.Text>
                                                ) : (null)
                                            }
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="passwordConfirmation">
                                            <Form.Label>Password confirmation</Form.Label>
                                            <Form.Control type="password" placeholder="Enter password confirmation" />
                                            {
                                                !validConfirmation && validPassword ? (
                                                    <Form.Text className="text-muted">
                                                        Password confirmation does not match!
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

                                        <Button variant="primary" type="submit" onClick={(e) => { handleFormSubmit(e) }}>
                                            Submit
                                        </Button>
                                    </Form>
                                ) : (
                                    <Form className='form-div' autoComplete="off">
                                        <p>Room succesfully created. Your room number is: {roomNumber}</p>
                                        <Button variant="primary" type="submit" onClick={() => history.push('/add-candidates')}>
                                            Add candidates
                                        </Button>
                                    </Form>
                                )
                            ) :
                                (
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
                </div>
            </Container>
            <Footer />
        </div>
    )
}

export default NewElection
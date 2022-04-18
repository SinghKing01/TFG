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

    const [loading, setLoading] = useState(false)

    const [validTitle, setValidTitle] = useState(true);
    const [validNumCandidates, setValidNumCandidates] = useState(true);
    const [validPassword, setValidPassword] = useState(true)
    const [validConfirmation, setValidConfirmation] = useState(true)

    const [account, setAccount] = useState("")
    const [network, setNetwork] = useState()
    const [web3, setWeb3] = useState()

    const [roomCreated, setRoomCreated] = useState(false)
    const [roomNumber, setRoomNumber] = useState(-1)

    const handleFormSubmit = async (e) => {
        e.preventDefault()

        let title, numCandidates, password, confirmation = null
        let valid_t = true
        let valid_n = true
        let valid_p = true
        let valid_p_confirmation = true

        title = document.getElementById("electionTitle").value
        numCandidates = document.getElementById("candidatesNumber").value
        password = document.getElementById("formBasicPassword").value
        confirmation = document.getElementById("passwordConfirmation").value

        if (title == "") {
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

        if (password == "") {
            setValidPassword(false)
            valid_p = false
        } else {
            setValidPassword(true)
            valid_p = true
        }

        if (password != confirmation) {
            setValidConfirmation(false)
            valid_p_confirmation = false
        } else {
            setValidConfirmation(true)
            valid_p_confirmation = true
        }

        if (valid_t && valid_n && valid_p && valid_p_confirmation) {
            try {
                //create election web3
                let instance = new web3.eth.Contract(
                    Elections.abi,
                    network && network.address,
                );

                // adding new election
                setLoading(true)
                await instance.methods.newElection(title, numCandidates).send({ from: account });
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
                                            <Form.Control type="string" placeholder="Enter election title" />
                                            {
                                                !validTitle ? (
                                                    <Form.Text className="text-muted">
                                                        Please enter a valid title for your election.
                                                    </Form.Text>
                                                ) : (null)
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
                                                        Password confirmation does not match.
                                                    </Form.Text>
                                                ) : (null)
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
                                    <Spinner animation="border" />
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
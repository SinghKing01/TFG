import React from 'react'
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { FaGithub, FaLinkedin, FaInstagram, FaReact, FaVoteYea } from 'react-icons/fa';
import { GiVote } from 'react-icons/gi';

const navbar = (props) => {
    return (
        <div>
            <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Brand href="/"><FaReact size={"40"} color={"#000000"} /></Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            {/* <Nav.Link href="/">Home</Nav.Link> */}
                            <Nav.Link href="/new-election">New Election</Nav.Link>
                            <Nav.Link href="/add-candidates">Add Candidates</Nav.Link>
                            <Nav.Link href="/vote">Vote</Nav.Link>
                            {/* <NavDropdown title="Links" id="basic-nav-dropdown">
                                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                            </NavDropdown> */}
                        </Nav>
                    </Navbar.Collapse>
                    {props.account}
                </Container>
            </Navbar>
        </div>
    )
}

export default navbar
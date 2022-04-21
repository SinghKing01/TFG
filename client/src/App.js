import React from 'react'
import Navbar from './components/navbar/navbar'
import Footer from './components/footer/footer'
import { Container } from 'react-bootstrap'

const App = () => {

  return (
    <div>
      <Navbar />
      <Container className='main-container'>
        <div className='second-container'>
          <div className='form-container'>
            <div className='home-page-text'>
              <h1 className='justify-content-center d-flex'>Welcome to the voting DAPP</h1>
              <p className='justify-content-center d-flex'>In order to interact with the application, you'll have to install Metamask on your web browser (only Chrome, Firefox, Brave and Edge). In case of running the application on public blockchain, you should switch to the Kovan Test Network. To run the application on a local blockchain, then you should consider to use the Ganache Network (see the given links below).</p>
              <h3 className='justify-content-center d-flex'>In this application you can:</h3>
              <div className='justifle-content-center'>
                <li>Create a new Election</li>
                <li>Add candidates to a Election you have created</li>
                <li>Submit a vote in a Election</li>
                <li>Get real-time results in the vote section</li>
              </div>
              <h4 className='justify-content-center d-flex mt-3'>Configuration links:</h4>
              <div className='justifle-content-center'>
                <ol>
                  <li><a target="_blank" rel="noopener noreferrer" href="https://trufflesuite.com/ganache/">Ganache installation<br></br></a></li>
                  <li><a target="_blank" rel="noopener noreferrer" href="https://metamask.io/download/">Metamask installation<br></br></a></li>
                  <li><a target="_blank" rel="noopener noreferrer" href="https://dapp-world.com/blogs/01/how-to-connect-ganache-with-metamask-and-deploy-smart-contracts-on-remix-without-1619847868947#:~:text=Connection%20of%20Ganache%20with%20Metamask%20%3A&text=Open%20Metamask%20and%20go%20to,ID%20for%20ganache%20is%201337.">Ganache configuration in Metamask<br></br></a></li>
                  <li><a target="_blank" rel="noopener noreferrer" href="https://ethdrop.dev/">Get ETHs for Kovan Network</a></li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  )
}

export default App
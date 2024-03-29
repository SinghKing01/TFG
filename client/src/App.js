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
              {/* <p className='justify-content-center d-flex'>In order to interact with the application, you'll have to install Metamask on your web browser (only Chrome, Firefox, Brave and Edge). To run this application on public blockchain, you should switch to the Kovan Test Network. To run the application on a local blockchain, then you should consider to use the Ganache Network (see the given links below).</p> */}
              {/* <p className='justify-content-center d-flex'>In order to interact with this application, you'll have to install Metamask on your web browser (Chrome, Firefox, Brave or Edge). This application works un Kovan Test Network (Ethereum's public blockchain for developers). To run the application on a local blockchain, then you should consider to use Ganache's local network (see the given links at the end).</p> */}
              <p className='justify-content-center d-flex'>In order to interact with this application, you'll have to install Metamask on your web browser (Chrome, Firefox, Brave or Edge) and switch to the Ethereum's Kovan Test Network.</p>
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
                  <li><a target="_blank" rel="noopener noreferrer" href="https://metamask.io/download/">Metamask installation<br></br></a></li>
                  <li><a target="_blank" rel="noopener noreferrer" href="https://ethdrop.dev/">Get ETHs for Kovan Network</a></li>
                  <li><a target="_blank" rel="noopener noreferrer" href="https://mycrypto.com/">Send ETHs to another account</a></li>
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
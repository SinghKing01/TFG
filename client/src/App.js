import React from 'react'
import Navbar from './components/navbar/navbar'
import Spinner from 'react-bootstrap/Spinner'

const App = () => {

  return (
    <div>
      <Navbar />
      <Spinner animation="border" />
    </div>
  )
}

export default App
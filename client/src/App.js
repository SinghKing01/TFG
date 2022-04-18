import React from 'react'
import Navbar from './components/navbar/navbar'
import Spinner from 'react-bootstrap/Spinner'
import Table from './components/table/table'

const App = () => {

  return (
    <div>
      <Navbar />
      <Spinner animation="border" />
    </div>
  )
}

export default App
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import "bootstrap/dist/css/bootstrap.min.css";

import NewElection from './pages/new-election/NewElection';
import AddCandidates from './pages/add-candidates/AddCandidates';
import Vote from './pages/vote/vote';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

ReactDOM.render(
    <Router>
        <Routes>
            <Route path='/' element={<App />} />
            <Route path='/vote' element={<Vote />} />
            <Route path='/new-election' element={<NewElection />} />
            <Route path='/add-candidates' element={<AddCandidates />} />
        </Routes>
    </Router>
    , document.getElementById('root')
);
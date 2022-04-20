import React from 'react'
import './footer.css'
import logo from './logo192.png'
import { FaGithub } from 'react-icons/fa';
import { FaReact } from 'react-icons/fa';



const footer = () => {
    return (
        <div>
            <div className='footer-main'>
                <div className='footer-container'>
                    <div className='footer-start'>
                        <div style={{ width: "40%" }} className='justify-content-between d-flex'>
                            <div className='mr-3'>
                                <img className='footer-logo' src={logo} alt="Logo" />
                            </div>
                            <div>
                                <p>GITHUB</p>
                                <p>SOLIDITY</p>
                                <p>TRUFFLE SUITE</p>
                            </div>
                        </div>
                        <div style={{ width: "20%", "padding": "7.5%" }}>
                            <FaGithub></FaGithub>
                            <FaReact></FaReact>
                        </div>
                    </div>
                    <div className="footer-end">Copyright © 2022 - Dilpreet Singh</div>
                </div>
            </div>
        </div >
    )
}

export default footer
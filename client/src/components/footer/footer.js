import React from 'react'
import './footer.css'
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';




const footer = () => {
    return (
        <div className='footer-div'>
            <div className='main-footer'>
                <div className='main-footer-container'>
                    <div className='main-footer-div'>
                        <a target="_blank" rel="noopener noreferrer" href="https://github.com/SinghKing01/TFG" className='footer-links'>
                            <div className='icon-div'><FaGithub size={"20"} /></div>
                            <div>Source Code</div>
                        </a>
                        <a target="_blank" rel="noopener noreferrer" href="https://es.linkedin.com/in/dilpreet-singh-57918b167" className='footer-links'>
                            <div className='icon-div'><FaLinkedin size={"20"} /></div>
                            <div>Linkedin</div>
                        </a>
                        <a target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/uibuniversitat/?hl=en" className='footer-links'>
                            <div className='icon-div'><FaInstagram size={"20"} /></div>
                            <div>UIB</div>
                        </a>
                    </div>
                </div>
            </div>
            <div className='footer-end'>
                Copyright © 2021 - 2022 Dilpreet Singh (Universitat de les Illes Balears)
            </div>
        </div>
    )
}

export default footer
# Election - DAPP 
If you want to interact with the public blockchain (Kovan Test Network) through this application, you can simply install Metamask on your web browser and add some Kovan ETHs (https://ethdrop.dev/) to your address and go ahead!

Otherwise, if you want to run this application on the local Ganache Blockchain (only recommended for developers) and understand the logic of the application, then follow the instructions that are given below.


## Dependencies
Install these prerequisites to run the web application:
- NPM: https://nodejs.org
- Truffle: https://github.com/trufflesuite/truffle
- Ganache: http://truffleframework.com/ganache/
- Metamask: https://metamask.io/


## Step 1. Clone the project
`git clone https://github.com/SinghKing01/TFG.git`

## Step 2. Install dependencies
```
$ cd client
$ npm install
```
## Step 3. Start Ganache
Open the Ganache GUI client that you downloaded and installed. This will start your local blockchain instance.


## Step 4. Compile & Deploy Election Smart Contract
`$ truffle migrate --reset`
You must migrate the election smart contract each time your restart ganache.

## Step 5. Configure Metamask
- Unlock Metamask
- Connect metamask to your local Etherum blockchain provided by Ganache.
- Import an account provided by ganache.

## Step 6. Run the Front End Application
`$ npm run start`
Visit this URL in your browser: http://localhost:3000

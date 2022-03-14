import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";

// etheres
import { ethers } from "ethers";

// abi
import firstNFT from "./utils/FirstNFT.json";

// spinner
import { SpinnerCircular } from "spinners-react";

// Constants
const TWITTER_HANDLE = "shaileshb_";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "https://testnets.opensea.io/collection/cricketnft-mdryh654ig";
const TOTAL_MINT_COUNT = 1;
const CONTRACT_ADDRESS = "0x7C873accda52Ca64C902dDDF826377F0181D3967";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [mintCount, setMintCount] = useState(0);

  const [isLoading, setIsSpinner] = useState(false);

  // check if wallet is connected
  const checkIfWalletIsConnected = async () => {
    // check if access exist for window.etherrum
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure yo have metamask!!!!");
      return;
    }
    console.log("Ethereum object found -> ", ethereum);

    // Check if we're authorized to acccess user's wallet
    const accounts = await ethereum.request({ method: "eth_accounts" });

    // grab first user account
    if (accounts.length !== 0) {
      console.log("Found authorized account -> ", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener();
    } else {
      console.log("Authorized account not found!!!");
    }
  };

  // connect wallet
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!!!");
        return;
      }

      // request acces to account
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
      setupEventListener();
      getChainID(ethereum);
      // checkIfWalletIsConnected()
    } catch (err) {
      console.error(err);
    }
  };

  const getChainID = async (ethereum) => {
    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);

    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
    }
  };

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          firstNFT.abi,
          signer
        );

        connectedContract.on("NewFirstNFT", (from, tokenID) => {
          console.log(from, tokenID.toNumber());
          alert(
            `OpenSea link: <https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenID.toNumber()}>`
          );
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        setIsSpinner(true);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          firstNFT.abi,
          signer
        );

        console.log("Paying gas fees...");
        let nftTxn = await connectedContract.makeNFT();

        console.log("Minning...", nftTxn);
        await nftTxn.wait();
        await getNFTCount();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object not found");
      }
    } catch (err) {
      console.error(err);
      if (err?.error["code"] === -32603) {
        alert(err?.error["message"]);
      }
    } finally {
      setIsSpinner(false);
    }
  };

  const getNFTCount = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        // const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          firstNFT.abi,
          provider
        );

        console.log("Get Total NFT's Minted So Far ");
        let count = await connectedContract.getTotalNFTsMintedSoFar();
        setMintCount(count.toNumber());
      } else {
        console.log("Ethereum object not found");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Render Methods
  const renderNotConnectedContainer = () => (
    <>
      <button
        onClick={connectWallet}
        className="cta-button connect-wallet-button"
      >
        Connect to Wallet
      </button>
    </>
  );

  const renderMintUI = () => (
    <>
      <button
        onClick={askContractToMintNft}
        className="cta-button connect-wallet-button"
      >
        Mint NFT
      </button>
      <p className="count-text">
        {`NFTs minted: ${mintCount}/${TOTAL_MINT_COUNT}`}
      </p>
    </>
  );

  useEffect(() => {
    getNFTCount();
    // setMintCount(0);
    checkIfWalletIsConnected();
  }, [mintCount]);

  return (
    <div className="App">
      {isLoading ? (
        <div>
          <SpinnerCircular size="20%" enabled={isLoading} />
        </div>
      ) : (
        <div className="container">
          <div className="header-container">
            <p className="header gradient-text">My NFT Collection</p>
            <p className="sub-text">
              Each unique. Each beautiful. Discover your NFT today.{" "}
            </p>
            {/* <p className="gradient-text">
            Total NFT's Minted So Far: {mintCount}/{TOTAL_MINT_COUNT}
          </p> */}
            {currentAccount.length > 0
              ? renderMintUI()
              : renderNotConnectedContainer()}

            <button className="cta-button connect-wallet-button">
              <a href={OPENSEA_LINK} target="_blank">🌊 View Collection on OpenSea</a>
            </button>
          </div>
          <div className="footer-container">
            <img
              alt="Twitter Logo"
              className="twitter-logo"
              src={twitterLogo}
            />
            <a
              className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`built on @${TWITTER_HANDLE}`}</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

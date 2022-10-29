import React, { useState, useEffect } from "react";
import Web3 from "web3";
import MetaMaskOnboarding from "metamask-onboarding";

function App() {
  const [{ metaMaskPresent, metaMaskConnected }, setMetaMaskObject] = useState({
    metaMaskPresent: false,
    metaMaskConnected: false
  });
  const [publicKey, setPublicKey] = useState("metamask not connected");
  const [{chainId, chainName}, setChainObject] = useState({chainId: "", chainName: ""});
  const web3 = new Web3(Web3.givenProvider || "http://localhost/8545");
  const provider = web3?.givenProvider;

  const connectMetaMask = async () => {
    let accounts;
    try {
      await web3?.givenProvider?.request({ method: "eth_requestAccounts" });
      setMetaMaskObject({ metaMaskConnected: true, metaMaskPresent });
      accounts = await web3.eth.getAccounts();
      setPublicKey(() => accounts[0]);
      chainChanged();
    } catch (error) {
      console.error("metmask error", error);
    }
  };

  const chainChanged = async () => {
    web3.eth.getChainId().then((id) => {
        web3.eth.net.getNetworkType().then((val) => {
            setChainObject({chainId: id, chainName: val});
          });
    })
    
  };

  const accountChanged = async (accounts) => {
    setPublicKey(() => accounts[0]);
  };

  useEffect(() => {
    if(publicKey == null) {
        setMetaMaskObject({ metaMaskConnected: false, metaMaskPresent });
    }
  }, [publicKey])

  useEffect(() => {
    const isMetaMaskPresent = () => {
      return web3?.givenProvider?.isMetaMask ? true : false;
    };
    setMetaMaskObject(() =>
      isMetaMaskPresent()
        ? { metaMaskPresent: true, metaMaskConnected }
        : { metaMaskPresent: false, metaMaskConnected }
    );
    

    if(metaMaskConnected) {

        provider.on("chainChanged", chainChanged);
        provider.on("accountsChanged", accountChanged);
    
        return () => {
            provider.removeListener("chainChanged", chainChanged);
            provider.removeListener("accountsChanged", accountChanged);
        };

    }

    if(web3?.givenProvider?.isMetaMask){
        web3?.givenProvider?.request({ method: "eth_accounts" }).then((val) => {
            if(val[0] != null) {
                setMetaMaskObject({ metaMaskConnected: true, metaMaskPresent });
                setPublicKey(() => val[0]);
                chainChanged();
            }
        });
    }

  }, [web3?.givenProvider?.isMetaMask, metaMaskConnected]);

  return (
    <div className="credit-card w-full lg:w-1/2 sm:w-auto shadow-lg mx-auto rounded-xl bg-white">
      <main className="mt-4 p-4">
        <h1 className="text-xl font-semibold text-gray-700 text-center">
         MetaMask network
        </h1>
        <div className="mt-4">
        {!metaMaskPresent && (
          <button
            onClick={() => {
                    const onboarding = new MetaMaskOnboarding();
                    onboarding.startOnboarding();
                  }}
            className="mt-2 mb-2 btn btn-primary submit-button focus:ring focus:outline-none w-full"
          >
            Install MetaMask
          </button>
        )}

        {metaMaskPresent && !metaMaskConnected && (
          <button
            onClick={() => {connectMetaMask();}}
            className="mt-2 mb-2 bg-warning border-warning btn submit-button focus:ring focus:outline-none w-full"
          >
            Connect MetaMask
          </button>
        )}
        </div>
        {metaMaskPresent && metaMaskConnected && (
            <div>
                <h2 className="text-xl font-semibold text-gray-700">Chain Id: {chainId}</h2>
                <h2 className="text-xl font-semibold text-gray-700">Chain Name: {chainName}</h2>
                <h2 className="text-xl font-semibold text-gray-700">Account's address: {publicKey}</h2>
            </div>
        )}
      </main>
    </div>
  );
}

export default App;

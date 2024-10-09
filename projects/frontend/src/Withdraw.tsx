import * as algokit from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import Transact from './components/Transact'
import { SteamClient } from './contracts/Steam'
import { streamEndTime, withdraw } from './methods'
import { getAlgodConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

interface WithdrawProps {}

const Withdraw: React.FC<WithdrawProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openDemoModal, setOpenDemoModal] = useState<boolean>(false)
  const [appId, setAppId] = useState<number>(0)
  const { activeAddress, signer } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = algokit.AlgorandClient.fromConfig({ algodConfig })
  algorand.setDefaultSigner(signer)

  const dmClient = new SteamClient(
    {
      resolveBy: 'id',
      id: appId,
      sender: { addr: activeAddress!, signer },
    },
    algorand.client.algod,
  )

  const handleWithdraw = async () => {
    if (activeAddress) {
      await withdraw(algorand, dmClient, activeAddress, appId)()
    }
  }

  const streamendtime = async () => {
    await streamEndTime(algorand, dmClient, activeAddress!, appId)()
  }

  return (
    <div className="hero min-h-screen bg-teal-400">
      <div className="hero-content text-center rounded-lg p-6 max-w-md bg-white mx-auto">
        <div className="max-w-md">
          <div className="grid">
            <button data-test-id="connect-wallet" className="btn m-2" onClick={toggleWalletModal}>
              Wallet Connection
            </button>
            <div className="divider" />
            <h1 className="text-red-700">Enter Flow rate and algos in microAlgos </h1>
            <label className="label">App Id</label>
            <input
              type="number"
              className="input input-bordered"
              value={appId}
              onChange={(e) => setAppId(e.currentTarget.valueAsNumber || 0)}
            ></input>

            {/* New fields for starting the stream */}
            {activeAddress && appId > 0 && (
              <div>
                <h2 className="text-2xl mt-2 mb-2">Withdraw Funds</h2>
              </div>
            )}
            <button className="btn m-2" onClick={handleWithdraw}>
              Withdraw
            </button>
            <button className="btn m-2" onClick={streamendtime}>
              GetEndTime
            </button>
          </div>

          <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
          <Transact openModal={openDemoModal} setModalState={setOpenDemoModal} />
        </div>
      </div>
    </div>
  )
}

export default Withdraw

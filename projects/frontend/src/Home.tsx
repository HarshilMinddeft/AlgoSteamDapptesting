// src/components/Home.tsx
import * as algokit from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet'
import algosdk from 'algosdk'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import MethodCall from './components/MethodCall'
import Transact from './components/Transact'
import { SteamClient } from './contracts/Steam'
import { create, deleteStreamApplication, startStream, stopStream, streamEndTime } from './methods'
import { getAlgodConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openDemoModal, setOpenDemoModal] = useState<boolean>(false)
  const [appId, setAppId] = useState<number>(0)
  const { activeAddress, signer } = useWallet()
  const [streamRate, setStreamRate] = useState<bigint>(0n)
  const [isStreaming, setIsStreaming] = useState<number>(0)
  const [recipient, setRecipient] = useState<string>('')
  const [amount, setAmount] = useState<bigint>(0n)
  const [streamApproxEndTime, setApproxEndTime] = useState<string>('')
  const [streamApproxHoursMins, setstreamApproxHoursMins] = useState<string>('')
  const [streamContractBalance, setStreamContractBalance] = useState<number>()
  const [streamStartTime, setStreamStartTime] = useState<string>()
  const [streamFinishTime, setStreamFinishTime] = useState<string>()
  const [streamFlowRate, setStreamFlowRate] = useState<number>()
  const [totalUserWithdraw, setTotalUserWithdraw] = useState<number>()

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

  const getApplicationAddress = (appId: number): string => {
    return algosdk.getApplicationAddress(appId)
  }

  const appAddress = getApplicationAddress(appId)

  // Create stream method reference
  const createStream = async () => {
    await create(algorand, dmClient, activeAddress!, setAppId)()
  }

  const streamendtime = async () => {
    await streamEndTime(algorand, dmClient, activeAddress!, appId)()
  }

  const funcStopStream = async () => {
    await stopStream(algorand, dmClient, activeAddress!, appId)()
  }

  const funcdeleteStream = async () => {
    await deleteStreamApplication(algorand, dmClient, activeAddress!, appId)()
  }

  // Start stream method reference
  const handleStartStream = async () => {
    await startStream(algorand, dmClient, activeAddress!, streamRate, recipient, amount, appId)()
    setIsStreaming(1)
  }

  const fetchIsStreaming = async (steamAbiClient: SteamClient) => {
    if (activeAddress && appId > 0) {
      const streamData = await steamAbiClient.getGlobalState()
      const isStreaming = streamData.isStreaming?.asNumber() ?? 0
      setIsStreaming(isStreaming)
    }
  }
  const fetchContractGlobalStateData = async (steamAbiClient: SteamClient) => {
    if (activeAddress) {
      const streamData = await steamAbiClient.getGlobalState()
      const isStreaming = streamData.isStreaming?.asNumber() ?? 0
      const TotalContractbalance = streamData.balance?.asNumber() ?? 0
      const streamfinishTime = streamData.endTime?.asNumber()
      const streamstartTime = streamData.startTime?.asNumber()
      const streamalgoFlowRate = streamData.streamRate?.asNumber() ?? 0
      const TotalwithdrawAmount = streamData.withdrawnAmount?.asNumber() ?? 0

      //
      const recipientBytes = streamData.recipient?.asByteArray()
      if (recipientBytes) {
        const userAddress = algosdk.encodeAddress(new Uint8Array(recipientBytes))
        console.log('UserAddress:', userAddress)
      } else {
        console.log('Recipient address not found or is invalid.')
      }

      // Convert in Algos
      const convTotalwithdrawAmount = TotalwithdrawAmount / 1000000
      const convstreamalgoFlowRate = streamalgoFlowRate / 1000000
      const convTotalContractbalance = TotalContractbalance / 1000000

      // Convert Unix timestamps to human-readable dates
      const formattedStreamStartTime = streamstartTime ? dayjs.unix(streamstartTime).format('MM/DD/YYYY, h:mm:ss A') : 'N/A'
      const formattedStreamFinishTime = streamfinishTime ? dayjs.unix(streamfinishTime).format('MM/DD/YYYY, h:mm:ss A') : 'N/A'

      setIsStreaming(isStreaming)
      setStreamContractBalance(convTotalContractbalance)
      setStreamStartTime(formattedStreamStartTime)
      setStreamFinishTime(formattedStreamFinishTime)
      setStreamFlowRate(convstreamalgoFlowRate)
      setTotalUserWithdraw(convTotalwithdrawAmount)
    }
  }

  const calculateStreamEndTime = () => {
    if (streamRate > 0n && amount > 0n) {
      const durationInSeconds = Number(amount) / Number(streamRate)
      const endTime = new Date(Date.now() + durationInSeconds * 1000)
      const hours = Math.floor(durationInSeconds / 3600)
      const minutes = Math.floor((durationInSeconds % 3600) / 60)
      const formattedEndTime = dayjs(endTime).format('MM/DD/YYYY, h:mm:ss A')
      setApproxEndTime(`${formattedEndTime}`)
      setstreamApproxHoursMins(`(${hours} hours, ${minutes} minutes)`)
    }
  }

  useEffect(() => {
    if (streamRate > 0 && amount > 0) {
      calculateStreamEndTime()
    } else {
      setApproxEndTime('')
    }
  }, [streamRate, amount])

  useEffect(() => {
    if (appId > 0 && dmClient) {
      fetchIsStreaming(dmClient)
      fetchContractGlobalStateData(dmClient)
    }
  }, [appId, activeAddress, dmClient])

  return (
    <div className="min-h-screen bg-slate-700">
      <p className="absolute mt-7 text-xl rounded-2xl text-red-700 bg-slate-400 ">ActiveStream : {isStreaming}</p>
      <center>
        <button data-test-id="connect-wallet" className="btn px-48  pb-3 pt-2 text-xl  rounded-2xl mt-5 mb-5 " onClick={toggleWalletModal}>
          Wallet Connection
        </button>
      </center>

      <div className="hero-content bg-slate-400 p-5 rounded-2xl mx-auto mt-5 mb-5">
        <p>TotalContractBalance {streamContractBalance} Algos</p>
        <p>StreamfinishTime :{streamFinishTime}</p>
        <p>StreamStartTime {streamStartTime}</p>
        <p>AlgoFlowRate {streamFlowRate} PerSec Algos</p>
        <p>TotalWithdrawAmount {totalUserWithdraw} Algos</p>
      </div>

      <div className="hero-content text-center rounded-2xl p-6 max-w-md bg-slate-500 mx-auto">
        <div className="max-w-md">
          <div className="grid">
            <h1 className="text-red-700">Enter Flow rate and algos in microAlgos </h1>
            <label className="label">App Id</label>
            <input
              type="number"
              className="input input-bordered"
              value={appId}
              onChange={(e) => setAppId(e.currentTarget.valueAsNumber || 0)}
            ></input>
            {activeAddress && appId === 0 && (
              <div>
                <MethodCall methodFuncition={createStream} text="CreateStream" />
              </div>
            )}

            {/* New fields for starting the stream */}
            {activeAddress && appId > 0 && isStreaming === 0 && (
              <div>
                <h2 className="text-2xl mt-2 mb-2">Agreement Created</h2>
                <div className="flex">
                  <h2 className="mt-4">Address</h2>
                  <input
                    type="text"
                    placeholder="Recipient Address"
                    className="input input-bordered mb-2"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </div>
                <div className="flex">
                  <h2 className="mt-4">Flow Rate</h2>
                  <input
                    type="number"
                    placeholder="Stream Rate (μAlgos/sec)"
                    className="input input-bordered mb-2"
                    value={streamRate.toString()} // Display as μAlgos (input value)
                    onChange={(e) => {
                      const inputVal = BigInt(e.currentTarget.value || 0)
                      setStreamRate(inputVal)
                    }}
                  />
                </div>
                <div className="flex">
                  <h2 className="mt-4">Amount</h2>
                  <input
                    type="number"
                    placeholder="Amount (Algos)"
                    className="input input-bordered mb-2"
                    value={amount.toString()} // Store and display as Algos
                    onChange={(e) => setAmount(BigInt(e.target.value) || 0n)} // Keep as bigint
                  />
                </div>
                {streamApproxEndTime && <h2 className="text-lg mt-2">Active stream Time: {streamApproxEndTime.toLocaleString()}</h2>}
                {streamApproxEndTime && <h2 className="text-lg mt-2">Stream Ending in: {streamApproxHoursMins.toLocaleString()}</h2>}

                {activeAddress && (
                  <div>
                    <MethodCall methodFuncition={handleStartStream} text="Start Stream" />
                  </div>
                )}
              </div>
            )}
            {/* <button className="btn m-2" onClick={handleWithdraw}>
              Withdraw
            </button> */}
            {activeAddress && appId > 0 && isStreaming === 1 && (
              <div>
                <button className="btn m-2" onClick={streamendtime}>
                  GetEndTime
                </button>
                <button className="btn m-2" onClick={funcStopStream}>
                  stopStream
                </button>
                <button className="btn m-2" onClick={funcdeleteStream}>
                  DeleteStream
                </button>
              </div>
            )}
          </div>

          <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
          <Transact openModal={openDemoModal} setModalState={setOpenDemoModal} />
        </div>
      </div>
    </div>
  )
}

export default Home

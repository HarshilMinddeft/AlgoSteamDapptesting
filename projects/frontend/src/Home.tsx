// src/components/Home.tsx
import * as algokit from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet'
import algosdk from 'algosdk'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import AnimatedCounter from './components/AnimatedCounter'
import ConnectWallet from './components/ConnectWallet'
import BlinkBlurB from './components/Loders'
import Nav from './components/Nav'
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
  const [streamContractBalance, setStreamContractBalance] = useState<number>(0)
  const [streamStartTime, setStreamStartTime] = useState<string>()
  const [streamFinishTime, setStreamFinishTime] = useState<string>()
  const [streamFlowRate, setStreamFlowRate] = useState<number>(0)
  const [totalUserWithdraw, setTotalUserWithdraw] = useState<number>()
  const [reciverAddress, setReciverAddress] = useState<string>()
  const [animationDuration, setAnimationDuration] = useState<number>(0)
  const [epochStreamTime, setepochStreamTime] = useState<number>(0)
  const [applicationAddress, getapplicationAddress] = useState<string>()

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

  // const getApplicationAddress = (appId: number): string => {
  //   return algosdk.getApplicationAddress(appId)
  // }

  // const appAddress = getApplicationAddress(appId)
  // getapplicationAddress(appAddress)

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
      const streamfinishTime = streamData.endTime?.asNumber() ?? 0
      const streamstartTime = streamData.startTime?.asNumber()
      const streamalgoFlowRate = streamData.streamRate?.asNumber() ?? 0
      const TotalwithdrawAmount = streamData.withdrawnAmount?.asNumber() ?? 0

      setepochStreamTime(streamfinishTime)

      //
      const recipientBytes = streamData.recipient?.asByteArray()
      if (recipientBytes) {
        const userAddress = algosdk.encodeAddress(new Uint8Array(recipientBytes))
        // console.log('UserAddress:', userAddress)
        setReciverAddress(userAddress)
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

  const calculateAnimationDuration = () => {
    // const currentTime = Date.now() // Get the current time in milliseconds

    // console.log('Current Time (ms):', currentTime)
    // console.log('Stream Finish Time (ms):', epochStreamTime)

    // if (epochStreamTime < currentTime) {
    //   setAnimationDuration(0) // Stream is finished, set animation duration to 0
    //   console.log('Stream has finished.')
    //   return // Exit the function early
    // }

    if (streamFlowRate > 0 && streamContractBalance > 0) {
      const totalAmount = Number(streamContractBalance) // Convert to Algos
      const totalDuration = (totalAmount / Number(streamFlowRate)) * 1000 // Duration in milliseconds
      setAnimationDuration(totalDuration)

      console.log('TTD', totalDuration)
    }
  }

  // useEffect(() => {
  //   if (streamFlowRate > 0 && amount > 0) {
  //     calculateAnimationDuration()
  //     console.log('UseEffect')
  //   }
  // }, [streamFlowRate, amount, appId])

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
      calculateAnimationDuration()
    }
  }, [appId, activeAddress, dmClient])

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/blur.jpeg')" }}>
      <div className="relative">
        <Nav />
      </div>
      <p className="absolute mt-6 ml-1 text-xl rounded-2xl p-1 text-red-200 backdrop-blur-[5px] bg-[rgba(34,30,41,0.39)] ">
        ActiveStream : {isStreaming}
      </p>
      <center>
        <button data-test-id="connect-wallet" className="btn px-48  pb-3 pt-2 text-xl  rounded-2xl mt-5 mb-5 " onClick={toggleWalletModal}>
          Wallet Connection
        </button>
      </center>
      {activeAddress && appId > 0 && isStreaming === 1 && (
        <div>
          <div className="mt-6 flex max-w-md mx-auto mb-11  ">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mr-8">Flow Started</h2>
            <BlinkBlurB></BlinkBlurB>
            <div className="text-white ml-10 text-xl font-semibold">
              <AnimatedCounter from={streamContractBalance} to={0} duration={animationDuration / 1000} />
            </div>
          </div>
          {/* <center>
            <div className="relative mt-6">
              <img
                src="/algoImg.png"
                alt="logo"
                width={25}
                height={25}
                className=" border-white max-w-md border-solid border-2 rounded-full cursor-auto"
              />
            </div>
          </center> */}
        </div>
      )}
      <div className="text-center rounded-2xl  p-6 max-w-md backdrop-blur-[5px] bg-[rgba(89,71,117,0.39)]  mx-auto">
        <div className="max-w-md">
          <div className="grid ">
            {/* <h1 className="text-red-700">Enter Flow rate and algos in microAlgos </h1> */}
            <label className="block mt-3 text-lg font-medium text-gray-900 dark:text-white">Your App ID</label>
            <input
              type="number"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm  rounded-lg focus:ring-blue-500  focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={appId}
              onChange={(e) => setAppId(e.currentTarget.valueAsNumber || 0)}
            ></input>
            {activeAddress && appId === 0 && (
              <button className="btn rounded-3xl text-base mt-4" onClick={createStream}>
                DeployAgreement
              </button>
            )}

            {/* New fields for starting the stream */}
            {activeAddress && appId > 0 && isStreaming === 0 && (
              <div>
                <h2 className="block mb-2 mt-4 mr-32 text-2xl font-medium text-gray-900 dark:text-white">create payment stream</h2>
                <div className="mt-4">
                  <label className="block mr-80 text-lg font-medium text-gray-900 dark:text-white">Address</label>
                  <input
                    type="text"
                    placeholder="Recipient Address"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </div>
                <div className="mt-4">
                  <label className="block mr-80 text-lg font-medium text-gray-900 dark:text-white">Flowrate</label>

                  <input
                    type="number"
                    placeholder="Stream Rate (μAlgos/sec)"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={Number(streamRate) / 1e6}
                    onChange={(e) => {
                      const inputVal = e.currentTarget.valueAsNumber
                      const bigintVal = BigInt(Math.round(inputVal * 1e6)) // Convert the decimal to μAlgos as BigInt
                      console.log('FlowRateAs', bigintVal)
                      setStreamRate(bigintVal)
                    }}
                  />
                </div>
                <div className="mt-4">
                  <label className="block mr-80  text-lg font-medium text-gray-900 dark:text-white">Amount</label>

                  <input
                    type="number"
                    placeholder="Amount (Algos)"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={Number(amount) / 1e6} // Convert microAlgos (BigInt) to Algos for display
                    onChange={(e) => {
                      const inputVal = e.target.valueAsNumber // Get the value as a number (in Algos)
                      const microAlgos = BigInt(Math.round(inputVal * 1e6)) // Convert Algos to microAlgos as BigInt
                      console.log('InputAmount', microAlgos)
                      setAmount(microAlgos) // Store as BigInt (μAlgos)
                    }}
                  />
                </div>
                <div className="block text-xl font-medium text-gray-900 dark:text-white">
                  {streamApproxEndTime && <h2 className=" mt-3">Stream till: {streamApproxEndTime.toLocaleString()}</h2>}
                  {streamApproxEndTime && <h2 className=" mt-1">Stream Ending in: {streamApproxHoursMins.toLocaleString()}</h2>}
                </div>
                {activeAddress && (
                  <div>
                    <button className="btn rounded-3xl mt-4" onClick={handleStartStream}>
                      CreateStream
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* <button className="btn m-2" onClick={handleWithdraw}>
              Withdraw
            </button> */}
            {activeAddress && appId > 0 && isStreaming === 1 && (
              <div className="">
                {/* <button className="btn rounded-full m-2" onClick={streamendtime}>
                  GetEndTime
                </button> */}
                <button className="btn rounded-3xl text-lg mr-6 mt-4 bg-red-100" onClick={funcStopStream}>
                  StopStream
                </button>
                <button className="btn rounded-3xl text-lg mt-4 bg-red-500" onClick={funcdeleteStream}>
                  DeleteAgreement
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {activeAddress && appId > 0 && isStreaming === 1 && (
        <div className="hero text-lg">
          <div className="backdrop-blur-[5px] bg-[rgba(89,71,117,0.39)]  p-5 rounded-2xl mt-5 mb-5 border-white border-solid border-2 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 hover:bg-violet-800 duration-300">
            <p className="flex text-white font-bold mt-1">
              Receiver <p className="text-white ml-32 mr-2 ">{reciverAddress}</p>
            </p>
            <p className="flex text-white font-bold mt-1">
              TotalContractBalance <p className="text-green-300 ml-auto mr-2 ">{streamContractBalance} Algos</p>
            </p>
            <p className="flex text-white font-bold mt-1">
              StreamfinishTime <p className="text-white ml-auto  mr-2 ">{streamFinishTime}</p>
            </p>
            <p className="flex text-white font-bold mt-1">
              StreamStartTime <p className="text-white ml-auto  mr-2"> {streamStartTime}</p>
            </p>
            <p className="flex text-white font-bold mt-1">
              AlgoFlowRate <p className="text-white ml-auto  mr-2"> {streamFlowRate} P/Sec Algos</p>
            </p>
            <p className="flex text-white font-bold mt-1">
              TotalWithdrawAmount <p className="text-red-200 ml-auto  mr-2">{totalUserWithdraw} Algos</p>
            </p>
          </div>
        </div>
      )}
      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      <Transact openModal={openDemoModal} setModalState={setOpenDemoModal} />
    </div>
  )
}

export default Home

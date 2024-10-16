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
import { getCurrentWithdawamount, streamEndTime, withdraw } from './methods'
import { getAlgodConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

interface WithdrawProps {}

const Withdraw: React.FC<WithdrawProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openDemoModal, setOpenDemoModal] = useState<boolean>(false)
  const [appId, setAppId] = useState<number>(0)
  const { activeAddress, signer } = useWallet()
  const [isStreaming, setIsStreaming] = useState<number>(0)
  const [currentwithdrawAmount, setCurrentwithdrawAmount] = useState<number>(0)
  const [streamContractBalance, setStreamContractBalance] = useState<number>(0)
  const [streamStartTime, setStreamStartTime] = useState<string>()
  const [streamFinishTime, setStreamFinishTime] = useState<string>()
  const [streamFlowRate, setStreamFlowRate] = useState<number>(0)
  const [totalUserWithdraw, setTotalUserWithdraw] = useState<number>()
  const [reciverAddress, setReciverAddress] = useState<string>()
  const [animationDuration, setAnimationDuration] = useState<number>(0)
  const [userAccountBalance, setUserAccountBalance] = useState<number>()
  const [epochStreamTime, setepochStreamTime] = useState<number>(0)

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

  const currentWithdrawAmount = async () => {
    const availableAmount = await getCurrentWithdawamount(algorand, dmClient, activeAddress!, appId)()
    const availableAmountAlgo = availableAmount / 1000000
    setCurrentwithdrawAmount(availableAmountAlgo)
  }

  const calculateAnimationDuration = () => {
    if (streamFlowRate > 0 && streamContractBalance > 0) {
      const totalAmount = Number(streamContractBalance) // Convert to Algos
      const totalDuration = (totalAmount / Number(streamFlowRate)) * 1000 // Duration in milliseconds
      setAnimationDuration(totalDuration)
    }
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
  const userBalanceFetch = async () => {
    const accountInfo = await algorand.client.algod.accountInformation(activeAddress!).do()
    const userBalance = accountInfo.amount
    // console.log('AccountInfo', accountInfo)
    setUserAccountBalance(userBalance / 1e6)
  }
  useEffect(() => {
    if (dmClient) {
      console.log('UseEffect userBalanceFetch')
      userBalanceFetch()
    }
  }, [dmClient])

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
      <p className="absolute mt-6 ml-1 text-xl rounded-2xl p-1 text-red-400 backdrop-blur-[5px] bg-[rgba(34,30,41,0.39)] ">
        ActiveStream : {isStreaming}
      </p>
      <p className="absolute mt-24 ml-1 text-xl rounded-2xl p-1 text-red-50 backdrop-blur-[5px] bg-[rgba(34,30,41,0.39)] ">
        Your Balance : {userAccountBalance} Algos
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
              <AnimatedCounter from={0} to={streamContractBalance} duration={animationDuration / 1000} />
            </div>
          </div>
        </div>
      )}
      <div className="text-center rounded-2xl p-6 max-w-md backdrop-blur-[5px] bg-[rgba(89,71,117,0.39)]  mx-auto">
        <div className="max-w-md">
          <div className="grid ">
            {/* <h1 className="text-red-700">Enter Flow rate and algos in microAlgos </h1> */}
            <label className="block mb-2 text-lg font-medium text-gray-900 dark:text-white">Enter Your app ID</label>
            <input
              type="number"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm  rounded-lg focus:ring-blue-500  focus:border-blue-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={appId}
              onChange={(e) => setAppId(e.currentTarget.valueAsNumber || 0)}
            ></input>
            {activeAddress && appId > 0 && isStreaming === 1 && (
              <div className="">
                {/* <button className="btn rounded-full m-2" onClick={streamendtime}>
                  GetEndTime
                </button> */}
                <button className="btn rounded-3xl  mr-6 text-lg mt-4" onClick={currentWithdrawAmount}>
                  CheckAvailableAmount
                </button>
                <button className="btn rounded-3xl bg-green-200 text-lg mr-2 mt-4" onClick={handleWithdraw}>
                  Withdraw
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {activeAddress && appId > 0 && isStreaming === 1 && (
        <div className="hero text-xl">
          <div className="backdrop-blur-[5px] bg-[rgba(89,71,117,0.39)]  p-5 rounded-2xl mt-5 mb-5 border-white border-solid border-2 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 hover:bg-violet-800 duration-300">
            <p className="flex text-white font-bold mt-1">
              Current Available Amount <p className="text-green-300 ml-auto  mr-2">{currentwithdrawAmount} Algos</p>
            </p>
            <p className="flex text-white font-bold mt-1">
              Your Wallet Address <p className="text-white ml-32 mr-2 ">{reciverAddress}</p>
            </p>
            <p className="flex text-white font-bold mt-1">
              Total Contract Balance <p className=" text-red-100 ml-auto mr-2 ">{streamContractBalance} Algos</p>
            </p>
            <p className="flex text-white font-bold mt-1">
              Stream Finish Time <p className="text-white ml-auto  mr-2 ">{streamFinishTime}</p>
            </p>
            <p className="flex text-white font-bold mt-1">
              Stream Start Time <p className="text-white ml-auto  mr-2"> {streamStartTime}</p>
            </p>
            <p className="flex text-white font-bold mt-1">
              Algo FlowRate <p className="text-white ml-auto  mr-2"> {streamFlowRate} P/Sec Algos</p>
            </p>
            <p className="flex text-white font-bold mt-1">
              Total Withdraw Amount <p className="text-green-300 ml-auto  mr-2">{totalUserWithdraw} Algos</p>
            </p>
          </div>
        </div>
      )}
      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      <Transact openModal={openDemoModal} setModalState={setOpenDemoModal} />
    </div>
  )
}

export default Withdraw

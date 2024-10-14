import * as algokit from '@algorandfoundation/algokit-utils'
import algosdk from 'algosdk'
import { SteamClient } from './contracts/Steam'

export function create(algorand: algokit.AlgorandClient, steamAbiClient: SteamClient, sender: string, setAppId: (id: number) => void) {
  return async () => {
    const createResult = await steamAbiClient.create.createApplication({})
    setAppId(Number(createResult.appId))
    console.log(createResult.appId)
    console.log(createResult.appAddress)
  }
}

// Method.ts code for methods calls info

// Helper to get contract's address from app ID
const getApplicationAddress = (appId: number): string => {
  return algosdk.getApplicationAddress(appId)
}

function convertToMicroAlgos(algos: bigint | number): bigint {
  return BigInt(algos) // Return the input value directly
}

export function startStream(
  algorand: algokit.AlgorandClient,
  steamAbiClient: SteamClient,
  sender: string,
  streamRate: bigint,
  recipient: string,
  amount: bigint,
  appId: number,
) {
  return async () => {
    try {
      const streamRateInMicroAlgos = convertToMicroAlgos(streamRate)
      console.log('before Stream Rate:', streamRateInMicroAlgos)
      console.log('before Amount:', amount)

      // Start the stream
      const startStreamResult = await steamAbiClient.startStream({ recipient, rate: streamRateInMicroAlgos, amount: amount })

      const appAddress = getApplicationAddress(appId)
      const algoAmount = algokit.microAlgos(Number(amount) + 100000)
      console.log('after Stream Rate:', streamRate)
      console.log('After Amount:', algoAmount)

      console.log('Return Params==>', startStreamResult.return)

      // Create payment transaction

      const paymentTxn = await algorand.send.payment({
        sender, // Sender's address (wallet)
        receiver: appAddress, // The smart contract's app address
        amount: algoAmount, // Amount to transfer to the contract
      })
      console.log('Payment transaction ID:', paymentTxn.txIds)
      console.log('Payment transaction sent:', paymentTxn.returns)

      // Log contract state after starting the stream
      const streamData = await steamAbiClient.getGlobalState()
      const balance = streamData.balance?.asNumber()
      const endTime = streamData.endTime?.asNumber()
      const isStreaming = streamData.isStreaming?.asNumber()
      const TotalWithdraw = streamData.withdrawnAmount?.asNumber()
      const StreamStartTime = streamData.lastStartTime?.asNumber()
      const recipitentAccount = streamData.recipient?.asString()
      const streamRateData = streamData.streamRate?.asNumber()
      console.log('SreamRateData =>', streamRateData)
      console.log('ReciverAccount=>', recipitentAccount)
      console.log('LastStartTime', StreamStartTime)
      console.log('Total Amount withdraw', TotalWithdraw)
      console.log('Balance Left:', balance)
      console.log('Stream End Time:', endTime)
      console.log('Is Streaming:', isStreaming)
    } catch (error) {
      console.error('Failed to start stream:', error)
    }
  }
}

export function withdraw(algorand: algokit.AlgorandClient, steamAbiClient: SteamClient, sender: string, appId: number) {
  return async () => {
    try {
      const appAddress = getApplicationAddress(appId)
      console.log('App ID:', appAddress)

      // Fetch suggested transaction parameters (includes fee, first valid, etc.)
      const suggestedParams = await algorand.getSuggestedParams()
      console.log('Suggested Transaction Params:', suggestedParams)

      // Prompt user for a fee
      const userFee = parseFloat('0.01')

      // Validate user fee input
      if (isNaN(userFee) || userFee <= 0) {
        console.error('Invalid fee provided. Please enter a positive number.')
        return
      }

      // Perform the withdraw operation with the appropriate send parameters
      const withdrawResult = await steamAbiClient.withdraw(
        {
          suggestedParams: {
            sendParams: {
              firstRound: suggestedParams.firstRound,
              lastRound: suggestedParams.lastRound,
              genesisID: suggestedParams.genesisID,
              genesisHash: suggestedParams.genesisHash,
              // flatFee: true, // Use flat fee option
            },
          },
        },
        {
          sendParams: {
            fee: algokit.algos(userFee), // Use the user-provided fee
          },
        },
      )

      // Check for confirmation
      if (withdrawResult.confirmation) {
        console.log('Withdrawal Successful:', withdrawResult.confirmation)
        const streamData = await steamAbiClient.getGlobalState()
        console.log('Stream Data:', streamData) // Log the entire streamData object for inspection
        const balance = streamData.balance?.asNumber()
        const endTime = streamData.endTime?.asNumber()
        const isStreaming = streamData.isStreaming?.asNumber()
        const TotalWithdraw = streamData.withdrawnAmount?.asNumber()
        const StreamStartTime = streamData.lastStartTime?.asNumber()
        const recipitentAccount = streamData.recipient?.asString()
        const streamRateData = streamData.streamRate?.asNumber()
        console.log('SreamRateData =>', streamRateData)
        console.log('ReciverAccount=>', recipitentAccount)
        console.log('LastStartTime', StreamStartTime)
        console.log('Total Amount withdraw', TotalWithdraw)
        console.log('Balance Left:', balance)
        console.log('Stream End Time:', endTime)
        console.log('Is Streaming:', isStreaming)
      } else {
        console.error('Withdrawal failed:', withdrawResult)
      }
    } catch (error) {
      console.error('Error during withdrawal:', error)
    }
  }
}

export function stopStream(algorand: algokit.AlgorandClient, steamAbiClient: SteamClient, sender: string, appId: number) {
  return async () => {
    const appAddress = getApplicationAddress(appId)

    const stopStream = await steamAbiClient.stopStream({}, { sendParams: { fee: algokit.algos(0.01) } })
    const streamData = await steamAbiClient.getGlobalState()
  }
}

export function streamEndTime(algorand: algokit.AlgorandClient, steamAbiClient: SteamClient, sender: string, appId: number) {
  return async () => {
    const appAddress = getApplicationAddress(appId)

    const streamendTime = await steamAbiClient.getStreamEndTime({})

    console.log('steam End time=>', streamendTime.return?.toString())
  }
}

export function deleteStreamApplication(algorand: algokit.AlgorandClient, steamAbiClient: SteamClient, sender: string, appId: number) {
  return async () => {
    const deleteAapp = await steamAbiClient.delete.deleteContract({}, { sendParams: { fee: algokit.algos(0.01) } })
  }
}

// <input
// type="number"
// placeholder="Stream Rate (μAlgos/sec)"
// className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
// value={Number(streamRate) / 1e6}
// onChange={(e) => {
//   const inputVal = e.currentTarget.valueAsNumber
//   const bigintVal = BigInt(Math.round(inputVal * 1e6)) // Convert the decimal to μAlgos as BigInt
//   console.log('FlowRateAs', bigintVal)
//   setStreamRate(bigintVal)
// }}
// />

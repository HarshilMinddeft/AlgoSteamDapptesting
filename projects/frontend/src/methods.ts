import * as algokit from '@algorandfoundation/algokit-utils'
import { SteamClient } from './contracts/Steam'

export function create(
  algorand : algokit.AlgorandClient,
  steamAbiClient:SteamClient,
  sender : string,
  streamRate :bigint,
  startTime: bigint,
  endTime: bigint,
  withdrawnAmount: bigint,
  recipient: string,
  balance: bigint,
  isStreaming: Boolean,
  last_start_time: bigint,
  last_withdrawal_time: bigint,
){}

export function startStream(
  algorand : algokit.AlgorandClient,
  steamAbiClient:SteamClient,
  sender : string,
  streamRate :bigint,
  startTime: bigint,
  endTime: bigint,
  withdrawnAmount: bigint,
  recipient: string,
  balance: bigint,
  isStreaming: Boolean,
  last_start_time: bigint,
  last_withdrawal_time: bigint,
){
  let amount = balance;
  return async ()=>{

  }
}

export function withdrawFunds(
  algorand : algokit.AlgorandClient,
  steamAbiClient:SteamClient,
  sender : string,
){}

export function stopStream(
  algorand : algokit.AlgorandClient,
  steamAbiClient:SteamClient,
  sender : string,
){}

export function streamEndTime(
  algorand : algokit.AlgorandClient,
  steamAbiClient:SteamClient,
  sender : string,
){}

export function deleteStreamApplication(
  algorand : algokit.AlgorandClient,
  steamAbiClient:SteamClient,
  sender : string,
){}

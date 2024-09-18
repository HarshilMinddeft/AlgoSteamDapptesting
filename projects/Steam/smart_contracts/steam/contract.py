from algopy import *


class Steam(ARC4Contract):
    # State variables
    streamRate: UInt64  # MicroAlgos per second
    startTime: UInt64
    withdrawnAmount: UInt64
    recipient: Account

    # Start a new stream with NoOp transaction type, after app creation
    @arc4.abimethod(allow_actions=["NoOp"], create="require")
    def createApplication(self) -> None:
        # Initialize the contract state variables (if needed)
        self.streamRate = UInt64(0)
        self.startTime = UInt64(0)
        self.withdrawnAmount = UInt64(0)
        self.recipient = Global.creator_address  # Empty default recipient

    @arc4.abimethod(allow_actions=["NoOp"])
    def startStream(self, recipient: Account, rate: UInt64, amount: UInt64) -> None:
        assert Txn.sender == Global.creator_address

        # Store stream parameters
        self.recipient = recipient
        self.streamRate = rate
        self.startTime = Global.latest_timestamp
        self.withdrawnAmount = UInt64(0)

        # Transfer Algotest tokens from sender to contract
        itxn.Payment(
            receiver=Global.current_application_address,
            amount=amount,
        ).submit()

    # Calculate the total streamed amount
    @subroutine
    def _calculateStreamedAmount(self) -> UInt64:
        elapsed_time = Global.latest_timestamp - self.startTime
        total_streamed = elapsed_time * self.streamRate
        return total_streamed - self.withdrawnAmount

    # Withdraw funds
    @arc4.abimethod(allow_actions=["NoOp"])
    def withdraw(self, amount: UInt64) -> None:
        assert Txn.sender == self.recipient

        available_amount = self._calculateStreamedAmount()
        assert available_amount >= amount

        itxn.Payment(
            receiver=self.recipient,
            amount=amount,
        ).submit()

        self.withdrawnAmount += amount

    # Stop the stream
    @arc4.abimethod(allow_actions=["NoOp"])
    def stopStream(self) -> None:
        assert Txn.sender == Global.creator_address
        self.streamRate = UInt64(0)

from algopy import *


class Steam(ARC4Contract):
    # State variables
    streamRate: UInt64  # MicroAlgos per second
    startTime: UInt64
    withdrawnAmount: UInt64
    recipient: Account  # Reciver account
    balance: UInt64  # Keep track of contract balance

    # Start a new stream with NoOp transaction type, after app creation
    @arc4.abimethod(allow_actions=["NoOp"], create="require")
    def createApplication(self) -> None:
        # Initialize the contract state variables
        self.streamRate = UInt64(0)
        self.startTime = UInt64(0)
        self.withdrawnAmount = UInt64(0)
        self.recipient = Global.creator_address  # Set the creator initially
        self.balance = UInt64(0)

    # Start a new stream with NoOp transaction type, after app creation
    @arc4.abimethod(allow_actions=["NoOp"])
    def startStream(self, recipient: Account, rate: UInt64, amount: UInt64) -> None:
        assert Txn.sender == Global.creator_address  # only creator can start

        # Store stream parameters
        self.recipient = recipient
        self.streamRate = rate
        self.startTime = Global.latest_timestamp
        self.withdrawnAmount = UInt64(0)
        self.balance += amount

    # we will take testAlgos from outerScript transection

    # Calculate the total streamed amount
    @subroutine
    def _calculateStreamedAmount(self) -> UInt64:
        elapsed_time = Global.latest_timestamp - self.startTime
        total_streamed = elapsed_time * self.streamRate
        return total_streamed - self.withdrawnAmount

    # Withdraw funds for the recipient based on the streamed amount
    @arc4.abimethod(allow_actions=["NoOp"])
    def withdraw(self, amount: UInt64) -> None:
        assert Txn.sender == self.recipient  # Only the recipient can withdraw

        available_amount = self._calculateStreamedAmount()
        assert available_amount >= amount  # Ensure there's enough to withdraw
        self.withdrawnAmount += amount  # Update the withdrawn amount
        self.balance -= amount

        itxn.InnerTransaction(
            sender=Global.current_application_address,
            # fee=1000,
            receiver=self.recipient,
            amount=amount,
            note=b"Withdrawal from contract",
            type=TransactionType.Payment,
        ).submit()

    @arc4.abimethod(allow_actions=["NoOp"])
    def stopStream(self) -> None:
        # Ensure only the creator can stop the stream
        assert Txn.sender == Global.creator_address

        # Reset the stream rate in local state
        self.streamRate = UInt64(0)

        # Transfer the remaining funds back to the creator
        if self.balance > 0:  # Ensure there is a balance to withdraw
            itxn.Payment(
                receiver=Global.creator_address,
                amount=self.balance,
                close_remainder_to=Global.creator_address,
            ).submit()
            self.balance = UInt64(0)

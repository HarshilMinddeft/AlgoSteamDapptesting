import algokit_utils
import pytest
from algokit_utils import get_localnet_default_account
from algokit_utils.config import config
from algosdk.v2client.algod import AlgodClient
from algopy import *
from algosdk.v2client.indexer import IndexerClient
from algokit_utils.beta.algorand_client import (
    AlgorandClient,
    PayParams,
)
from algokit_utils.beta.account_manager import AddressAndSigner
import algosdk
from algosdk.atomic_transaction_composer import TransactionWithSigner
from smart_contracts.artifacts.steam.steam_client import SteamClient


# Fixture for setting up Algorand client
@pytest.fixture(scope="session")
def algorand() -> AlgorandClient:
    """Get Algorand client"""
    return AlgorandClient.default_local_net()


# Fixture for getting dispenser account with test tokens
@pytest.fixture(scope="session")
def dispenser(algorand: AlgorandClient) -> AddressAndSigner:
    """Get dispenser account"""
    return algorand.account.dispenser()


# Fixture for creating the stream contract creator account
@pytest.fixture(scope="session")
def creator(algorand: AlgorandClient, dispenser: AddressAndSigner) -> AddressAndSigner:
    """Create account and fund it with some tokens"""
    acct = algorand.account.random()

    algorand.send.payment(
        PayParams(sender=dispenser.address, receiver=acct.address, amount=10_000_000)
    )
    return acct


# Fixture for initializing the payment stream client
@pytest.fixture(scope="session")
def payment_stream_client(
    algorand: AlgorandClient, creator: AddressAndSigner
) -> SteamClient:
    """Initialize payment stream contract"""
    client = SteamClient(
        algod_client=algorand.client.algod,
        sender=creator.address,
        signer=creator.signer,
    )
    # Use the new createApplication method for contract creation
    client.create_create_application()  # This initializes the contract
    return client


def test_start_stream(
    payment_stream_client: SteamClient,
    creator: AddressAndSigner,
    algorand: AlgorandClient,
):
    """Test starting the payment stream"""
    recipient = algorand.account.random()

    # Transfer funds to start the stream
    stream_fund_txn = algorand.transactions.payment(
        PayParams(
            sender=creator.address,
            receiver=payment_stream_client.app_address,
            amount=1_000_000,  # Funding the stream
            extra_fee=1_000,
        )
    )

    # Start the stream
    result = payment_stream_client.start_stream(
        recipient=recipient.address,
        rate=1000,  # Streaming rate in microAlgos per second
        amount=1_000_000,  # Initial funding
        paymentTxn=TransactionWithSigner(txn=stream_fund_txn, signer=creator.signer),
    )
    assert result.confirmed_round

    # Check the stored recipient and rate
    assert payment_stream_client.get_stream_rate() == 1000
    assert payment_stream_client.get_recipient() == recipient.address


def test_withdraw(
    payment_stream_client: SteamClient,
    algorand: AlgorandClient,
    dispenser: AddressAndSigner,
):
    """Test withdrawing funds from the stream"""
    recipient = algorand.account.random()

    # Fund the recipient account
    algorand.send.payment(
        PayParams(
            sender=dispenser.address,
            receiver=recipient.address,
            amount=5_000_000,
        )
    )

    # Simulate some time passage (e.g., 100 seconds) before withdrawal
    # This is for test purposes; in reality, the blockchain time would naturally pass.
    algorand.client.algod.status_after_block(100)

    # Withdraw a portion of the funds (e.g., 50,000 microAlgos)
    withdraw_amount = 50_000
    withdraw_txn = payment_stream_client.withdraw(
        recipient=recipient.address,
        amount=withdraw_amount,
        signer=recipient.signer,
    )

    assert withdraw_txn.confirmed_round

    # Confirm the recipient received the correct amount
    recipient_info = algorand.account.get_information(recipient.address)
    assert recipient_info["amount"] >= withdraw_amount


def test_stop_stream(
    payment_stream_client: SteamClient,
    creator: AddressAndSigner,
    algorand: AlgorandClient,
):
    """Test stopping the payment stream"""
    # Stop the stream
    result = payment_stream_client.stop_stream(
        sender=creator.address,
        signer=creator.signer,
    )
    assert result.confirmed_round

    # Check that the stream rate is now zero
    assert payment_stream_client.get_stream_rate() == 0

## Relay Telecom

DEMO: https://relay.netlify.com

(Note: the demo uses http://relay-relay.herokuapp.com/ as its relay found here https://github.com/RelayTelecom/relay and may go into standby. Any http request, such as visiting the page, should force heroku to keep it deployed)

This project aims to provide a platform for decentralized voice communications using ethereum.

Whisper is used to locate an address and thereafter negotiate a symmetric encryption key. The clients locate a nearby relay and, using that encryption key, send and receive each other's audio data through a high throughput relay.

Relays advertise themselves over whisper.

This technology will pair nicely with payment channels like Raiden as usage can be billed at the per-second level. This is out of scope of our hackathon submission but further work would include it.

Hackathon GitHub Issue: https://github.com/status-im/hackathon/issues/79

{
	"whisper-identity": "79-Relay-Telecom",
	"name":             "# 79 Relay Telecom",
	"dapp-url":         "https://relay.netlify.com"
}

# Building

yarn install

yarn start

# Running

Call an ethereum address. If they are also on the web page it will ring and present an accept/decline dialog.

# Hackathon Checklist

- [x] Basic interface
- [x] Relay read-from-client buffer
- [x] Client play-from-relay
- [x] Fork Status to allow microphone
- [x] Fork Token to allow microphone
- [x] ~~Whisper negotiation~~ (Whisper is iffy right now, we proxied the functionality using websockets here: https://github.com/RelayTelecom/whispersocket)

# Future Work

- Client side encryption. The framework is in place but the implementation is not.
- Whisper rework when the protocol is finalized
- Token/Status natively listen for these whisper messages and ring the phone, even when users are not on the page.
- web3.eth.sign! Status and Token don't support this key operation to off-chain identification.

# Judges

You can use the Status web client for making calls; however, the audio quality is lacking. For the best audio quality, we recommend using chrome on a non-mobile device with metamask.

For the changes to status, see https://github.com/RelayTelecom/status-react and its dependency, https://github.com/RelayTelecom/react-native-webview-bridge

For our Token Android apk see: https://github.com/RelayTelecom/token-android-client

We know that the encrypting, encoding, transfering, decoding, and decrypting of audio data can be improved, but it is working!

## Relay Telecom

This project aims to provide a platform for decetralized voice communications using ethereum.

Whisper is used to locate an address and thereafter negotiate a symmetric encryption key. The clients locate a nearby relay and, using that encryption key, send and receive each other's audio data through a high throughput relay.

Relays advertise themselves over whisper.

This technology will pair nicely with payment channels like Raiden as usage can be billed at the per-second level. This is out of scope of our hackathon submission but further work would include it.


# Building

yarn install

yarn start

# Running

Run your ethereum node on the ropsten testnet with whisper v2. (geth <= 1.6.0). When status supports v5 we will update the whisper api.

Launch a relay (see https://github.com/RelayTelecom/relay)

On another computer / node / status app call the other address (not quite there yet)


# Checklist

- [x] Basic interface
- [x] Relay read-from-client buffer
- [ ] Fork status to allow microphone
- [ ] Whisper key negotiation
- [ ] Client side encryption

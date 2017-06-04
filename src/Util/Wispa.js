import ethUtils from 'ethereumjs-util';
import io from 'socket.io-client';

/*
* This class is a wrapper for what would normally be whisper operations. Because whisper is extremely unreliable in its current state,
* and the api for it is in flux, we decided to implement a simple websocket version for this hackathon. In the future when web3.shh
* is more production-ready, we can replace the operations in this class with true whisper code.
*/
class Wispa {
  static listenForCalls(web3, identity, cb) {
    const socket = io("https://relay-telecom.herokuapp.com");

    //const callFilter = web3.shh.filter({topics: ['relaytelecom-call']});
    //callFilter.watch((err, call) => {
    socket.on('relaytelecom-call', (call) => {

      //const payload = JSON.parse(web3.toAscii(res.payload));
      console.log("Got call from " + call.self + " for " + call.address);

      if (call.address.toLowerCase() === web3.eth.defaultAccount.toLowerCase() && call.challenge.length === 10) {
        // They are looking for me!
        // And they aren't trying to make me do horrible things!
        // Sign their challenge

        console.log("Signing challenge");
        web3.eth.sign(web3.eth.defaultAccount, web3.sha3(call.challenge), (err, signature) => {
          if (err) {
            console.log(err);
          } else {
            const myChallenge = makeChallenge(10);
            const replyPayload = {
              signature,
              challenge: myChallenge,
            };

            // web3.shh.post({
            //   from: identity,
            //   to: res.from,
            //   topics: ['relaytelecom-reply'],
            //   payload: JSON.stringify(replyPayload),
            //   ttl: 30,
            // }, () => console.log("Someone Called me... Signed " + payload.challenge));

            // TODO: ENCRYPT
            const msg = JSON.stringify(replyPayload);
            socket.emit('relaytelecom-reply', msg);

            //const callFilter = web3.shh.filter({topics: ['relaytelecom-call']});
            //callFilter.watch((err, call) => {
            socket.on('relaytelecom-affirm', (affirmation) => {
              // TODO: Decrypt
              const affirm = JSON.parse(affirmation);

              // if (decrypt successful) {
              socket.removeAllListeners('relaytelecom-affirm');
              // }

              const signature = ethUtils.fromRpcSig(affirm.signature);
              const pubKey = ethUtils.ecrecover(
                ethUtils.toBuffer(web3.sha3(myChallenge)),
                signature.v,
                signature.r,
                signature.s);

              const foundAddr = '0x' + ethUtils.pubToAddress(pubKey).toString('hex');
              if (foundAddr.toLowerCase() === call.address.toLowerCase()) {
                cb(foundAddr.toLowerCase(), affirm.relayAddr, myChallenge, affirm.key);
              } else {
                console.log("Cheater detected? ");
                console.log(affirm);
              }
            });
          }
        });
      }
    });
    console.log("Listening to calls for " + web3.eth.accounts);
  }

  static makeCall(web3, address, progress, cb) {
    const challenge = makeChallenge(10);

    const call = {
      address,
      challenge,
      pubkey: '1234', // TODO actually make a keypair..
      self: web3.eth.defaultAccount,
    };

    const socket = io("https://relay-telecom.herokuapp.com");

    // web3.shh.post({
    //   from: identity,
    //   topics: ['relaytelecom-call'],
    //   payload: JSON.stringify(call),
    //   ttl: 300,
    // }, () => console.log("Calling " + address + "..."));
    socket.emit('relaytelecom-call', call);
    progress(2);
    // const replyFilter = web3.shh.filter({topics: ['relaytelecom-reply'], to: identity});
    // replyFilter.watch((err, reply) => {
    socket.on('relaytelecom-reply', (encryptedReply) => {
      progress(3);

      // TODO decrypt
      const reply = JSON.parse(encryptedReply);
      const signature = ethUtils.fromRpcSig(reply.signature);

      const pubKey = ethUtils.ecrecover(
        ethUtils.toBuffer(web3.sha3(challenge)),
        signature.v,
        signature.r,
        signature.s);

      const foundAddr = '0x' + ethUtils.pubToAddress(pubKey).toString('hex');

      // verify that they are who I wanted and that their signature is correct
      if (foundAddr.toLowerCase() === address.toLowerCase()) {
        // Yay! The right dude replied! Now I have to affirm that I'm me.
        web3.eth.sign(web3.eth.defaultAccount, web3.sha3(reply.challenge), (err, mySignature) => {
          if (err) {
            console.log(err);
          } else {
            const affirm = {
              signature: mySignature,
              key: '1234symmetricKey1234',
              relay: '123.456.7.8',
            }

            // web3.shh.post({
            //   from: identity,
            //   to: reply.from,
            //   topics: ['relaytelecom-affirm'],
            //   payload: JSON.stringify(affirmPayload),
            //   ttl: 30,
            // }, () => console.log("Confirmed that " + address + " is real. Affirmed with " + JSON.stringify(affirmPayload)));
            // TODO: Encrypt
            socket.emit('relaytelecom-affirm', JSON.stringify(affirm));
            progress(4);

            cb(foundAddr.toLowerCase(), affirm.relayAddr, reply.challenge, affirm.key);
          }
        });
      }
    });
  }
}


function makeChallenge(len) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

export default Wispa;

import ethUtils from 'ethereumjs-util';


class Wispa {
  static listenForCalls(web3, identity, cb) {
    const callFilter = web3.shh.filter({topics: ['relaytelecom-call']});

    callFilter.watch((err, res) => {
      if (err) {
        console.log(err);
      } else {
        const payload = JSON.parse(web3.toAscii(res.payload));
        console.log(payload);

        if (payload.address in web3.eth.accounts) {
          // They are looking for me!
          if (payload.challenge.length === 10) {
            // And they aren't trying to make me do horrible things!
            // Sign their challenge
            web3.eth.sign(web3.eth.defaultAccount, web3.sha3(payload.challenge), (err, signature) => {
              if (err) {
                console.log(err);
              } else {
                const myChallenge = makeChallenge(10);
                const replyPayload = {
                  signature,
                  challenge: myChallenge,
                };

                // send my reply out
                web3.shh.post({
                  from: identity,
                  to: res.from,
                  topics: ['relaytelecom-reply'],
                  payload: JSON.stringify(replyPayload),
                  ttl: 30,
                }, () => console.log("Someone Called me... Signed " + payload.challenge));


                // Wait for his affirmation
                // filter shit
                // get his symmetric key that he sends me, and connect to his relay that he sends me
              }
            });
          }
        }
      }
    });
    console.log("Listening to calls for " + web3.eth.accounts);
  }

  static makeCall(web3, address, identity, answer) {
    const challenge = makeChallenge(10);

    const payload = {
      address,
      challenge,
    };

    // send my payload out
    web3.shh.post({
      from: identity,
      topics: ['relaytelecom-call'],
      payload: JSON.stringify(payload),
      ttl: 30,
    }, () => console.log("Calling " + address + "..."));

    const replyFilter = web3.shh.filter({topics: ['relaytelecom-reply'], to: identity});
    replyFilter.watch((err, reply) => {
      // verify that they are who I wanted and that their signature is correct
      const parsedPayload = JSON.parse(web3.toAscii(payload));
      const signature = ethUtils.fromRpcSig(parsedPayload.signature);

      const pubKey = ethUtils.ecrecover(
        ethUtils.toBuffer(web3.sha3(challenge)),
        signature.v,
        signature.r,
        signature.s);

      const foundAddr = '0x' + ethUtils.pubToAddress(pubKey).toString('hex');

      if (foundAddr === address) {
        // Yay! The right dude replied! Now I have to affirm that I'm me.
        web3.eth.sign(web3.eth.defaultAccount, web3.sha3(parsedPayload.challenge), (err, mySignature) => {
          if (err) {
            console.log(err);
          } else {
            const affirmPayload = {
              signature: mySignature,
              key: '1234symmetricKey1234',
              relay: '123.456.7.8',
            }

            // send my affirmation out
            web3.shh.post({
              from: identity,
              to: reply.from,
              topics: ['relaytelecom-affirm'],
              payload: JSON.stringify(affirmPayload),
              ttl: 30,
            }, () => console.log("Confirmed that " + address + " is real. Affirmed with " + JSON.stringify(affirmPayload)));

          }
        });
      }


      console.log(reply.payload);
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

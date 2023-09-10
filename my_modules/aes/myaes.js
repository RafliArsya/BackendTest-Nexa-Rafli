//const crypto = require("crypto");
import crypto from "crypto";

export function checklength(input){
    var inputhex = Buffer.from(input, 'utf8').toString('hex');
    var inputbuffer = Buffer.from(inputhex, "hex")
    if (inputbuffer.length < 16){
        var chunkbuf = [];
        chunkbuf.push(Buffer.from(inputbuffer));
        for (let i = inputbuffer.length; i < 16; i++){
            chunkbuf.push(Buffer.from([0x00]));
        }
        chunkbuf = Buffer.concat(chunkbuf);
        //console.log(chunkbuf);
    }
    return chunkbuf.length>inputbuffer.length?chunkbuf:inputbuffer;
}

// encrypt the message
export function encrypt(plainText, securitykey, outputEncoding) {
    //console.log(securitykey);
    var n_securitykey = checklength(securitykey);
    const cipher = crypto.
        createCipheriv("aes-128-ecb", n_securitykey, null);
    return Buffer.
        concat([cipher.update(plainText), cipher.final()]).
        toString(outputEncoding);
}

//AES decryption
export function decrypt(cipherText, securitykey, outputEncoding) {
    var n_securitykey = checklength(securitykey);
    const cipher = crypto.
        createDecipheriv("aes-128-ecb", n_securitykey, null);
    return Buffer.
        concat([cipher.update(cipherText), cipher.final()]).
        toString(outputEncoding);
}

//module.exports = {
//    encrypt: encrypt,
//    decrypt: decrypt,
//}

export default {decrypt, encrypt, checklength}
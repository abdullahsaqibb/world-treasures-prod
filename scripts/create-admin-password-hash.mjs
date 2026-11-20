#!/usr/bin/env node
// Creates a local scrypt password verifier. Never prints the actual password.
import {randomBytes,scryptSync} from "node:crypto";
import readline from "node:readline";
import {Writable} from "node:stream";
if(!process.stdin.isTTY){console.error("Run this in a local terminal.");process.exit(1);}
let hidden=false;
const output=new Writable({write(chunk,encoding,callback){if(!hidden)process.stdout.write(chunk,encoding);callback();}});
const rl=readline.createInterface({input:process.stdin,output,terminal:true});
const password=await new Promise(resolve=>{process.stdout.write("Choose a strong admin password (16+ characters): ");hidden=true;rl.question("",resolve);});
hidden=false;process.stdout.write("\n");rl.close();
if(password.length<16||password.length>1024){console.error("Password must be 16 to 1024 characters.");process.exit(1);}
const salt=randomBytes(32);
const hash=scryptSync(password,salt,64,{maxmem:64*1024*1024});
console.log("\nPaste this value into the Vercel Preview variable ADMIN_PASSWORD_SCRYPT:\n");
console.log(salt.toString("hex")+":"+hash.toString("hex"));
console.log("\nKeep the original password private; never commit it or paste it into chat.");

import dotenv from 'dotenv'
const path = require('path')
dotenv.config({ path: path.join(__dirname, '.env')})

import express from 'express'
import cors from 'cors'
const app = express();
const port = process.env.APP_PORT || 3003

import routerSignIn from './routes/signin/index';

app.use(express.static('public'))
app.use(express.json());
app.use(cors())

app.use('/signin', routerSignIn)

async function main(){
 
}

main().catch(error => console.log('main function error ', error))

app.listen(port, () => {
  try {
      console.log(`listening at ${port} ...`);      
  } catch (error) {
      console.log(error);
  }   
});

process.on('SIGINT', () =>{
  console.log("\nExiting ...");
  //db.connection.end();
  console.log("\nExited ...");
  process.exit(0);   
});
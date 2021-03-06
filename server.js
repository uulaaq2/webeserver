import dotenv from 'dotenv'
const path = require('path')
dotenv.config({ path: path.join(__dirname, '.env')})

import express from 'express'
import cors from 'cors'
const app = express();
const port = process.env.APP_PORT || 3003

app.use(express.static('public'))
app.use(express.json());
app.use(cors())

import DB from './classes/DB'
import routerSignIn from './routes/signin'
app.use('/signin', routerSignIn)

async function main(){
  // try {
  //   new DB().query({
  //     sqlStatement: 'SELECT * FROM sys_users WHERE ID = -1'
  //   })    
  // } catch (error) {
  //   console.log('error ', error)
  // }
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
import express from 'express'
import cors from 'cors'
const router = express.Router()
import { setSuccessReply } from '../../appFunctions/replies'
import CustomError from '../../classes/CustomError3'
import User from '../../classes/User'

router.post('/', cors(), function(req, res) {

  async function main() {
    try {
      console.log(req.body)
      const result = await new User().signIn({ ...req.body })    
      console.log(result)
      res.send(result)      
    } catch (error) {
      res.send(new CustomError(error.message, error.iType || undefined))
    }
  }

  main()
})

export default router
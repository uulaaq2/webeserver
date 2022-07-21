import express from 'express'
import cors from 'cors'
const router = express.Router()
import { setSuccessReply } from '../../appFunctions/replies'
import CustomError from '../../classes/CustomError'
import User from '../../classes/User'

router.post('/', cors(), function(req, res) {

  async function main() {
    try {
      const result = await new User().signIn({ ...req.body })    
      res.send(result)      
    } catch (error) {
      res.send(new CustomError(error.message, error.iType || undefined))
    }
  }

  main()
})

export default router
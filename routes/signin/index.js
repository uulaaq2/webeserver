import express from 'express'
import cors from 'cors'
const router = express.Router()
import { setSuccessReply, setCustomReply, setErrorReply } from '../../appFunctions/replies'
import User from '../../classes/User'

router.post('/', cors(), function(req, res) {

  async function main() {
    const result = await new User().signIn({ ...req.body })
    res.send(result)
  }

  main()
})

export default router
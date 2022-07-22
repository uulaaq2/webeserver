import bcrypt from 'bcryptjs'
import { setSuccessReply } from "../appFunctions/replies"
import CustomError from './CustomError3'

class Password {

  // encrypt
  encrypt(params) {    
    try {
      const { password } = params    
      const salt = bcrypt.genSaltSync(10)
      const encryptedPassword = bcrypt.hashSync(password, salt)

      return setSuccessReply({
        data: encryptedPassword
      })

    } catch (error) {
      throw new CustomError(error)
    }
  }
  // encrypt

  //compare
  compare(params) {
    try {
      const { password, encryptedPassword } = params

      if (bcrypt.compareSync(password, encryptedPassword)) {
        return setSuccessReply({
          data: password
        })
      } else {
        throw new CustomError('Invalid password', 'invalidPassword')
      }

    } catch (error) {
      throw new CustomError(error)
    }
  }
  // compare

}

export default Password
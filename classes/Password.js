import bcrypt from 'bcryptjs'
import { setSuccessReply, setErrorReply, setCustomReply } from "../appFunctions/replies"
import { _getDebugLine } from '../appFunctions/helpers'

class Password {

  // encrypt
  encrypt(params) {    
    try {
      const { password } = params    
      const salt = bcrypt.genSaltSync(10)
      const encryptedPassword = bcrypt.hashSync(password, salt)

      return setSuccessReply({
        encryptedPassword,
        debugLine: _getDebugLine()
      })

    } catch (error) {
      return setErrorReply({
        debugLine: _getDebugLine(),
        obj: error
      })
    }
  }
  // encrypt

  //compare
  compare(params) {
    try {
      const { password, encryptedPassword } = params

      if (bcrypt.compareSync(password, encryptedPassword)) {
        return setSuccessReply({
          debugLine: _getDebugLine()
        })
      } else {
        return setCustomReply({
          status: 'invalidPassword',
          message: 'Invalid password',
          debugLine: _getDebugLine()
        })
      }

    } catch (error) {
      return setErrorReply({
        debugLine: _getDebugLine(),
        obj: error
      })
    }
  }
  // compare

}

export default Password
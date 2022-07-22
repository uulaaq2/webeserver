import jwt from 'jsonwebtoken'
import config from '../config'
import DateUtils from './DateUtils'
import { setSuccessReply } from './../appFunctions/replies'
import CustomError from './CustomError3';

class Token {
  
  // generate
  generate(params) {
    try {      
      const { payload, expiresIn = null } = params
      
      let jwtOptions = {}
      
      if (!expiresIn) {
        jwtOptions.expiresIn = config.tokenExpiresIn
      }

      const token = jwt.sign(payload, process.env.JWT_SECRET, jwtOptions)

      return setSuccessReply({
        data: token
      })

    } catch (error) {
      throw new CustomError(error)
    }
  }
  // generate

  // verify
  verify(params) {
    try {
      const { token, ignoreShouldChangePassword = false } = params
      const verifyTokenResult = jwt.verify(token, process.env.JWT_SECRET)        
      const accountExpiresAt = verifyTokenResult.accountExpiresAt

      const dateUtils = new DateUtils()
      const diffToDate = dateUtils.diffToDate(accountExpiresAt)

      if (diffToDate.days < 0) {
        throw new CustomError({
          message: 'Account is expired',
          iType: 'accountIsExpired'
        })
      }

      if (!ignoreShouldChangePassword) {
        if (verifyTokenResult.shouldChangePassword) {
          throw new Error({
            message: 'Please change your password',
            iType: 'shouldChangePassword'
          })
        }
      }
      
      return setSuccessReply({
        data: {
          token,
          user: verifyTokenResult
        }
      })
    } catch (error) {
      throw new CustomError({
        message: 'Token expired',
        iType: 'tokenExpired'
      })
    }

  }
  // verify

}

export default Token
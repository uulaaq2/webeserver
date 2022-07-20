import jwt from 'jsonwebtoken'
import config from '../config'
import DateUtils from './DateUtils'
import { setSuccessReply, setCustomReply, setErrorReply } from './../appFunctions/replies'
import { _getDebugLine } from '../appFunctions/helpers'

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
        token,
        debugLine: _getDebugLine(),
      })

    } catch (error) {
      return setErrorReply({
        debugLine: _getDebugLine(),
        errorObj: error
      })
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

      if (diffToDate.status !== 'ok') {
        setCustomReply({
          status: diffToDate.status,
          message: diffToDate.message,
          debugLine: _getDebugLine(),
          returnedDebug: diffToDate.debug
        })
      }      

      if (diffToDate.days < 0) {
        return setCustomReply({
          status: 'accountIsExpired',
          message: 'Your account is expired, please contact to your manager',
          debugLine: _getDebugLine()
        })
      }

      if (!ignoreShouldChangePassword) {
        if (verifyTokenResult.shouldChangePassword) {
          return setCustomReply({
            status: 'shouldChangePassword',
            message: 'Please change your password',
            debugLine: _getDebugLine(),
            token
          })
        }
      }
      
      return setSuccessReply({
        token,
        user: verifyTokenResult
      })
    } catch (error) {
      return setCustomReply({
        status: 'invalidToken',
        message: 'Invalid token',
        debugLine: _getDebugLine(),
        errorObj: error
      })
    }

  }
  // verify

}

export default Token
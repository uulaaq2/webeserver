import DB from './DB'
import Password from './Password'
import Token from './Token'
import sqlstring from 'sqlstring'
import { setSuccessReply, setCustomReply, setErrorReply } from '../appFunctions/replies'
import { _getCallerFile, _getDebugLine } from '../appFunctions/helpers'

class User {

  // getByEmailAddress
  async getByEmailAddress(params) {
    const { emailAddress } = params

    if (!emailAddress) {
      return setCustomReply('noEmailAddressIsProvided',{
        message: 'No email address is provided'
      })
    }

    try {
      let sqlStatement = 'SET @EmailAddress = ' + sqlstring.escape(emailAddress) + ';' + 
                         'SET @Active = 1;' +
                         'SELECT * FROM get_user_by_email_address'
      
      const getByEmailAddressResult = await new DB().query({
        sqlStatement
      })

      if (getByEmailAddressResult.status !== 'ok') {
        return setCustomReply({
          status: getByEmailAddressResult.status,
          message: getByEmailAddressResult.message,          
          debugLine: _getDebugLine(),       
          returnedDebugLine: getByEmailAddressResult.debugLine,   
          obj: getByEmailAddressResult.obj || null
        })
      }

      if (getByEmailAddressResult.data[getByEmailAddressResult.data.length - 1].length === 0) {
        return setCustomReply({
          status: 'emailAddressCannotBeFound',
          message: 'Email address can not be found',
          debugLine: _getDebugLine(),
          returnedDebugLine: getByEmailAddressResult.debugLine,
          obj: getByEmailAddressResult.obj || null
        })
      }
      return setSuccessReply({
        user: getByEmailAddressResult.data[getByEmailAddressResult.data.length - 1][0],
        debugLine: _getDebugLine()
      })

    } catch (error) {
      return setErrorReply({
        debugLine: _getDebugLine(),
        obj: error
      })
    }
  }
  //getByEmailAddress

  // checkPassword
  async checkCredentials(params) {
    try {
      const { emailAddress, password } = params     

      const getByEmailAddressResult = await this.getByEmailAddress({emailAddress})
      
      if (getByEmailAddressResult.status !== 'ok') {
        return setCustomReply({
          status: getByEmailAddressResult.status,
          message: getByEmailAddressResult.message,
          debugLine: _getDebugLine(),
          returnedDebugLine: getByEmailAddressResult.debugLine,
          obj: getByEmailAddressResult.obj
        })
      }
      const decrytpPasswordResult = new Password().compare({
        password,
        encryptedPassword: getByEmailAddressResult.user.Password
      })
      
      if (decrytpPasswordResult.status !== 'ok') {
        return setCustomReply({
          status: decrytpPasswordResult.status,
          message: decrytpPasswordResult.message,
          debugLine: _getDebugLine(),
          returnedDebugLine: decrytpPasswordResult.debugLine,
          obj: decrytpPasswordResult.obj
        })
      }

      return setSuccessReply({
        user: getByEmailAddressResult.user,
        debugLine: _getDebugLine()
      })

    } catch (error) {
      return setErrorReply({
        debugLine: _getDebugLine(),
        obj: error
      })
    }
  }
  // checkPassword

  // signIn
  async signIn(params) {
    try {
      const { emailAddress, password, token } = params

      if (!emailAddress || !password) {        
        const verifyTokenResult = new Token().verify({ token })

        if (verifyTokenResult.status !== 'ok') {
          return setCustomReply({
            status: verifyTokenResult.status,
            message: verifyTokenResult.message,
            debugLine: _getDebugLine(),
            returnedDebugLine: verifyTokenResult.debugLine,
            obj: verifyTokenResult.obj
          })
        }

        emailAddress = verifyTokenResult.user.Email_Address
        password = verifyTokenResult.user.password
      }
      
      const checkCredentialsResult = await this.checkCredentials({ emailAddress, password })
      console.log(checkCredentialsResult)

      if (checkCredentialsResult.status !== 'ok') {
        return setCustomReply({
          status: checkCredentialsResult.status,
          message: checkCredentialsResult.message,
          debugLine: _getDebugLine(),
          returnedDebugLine: checkCredentialsResult.debugLine,
          obj: checkCredentialsResult.obj || null
        })
      }

      const generateTokenResult = new Token().generate({ 
        payload: {
          Expires_At: checkCredentialsResult.user.Expires_At,
          Email_Address: checkCredentialsResult.user.Email_Address
        }
      })

      if (generateTokenResult.status !== 'ok') {
        return setCustomReply({
          status: generateTokenResult.status,
          message: generateTokenResult.message,
          debugLine: _getDebugLine(),
          returnedDebugLine: generateTokenResult.debugLine,
          obj: generateTokenResult.obj || null
        })
      }

      return setSuccessReply({
        links: {
          userLinks: ''
        },
        menus: {
          userMenus: ''
        },
        settings: {
          userSettings: ''
        },
        user: checkCredentialsResult.user,
        token: generateTokenResult.token,  
        debugLine: _getDebugLine()
      })

    } catch (error) {
      return setErrorReply({
        debugLine: _getDebugLine(),
        obj: error
      })
    }
  }
  // signIn

  
}

export default User
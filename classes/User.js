import DB from './DB'
import Password from './Password'
import Token from './Token'
import Permissions from './Permissions'
import sqlstring from 'sqlstring'
import _ from 'lodash'
import { setSuccessReply, setCustomReply, setErrorReply } from '../appFunctions/replies'
import { _getCallerFile, _getDebugLine } from '../appFunctions/helpers'

class User {

  // getByEmailAddress
  async getByEmailAddress(params) {
    const { emailAddress } = params

    if (!emailAddress) {
      return setCustomReply({
        status: 'noEmailAddressIsProvided',
        message: 'No email address is provided',
        debugLine: _getDebugLine()
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
          returnedDebug: getByEmailAddressResult.debug
        })
      }

      if (getByEmailAddressResult.data[getByEmailAddressResult.data.length - 1].length === 0) {
        return setCustomReply({
          status: 'invalidEmailAddress',
          message: 'Invalid email address',
          debugLine: _getDebugLine(),
          returnedDebug: getByEmailAddressResult.debug
        })
      }
      return setSuccessReply({
        user: getByEmailAddressResult.data[getByEmailAddressResult.data.length - 1][0],
        debugLine: _getDebugLine()
      })

    } catch (error) {
      return setErrorReply({
        debugLine: _getDebugLine(),
        errorObj: error
      })
    }
  }
  //getByEmailAddress

  // checkCredentials
  async checkCredentials(params) {
    try {
      let { emailAddress, password, token } = params
      let signInType = (emailAddress && password) ? 'credentials' : 'token'

      if (signInType === 'token') {
        if (token) {
          const verifyTokenResult = new Token().verify({ token })
          if (verifyTokenResult.status !== 'ok') {
            return setCustomReply({
              status: verifyTokenResult.status,
              message: verifyTokenResult.message,
              debugLine: _getDebugLine(),
              returnedDebug: verifyTokenResult.debug
            })
          }

          emailAddress = verifyTokenResult.user.Email_Address
        }
      }

      const getByEmailAddressResult = await this.getByEmailAddress({emailAddress})
      
      if (getByEmailAddressResult.status !== 'ok' && getByEmailAddressResult.status !== 'invalidEmailAddress') {
        return setCustomReply({
          status: getByEmailAddressResult.status,
          message: getByEmailAddressResult.message,
          debugLine: _getDebugLine(),
          returnedDebug: getByEmailAddressResult.debug
        })
      }

      if (getByEmailAddressResult.status === 'invalidEmailAddress') {
        return setCustomReply({
          status: 'invalidCredentials',
          message: 'Invalid email address or password',
          debugLine: _getDebugLine()
        })
      }

      if (signInType === 'credentials') {
        const decrytpPasswordResult = new Password().compare({
          password,
          encryptedPassword: getByEmailAddressResult.user.Password
        })
        
        if (decrytpPasswordResult.status !== 'ok' && decrytpPasswordResult.status !== 'invalidPassword') {
          return setCustomReply({
            status: decrytpPasswordResult.status,
            message: decrytpPasswordResult.message,
            debugLine: _getDebugLine(),
            returnedDebug: decrytpPasswordResult.debug
          })
        }
        
        if (decrytpPasswordResult.status === 'invalidPassword') {
          return setCustomReply({
            status: 'invalidCredentials',
            message: 'Invalid email address or password',
            debugLine: _getDebugLine()
          })
        }
      }


      return setSuccessReply({
        user: getByEmailAddressResult.user,
        debugLine: _getDebugLine()
      })

    } catch (error) {
      return setErrorReply({
        debugLine: _getDebugLine(),
        errorObj: error
      })
    }
  }
  // checkCredentials

  // signIn
  async signIn(params) {
    try {
      const { emailAddress, password, token, site } = params

      const checkCredentialsResult = await this.checkCredentials({ emailAddress, password, token })

      if (checkCredentialsResult.status !== 'ok') {
        return setCustomReply({
          status: checkCredentialsResult.status,
          message: checkCredentialsResult.message,
          debugLine: _getDebugLine(),
          returnedDebug: checkCredentialsResult.debug
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
          returnedDebug: generateTokenResult.debug
        })
      }

      // get user selected site
      const siteList = checkCredentialsResult.user.Sites.split(',')
      let userSelectedSite
      if (site) {        
        let found = false;
        for (let i = 0; i < siteList.length && !found; i++) {
          if (siteList[i] === site) {
            found = true;
            break;
          }
        }
        if (found) {
          userSelectedSite = site
        } else {
          userSelectedSite = siteList[0]
        }
      } else {
        userSelectedSite = siteList[0]
      }
      // get user selected site

      // get all user permissions
      const userDepartmentIDsCommaListResult = await new Permissions().getUserDepartments({
        userID: checkCredentialsResult.user.ID
      })      

      const allUserPermissionsResult = await new Permissions().getAllUserPermissions({
        userID: checkCredentialsResult.user.ID,
        departmentIDsCommaList: userDepartmentIDsCommaListResult.departmentIDsCommaList,
        site: userSelectedSite
      })
      // get all user permissions

      // prepare all user permissions
      let menus = {}
      var menusTemp
      let rawPermissions = allUserPermissionsResult.allUserPermissions
      var i = 0
      let pieces
      rawPermissions.forEach(e => {                  
          pieces = rawPermissions[i].Path.split('.')
          menusTemp = pieces.reduceRight((obj, next) => ({[next]: obj}), {[rawPermissions[i].Action]: true})
          _.merge(menus, menusTemp)                
          i++
      })                   
      // prepare all user permissions

      return setSuccessReply({
        menus,
        selectedSite: userSelectedSite,
        user: checkCredentialsResult.user,                        
        token: generateTokenResult.token,  
        debugLine: _getDebugLine()
      })

    } catch (error) {
      return setErrorReply({
        debugLine: _getDebugLine(),
        errorObj: error
      })
    }
  }
  // signIn

  
}

export default User
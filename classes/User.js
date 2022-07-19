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
          returnedDebug: getByEmailAddressResult.debug
        })
      }

      if (getByEmailAddressResult.data[getByEmailAddressResult.data.length - 1].length === 0) {
        return setCustomReply({
          status: 'emailAddressCannotBeFound',
          message: 'Email address can not be found',
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
      const { emailAddress, password } = params     

      const getByEmailAddressResult = await this.getByEmailAddress({emailAddress})
      
      if (getByEmailAddressResult.status !== 'ok') {
        return setCustomReply({
          status: getByEmailAddressResult.status,
          message: getByEmailAddressResult.message,
          debugLine: _getDebugLine(),
          returnedDebug: getByEmailAddressResult.debug
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
          returnedDebug: decrytpPasswordResult.debug
        })
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
      
      if (!emailAddress || !password) {        
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
        password = verifyTokenResult.user.password
      }
      
      const checkCredentialsResult = await this.checkCredentials({ emailAddress, password })

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
      console.log(siteList)
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

      console.log(
        {
          menus,
          user: checkCredentialsResult.user,                        
          token: generateTokenResult.token,  
          debugLine: _getDebugLine()
      })

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
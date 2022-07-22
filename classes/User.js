import DB from './DB'
import Password from './Password'
import Token from './Token'
import Permissions from './Permissions'
import sqlstring from 'sqlstring'
import _ from 'lodash'
import { setSuccessReply } from '../appFunctions/replies'
import CustomError from './CustomError3'

class User {

  // getByEmailAddress
  async getByEmailAddress(params) {
    const { emailAddress } = params

    if (!emailAddress) {
      throw new CustomError(({
        iType: 'missingParameters',
        message: 'Missing email addrres'
      }))
    }

    try {
      let sqlStatement = 'SET @EmailAddress = ' + sqlstring.escape(emailAddress) + ';' + 
                         'SET @Active = 1;' +
                         'SELECT * FROM get_user_by_email_address'
      
      const getByEmailAddressResult = await new DB().query({
        sqlStatement
      })

      if (getByEmailAddressResult.data[getByEmailAddressResult.data.length - 1].length === 0) {
        throw new CustomError({
          iType: 'invalidEmailAddress',
          message: 'Invalid email address'
        })
      }
      return setSuccessReply({
        data: getByEmailAddressResult.data[getByEmailAddressResult.data.length - 1][0]
      })

    } catch (error) {
      throw new CustomError(error)
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

          emailAddress = verifyTokenResult.user.Email_Address
        }
      }

      const getByEmailAddressResult = await this.getByEmailAddress({emailAddress})     

      if (signInType === 'credentials') {
        const decrytpPasswordResult = new Password().compare({
          password,
          encryptedPassword: getByEmailAddressResult.user.Password
        })              
      }


      return setSuccessReply({
        data: getByEmailAddressResult.user
      })

    } catch (error) {
      if (error.iType && ['invalidEmailAddress', 'invalidPassword'].includes(error.iType)) {
        throw new CustomError({
          iType: 'invalidSignInCredentials',
          message: 'Invalid email address or password'
        })
      } else {
        throw new CustomError(error)
      }
    }
  }
  // checkCredentials

  // signIn
  async signIn(params) {
    try {
      const { emailAddress, password, token, site } = params

      const checkCredentialsResult = await this.checkCredentials({ emailAddress, password, token })

      const generateTokenResult = new Token().generate({ 
        payload: {
          Expires_At: checkCredentialsResult.user.Expires_At,
          Email_Address: checkCredentialsResult.user.Email_Address
        }
      })

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
        userID: checkCredentialsResult.data.ID
      })      

      const allUserPermissionsResult = await new Permissions().getAllUserPermissions({
        userID: checkCredentialsResult.data.ID,
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
        data: {
          menus,
          selectedSite: userSelectedSite,
          user: checkCredentialsResult.user,                        
          token: generateTokenResult.token
        }
      })

    } catch (error) {
      throw new CustomError(error)
    }
  }
  // signIn

  
}

export default User
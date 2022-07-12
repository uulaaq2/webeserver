import DB from './DB'
import sqlstring from 'sqlstring'
import { setSuccessReply, setCustomReply, setErrorReply } from '../appFunctions/replies'
import { _getCallerFile, _getDebugLine } from '../appFunctions/helpers'

class User {

  async getUserByEmailAddress(params) {
    const { emailAddress } = params

    if (!emailAddress) {
      return setCustomReply('NoEmailAddressIsProvided',{
        message: 'No email address is provided'
      })
    }

    try {
      let sqlStatement = 'SET @EmailAddress=' + sqlstring.escape(emailAddress) + ';' + 
                         'SELECT * FROM get_user_by_email_addressa'
      
      const result = await new DB().query({
        sqlStatement
      })

      console.log(result)
      if (result.status !== 'ok') {
        return setCustomReply({
          status: 'ReturnedError',
          location: _getDebugLine(),
          obj: result.obj
        })
      }

      if (result.data[1].length === 0) {
        return setCustomReply('NoEmailAddress',{
          message: 'Email address can not be found'
        })
      }

      return setSuccessReply({
        data: result.data[1][0]
      })

    } catch (error) {
      return setErrorReply({
        location: _getCallerFile(),
        obj: error
      })
    }
  }
}

export default User
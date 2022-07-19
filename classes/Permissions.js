import DB from './DB'
import sqlstring from 'sqlstring'
import { setSuccessReply, setErrorReply, setCustomReply } from './../appFunctions/replies'
import { _getDebugLine } from '../appFunctions/helpers'

class Permissions {

  // getUserDepartments
  async getUserDepartments(params) {    
    try {
      const { userID } = params
      const sqlStatement = 'SET @userID = ' + userID + ';' +
                      'SELECT * FROM get_user_department_ids_comma_list';
      const result = await new DB().query({
        sqlStatement
      })
      
      if (result.status !== 'ok') {
        return setCustomReply({
          status: result.status,
          message: result.message,
          debugLine: _getDebugLine(),
          returnedDebug: result.debug
        })
      }

      return setSuccessReply({
        debugLine: _getDebugLine(),
        departmentIDsCommaList: result.data[result.data.length -1][0].DepartmentIDsCommaList
      })
    } catch (error) {
      return setErrorReply({
        debugLine: _getDebugLine(),
        errorObj: error
      })
    }
  }
  // getUserDepartments

  // getAllUserPermissions
  async getAllUserPermissions(params) {
    try {
      const { userID, departmentIDsCommaList, site } = params

      const sqlStatement = 'SET @userID = ' + userID + ';' +
                           'SET @departmentIDsCommaList = ' + sqlstring.escape(departmentIDsCommaList) + ';' +
                           'SET @site = ' + sqlstring.escape(site) + ';' +
                           'SELECT * FROM get_all_user_permissions'
      
      const result = await new DB().query({
        sqlStatement
      })
      
      if (result.status !== 'ok') {
        return setCustomReply({
          debugLine: _getDebugLine(),
          returnedDebug: result.debug
        })
      }

      return setSuccessReply({
        debugLine: _getDebugLine,
        allUserPermissions: result.data[result.data.length - 1]
      })

    } catch (error) {
      return setErrorReply({
        debugLine: _getDebugLine(),
        errorObj: error
      })
    }
  }
}

export default Permissions
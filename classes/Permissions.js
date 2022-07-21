import DB from './DB'
import sqlstring from 'sqlstring'
import { setSuccessReply } from './../appFunctions/replies'
import CustomError from './CustomError'

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
      
      return setSuccessReply({
        data: result.data[result.data.length -1][0].DepartmentIDsCommaList
      })
    } catch (error) {
      throw new CustomError()
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

      return setSuccessReply({
        data: result.data[result.data.length - 1]
      })

    } catch (error) {
      throw new CustomError(error.message, error.iType)
    }
  }
}

export default Permissions
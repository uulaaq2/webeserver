import mysql from 'mysql'
import CustomError from './CustomError'
import CustomError2 from './CustomError'
import { setSuccessReply } from '../appFunctions/replies'
import { result } from 'lodash';

class DB {

  static connection = mysql.connection

  constructor() {
    if (!DB.connection) {
        DB.connection = mysql.createConnection({
                                host: process.env.DB_HOST,
                                user: process.env.DB_USER,
                                password: process.env.DB_PASSWORD,
                                database: process.env.DB_DATABASE,
                                port: process.env.DB_PORT,
                                multipleStatements: true
                              })     
        DB.connection.connect((error) => {
                                if (error) {
                                  throw new CustomError(error)
                                }
                                console.log('Connected to the db ...')
                            })

        }        
  }

  isConnected() {
    return DB.connection.state === 'connected' ? true : false
  }

  async query(params) {
    const { sqlStatement, values = [] } = params

    return new Promise((resolve) => {
      DB.connection.query(sqlStatement, values, (error, results) => {

          if (error) {
           throw new CustomError(error)
          }

          if (results.length === 0 || results[results.length -1].length === 0) {
            throw new CustomError({message: 'No records', iType: 'emptyDBResult'})
          }

          resolve(setSuccessReply({
            data: results
          }))

        }
      )
    })
  }

}

export default DB
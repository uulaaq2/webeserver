import mysql from 'mysql'
import { setSuccessReply, setErrorReply } from '../appFunctions/replies'

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
                                if (error) setErrorReply({
                                  obj: error
                                })
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
            resolve(setErrorReply({
              obj: error
            }))
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
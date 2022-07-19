import { setSuccessReply, setErrorReply } from '../appFunctions/replies'
import { _getDebugLine } from '../appFunctions/helpers'

class DateUtils {
  
  // diffToDate
  diffToDate(toDate) {
    try {
      const today = new Date();
      const difference = new Date(toDate).getTime() - today.getTime()
      const days = Math.ceil(difference / (1000 * 3600 * 24));      

      return setSuccessReply({
        days,
        debugLine: _getDebugLine()
      })
    } catch (error) {
        return setErrorReply({
          debugLine: _getDebugLine(),
          errorObj: error
        })
    }
  }
  // diffToDate

}

export default DateUtils
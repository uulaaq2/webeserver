import { setSuccessReply } from '../appFunctions/replies'
import CustomError from './CustomError3';

class DateUtils {
  
  // diffToDate
  diffToDate(toDate) {
    try {
      const today = new Date();
      const difference = new Date(toDate).getTime() - today.getTime()
      const days = Math.ceil(difference / (1000 * 3600 * 24));      

      return setSuccessReply({
        data: days
      })
    } catch (error) {
      throw new CustomError(error)
    }
  }
  // diffToDate

}

export default DateUtils
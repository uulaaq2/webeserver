import config from '../config'

export function setSuccessReply(params = {}) {
  const { message = '', ...rest } = params
  let reply ={
    status: 'ok',
    message,
    ...rest
  }

  return reply
}
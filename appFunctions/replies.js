import config from '../config'

export function setSuccessReply(params = {}) {
  const { status = 'ok', message = '', debugLine = '', ...rest } = params
  let reply ={
    status,
    message,
    debugLine,
    ...rest
  }

  return reply
}

export function setCustomReply(params = {}) {
  const { status, message = '', debugLine = '', ...rest } = params
  let reply = {
    status,
    message,
    debugLine,
    ...rest
  }

  return reply
}

export function setErrorReply(params = {}) {
  const { status = 'error', message = '', debugLine = '', ...rest } = params
  let reply = {
    status,    
    message,
    debugLine,
     ...rest
  }
 
  return reply
}
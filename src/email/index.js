import Transporter from './transporter'
import Code from './code'
import createMessage from './message'
import AckKey from './ackKey'

const sendEmailAsync = (message) => new Promise((resolve, reject) => {
  Transporter.sendMail(message, (error, info) => {
    if (error) {
      console.log('Error occurred');
      console.error(error.message);
      reject(false)
      return
    }

    resolve(info)

    console.log('Message sent successfully!');
  });
})


const sendCode = async (accepter) => {
  let code = await Code.create(accepter)
  let message = createMessage(code, accepter)

  let info = await sendEmailAsync(message)

  return info
}

const checkCode = async (email, code) => {
  return await Code.check(email, code)
}

const deleteCode = async (email) => {
  return await Code.delete(email)
}


export default {
  sendCode,
  checkCode,
  deleteCode,
  AckKey
}
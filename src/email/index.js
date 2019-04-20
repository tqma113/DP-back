import Transporter from './transporter'
import Code from './code'
import createMessage from './message'
import AckKey from './ackKey'


const sendCode = async (accepter) => {
  let code = await Code.create(accepter)
  let message = createMessage(code, accepter)

  let info = await Transporter.sendMail(message, (error, info) => {
    if (error) {
      console.log('Error occurred');
      console.log(error.message);
      throw error
    }

    console.log('Message sent successfully!');
  });

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
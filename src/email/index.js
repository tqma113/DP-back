import Transporter from './transporter'
import Code from './code'
import createMessage from './message'
import AckKey from './ackKey'


const sendCode = async (accepter) => {
  let code = Code.create(accepter)
  let message = createMessage(code, accepter)

  let info = await Transporter.sendMail(message, (error, info) => {
    if (error) {
      console.log('Error occurred');
      console.log(error.message);
      throw error
    }

    console.log('Message sent successfully!');
    console.log(nodemailer.getTestMessageUrl(info));
  });

  return info
}

const checkCode = (email, code) => {
  return Code.check(email)
}


export default {
  sendCode,
  checkCode,
  AckKey
}
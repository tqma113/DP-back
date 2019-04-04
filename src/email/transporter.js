import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  pool: true,
  host: "smtp.126.com",
  port: 465,
  secure: true, // use TLS
  auth: {
    user: "nowblog@126.com",
    pass: "mtq123456"
  },
  logger: true
}, {
  // default message fields

  // sender info
  from: 'Now Blog <nowblog@126.com>',
  headers: {
      'X-Laziness-level': 1000 // just an example header, no need to use this
  }
});

export default transporter
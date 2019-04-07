export default (code, accepter) => ({
  // Comma separated list of recipients
  to: accepter,

  // Subject of the message
  subject: 'Now Blog Code ✔',

  // plaintext body
  text: `Hello! Welcome to use Now Blog. Here is your verify code.${code}`,

  // HTML body
  html:
    '<p><b>Hello!</b> Welcome to use Now Blog.></p>' +
    '<p>Here\'s  your verify code.</p>' +
    '<h1>'+ code + '</h1>',
    

  // // An array of attachments
  // attachments: [
  //   // String attachment
  //   {
  //     filename: 'notes.txt',
  //     content: 'Some notes about this e-mail',
  //     contentType: 'text/plain' // optional, would be detected from the filename
  //   },

  //   // Binary Buffer attachment
  //   {
  //     filename: 'image.png',
  //     content: Buffer.from(
  //       'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD/' +
  //         '//+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4U' +
  //         'g9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC',
  //       'base64'
  //     ),

  //     cid: 'note@example.com' // should be as unique as possible
  //   },

  //   // File Stream attachment
  //   {
  //     filename: 'nyan cat ✔.gif',
  //     path: __dirname + '/assets/nyan.gif',
  //     cid: 'nyan@example.com' // should be as unique as possible
  //   }
  // ],

  // list: {
  //   // List-Help: <mailto:admin@example.com?subject=help>
  //   help: 'admin@example.com?subject=help',

  //   // List-Unsubscribe: <http://example.com> (Comment)
  //   unsubscribe: [
  //     {
  //       url: 'http://example.com/unsubscribe',
  //       comment: 'A short note about this url'
  //     },
  //     'unsubscribe@example.com'
  //   ],

  //   // List-ID: "comment" <example.com>
  //   id: {
  //     url: 'mylist.example.com',
  //     comment: 'This is my awesome list'
  //   }
  // }
})
const nodemailer = require('nodemailer');
let sendEmail = async (data) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'ipangram2020@gmail.com',
      pass: 'mzfqepovggmwgzav',
    },
  });

  let info = await transporter.sendMail({
    from: 'noreply@ipangram.com',
    to: data.email,
    subject: data.subject,
    // text: "Hello world?",
    html: mailTemp(data.title, data.info),
  });
  console.log('Message sent: %s', info.messageId);
};
let mailTemp = (title, info) => {
  let temp = `<table width="640" cellspacing="0" cellpadding="0" align="center" style="background: papayawhip;" >
 <tbody>

     <tr>
         <td style="padding:0px 20px">
             <table width="100%" cellspacing="0" cellpadding="0" border="0">
                 <tbody>
                     <tr>
                         <td>
                             <div style="text-align:center; color: #000000">
                                <h2>${title}</h2>
                             </div>
                         </td>
                     </tr>
                     <tr>
                         <td>
                            <div style="font-size: 14px; text-align:center;color:black;">
                                <p>${info}</p>
                            </div>
                         </td>
                     </tr>
                 </tbody>
             </table>
         </td>
     </tr>

 </tbody>
 </table>
    <div style="padding:10px;text-align:center;font-size: 12px; color: #000000">Copyright © 2023 IPangram.  All rights reserved.</div>`;
  return temp;
};
module.exports = { sendEmail };

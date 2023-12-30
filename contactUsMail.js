const nodemailer = require('nodemailer');
let contactUsMail = async (data) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'ipangram2020@gmail.com',
      pass: 'mzfqepovggmwgzav',
    },
  });

  await transporter.sendMail({
    from: 'ipangram2020@gmail.com',
    to: 'ipangram2020@gmail.com',
    subject: data.subject,
    html: mailTemp(data.title, data.info),
  });
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
                                <h3>${title}</h3>
                             </div>
                         </td>
                     </tr>
                     <tr>
                         <td>
                            <div style="font-size: 14px; text-align:center;color:black;">
                            <p style="margin-bottom:5px font-size:18px " >Message: ${info.message}</p>
                            <p style="margin-bottom:5px" >Name: ${info.name}</p>
                            <p style="margin-bottom:5px" >Email: ${info.email}</p>
                            <p style="margin-bottom:5px" >Phone number: ${info.phone}</p>
                            </div>
                         </td>
                     </tr>
                 </tbody>
             </table>
         </td>
     </tr>

 </tbody>
 </table>
    <div style="padding:10px;text-align:center;font-size: 12px; color: #000000">Copyright © 2020 IPangram.  All rights reserved.</div>`;
  return temp;
};
module.exports = { contactUsMail };

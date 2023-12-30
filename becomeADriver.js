const nodemailer = require('nodemailer');
let becomeADriver = async (data) => {
  let transporter = nodemailer.createTransport(
    {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'ipangram2020@gmail.com',
      pass: 'mzfqepovggmwgzav',
    },
  }
  
  // {
  //   host: 'smtp.ethereal.email',
  //   port: 587,
  //   auth: {
  //       user: 'coy.halvorson@ethereal.email',
  //       pass: 'VFgB7PWCMcKVcZpQ6N'
  //   }
  // }
  
  
  
  );

  let info = await transporter.sendMail({
    from: 'noreply@ipangram.com',
    to: data.email,
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
                            <p style="margin-bottom:5px" >Name: ${info.firstName}</p>
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
    <div style="padding:10px;text-align:center;font-size: 12px; color: #000000">Copyright © 2023 Ipangram.  All rights reserved.</div>`;
  return temp;
};
module.exports = { becomeADriver };

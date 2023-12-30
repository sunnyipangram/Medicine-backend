const nodemailer = require('nodemailer');
let rejectMail = async (data) => {
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
    html: mailTemp(),
  });
};
let mailTemp = () => {
  let temp = `<table width="640" cellspacing="0" cellpadding="0" align="center" style="background: papayawhip;" >
 <tbody>

     <tr>
         <td style="padding:0px 20px">
             <table width="100%" cellspacing="0" cellpadding="0" border="0">
                 <tbody>
                     <tr>
                         <td>
                            <div style="font-size: 14px; color:black;">
                            <p style="margin-bottom:10px" >Dear Customer,</p>
                            <p>Since we could not verify your payment information, we have cancelled your order. If you believe there is a mistake, please contact us.</p>
                            <p style="margin-tops:10px" >Best regards,</p>
                            <p style="margin-bottom:10px" >IPangram Vape Team</p>
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
module.exports = { rejectMail };

<!DOCTYPE html >
<html xmlns="http://www.w3.org/1999/xhtml">
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <style TYPE="text/css">
         body {
         background: #f3f2ef none repeat scroll 0 0;
         font-family: "Muli", sans-serif;
         font-weight: 300;
         }
         table#tab1 {
         border-collapse: collapse;
         width: 100%;
         cursor: pointer;
         }
         table#tab1 th {
         background: #6691CC;
         color: #fff;
         }
         table#tab1 th,table#tab1 td {
         padding: 8px ;
         text-align: left;
         border-bottom: 1px solid #ddd;
         }
         table#tab1 tr:hover {background-color:#f5f5f5;}
      </style>
   </head>
   <body style="backgroun-image:url('bg.jpg');">
 
      <table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" style="max-width: 640px; margin: 0px auto; background:#ffffff;" id="bodyTable">
         
         <tr>
            <td  style="padding:0 20px;">
               <table  style="width:100%;max-width: 500px; margin: 0 auto;">
                <tr>
           <td style="text-align: center;margin-top:10px; "> <img src="http://127.0.0.1:8000/bg.jpg" style="margin-top: 13px;"></td>
         </tr>
         <tr>
                     <td colspan="2"><img style="width: 100%;" src="http://127.0.0.1:8000/line.png"></td>
                  </tr>
                  <tr>
                     <td colspan="2" style="text-align: center;"><img style="width:240px;" src="http://127.0.0.1:8000/bg.jpg"></td>
                  </tr>
                  <tr>
                     <td >
                     
                     </td>
                  </tr>
                  <form action="" method="get">
                  <tr>
                     <td colspan="2">
                        <p style=" color:#00a0e3; font-weight:700; font-size:22px;margin-bottom: 20px; margin-top: 10px; line-height: 20px;text-align: center;text-transform: uppercase; ">Reset your password
                        </p>
                           <h1 style="color:#101010; font-weight:700; font-size:14px; margin-top: 20px; margin-bottom: 0;">
                        Hi Sir/Madam,</h1>
                        <p style=" color:#353535; font-weight:400; font-size:13px;margin-bottom: 0px; margin-top: 10px; line-height: 23px;text-align: justify; ">We have received a request to have your password reset.If you did not make this request , please ignore this mail. 
                        </p>
                        
                        <div style="text-align: center;">
                           <p style=" color:#353535; font-weight:600; font-size:13px;margin-bottom: 0px; margin-top: 10px; line-height: 23px;">Click below to reset your password. 
                        </p>
                        <button style="background: #00a0e3;color: #fff;border:none;height: 40px;width: 50%;margin: 10px 0px;font-weight: 700;cursor: pointer;">
                        <a href="{{ url('http://localhost:3000/reset-password/'.$email.'/'.$token) }}">RESET PASSWORD</a> </button>
                     </div>
                     </td>
                  </tr>
                  </form>
                  <tr>
                  <tr >
                     <td>
                        <p style=" color:#353535; font-weight:400; font-size:13px;">
                           Warm Regards,<br/>
                          <b>ORISYS</b>
                        </p>
                     </td>
                  </tr>
                  <tr>
                     <td colspan="2"><img style="width: 100%;" src="http://127.0.0.1:8000/line.png"></td>
                  </tr>
                  
               </table>
            </td>
         </tr>
         <tr>
            <td style=" padding:20px 80px 40px;text-align: center; ">
              
               <p style="font-size:12px; margin: 0;">©2021. All Rights Reserved.</p>
            </td>
         </tr>
      </table>
   
   </body>
</html>
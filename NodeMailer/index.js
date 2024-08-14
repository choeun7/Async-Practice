import cron from 'node-cron';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '../.env') });  //.env 파일 사용

cron.schedule('28 16 * * 3', () => {
    console.log('start sending email');
    try {
        let mailContent = `node mailer 테스트 메일입니다.`;

        // Nodemailer setup
        let transporter = nodemailer.createTransport({
            host: "smtp.mailplug.co.kr",
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAILPLUG_ID,
                pass: process.env.MAILPLUG_PASS
            },
        });

        let mailOptions = {
            from: 'short0720@incross.com',
            to: 'short0720@gmail.com',
            subject: '캠페인 코드가 없는 캠페인 리스트',
            text: mailContent,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            let result;
            if (error) {
                console.log(error);
                result = 'fail';
            } else {
                console.log('Email sent: ' + info.response);
                result = 'success';
            }
            console.log(result);
        });

    } catch (err) {
        console.log(`Error occurred: ${err}`);
    }
});

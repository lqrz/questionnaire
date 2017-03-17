/*
*	Email handler
*/

const nodemailer = require('nodemailer');

Email_handler = {}

Email_handler.send_invitations = function(questionnaire_hash, questionnaire_title, recipients){

	for (var i=0, len=recipients.length; i<len; i++){
		const rec = recipients[i]

		const link = process.env.WEBAPP_ENDPOINT.replace(/\/$/, '')+'?questionnaire_link='+questionnaire_hash+'QB'+rec['hash'];

		send_invitation_by_mail(rec['email'], rec['first_name'], link, questionnaire_title)

		console.log('[dummy] Sending invitation email to: ' + rec['first_name']+' '+rec['email']+' '+link);
	};
};

//TODO: configure and test the SMTP
function send_invitation_by_mail(to_addr, user_firstname, questionnaire_link, questionnaire_name){

	const config = {
		host: 'outlook.office365.com',
		port: '587',
		auth: {
			user: process.env.EMAIL_ACCOUNT,
			pass: Buffer.from(process.env.EMAIL_PASSWORD_BASE64, 'base64')
		}
	};
	
	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport(config);

	const html_body = '<html>'+
	'<head></head>'+
	'<body>'+
	'<h1>Hi, ' + user_firstname + '!</h1>'+
	'We need you to complete the following questionnaire: <a href="'+questionnaire_link+'">'+questionnaire_name+'</a>'+
	'</body>'+
	'</html>'

	// setup email data with unicode symbols
	let mailOptions = {
		from: config.auth.user, // sender address
		to: [to_addr], // list of receivers
		subject: 'Please complete this questionnaire', // Subject line
		html: html_body // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		};
		
		console.log('Message %s sent: %s', info.messageId, info.response);

		});
};

module.exports = Email_handler
/*
*	Email handler
*/

const nodemailer = require('nodemailer');

const email_service = process.env.EMAIL_SERVICE;
const email_account = process.env.EMAIL_ACCOUNT;
const email_password = process.env.EMAIL_PASSWORD_BASE64;

function check_environment_variables(){
	if (email_account==undefined){
		throw new Error('Missing EMAIL_ACCOUNT env variable.');
	};

	if (email_password==undefined){
		throw new Error('Missing EMAIL_PASSWORD_BASE64 env variable.');
	};

	if (email_service==undefined){
		throw new Error('Missing EMAIL_SERVICE env variable.');
	};

};

check_environment_variables();

Email_handler = {}

Email_handler.send_invitations = function(webapp_url, questionnaire_hash, questionnaire_title, recipients){

	for (var i=0, len=recipients.length; i<len; i++){
		const rec = recipients[i]

		const link = webapp_url+'/questionnaire?questionnaire_link='+questionnaire_hash+'QB'+rec['hash'];

		send_invitation_by_mail(rec['email'], rec['first_name'], link, questionnaire_title)

		console.log('[dummy] Sending invitation email to: ' + rec['first_name']+' '+rec['email']+' '+link);
	};
};

//TODO: configure and test the SMTP
function send_invitation_by_mail(to_addr, user_firstname, questionnaire_link, questionnaire_name){

	var config = null;

	if (email_service=='mailgun'){
		config = {
			service:  'Mailgun',
			auth: {
				user: email_account,
				pass: Buffer.from(email_password, 'base64')
			}
		};
	}else if (email_service=='outlook'){
		config = {
			host: 'outlook.office365.com',
			port: '587',
			auth: {
				user: email_account,
				pass: Buffer.from(email_password, 'base64')
			}
		};
	}else if (email_service=='gmail'){
		config = {
			service: 'Gmail',
			auth: {
				user: email_account,
				pass: Buffer.from(email_password, 'base64')
			}
		}
	}else{
		throw new Error('Invalid EMAIL_SERVICE env variable value: '+email_service+' ("mailgun" or "outlook")');
	};

	// // create reusable transporter object using the default SMTP transport
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
		subject: '[Questionnaire standalone] Please complete this questionnaire', // Subject line
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
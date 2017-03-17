/*
*	Questionnaire handler
*/

const formidable = require('formidable')
const path = require('path')
const fs = require('fs')
const xml2js = require('xml2js')

const Db_handler = require('./database')
const Email_handler = require('./email_handler')

Questionnaire_handler = {}

Questionnaire_handler.upload_questionnaire = function (req, res){

	// get the FormData object from the client
	var form = new formidable.IncomingForm();

	form.uploadDir = path.join(__dirname, '/../uploads');

	var filepath = null

	// catch errors
	form.on('error', function(err) {
		console.log('An error has occured while getting the FormData object: \n' + err);
	});

	form.on('file', function(field, file) {
		console.log('Saving questionnaire file in filesystem');

		filepath = path.join(form.uploadDir, file.name)

		fs.rename(file.path, filepath, function (err) {
			if (err) throw err;
		});
	});

	form.on('end', function() {
		console.log('Reading questionnaire file');

		fs.readFile(filepath, 'utf-8', function(err, xml_data) {

			if (err) throw err;

			var parser = new xml2js.Parser();

			parser.parseString(xml_data, function(err, result){
				if (err) throw err;

				const recipients = result['questionnaire']['recipients'];
				const title = result['questionnaire']['title'][0];
				const description = result['questionnaire']['description'][0];
				const question_items = result['questionnaire']['item'];

				console.log('Storing in database')
				Db_handler.insert_questionnaire(title, description, question_items, function(questionnaire_obj){
					console.log('Insert finished OK')
					// console.log(questionnaire_obj);

					const title = questionnaire_obj[0].questionnaire_title;
					const description = questionnaire_obj[0].questionnaire_description;
					const questionnaire_hash = questionnaire_obj[0].questionnaire_hash;

					console.log('Inserting users')
					Db_handler.insert_users(recipients, function(users){

						console.log('Inserting users OK')

						// send email to recipients
						console.log('Sending email invitations')
						Email_handler.send_invitations(questionnaire_hash, title, users);

						res.render('questionnaire_deployed', {recipients: users});
					});
				});
			});
		});
	});

	form.parse(req);

};

function split_questionnaire_link(questionnaire_link){
	return questionnaire_link.split('QB');
};

Questionnaire_handler.answer_questionnaire = function(req, res){
	const questionnaire_link = req.body.questionnaire_link;
	const questionnaire_hash = split_questionnaire_link(questionnaire_link)[0];

	Db_handler.get_questionnaire(questionnaire_hash,(questionnaire_rows)=>{
		const questionnaire_title = questionnaire_rows[0].questionnaire_title;
		const questionnaire_description = questionnaire_rows[0].questionnaire_description;

		var question_items = {};
		for(var i=0; i<questionnaire_rows.length; i++){
			if (question_items[questionnaire_rows[i].question_id]==undefined){
				question_items[questionnaire_rows[i].question_id] = {
														question_id: questionnaire_rows[i].question_id,
														question: questionnaire_rows[i].question_text,
														answer: [questionnaire_rows[i].possible_answer_text]
													}
			}
			else{
				question_items[questionnaire_rows[i].question_id]['answer'].push(questionnaire_rows[i].possible_answer_text)
			}
		};

		var questions_objs = [];
		for(var key in question_items){
			questions_objs.push(question_items[key]);
		};

		res.render('questionnaire', {questionnaire_link: questionnaire_link, title: questionnaire_title, description: questionnaire_description, question_items: questions_objs});
	});
};

Questionnaire_handler.save_answer = function(req, res){

	const questionnaire_link_split = split_questionnaire_link(req.body.questionnaire_link);
	const questionnaire_hash = questionnaire_link_split[0];
	const user_hash = questionnaire_link_split[1];

	Db_handler.save_answer(questionnaire_hash, user_hash, req.body.answers, req.body.elapsed_times, (user_first_name)=>{
		res.render('thanks', {user_first_name: user_first_name});
	});
};

module.exports = Questionnaire_handler
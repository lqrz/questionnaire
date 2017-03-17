/*
*	main router
*/

const express = require('express')
const Questionnaire_handler = require('./questionnaire_handler')

const router =  express.Router()

router.get('/', function(req, res){
	res.render('index');
});

router.post('/upload_questionnaire', function(req, res){
	console.log('Uploading questionnaire');
	Questionnaire_handler.upload_questionnaire(req, res);
});

router.get('/questionnaire*', function(req, res){
	req.body.questionnaire_link = req.query.questionnaire_link;
	console.log(req.query.questionnaire_link)
	if (req.query.questionnaire_link==undefined || req.query.questionnaire_link=='') res.render('404');
	console.log('Accessing through email link')
	Questionnaire_handler.answer_questionnaire(req, res);
});

router.post('/save_answer', function(req, res){
	console.log('Saving questionnaire answers');
	Questionnaire_handler.save_answer(req, res);
});

router.all('*',function(req,res){
  res.render('404');
});

module.exports = router
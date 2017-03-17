$(document).ready(function(){

	$('#complete_questionnaire_next').click(function(){
		ITEMS.add_answer();
		ITEMS.load_question_item();
	});

	$('#complete_questionnaire_submit').click(function(){

		ITEMS.add_answer();

		console.log('Submitting questionnaire');

		json_obj = JSON.stringify({
							questionnaire_link: ITEMS.questionnaire_link,
							answers: ITEMS.selected_answers,
							elapsed_times: ITEMS.question_items_elapsed_time
						});

		$.ajax({
			type: 'POST',
			url: '/save_answer',
			data: json_obj,
			contentType: 'application/json',
			cache: false,
			processData: false
		})
		.success(function(server_response){
			console.log('Questionnaire successfully submitted');
			$('body').html(server_response);
		});
	});

	$('#complete_questionnaire_previous').click(function(){
		ITEMS.question_item_ix -= 2;
		ITEMS.from_previous = true;
		ITEMS.load_question_item();
	});

});
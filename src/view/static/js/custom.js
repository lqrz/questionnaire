/*
*	UNUSED
*/

$(document).ready(function(){

	var question_items = [];
	var selected_answers = [];
	var question_item_ix = 0;
	var from_previous = false;

	$('#custom_upload_button').on('click', function (){
		$('#file_chooser').click();
	});

	$('#file_chooser').on('change', function(){
			console.log("holaa");
			
			var file = $(this).get(0).files[0];
			console.log(file);
			console.log(file.name);

			var formData = new FormData();

			formData.append("username", "Groucho");

			if (file != undefined){
				formData.append("file_object", file);
			};

			// this is always empty. You cannot log a FormData
			// console.log(formData);

			var xhr = new XMLHttpRequest();
			xhr.open("POST", "/upload_questionnaire");
			// xhr.setRequestHeader("Content-type", "application/json");
			xhr.onreadystatechange = function(res) {
				if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
					// Request finished. Do processing here.

					// const responseText = jQuery.parseJSON(xhr.responseText)
					// console.log(responseText);
					// const title = responseText["title"];
					// const description = responseText["description"];

					// question_items = responseText["item"];
					// console.log(question_items);

					// $('#choose_questionnaire').hide();
					// $('#complete_questionnaire').show();
					// $('#complete_questionnaire h1').text(title);
					// $('#complete_questionnaire h5').text(description);
					console.log(xhr.responseText);
					$('body').html(xhr.responseText);
					load_question_item();
				};
			};
			
			console.log('Questionnaire sent1');

			xhr.send(formData);
	});

	function load_question_item(){

		const qi = question_items[question_item_ix];

		$('#complete_questionnaire .question').text(qi['question']);

		if (question_item_ix==0 && !from_previous){
			$('#complete_questionnaire .answer').append('<table></table>');
		}else{
			$('#complete_questionnaire .answer').html('<table></table>');
		};

		$.each(qi['answer'], function(key, value){
			$('#complete_questionnaire .answer table').append('<tr><td><input type="radio" name="'+question_item_ix+'" value="'+value+'">'+value+'</input></td></tr>');
			$('#complete_questionnaire_next').show();
			attach_event();
		});

		if (question_item_ix > 0){
			$('#complete_questionnaire_previous').show();
		}else{
			$('#complete_questionnaire_previous').hide();
		};

		question_item_ix += 1;

		if (question_item_ix == question_items.length){
			$('#complete_questionnaire_next').hide();
			$('#complete_questionnaire_submit').show();
			$('#complete_questionnaire_submit').attr('disabled', true);
		}else{
			$('#complete_questionnaire_submit').hide();
			$('#complete_questionnaire_next').show();
			$('#complete_questionnaire_next').attr('disabled', true);
		};
	};

	function add_answer(){
		selected_answers[question_item_ix-1] = $('input[type="radio"]:checked').val();
	};

	$('#complete_questionnaire_next').click(function(){
		add_answer();
		load_question_item();
	});

	$('#complete_questionnaire_submit').click(function(){

		add_answer();

		console.log('Submitting questionnaire');

		json_obj = JSON.stringify(selected_answers);

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

	function attach_event(){
		$('input[type="radio"]').click(function(){
			$('#complete_questionnaire_next').removeAttr('disabled');

			if (question_item_ix == question_items.length){
				$('#complete_questionnaire_submit').removeAttr('disabled');
			};
		});
	};

	$('#complete_questionnaire_previous').click(function(){
		question_item_ix -= 2;
		from_previous = true;
		load_question_item();
	});

});
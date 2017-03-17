$(document).ready(function(){

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

					// $('body').html(xhr.responseText);
					// ITEMS.load_question_item();

					$('body').html(xhr.responseText);
					
				};
			};
			
			console.log('Questionnaire sent1');

			xhr.send(formData);
	});

});
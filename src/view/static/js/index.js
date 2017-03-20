$(document).ready(function(){

	$('#custom_upload_button').on('click', function (){
		$('#file_chooser').click();
	});

	$('#file_chooser').on('change', function(){
			
			var file = $(this).get(0).files[0];
			var formData = new FormData();

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
					$('body').html(xhr.responseText);
				};
			};
			
			console.log('Questionnaire sent1');

			xhr.send(formData);
	});

});
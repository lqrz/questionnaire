;var ITEMS = {};

;(function($) {

	ITEMS = {

		questionnaire_link: null,
		
		question_items: [],

		question_item_ix: 0,

		question_item_types: [],

		selected_answers: [],

		question_items_elapsed_time: {},

		question_item_start_time: null,

		from_previous: false,

		load_question_item: function(){

			render_possible_answers();

			show_buttons();

			ITEMS.question_item_ix += 1;

			ITEMS.question_item_start_time = $.now();
		},

		attach_radio_button_event: function(){
			$('input[type="radio"]').click(function(e){

				e.stopImmediatePropagation();
				
				$('#complete_questionnaire_next').removeAttr('disabled');

				if (ITEMS.question_item_ix == ITEMS.question_items.length){
					$('#complete_questionnaire_submit').removeAttr('disabled');
				};
			});
			$('tr')
				.hover(function(){
					$(this).css('cursor', 'pointer');
				})
				.click(function(){
					$(this).find('input').prop( "checked", true );
					$(this).find('input').trigger( "click" );
				});
		},

		attach_text_area_event: function(){
			$('textarea').on('change keyup paste', function() {

				if ($(this).val()==''){
					$('#complete_questionnaire_submit').attr('disabled', true);
					$('#complete_questionnaire_next').attr('disabled', true);
				}else{
					$('#complete_questionnaire_submit').removeAttr('disabled');
					$('#complete_questionnaire_next').removeAttr('disabled');
				};
			});
		},

		add_answer: function(){

			if (ITEMS.question_items_elapsed_time[ITEMS.question_items[ITEMS.question_item_ix-1].question_id] == undefined){
				ITEMS.question_items_elapsed_time[ITEMS.question_items[ITEMS.question_item_ix-1].question_id] = $.now() - ITEMS.question_item_start_time;
			}else{
				ITEMS.question_items_elapsed_time[ITEMS.question_items[ITEMS.question_item_ix-1].question_id] += $.now() - ITEMS.question_item_start_time;
			};

			if (ITEMS.question_item_types[ITEMS.question_item_ix-1]=='open'){
				answer = {
							question_id: ITEMS.question_items[ITEMS.question_item_ix-1].question_id,
							text: $('textarea').val()
						};
			}else{
				answer = {
							question_id: ITEMS.question_items[ITEMS.question_item_ix-1].question_id,
							text: $('input[type="radio"]:checked').val()
						};
			};

			ITEMS.selected_answers[ITEMS.question_item_ix-1] = answer;
		}
	}

	function render_possible_answers(){
		const qi = ITEMS.question_items[ITEMS.question_item_ix];

		$('#complete_questionnaire .question').text(qi['question']);
		
		$('#complete_questionnaire .description').text((qi['question_description']==null) ? '' : qi['question_description']);

		if (qi['answer'].length == 1 && qi['answer'][0]==''){

			$('#complete_questionnaire .answer').html('<textarea rows="4" cols="50"></textarea>');

			ITEMS.attach_text_area_event();

			ITEMS.question_item_types[ITEMS.question_item_ix] = 'open'
		}else{
			if (ITEMS.question_item_ix==0 && !ITEMS.from_previous){
				$('#complete_questionnaire .answer').append('<table></table>');
			}else{
				$('#complete_questionnaire .answer').html('<table></table>');
			};

			$.each(qi['answer'], function(key, value){
				$('#complete_questionnaire .answer table').append('<tr><td><input type="radio" name="'+ITEMS.question_item_ix+'" value="'+value+'">'+value+'</input></td></tr>');
				$('#complete_questionnaire_next').show();
				ITEMS.attach_radio_button_event();
			});

			ITEMS.question_item_types[ITEMS.question_item_ix] = 'select'
		};
	};

	function show_buttons(){
		if (ITEMS.question_item_ix > 0){
			$('#complete_questionnaire_previous').show();
		}else{
			$('#complete_questionnaire_previous').hide();
		};

		if (ITEMS.question_item_ix == ITEMS.question_items.length-1){
			$('#complete_questionnaire_next').hide();
			$('#complete_questionnaire_submit').show();
			$('#complete_questionnaire_submit').attr('disabled', true);
		}else{
			$('#complete_questionnaire_submit').hide();
			$('#complete_questionnaire_next').show();
			$('#complete_questionnaire_next').attr('disabled', true);
		};
	};

})(jQuery);
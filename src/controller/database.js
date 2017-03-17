/*
*	Database handler
*/
const pg = require('pg');
const parseDbUrl = require("parse-database-url");
const adler32 = require('adler-32');

const connectionString = process.env.DATABASE_URL;
const schema_name = 'standalone_webapp';

if (connectionString==undefined){
	throw new Error('Missing DATABASE_URL env variable');
};

Db_handler = {}

db_config = parseDbUrl(connectionString);

var config = {
  user: db_config.user, 
  database: db_config.database, 
  password: db_config.password, 
  host: db_config.host, 
  port: db_config.port, 
  max: 10, // max number of clients in the pool 
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed 
};

var pool = new pg.Pool(config);

var rollback = function(err, client, done) {

	console.log('Rolling back');
	console.log(err);

	client.query('ROLLBACK', function(err) {
		//if there was a problem rolling back the query
		//something is seriously messed up.  Return the error
		//to the done function to close & remove this client from
		//the pool.  If you leave a client in the pool with an unaborted
		//transaction weird, hard to diagnose problems might happen.
		return done(err);
	});
};

Db_handler.insert_users = function(users, next){

	var user_rows = [];

	pool.connect((err, client, release)=>{
		if (err) throw err;

		client.query('BEGIN', (err)=>{
			if (err) return rollback(err, client, release);

			n_users = 0

			for(var i=0; i<users.length; i++){

				const first_name = users[i].person[0].first_name[0];
				const last_name = users[i].person[0].last_name[0];
				const email = users[i].person[0].email[0];
				const hash = adler32.str(email);

				client.query('SELECT first_name, last_name, email, hash from standalone_webapp.user WHERE hash=$1', [hash], (err, res)=>{
					if (err) return rollback(err, client, release);

					if (res.rows.length>1) throw new Error('More than one user in the db for email: '+email);
					
					if (res.rows.length==0){
						client.query('INSERT INTO standalone_webapp.user(first_name, last_name, email, hash) VALUES($1,$2,$3,$4) RETURNING first_name, last_name, email, hash', [first_name, last_name, email, hash], (err, res)=>{
							if (err) return rollback(err, client, release);

							user_rows.push(res.rows[0]);
							
							n_users += 1

							if (n_users==users.length){
								console.log('Finishing up');
								client.query('COMMIT', release);
								release();
								next(user_rows);
							};

						});
					}else{
						user_rows.push(res.rows[0]);

						n_users += 1

						if (n_users==users.length){
							console.log('Finishing up');
							client.query('COMMIT', release);
							release();
							next(user_rows);
						};
					};
				});


			};
		});
	});
};

Db_handler.insert_questionnaire = function(title, description, question_items, next){

	n_answer_total = 0
	for (var i=0; i<question_items.length; i++){
		n_answer_total += question_items[i].answer.length;
	};

	pool.connect((err, client, release)=>{
		if (err) throw err;

		n_answers = 0;

		client.query('BEGIN', (err)=>{
			if (err) return rollback(err, client, release);

			client.query('INSERT INTO standalone_webapp.questionnaire(title, description) VALUES($1, $2) RETURNING id', [title, description], (err, res)=>{
				if (err) return rollback(err, client, release);

				const questionnaire_id = res.rows[0].id;
				const questionnaire_hash = adler32.str(questionnaire_id.toString())

				client.query('UPDATE standalone_webapp.questionnaire SET hash=$1 WHERE id=$2', [questionnaire_hash, questionnaire_id], (err, res)=>{
					if (err) return rollback(err, client, release);

					for(var i=0; i<question_items.length; i++){

						const question_text = question_items[i]['question'][0];
						const question_description = question_items[i]['description'] != undefined ? question_items[i]['description'][0] : null;
						const question_answers = question_items[i]['answer'];

						client.query('INSERT INTO standalone_webapp.question(questionnaire_id, text, description) VALUES($1,$2,$3) RETURNING id', [questionnaire_id, question_text, question_description], (err, res)=>{
							if (err) return rollback(err, client, release);

							const question_id = res.rows[0].id;

							for(var j=0; j<question_answers.length; j++){

								client.query('INSERT INTO standalone_webapp.possible_answer(question_id, text) VALUES($1,$2) RETURNING id', [question_id, question_answers[j]], (err, res)=>{
									if (err) return rollback(err, client, release);

									n_answers += 1;

									if( n_answers==n_answer_total){
										console.log('Finishing up');
										client.query('COMMIT', release);
										client.query('SELECT qn.id as "questionnaire_id", qn.title as "questionnaire_title", qn.description as "questionnaire_description", qn.hash as "questionnaire_hash", '+
											'qt.id as "question_id", qt.text as "question_text", qt.description as "question_description", pa.id as "possible_answer_id", pa.text as "possible_answer_text" '+
											'FROM standalone_webapp.questionnaire qn, standalone_webapp.question qt, standalone_webapp.possible_answer pa '+
											'WHERE qn.id=$1 AND qt.questionnaire_id=qn.id AND pa.question_id=qt.id',
											[questionnaire_id], (err, res)=>{
												if (err) return rollback(err, client, release);

												release();

												next(res.rows);

											});
									};
								});
							};

						});
					};
				});

			});
		});
	});

	pool.on('error', function (err, client) {
		// if an error is encountered by a client while it sits idle in the pool 
		// the pool itself will emit an error event with both the error and 
		// the client which emitted the original error 
		// this is a rare occurrence but can happen if there is a network partition 
		// between your application and the database, the database restarts, etc. 
		// and so you might want to handle it and at least log it out 
		console.error('idle client error', err.message, err.stack)
	});

};


Db_handler.get_questionnaire = function(questionnaire_hash, next){
	pool.connect((err, client, release)=>{
		if (err) throw err;

		client.query('SELECT qn.id as "questionnaire_id", qn.title as "questionnaire_title", qn.description as "questionnaire_description", qn.hash as "questionnaire_hash", '+
		'qt.id as "question_id", qt.text as "question_text", qt.description as "question_description", pa.id as "possible_answer_id", pa.text as "possible_answer_text" '+
		'FROM standalone_webapp.questionnaire qn, standalone_webapp.question qt, standalone_webapp.possible_answer pa '+
		'WHERE qn.hash=$1 AND qt.questionnaire_id=qn.id AND pa.question_id=qt.id',
		[questionnaire_hash], (err, res)=>{
			if (err) return rollback(err, client, release);
			release();
			next(res.rows);
	});
	});
};

Db_handler.save_answer = function(questionnaire_hash, user_hash, answers, elapsed_times, next){

	pool.connect((err, client, release)=>{
		if (err) throw err;

		n_answers = 0;


		client.query('BEGIN', (err)=>{
			if (err) return rollback(err, client, release);

			client.query('SELECT * FROM standalone_webapp.user WHERE hash=$1', [user_hash], (err, res)=>{

				if (err) return rollback(err, client, release);

				const user_id = res.rows[0].id;
				const user_first_name = res.rows[0].first_name;

				for(var i=0; i<answers.length; i++){

					const ans = answers[i]
					const elapsed_time = elapsed_times[ans.question_id];

					client.query('INSERT INTO standalone_webapp.answer(question_id, user_id, text, elapsed_time) VALUES($1,$2,$3,$4)', [ans.question_id, user_id, ans.text, elapsed_time], (err, res)=>{

						if (err) return rollback(err, client, release);

						n_answers += 1;

						if (n_answers==answers.length){
							client.query('COMMIT', release);
							release();
							next(user_first_name)
						};
					});
				};		
			});
		});
	});

};

module.exports = Db_handler
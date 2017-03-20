CREATE TABLE IF NOT EXISTS standalone_webapp.questionnaire(
	id SERIAL PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	description VARCHAR(255) NOT NULL,
	hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS standalone_webapp.question(
	id SERIAL PRIMARY KEY,
	questionnaire_id INTEGER REFERENCES standalone_webapp.questionnaire NOT NULL,
	text VARCHAR(255) NOT NULL,
	description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS standalone_webapp.possible_answer(
	id SERIAL PRIMARY KEY,
	question_id INTEGER REFERENCES standalone_webapp.question NOT NULL,
	text VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS standalone_webapp.user(
	id SERIAL PRIMARY KEY,
	first_name VARCHAR(255) NOT NULL,
	last_name VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL,
	hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS standalone_webapp.answer(
	id SERIAL PRIMARY KEY,
	question_id INTEGER REFERENCES standalone_webapp.question NOT NULL,
	user_id INTEGER REFERENCES standalone_webapp.user NOT NULL,
	text VARCHAR(255),
	elapsed_time INTEGER NOT NULL
);
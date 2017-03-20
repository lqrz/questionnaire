/*
*	main module.
*/

const express = require('express');
const bodyParser = require('body-parser')
const stylus = require('stylus')
const nib = require('nib')

const main_router = require('./routes')

// instantiate express
const app = express();

const port = process.env.PORT || 3000;

// use bodyParser
app.use(bodyParser.json({limit: '50mb'}));

// set the view engine
app.set('views', './src/view')
app.set('view engine', 'pug') // i dont have to load pug myself if i do this.
app.use(stylus.middleware(
	{
		src: './src/view',
		compile: function compile(str, path){
					return stylus(str)
						.set('filename', path)
						.use(nib());
				}
	}
));

// serve static files
app.use('/static', express.static(__dirname + '/../view/static/'));

// set main router
app.use('/', main_router)

// listen
var server = app.listen(port, function () {
   var host = server.address().address;
   var port = server.address().port;
   console.log('App listening at http://%s:%s', host, port);
});
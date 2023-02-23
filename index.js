const tmi = require('tmi.js'),
	fs = require('fs'),
	config = require('./config');

//Create new log folder if not exists
if (!fs.existsSync(config.dir))
    fs.mkdirSync(config.dir);
if (!fs.existsSync(config.dir+'/streamstate'))
    fs.mkdirSync(config.dir);

const client = new tmi.Client({
	channels: config.channels
});
client.connect();

process.env.TZ = "Europe/Moscow";
var date = new Date();

function isNewDay(dateParameter) {
	if((dateParameter.getDate() === date.getDate() && dateParameter.getMonth() === date.getMonth() && dateParameter.getFullYear() === date.getFullYear()))
		return;
	console.log(`\n--- NEW DAY ---\n`)
	client.opts.channels.forEach(channel => listen(channel,new Date(),true));
}

function listen(channel,time,isNew=false) {
	if(isNew) {
		date = new Date();
		writableStream[channel].end();
	}
	writableStream[channel]=fs.createWriteStream(`${config.dir}/${channel}/${channel}_${time.getDate()}-${time.getMonth()}-${time.getFullYear()}.csv`);
	writableStream[channel].write('time;user;badges;color;message\n');
}

const writableStream = [];
client.opts.channels.forEach(channel => {
	if (!fs.existsSync(`${config.dir}/${channel}`))
    	fs.mkdirSync(`${config.dir}/${channel}`);
	listen(channel,new Date());
});
console.log('Запись каналов '+client.opts.channels);

client.on('message', (channel, tags, message, self) => {
	isNewDay(new Date());
	var time = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString();
	console.log(`[${time}] [${channel}] <${tags.username}>: ${message}`);
	writableStream[channel].write(`${time};${tags.username};${tags['badges-raw']};${tags['color']};"${message}"\n`);
});
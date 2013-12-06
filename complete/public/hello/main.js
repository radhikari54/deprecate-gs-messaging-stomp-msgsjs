define(function(require) {

	var ready = require('curl/domReady');
	var connectMessageBus = require('./connectMessageBus');

	var bus, sendGreeting, form, connectButton, disconnectButton, responseContainer;

	ready(function() {
		form = document.querySelector('form');
		connectButton = document.querySelector('[data-connect]');
		disconnectButton = document.querySelector('[data-disconnect]');
		responseContainer = document.querySelector('[data-response]');

		form.addEventListener('submit', parseFormAndSend);
		connectButton.addEventListener('click', connect);
		disconnectButton.addEventListener('click', disconnect);
	});

	function connect() {
		bus = connectMessageBus('//cw-stomp.cfapps.io/hello', function() {
			setConnected(true);

			sendGreeting = bus.inboundAdapter('remote!/app/hello', JSON.stringify);

			bus.on('remote!/queue/greetings', function(greeting) {
				addGreeting(JSON.parse(greeting));
			});
		});
	}

	function disconnect() {
		bus.destroy();
		setConnected(false);
	}

	function parseFormAndSend(e) {
		e.preventDefault();

		var name = e.target.elements.name.value;
		sendGreeting({ name: name });
	}

	function setConnected(connected) {
		connectButton.disabled = !!connected;
		disconnectButton.disabled = !connected;
		responseContainer.innerHTML = '';
	}

	function addGreeting(greeting) {
		form.reset();
		responseContainer.innerHTML += '<p>' + greeting.content + '</p>';
	}
});
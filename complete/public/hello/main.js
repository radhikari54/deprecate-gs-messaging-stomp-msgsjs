define(function(require) {

	var msgs = require('msgs');
	var SockJS = require('sockjs');
	var ready = require('curl/domReady');

	var bus, socket, sendGreeting, form, connectButton, disconnectButton, responseContainer;

	require('msgs/adapters/webSocket');
	require('msgs/channels/bridges/stomp');

	ready(function() {
		form = document.querySelector('form');
		connectButton = document.querySelector('[data-connect]');
		disconnectButton = document.querySelector('[data-disconnect]');
		responseContainer = document.querySelector('[data-response]');

		connectButton.addEventListener('click', connect);
		disconnectButton.addEventListener('click', disconnect);
		form.addEventListener('submit', function(e) {
			e.preventDefault();

			var name = e.target.elements.name.value;
			sendGreeting({ name: name });
		});
	});

	function connect() {
		bus = msgs.bus();
		socket = new SockJS('//cw-stomp.cfapps.io/hello');

		socket.addEventListener('open', function () {
			var bridge = bus.stompWebSocketBridge('remote', socket, { ack: 'client' });

			bridge.controlBus.on('connected', function () {
				setConnected(true);
				sendGreeting = bus.inboundAdapter('remote!/app/hello', JSON.stringify);
				bus.on('remote!/queue/greetings', function(greeting) {
					addGreeting(JSON.parse(greeting));
				});
			});

			bridge.controlBus.on('error', function (error) {
				console.error('STOMP protocol error ' + error);
			});
		});
	}

	function disconnect() {
		bus.destroy();
		setConnected(false);
	}

	function setConnected(connected) {
		connectButton.disabled = connected;
		disconnectButton.disabled = !connected;
		responseContainer.innerHTML = '';
	}

	function addGreeting(greeting) {
		form.reset();
		document.querySelector('[data-response]').innerHTML += '<p>' + greeting.content + '</p>';
	}
});
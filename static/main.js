/**
 * Generate a random session ID for the user, 4 sets of 6 alphanumeric characters.
 */
const sessionID = randomstring(6) + '-' + randomstring(6) + '-' + randomstring(6) + '-' + randomstring(6);

const gcfUrl = 'https://europe-west6-edgarbot-383711.cloudfunctions.net/webhook_synchronous';

//Set timeout to 2 minutes
const TIMEOUT = 120000;

async function callEdgarbot(message) {
    let messagesPayload = {
        provider_item_id: sessionID,
        customer: demo,
        webhook_key: 'sadoufhg3RTH3greqwaQW3g',
        workflow: 'default',
        provider: 'webchat',
        raw_data: message
    };

	const controller = new AbortController();
    const timeout = setTimeout(() => {
        controller.abort();
    }, TIMEOUT);
	
    try {
		let response = await fetch(gcfUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(messagesPayload),
			signal: controller.signal,
		});

		clearTimeout(timeout);

		if (response.ok) {
			let data = await response.json();
			let responseMessage = data.answer;
			// return responseMessage;
			showBotMessage(responseMessage);
		} else {
			console.error("Error: ", response.status);
			showBotMessage(`Errore! Ricarica la pagina e riprova. MESSAGGIO DI ERRORE: ${response.status}`);
		}
	} catch (error) {
		clearTimeout(timeout);
		if (error.name === 'AbortError') {
            console.error("Request timed out");
            showBotMessage('Errore! La richiesta è scaduta. Per favore riprova.');
        } else {
			console.error("Error: ", error);
			showBotMessage(`Errore! Ricarica la pagina e riprova. MESSAGGIO DI ERRORE: ${error}`);
		}
	}
}

// Read value of 'demo' key from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const demo = urlParams.get('demo');

/**
 * Returns the current datetime for the message creation.
 */
function getCurrentTimestamp() {
	return new Date();
}

/**
 * Renders a message on the chat screen based on the given arguments.
 * This is called from the `showUserMessage` and `showBotMessage`.
 */
function renderMessageToScreen(args) {
	// local variables
	let displayDate = (args.time || getCurrentTimestamp()).toLocaleString('en-IN', {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
	});
	let messagesContainer = $('.messages');

	// init element
	let message = $(`
	<li class="message ${args.message_side}">
		<div class="avatar"></div>
		<div class="text_wrapper">
			<div class="text">${args.text}</div>
			<div class="timestamp">${displayDate}</div>
		</div>
	</li>
	`);

	// add to parent
	messagesContainer.append(message);

	// animations
	setTimeout(function () {
		message.addClass('appeared');
	}, 0);
	messagesContainer.animate({ scrollTop: messagesContainer.prop('scrollHeight') }, 300);
}

/* Sends a message when the 'Enter' key is pressed.
 */
$(document).ready(function() {
    $('#msg_input').keydown(function(e) {
        // Check for 'Enter' key
        if (e.key === 'Enter') {
            // Prevent default behaviour of enter key
            e.preventDefault();
			// Trigger send button click event
            $('#send_button').click();
        }
    });
});

/**
 * Displays the user message on the chat screen. This is the right side message.
 */
function showUserMessage(message, datetime) {
	renderMessageToScreen({
		text: message,
		time: datetime,
		message_side: 'right',
	});
}

/**
 * Displays the chatbot message on the chat screen. This is the left side message.
 */
function showBotMessage(message, datetime) {
	renderMessageToScreen({
		text: message,
		time: datetime,
		message_side: 'left',
	});
}

let userMessage = '';

/**
 * Get input from user and show it on screen on button click.
 */
$('#send_button').on('click', function (e) {
	let userMessage = $('#msg_input').val();
	// get and show message and reset input
	showUserMessage(userMessage);
	$('#msg_input').val('');
	// Print to console the info sent to Edgarbot
	console.log(`Session ID: ${sessionID} - Message: ${userMessage}`);

	// Call Edgarbot if user message is not empty and demo is not null
	if (userMessage !== '' && demo !== null) {
		callEdgarbot(userMessage);
	} else {
		showBotMessage('Errore! Messaggio vuoto o valore di "demo" non specificato nel parametro URL.');
	}

});

/**
 * Returns a random string. Just to specify bot message to the user.
 */
function randomstring(length = 20) {
	let output = '';

	// magic function
	var randomchar = function () {
		var n = Math.floor(Math.random() * 62);
		if (n < 10) return n;
		if (n < 36) return String.fromCharCode(n + 55);
		return String.fromCharCode(n + 61);
	};

	while (output.length < length) output += randomchar();
	return output;
}
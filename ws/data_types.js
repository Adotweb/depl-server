function create_sendable_data(relay_information, message_metadata, message) {
    // Handle the message conversion based on its type
    let encodedMessage;
    
    // If message is binary, encode it as base64 string
    if (message instanceof ArrayBuffer) {
        encodedMessage = arrayBufferToBase64(message);
    } else if (typeof message === 'object') {
        // If message is JSON, stringify it
        encodedMessage = JSON.stringify(message);
    } else {
        // If it's already a string, leave it as is
        encodedMessage = message;
    }

    // Build the sendable data structure
    const sendableData = {
        relay_information: relay_information,
        message_metadata: message_metadata,
        message: encodedMessage
    };

    return sendableData;
}

// Helper function to convert ArrayBuffer (binary data) to base64
function arrayBufferToBase64(buffer) {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return window.btoa(binary);
}



function decode_sendable_data(encodedData) {
    let decodedMessage;

    // Try to parse the message as JSON, otherwise treat it as a string or binary
    try {
        decodedMessage = JSON.parse(encodedData.message);
    } catch (e) {
        // If parsing fails, check if it might be base64-encoded binary data
        if (isBase64(encodedData.message)) {
            decodedMessage = base64ToArrayBuffer(encodedData.message);
        } else {
            // Otherwise, it's a simple string
            decodedMessage = encodedData.message;
        }
    }

    // Return the decoded structure
    return {
        relay_information: encodedData.relay_information,
        message_metadata: encodedData.message_metadata,
        message: decodedMessage
    };
}

// Helper function to convert base64 to ArrayBuffer (binary data)
function base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

// Helper function to check if a string is valid base64
function isBase64(str) {
    try {
        return btoa(atob(str)) === str;
    } catch (err) {
        return false;
    }
}

module.exports = {
	create_sendable_data, 
	decode_sendable_data
}

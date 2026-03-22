// unbanCommand.js

/**
 * Unban Users Command Handler
 * This function handles unbanning users via WhatsApp messages.
 * @param {object} message - The incoming message object.
 * @returns {string} - Response message.
 */
function handleUnban(message) {
    const userToUnban = message.body.split(' ')[1];
    if (!userToUnban) {
        return 'Please specify a user to unban.';
    }
    // Add logic to unban the user from your database/system
    // For now, we'll just return a success message
    return `User ${userToUnban} has been unbanned successfully!`; 
}

module.exports = { handleUnban };
// helpCommand.js

module.exports = {
    help: function() {
        return `Welcome to the WhatsApp Ban Bot! Here are the commands you can use:\n\n` +
               `1. !ban <user> - Bans a user from the chat.\n` +
               `2. !unban <user> - Unbans a user from the chat.\n` +
               `3. !status - Displays the current status of the bot.\n` +
               `4. !help - Displays this help information.\n` +
               `\nUse these commands wisely!`; 
    }
};
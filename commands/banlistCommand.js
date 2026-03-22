// banlistCommand.js

// This command displays the list of banned users.

const bannedUsers = [];

function displayBannedUsers() {
    if (bannedUsers.length === 0) {
        console.log('No users are banned.');
        return;
    }
    console.log('Banned Users:');
    bannedUsers.forEach(user => {
        console.log(user);
    });
}

// Export the function if using as a module
module.exports = {
    displayBannedUsers
};
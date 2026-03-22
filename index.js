const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('./config/config');
const banManager = require('./utils/banManager');
const Storage = require('./utils/storage');

Storage.initializeBanlist();

const client = new Client({ authStrategy: new LocalAuth() });

client.on('qr', (qr) => {
    console.log('📱 Scan the QR code below to log in to WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot is ready!');
    console.log('🤖 WhatsApp Ban Bot is now running...');
});

client.on('message_create', async (message) => {
    try {
        if (message.fromMe) return;
        const chat = await message.getChat();
        const sender = await message.getContact();
        const prefix = config.BOT_PREFIX;

        if (!message.body.startsWith(prefix)) return;
        const args = message.body.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        console.log(`📨 Command received: ${command} from ${sender.pushname || sender.name} in ${chat.name}`);

        switch (command) {
            case config.COMMANDS.BAN:
                await handleBanCommand(message, chat);
                break;
            case config.COMMANDS.UNBAN:
                await handleUnbanCommand(message, chat);
                break;
            case config.COMMANDS.BANLIST:
                await handleBanlistCommand(message, chat);
                break;
            case config.COMMANDS.HELP:
                await handleHelpCommand(message);
                break;
            default:
                await message.reply(config.MESSAGES.INVALID_COMMAND);
        }
    } catch (error) {
        console.error('❌ Error processing message:', error);
    }
});

async function handleBanCommand(message, chat) {
    try {
        if (!message.hasQuotedMsg) {
            return await message.reply('❌ Please reply to a message to ban that user.');
        }

        const quotedMsg = await message.getQuotedMessage();
        const contact = await quotedMsg.getContact();
        const userName = contact.name || contact.pushname || 'Unknown User';
        const userId = contact.id.user;

        const result = await banManager.banUser(userId, userName, chat.id._serialized);

        if (result.success) {
            await message.reply(`✅ ${result.message}`);
            console.log(`🚫 User banned: ${userName}`);
        } else {
            await message.reply(`⚠️ ${result.message}`);
        }
    } catch (error) {
        console.error('Error in ban command:', error);
        await message.reply('❌ Error executing ban command.');
    }
}

async function handleUnbanCommand(message, chat) {
    try {
        if (!message.hasQuotedMsg) {
            return await message.reply('❌ Please reply to a message of the user you want to unban.');
        }

        const quotedMsg = await message.getQuotedMessage();
        const contact = await quotedMsg.getContact();
        const userName = contact.name || contact.pushname || 'Unknown User';
        const userId = contact.id.user;

        const result = await banManager.unbanUser(userId, chat.id._serialized);

        if (result.success) {
            await message.reply(`✅ ${result.message} (${userName})`);
            console.log(`✅ User unbanned: ${userName}`);
        } else {
            await message.reply(`⚠️ ${result.message}`);
        }
    } catch (error) {
        console.error('Error in unban command:', error);
        await message.reply('❌ Error executing unban command.');
    }
}

async function handleBanlistCommand(message, chat) {
    try {
        const banlist = await banManager.getBanlist(chat.id._serialized);
        if (banlist.length === 0) {
            return await message.reply('📋 No banned users in this group.');
        }

        let banlistMessage = '📋 *Banned Users List:*
\n';
        banlist.forEach((user, index) => {
            const bannedDate = new Date(user.bannedAt).toLocaleDateString();
            banlistMessage += `${index + 1}. ${user.userName}\n`;
            banlistMessage += `Banned: ${bannedDate}\n\n`;
        });

        await message.reply(banlistMessage);
    } catch (error) {
        console.error('Error in banlist command:', error);
        await message.reply('❌ Error retrieving ban list.');
    }
}

async function handleHelpCommand(message) {
    try {
        const helpMessage = `🤖 *WhatsApp Ban Bot - Help*
 *Available Commands:* 1. *!ban* - Ban a user → Reply to a message and use !ban 2. *!unban* - Unban a user → Reply to a user's message and use !unban 3. *!banlist* - View all banned users → Use !banlist to see the complete ban list 4. *!help* - Show this help message For more information, visit: https://github.com/empresss302930/whatsapp-ban-bot`;
        await message.reply(helpMessage);
    } catch (error) {
        console.error('Error in help command:', error);
        await message.reply('❌ Error retrieving help information.');
    }
}

client.on('error', (error) => {
    console.error('❌ Client error:', error);
});

client.on('disconnected', (reason) => {
    console.log('⚠️ Client disconnected:', reason);
});

client.initialize();

process.on('SIGINT', () => {
    console.log('\n👋 Shutting down bot gracefully...');
    client.destroy().then(() => {
        console.log('✅ Bot shut down successfully');
        process.exit(0);
    });
});

module.exports = client;
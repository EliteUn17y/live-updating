const { Client, Events, GatewayIntentBits, REST, Routes } = require('discord.js');
const { token, clientId, guildId } = require('./config.json');

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// REST instance for registering commands
const rest = new REST({ version: '10' }).setToken(token);

// Register commands
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: [
                {
                    name: 'update',
                    description: 'Live updates website',
                }
            ] },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.once(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`);
});

client.login(token); // Login to Discord bot

// Handle interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'update') {
        wss.clients.forEach((wsClient) => {
            if (wsClient.readyState === WebSocket.OPEN) {
                wsClient.send('refresh'); // Send refresh command
            }
        });

        await interaction.reply("Refreshed!"); // Discord reply
    }
});

console.log("WebSocket is now live!");
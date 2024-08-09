const { Events } = require('discord.js');

module.exports = {
  // The `name` property states which event this file is for
  name: Events.ClientReady,
  // the `once` property holds a boolean value that specifies if the event should run only once.
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};

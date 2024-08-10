const { Events, Collection } = require('discord.js');

module.exports = {
  // The `name` property states which event this file is for
  name: Events.InteractionCreate,
  // You don't need to specify this in interactionCreate.js as the default behavior will be to run on every event instance.

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    // Cooldown
    const { cooldowns } = interaction.client;

    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Collection());
    }

    // `now` : The current timestamp.
    const now = Date.now();
    // `timestamps` : A reference to the Collection of user ids and timestamp key/value pairs for the triggered command.
    const timestamps = cooldowns.get(command.data.name);
    const defaultCooldownDuration = 3;
    // `cooldownAmount`: The specified cooldown for the command, converted to milliseconds for straightforward calculation.
    // If none is specified, this defaults to three seconds.
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime =
        timestamps.get(interaction.user.id) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000);
        return interaction.reply({
          content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
          ephemeral: true,
        });
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  },
};

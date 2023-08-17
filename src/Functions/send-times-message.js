async function sendMessageAndStoreId(eventsChannel, day, hours) {
  const emojiMap = {
      1: '1️⃣',
      2: '2️⃣',
      3: '3️⃣',
      4: '4️⃣',
      5: '5️⃣',
      6: '6️⃣',
      7: '7️⃣',
      8: '8️⃣',
      9: '9️⃣',
      10: '🔟',
      11: '🕚',
      12: '🕛'
  };

  const message = await eventsChannel.send(day);
  const messageId = message.id;

  // Sorting the hours array to ensure the correct order
  const sortedHours = hours.sort((a, b) => a - b);

  for (const hour of sortedHours) {
      const emoji = emojiMap[hour];
      if (emoji) {
          await message.react(emoji);
      }
  }

  return messageId;
}


module.exports = { sendMessageAndStoreId };
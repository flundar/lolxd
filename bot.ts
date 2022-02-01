import * as slash from "https://code.harmony.rocks/v2.0.0/deploy";

slash.init({ env: true });

const ACTIVITIES: {
  [name: string]: {
    id: string;
    name: string;
  };
} = {
  poker: {
    id: "755827207812677713",
    name: "Poker Night",
  },
  betrayal: {
    id: "773336526917861400",
    name: "Betrayal.io",
  },
  //youtube: {
   // id: "755600276941176913",
   // name: "YouTube Together",
  //},
  fishing: {
    id: "814288819477020702",
    name: "Fishington.io",
  },
  chess: {
    id: "832012774040141894",
    name: "Chess in the Park",
  },
//  watchTogether: {
//    id: "880218394199220334",
//    name: "Watch Together",
//  },
  doodleCrew: {
    id: "878067389634314250",
    name: "Doodle Crew",
  },
  letterTile: {
    id: "879863686565621790",
    name: "Letter Tile",
  },
  wordSnacks: {
    id: "879863976006127627",
    name: "Word Snacks",
  },
};

const commands = [
   {
     name: "davet",
     description: "Beni davet etmek istiyorsanız yazın.",
   },
   {
     name: "aktivite",
     description: "Bir aktivite başlatın.",
     options: [
      {
        name: "channel",
        type: "CHANNEL",
        description: "Bir odada olman gerekiyor!.",
        required: true,
      },
      {
        name: "activity",
        type: "STRING",
        description: "Başlatılacak aktivite.",
        required: true,
        choices: Object.entries(ACTIVITIES).map((e) => ({
          name: e[1].name,
          value: e[0],
        })),
      },
    ],
  },
];

// Create Slash Commands if not present
slash.commands.all().then((e) => {
  let cmd;
  if (
    e.size !== commands.length || 
    !(cmd = e.find(e => e.name === "aktivite")) 
    || cmd?.options[1]?.choices?.length !== Object.keys(ACTIVITIES)
    || cmd.options[1].choices.some(e => ACTIVITIES[e.value] !== e.name)
  ) {
    slash.commands.bulkEdit(commands);
  }
});

slash.handle("aktivite", (d) => {
  if (!d.guild) return;
  const channel = d.option<slash.InteractionChannel>("channel");
  const activity = ACTIVITIES[d.option<string>("activity")];
  if (!channel || !activity) return;
  
  if (channel.type !== slash.ChannelTypes.GUILD_VOICE) {
    return d.reply("Activities can only be started in Voice Channels!", {
      ephemeral: true,
    });
  }

  return slash.client.rest.api.channels[channel.id].invites
    .post({
      max_age: 604800,
      max_uses: 0,
      target_application_id: activity.id,
      target_type: 2,
      temporary: false,
    })
    .then((inv) => {
      return d.reply(
        `[${activity.name} oyununa ${channel.name} kanalında girmek için tıklayınız.](<https://discord.gg/${inv.code}>)`
      );
    })
    .catch((e) => {
      console.error("Aktivite başlatılamadı.", e);
      return d.reply("Aktivite başlatılamadı.", { ephemeral: true });
    });
});

slash.handle("davet", (d) => {
  return d.reply(
    `• [Tıklayarak davet edebilirsin.](<https://discord.com/api/oauth2/authorize?client_id=825427254942236763&permissions=1&scope=applications.commands%20bot>)\n`,
    { ephemeral: true },
  );
});

// Handle for any other commands received.
slash.handle("*", (d) => d.reply("Komut çalıştırılamadı", { ephemeral: true }));
// Log all errors.
slash.client.on("interactionError", console.error);

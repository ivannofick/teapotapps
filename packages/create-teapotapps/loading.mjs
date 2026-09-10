/**
 * loading.mjs - TeapotApps Boiling Water Loader
 * Displays an animated boiling teapot ASCII art while background tasks are running.
 */

const TEAPOT_BODY = [
  "            _________________________",
  "           : _ _ _ _ _ _ _ _ _ _ _ _ :",
  '       ,---:".".".".".".".".".".".".":',
  "      : ,'\"`::.:.:.:.:.:.:.:.:.:.:.::'",
  "      `.`.  `:-===-===-===-===-===-:'",
  "        `.\\`-._:                   :",
  "          `-.__`.               ,'",
  "      ,--------`\"`-------------'--------.",
  "       `\"--.__                   __.--\"`",
  "              `\"\"-------------\"\"'"
];

const STEAM_FRAMES = [
  // Frame 0 - Gentle rising steam
  [
    "                         .",
    "                          `:.",
    "                            `:.",
    "                    .:'     ,::",
    "                   .:'      ;:'",
    "                   ::      ;:'",
    "                    :    .:'",
    "                     `.  :."
  ],
  // Frame 1 - Steam wisps expanding
  [
    "                          (",
    "                     .     )",
    "                    `:.   (",
    "                      `:.   `:.",
    "                     .:'    ,::",
    "                    .:'     ;:'",
    "                    ::     ;:'",
    "                     :   .:'"
  ],
  // Frame 2 - Bubbling steam puff
  [
    "                    (   )",
    "                   (     )  .",
    "                    )   (  `:.",
    "                     `:.     `:.",
    "                     .:'     ,::",
    "                    .:'      ;:'",
    "                    ::      ;:'",
    "                     `.  :."
  ],
  // Frame 3 - High steam boiling
  [
    "                      ~ ~",
    "                    (  ♨️  )",
    "                     )   (",
    "                   (       )  .",
    "                     `:.     `:.",
    "                     .:'     ,::",
    "                    .:'      ;:'",
    "                     :    .:'"
  ],
  // Frame 4 - Whirling vapor
  [
    "                         ~",
    "                    (   )",
    "                   (     )",
    "                    )   (",
    "                     `:.    .",
    "                      `:.  `:.",
    "                     .:'    ,::",
    "                    .:'     ;:'"
  ]
];

/**
 * Start animated boiling loader
 * @param {string} message - Optional status message to display below teapot
 * @param {number} intervalMs - Animation speed in milliseconds
 * @returns {{ stop: (finalMessage?: string) => void, updateMessage: (newMessage: string) => void }}
 */
export function startBoilingLoader(message = '🫖 Boiling water and brewing your app...', intervalMs = 180) {
  let frameIndex = 0;
  let currentMessage = message;
  let isRunning = true;
  let firstRender = true;

  const totalLines = STEAM_FRAMES[0].length + TEAPOT_BODY.length + 3; // steam + body + blank lines + message

  // Hide cursor
  process.stdout.write('\x1B[?25l');

  const render = () => {
    if (!isRunning) return;

    const steam = STEAM_FRAMES[frameIndex];
    const fullFrame = [
      ...steam,
      ...TEAPOT_BODY,
      '',
      `  ${currentMessage}`,
      ''
    ].join('\n');

    if (!firstRender) {
      // Move cursor up by total lines and clear to bottom
      process.stdout.write(`\x1B[${totalLines}A\x1B[0J`);
    } else {
      firstRender = false;
    }

    process.stdout.write(fullFrame + '\n');
    frameIndex = (frameIndex + 1) % STEAM_FRAMES.length;
  };

  render();
  const timer = setInterval(render, intervalMs);

  return {
    updateMessage(newMessage) {
      currentMessage = newMessage;
    },
    stop(finalMessage = '✅ Tea is served!') {
      if (!isRunning) return;
      isRunning = false;
      clearInterval(timer);

      // Clear the animation frame and show cursor
      process.stdout.write(`\x1B[${totalLines}A\x1B[0J`);
      process.stdout.write('\x1B[?25h');

      if (finalMessage) {
        console.log(`\n${finalMessage}\n`);
      }
    }
  };
}

export default startBoilingLoader;

// If executed directly: `node loading.mjs`, run a demo for 4 seconds
if (process.argv[1] && process.argv[1].endsWith('loading.mjs')) {
  const loader = startBoilingLoader('🫖 Boiling water: warming up teapot and preparing ingredients...');

  setTimeout(() => {
    loader.updateMessage('🍵 Steeping tea leaves: installing dependencies...');
  }, 2000);

  setTimeout(() => {
    loader.stop('🫖 Your teapot is warm, time to brew your app 🚀');
    process.exit(0);
  }, 4000);
}

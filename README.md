Haunted Mansion — Prototype

This repo is now themed as a small Haunted Mansion interactive prototype. The main resource tracked is "Courage" (instead of the previous "Vibe").

How it works:
- Open `public/index.html` in your browser.
- The engine (`public/js/app.js`) loads scene data from `public/data/scenes.json`.
- Each scene contains three choices: `bad`, `meh`, and `good`.
- Choices adjust a "Courage" score and either move to another scene or end the current branch.

Extending:
- Add backgrounds in `public/assets` and reference them in the scene `background` fields.
- Add more scenes and branching by adding entries to `scenes.json`.

Run locally:
- On Windows, simply double-click `public\index.html` to open in your default browser, or run a local static server such as `npx http-server public`.

Notes:
- The save system stores `courage` and the current scene id in `localStorage` under keys `vibe_save_1` etc. (I kept the storage key for compatibility. You can change the prefix in `public/js/app.js` if you want.)
- This is intentionally minimal. If you'd like I can add: portraits, ambient audio, screenshots for save slots, or a small scene editor.
- New Game resets progress and starts from `scene1`.
- Continue will attempt to load the most recent save from the three slots.
- Save Slots: three user-managed slots are available. Each slot shows the saved scene id, vibe score and timestamp.
- You can Save / Load / Clear each slot from the menu. There's also a Quick Save button in the HUD which saves to Slot 1.

Main menu:
- The app now starts at a fullscreen Main Menu. You can start a New Game or Continue from your latest save.
- Use Quit to Main Menu from the in-game menu to return to the fullscreen main menu at any time.
Notes on persistence:
- Saves are stored in the browser `localStorage` under keys `vibe_save_1`, `vibe_save_2`, `vibe_save_3`.
- To fully clear saves, either use the Clear button for each slot or clear site data in your browser.

Notes:
- This is intentionally minimal. Let me know if you want: asset loading, character portraits, typewriter text effect, save/load, audio, or a scene editor.

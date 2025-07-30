# Mirall: Generic Note Linking for Obsidian

Mirall is an Obsidian plugin designed to streamline the process of linking scattered notes and ideas back to a central page. It allows you to quickly tag lines in any note and aggregate them as transclusions in a designated file, keeping your context organized and accessible.

---

## Features

### 1. "Tag for page" Command

The core of the plugin is a single, powerful command that connects your notes.

- **How to Use:**
    1.  In any note, place your cursor on a line (or select multiple lines) that you want to link to a page.
    2.  Run the **`Tag for page`** command (default hotkey: `Cmd+J` or `Ctrl+J`).
    3.  A "Page Chooser" modal will appear.

### 2. Page Chooser

This modal provides a quick way to select the destination page for your tagged notes.

- **How it Works:** The modal lists all notes in your vault that contain `mirall: open` in their YAML frontmatter.
- **Page ID:** Each page note must also have a `mirall-id` key in its frontmatter (e.g., `mirall-id: my-awesome-page`). This ID is used to create unique, identifiable block references.

**Example Page File (`My Page.md`):**

```yaml
---
mirall: open
mirall-id: my-awesome-page
---
# My Awesome Page

This is the central page for my page.
```

### 3. Automatic Block Linking and Transclusion

Once you select a page from the chooser, the plugin performs several actions automatically:

1.  **Adds a Block ID:** A unique block ID is appended to the end of the current line (or each selected line). This ID is prefixed with the page's ID (e.g., `^mrll-my-awesome-page-1a2b3c`).
2.  **Adds a Header:** A level-4 markdown header with a link to the source file (e.g., `#### [[Source Note]]`) is added to the page file.
3.  **Adds Transclusions:** The newly tagged blocks are added as transclusions under the new header at the _top_ of the page file (right after the frontmatter), so the most recent additions are always visible first.

### 4. Clickable Page Capsules

To make the links easily identifiable, the generated block IDs are rendered in the editor as stylish, clickable "capsules."

- **Appearance:** The capsule displays the page ID and a customizable icon.
- **Functionality:** Clicking on the capsule will instantly navigate you to the corresponding page file.

---

## Settings

The plugin's behavior can be customized in the settings tab:

- **Capsule Icon:** Change the default icon (`list-checks`) used in the page capsules to any other Lucide icon name available in Obsidian.

---

## Installation

### Manual Installation

1.  Download the latest release files (`main.js`, `styles.css`, `manifest.json`) from the **Releases** page of the GitHub repository (or the zip file, contains all of these).
2.  Find your Obsidian vault's plugins folder by going to `Settings` > `About` and clicking `Open` next to `Override config folder`. Inside that folder, navigate into the `plugins` directory.
3.  Create a new folder named `mirall`.
4.  Copy the `main.js`, `manifest.json`, and `styles.css` files into the new `mirall` folder.
5.  In Obsidian, go to **Settings** > **Community Plugins**.
6.  Make sure "Restricted mode" is turned off. Click the "Reload plugins" button.
7.  Find "Mirall" in the list and **enable** it.

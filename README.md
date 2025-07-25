# Proj: Project-Based Note Linking for Obsidian

Proj is an Obsidian plugin designed to streamline the process of linking scattered notes and ideas back to a central project page. It allows you to quickly tag lines in any note and aggregate them as transclusions in a designated project file, keeping your project context organized and accessible.

---

## Features

### 1. "Tag for Project" Command

The core of the plugin is a single, powerful command that connects your notes to your projects.

-   **How to Use:**
    1.  In any note, place your cursor on a line (or select multiple lines) that you want to link to a project.
    2.  Run the **`Tag for project`** command (default hotkey: `Cmd+J` or `Ctrl+J`).
    3.  A "Project Chooser" modal will appear.

### 2. Project Chooser

This modal provides a quick way to select the destination project for your tagged notes.

-   **How it Works:** The modal lists all notes in your vault that contain `proj: open` in their YAML frontmatter.
-   **Project ID:** Each project note must also have a `proj-id` key in its frontmatter (e.g., `proj-id: my-awesome-project`). This ID is used to create unique, identifiable block references.

**Example Project File (`My Project.md`):**
```yaml
---
proj: open
proj-id: my-awesome-project
---

# My Awesome Project

This is the central page for my project.
```

### 3. Automatic Block Linking and Transclusion

Once you select a project from the chooser, the plugin performs several actions automatically:

1.  **Adds a Block ID:** A unique block ID is appended to the end of the current line (or each selected line). This ID is prefixed with the project's ID (e.g., `^proj-my-awesome-project-1a2b3c`).
2.  **Adds a Header:** A level-4 markdown header with a link to the source file (e.g., `#### [[Source Note]]`) is added to the project file.
3.  **Adds Transclusions:** The newly tagged blocks are added as transclusions under the new header at the *top* of the project file (right after the frontmatter), so the most recent additions are always visible first.

### 4. Clickable Project Capsules

To make the links easily identifiable, the generated block IDs are rendered in the editor as stylish, clickable "capsules."

-   **Appearance:** The capsule displays the project ID and a customizable icon.
-   **Functionality:** Clicking on the capsule will instantly navigate you to the corresponding project file.

---

## Settings

The plugin's behavior can be customized in the settings tab:

-   **Capsule Icon:** Change the default icon (`list-checks`) used in the project capsules to any other Lucide icon name available in Obsidian.

---

## Installation

### Manual Installation

1.  Download the latest release files (`main.js`, `styles.css`, `manifest.json`) from the **Releases** page of the GitHub repository (or the zip file, contains all of these).
2.  Find your Obsidian vault's plugins folder by going to `Settings` > `About` and clicking `Open` next to `Override config folder`. Inside that folder, navigate into the `plugins` directory.
3.  Create a new folder named `proj`.
4.  Copy the `main.js`, `manifest.json`, and `styles.css` files into the new `proj` folder.
5.  In Obsidian, go to **Settings** > **Community Plugins**.
6.  Make sure "Restricted mode" is turned off. Click the "Reload plugins" button.
7.  Find "Proj" in the list and **enable** it.

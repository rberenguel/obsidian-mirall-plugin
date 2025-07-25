import { Plugin } from "obsidian";
import { addProjCommands } from "./src/commands";
import { ProjSettingTab } from "./src/SettingsTab";
import { buildProjectViewPlugin } from "./src/view";

export interface ProjPluginSettings {
	capsuleIcon: string;
}

const DEFAULT_SETTINGS: ProjPluginSettings = {
	capsuleIcon: "list-checks",
};

export default class ProjPlugin extends Plugin {
	settings: ProjPluginSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ProjSettingTab(this.app, this));
		this.registerEditorExtension(buildProjectViewPlugin(this));
		addProjCommands(this);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

import { Plugin } from "obsidian";
import { addMirallCommands } from "./src/mirall-commands";
import { MirallSettingTab } from "./src/MirallSettingsTab";
import { buildMirallViewPlugin } from "./src/view";

export interface MirallPluginSettings {
	capsuleIcon: string;
	excludeMirallStates: string;
}

const DEFAULT_SETTINGS: MirallPluginSettings = {
	capsuleIcon: "list-checks",
	excludeMirallStates: "closed,cancelled",
};

export default class MirallPlugin extends Plugin {
	settings: MirallPluginSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new MirallSettingTab(this.app, this));
		this.registerEditorExtension(buildMirallViewPlugin(this));
		addMirallCommands(this);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
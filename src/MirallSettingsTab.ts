import { App, PluginSettingTab, Setting } from "obsidian";
import MirallPlugin from "../main";

export class MirallSettingTab extends PluginSettingTab {
	plugin: MirallPlugin;

	constructor(app: App, plugin: MirallPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl("h2", { text: "Mirall Plugin Settings" });

		new Setting(containerEl)
			.setName("Capsule Icon")
			.setDesc("The icon to display in the capsule.")
			.addText((text) =>
				text
					.setPlaceholder("list-checks")
					.setValue(this.plugin.settings.capsuleIcon)
					.onChange(async (value) => {
						this.plugin.settings.capsuleIcon = value.trim();
						await this.plugin.saveSettings();
						this.plugin.app.workspace.updateOptions();
					}),
			);

		new Setting(containerEl)
			.setName("Exclude Page States")
			.setDesc(
				"A comma-separated list of states to exclude from the page chooser.",
			)
			.addText((text) =>
				text
					.setPlaceholder("closed,cancelled")
					.setValue(this.plugin.settings.excludeMirallStates)
					.onChange(async (value) => {
						this.plugin.settings.excludeMirallStates = value.trim();
						await this.plugin.saveSettings();
					}),
			);
	}
}

import { App, PluginSettingTab, Setting } from "obsidian";
import ProjPlugin from "../main";

export class ProjSettingTab extends PluginSettingTab {
	plugin: ProjPlugin;

	constructor(app: App, plugin: ProjPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl("h2", { text: "Proj Plugin Settings" });

		new Setting(containerEl)
			.setName("Capsule Icon")
			.setDesc("The icon to display in the project capsule.")
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
	}
}

import { App, FuzzySuggestModal, TFile } from "obsidian";
import MirallPlugin from "../main";

export class MirallChooserModal extends FuzzySuggestModal<TFile> {
	constructor(
		app: App,
		private plugin: MirallPlugin,
		private onChoose: (result: TFile) => void,
	) {
		super(app);
	}

	getItems(): TFile[] {
		const excludedStates = this.plugin.settings.excludeMirallStates
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
		return this.app.vault.getMarkdownFiles().filter((file) => {
			const frontmatter =
				this.app.metadataCache.getFileCache(file)?.frontmatter;
			if (!frontmatter || !frontmatter.mirall) {
				return false;
			}
			return !excludedStates.includes(frontmatter.mirall);
		});
	}

	getItemText(item: TFile): string {
		return item.basename;
	}

	onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent): void {
		this.onChoose(item);
	}
}

import { App, FuzzySuggestModal, TFile } from "obsidian";
import ProjPlugin from "../main";

export class ProjectChooserModal extends FuzzySuggestModal<TFile> {
	constructor(
		app: App,
		private plugin: ProjPlugin,
		private onChoose: (result: TFile) => void
	) {
		super(app);
	}

	getItems(): TFile[] {
		const excludedStates = this.plugin.settings.excludeProjectStates.split(",").map(s => s.trim()).filter(Boolean);
		return this.app.vault.getMarkdownFiles().filter(file => {
			const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
			if (!frontmatter || !frontmatter.proj) {
				return false;
			}
			return !excludedStates.includes(frontmatter.proj);
		});
	}

	getItemText(item: TFile): string {
		return item.basename;
	}

	onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent): void {
		this.onChoose(item);
	}
}
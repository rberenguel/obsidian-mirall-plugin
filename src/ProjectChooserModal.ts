import { App, FuzzySuggestModal, TFile } from "obsidian";

export class ProjectChooserModal extends FuzzySuggestModal<TFile> {
	constructor(app: App, private onChoose: (result: TFile) => void) {
		super(app);
	}

	getItems(): TFile[] {
		return this.app.vault.getMarkdownFiles().filter(file => {
			const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
			return frontmatter && frontmatter.proj === "open";
		});
	}

	getItemText(item: TFile): string {
		return item.basename;
	}

	onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent): void {
		this.onChoose(item);
	}
}

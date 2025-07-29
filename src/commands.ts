import { Editor, MarkdownView, Notice, TFile } from "obsidian";
import ProjPlugin from "../main";
import { ProjectChooserModal } from "./ProjectChooserModal";

export function addProjCommands(plugin: ProjPlugin) {
	plugin.addCommand({
		id: "tag-for-project",
		name: "Tag for project",
		hotkeys: [{ modifiers: ["Mod"], key: "j" }],
		editorCallback: (editor: Editor, view: MarkdownView) => {
			const file = view.file;
			if (!file) {
				new Notice("No active file.");
				return;
			}

			if (editor.getValue().trim() === "") {
				const newProjId = file.basename.toLowerCase().replace(/\s/g, "-");
				const frontmatter = `---
proj: open
proj-id: ${newProjId}
---

`;
				editor.setValue(frontmatter);
				new Notice("Added project frontmatter.");
				return;
			}

			new ProjectChooserModal(plugin.app, plugin, (project) => {
				const projectFile = plugin.app.vault.getAbstractFileByPath(project.path);
				if (!projectFile || !(projectFile instanceof TFile)) {
					new Notice("Project file not found or is not a markdown file.");
					return;
				}

				plugin.app.vault.read(projectFile).then(content => {
					const cache = plugin.app.metadataCache.getFileCache(projectFile);
					const projId = cache?.frontmatter ? cache.frontmatter["proj-id"] : undefined;

					if (!projId) {
						new Notice("Project ID not found in project file's frontmatter.");
						return;
					}

					const selection = editor.getSelection();
					const blockIds = [];

					if (selection) {
						const lines = selection.split("\n");
						for (let i = 0; i < lines.length; i++) {
							const line = lines[i];
							if (line.trim() === "") continue;

							const blockId = `^proj-${projId}-${Date.now().toString(36)}${i}`;
							lines[i] = `${line} ${blockId}`;
							blockIds.push(blockId);
						}
						editor.replaceSelection(lines.join("\n"));
					} else {
						const cursor = editor.getCursor();
						const line = editor.getLine(cursor.line);
						const blockId = `^proj-${projId}-${Date.now().toString(36)}`;
						const newLine = line.trim() === "" ? `${blockId}` : `${line} ${blockId}`;
						editor.setLine(cursor.line, newLine);
						blockIds.push(blockId);
					}

					if (blockIds.length === 0) {
						return;
					}

					const transclusions = blockIds.map(id => `![[${file.basename}#${id}]]`);
					const header = `#### [[${file.basename}]]`;
					let newContent;

					const fileContentLines = content.split('\n');
					const headerLineIndex = fileContentLines.findIndex(line => line.trim() === header);

					if (headerLineIndex !== -1) {
						let endOfSectionIndex = fileContentLines.length;
						for (let i = headerLineIndex + 1; i < fileContentLines.length; i++) {
							if (fileContentLines[i].trim().startsWith('#### ')) {
								endOfSectionIndex = i;
								break;
							}
						}

						let insertionLine = endOfSectionIndex;
						while(insertionLine > headerLineIndex + 1 && fileContentLines[insertionLine - 1].trim() === '') {
							insertionLine--;
						}

						const itemsToInsert = transclusions.join('\n\n').split('\n');

						if (insertionLine > headerLineIndex + 1) {
							fileContentLines.splice(insertionLine, 0, '', ...itemsToInsert);
						} else {
							fileContentLines.splice(insertionLine, 0, ...itemsToInsert);
						}
						newContent = fileContentLines.join('\n');

					} else {
						const transclusionsText = transclusions.join('\n\n');
						const headerWithNewline = header + '\n';
						const frontmatterEnd = cache?.frontmatterPosition?.end?.offset;

						if (frontmatterEnd) {
							const before = content.slice(0, frontmatterEnd);
							const after = content.slice(frontmatterEnd);
							newContent = `${before}\n\n${headerWithNewline}${transclusionsText}${after}`;
						} else {
							newContent = `${headerWithNewline}${transclusionsText}\n${content}`;
						}
					}

					plugin.app.vault.modify(projectFile, newContent);
					new Notice(`Tagged for project: ${project.basename}`);
				});
			}).open();
		},
	});
}
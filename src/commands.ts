import { Editor, MarkdownView, Notice, TFile } from "obsidian";
import ProjPlugin from "../main";
import { ProjectChooserModal } from "./ProjectChooserModal";

export function addProjCommands(plugin: ProjPlugin) {
	plugin.addCommand({
		id: "tag-for-project",
		name: "Tag for project",
		hotkeys: [{ modifiers: ["Mod"], key: "j" }],
		editorCallback: (editor: Editor, view: MarkdownView) => {
			new ProjectChooserModal(plugin.app, (project) => {
				const file = view.file;
				if (!file) {
					new Notice("No active file.");
					return;
				}

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
						editor.setLine(cursor.line, `${line} ${blockId}`);
						blockIds.push(blockId);
					}

					if (blockIds.length === 0) {
						return;
					}

					const transclusions = blockIds.map(id => `![[${file.basename}#${id}]]`).join("\n");
                    const header = `#### [[${file.basename}]]\n`;
                    const frontmatterEnd = cache?.frontmatterPosition?.end?.offset;
                    let newContent;

                    if (frontmatterEnd) {
                        const before = content.slice(0, frontmatterEnd);
                        const after = content.slice(frontmatterEnd);
                        newContent = `${before}\n\n${header}${transclusions}${after}`;
                    } else {
                        newContent = `${header}${transclusions}\n${content}`;
                    }

					plugin.app.vault.modify(projectFile, newContent);
					new Notice(`Tagged for project: ${project.basename}`);
				});
			}).open();
		},
	});
}

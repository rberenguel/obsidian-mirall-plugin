import { Editor, MarkdownView, Notice, TFile } from "obsidian";
import MirallPlugin from "../main";
import { MirallChooserModal } from "./MirallChooserModal";

export function addMirallCommands(plugin: MirallPlugin) {
	plugin.addCommand({
		id: "tag-for-page",
		name: "Tag for page",
		hotkeys: [{ modifiers: ["Mod"], key: "j" }],
		editorCallback: async (editor: Editor, view: MarkdownView) => {
			const file = view.file;
			if (!file) {
				new Notice("No active file.");
				return;
			}

			if (editor.getValue().trim() === "") {
				const newMirallId = file.basename
					.toLowerCase()
					.replace(/\s/g, "-");
				const frontmatter = `---
mirall: open
mirall-id: ${newMirallId}
---

`;
				editor.setValue(frontmatter);
				new Notice("Added page frontmatter.");
				return;
			}

			const cursor = editor.getCursor();
			const line = editor.getLine(cursor.line);
			const selection = editor.getSelection();
			const match = line.match(/\s(\^mrll-[a-zA-Z0-9-]+)\s*$/);

			if (match && !selection) {
				const blockIdWithCaret = match[1];
				const blockId = blockIdWithCaret.substring(1);
				const parts = blockId.split("-");
				const pageId = parts.slice(1, -1).join("-");

				const pageFile = plugin.app.vault
					.getMarkdownFiles()
					.find((f) => {
						const fm =
							plugin.app.metadataCache.getFileCache(
								f,
							)?.frontmatter;
						return fm && fm["mirall-id"] === pageId;
					});

				if (!pageFile) {
					new Notice(`Page with ID "${pageId}" not found.`);
					return;
				}

				const pageContent = await plugin.app.vault.read(pageFile);
				const transclusion = `![[${file.basename}#${blockIdWithCaret}]]`;

				if (pageContent.includes(transclusion)) {
					const newPageContent = pageContent.replace(
						transclusion,
						line,
					);
					await plugin.app.vault.modify(pageFile, newPageContent);

					const originalCursorLine = cursor.line;
					const originalCursorCh = cursor.ch;

					const lines = editor.getValue().split("\n");
					lines.splice(originalCursorLine, 1);
					editor.setValue(lines.join("\n"));

					// Restore cursor position
					// If the removed line was the last line, move cursor to the end of the previous line.
					// Otherwise, move cursor to the beginning of the new line at the original position.
					if (originalCursorLine >= lines.length) {
						editor.setCursor(
							lines.length - 1,
							lines[lines.length - 1].length,
						);
					} else {
						editor.setCursor(originalCursorLine, 0);
					}

					new Notice(`Moved line to ${pageFile.basename}.`);
				} else {
					new Notice(
						`Could not find transclusion in ${pageFile.basename} to replace.`,
					);
				}
			} else {
				new MirallChooserModal(plugin.app, plugin, async (page) => {
					const pageFile = plugin.app.vault.getAbstractFileByPath(
						page.path,
					);
					if (!pageFile || !(pageFile instanceof TFile)) {
						new Notice(
							"Page file not found or is not a markdown file.",
						);
						return;
					}

					const cache =
						plugin.app.metadataCache.getFileCache(pageFile);
					const pageId = cache?.frontmatter
						? cache.frontmatter["mirall-id"]
						: undefined;

					if (!pageId) {
						new Notice(
							"Page ID not found in page file's frontmatter.",
						);
						return;
					}

					if (page.path === file.path) {
						const dummyBlockId = `^mrll-${pageId}-${Date.now().toString(36)}`;
						const selection = editor.getSelection();

						if (selection) {
							const lines = selection.split("\n");
							for (let i = 0; i < lines.length; i++) {
								const line = lines[i];
								if (line.trim() === "") continue;
								lines[i] = `${line} ${dummyBlockId}`;
							}
							editor.replaceSelection(lines.join("\n"));
						} else {
							const cursor = editor.getCursor();
							const line = editor.getLine(cursor.line);
							const newLine =
								line.trim() === ""
									? `${dummyBlockId}`
									: `${line} ${dummyBlockId}`;
							editor.setLine(cursor.line, newLine);
						}
						new Notice("Added project reference to current file.");
						return;
					}

					plugin.app.vault.read(pageFile).then((content) => {
						const selection = editor.getSelection();
						const blockIds = [];

						if (selection) {
							const lines = selection.split("\n");
							for (let i = 0; i < lines.length; i++) {
								const line = lines[i];
								if (line.trim() === "") continue;

								const blockId = `^mrll-${pageId}-${Date.now().toString(36)}${i}`;
								lines[i] = `${line} ${blockId}`;
								blockIds.push(blockId);
							}
							editor.replaceSelection(lines.join("\n"));
						} else {
							const cursor = editor.getCursor();
							const line = editor.getLine(cursor.line);
							const blockId = `^mrll-${pageId}-${Date.now().toString(36)}`;
							const newLine =
								line.trim() === ""
									? `${blockId}`
									: `${line} ${blockId}`;
							editor.setLine(cursor.line, newLine);
							blockIds.push(blockId);
						}

						if (blockIds.length === 0) {
							return;
						}

						const transclusions = blockIds.map(
							(id) => `![[${file.basename}#${id}]]`,
						);
						const header = `#### [[${file.basename}]]`;
						let newContent;

						const fileContentLines = content.split("\n");
						const headerLineIndex = fileContentLines.findIndex(
							(line) => line.trim() === header,
						);

						if (headerLineIndex !== -1) {
							let endOfSectionIndex = fileContentLines.length;
							for (
								let i = headerLineIndex + 1;
								i < fileContentLines.length;
								i++
							) {
								if (
									fileContentLines[i]
										.trim()
										.startsWith("#### ")
								) {
									endOfSectionIndex = i;
									break;
								}
							}

							let insertionLine = endOfSectionIndex;
							while (
								insertionLine > headerLineIndex + 1 &&
								fileContentLines[insertionLine - 1].trim() ===
									""
							) {
								insertionLine--;
							}

							const itemsToInsert = transclusions
								.join("\n\n")
								.split("\n");

							if (insertionLine > headerLineIndex + 1) {
								fileContentLines.splice(
									insertionLine,
									0,
									"",
									...itemsToInsert,
								);
							} else {
								fileContentLines.splice(
									insertionLine,
									0,
									...itemsToInsert,
								);
							}
							newContent = fileContentLines.join("\n");
						} else {
							const transclusionsText =
								transclusions.join("\n\n");
							const headerWithNewline = header + "\n";
							const frontmatterEnd =
								cache?.frontmatterPosition?.end?.offset;

							if (frontmatterEnd) {
								const before = content.slice(0, frontmatterEnd);
								const after = content.slice(frontmatterEnd);
								newContent = `${before}\n\n${headerWithNewline}${transclusionsText}${after}`;
							} else {
								newContent = `${headerWithNewline}${transclusionsText}\n${content}`;
							}
						}

						plugin.app.vault.modify(pageFile, newContent);
						new Notice(`Tagged for page: ${page.basename}`);
					});
				}).open();
			}
		},
	});
}

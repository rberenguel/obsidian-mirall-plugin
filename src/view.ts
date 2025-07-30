import {
	ViewPlugin,
	ViewUpdate,
	Decoration,
	DecorationSet,
	WidgetType,
	EditorView,
} from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { setIcon, App } from "obsidian";
import ProjPlugin from "../main";

const solarizedColors = [
	"var(--proj-cyan)",
	"var(--proj-red)",
	"var(--proj-orange)",
	"var(--proj-yellow)",
	"var(--proj-blue)",
	"var(--proj-green)",
	"var(--proj-magenta)",
	"var(--proj-violet)",
];

function simpleHash(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0; // Convert to 32bit integer
	}
	return Math.abs(hash);
}

class ProjectCapsuleWidget extends WidgetType {
	constructor(
		private readonly app: App,
		private readonly projectId: string,
		private readonly icon: string,
	) {
		super();
	}

	toDOM(view: EditorView): HTMLElement {
		const capsule = document.createElement("span");
		capsule.className = "proj-capsule";
		capsule.style.cursor = "pointer";

		const iconEl = capsule.createSpan({ cls: "proj-capsule-icon" });
		setIcon(iconEl, this.icon);

		const textEl = capsule.createSpan({ cls: "proj-capsule-text" });
		textEl.setText(this.projectId);

		const colorIndex = simpleHash(this.projectId) % solarizedColors.length;
		textEl.style.color = solarizedColors[colorIndex];


		capsule.setAttribute("aria-label", `Project: ${this.projectId}`);

		capsule.addEventListener("mousedown", (event) => {
			event.preventDefault();
			const projectFile = this.app.vault.getMarkdownFiles().find(file => {
				const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
				return frontmatter && frontmatter["proj-id"] === this.projectId;
			});

			if (projectFile) {
				this.app.workspace.openLinkText(projectFile.path, "", false);
			}
		});

		return capsule;
	}

	ignoreEvent(event: Event): boolean {
		return event instanceof MouseEvent && event.type === 'mousedown';
	}
}

export function buildProjectViewPlugin(plugin: ProjPlugin) {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;

			constructor(view: EditorView) {
				this.decorations = this.buildDecorations(view);
			}

			update(update: ViewUpdate) {
				if (
					update.docChanged ||
					update.viewportChanged ||
					update.selectionSet
				) {
					this.decorations = this.buildDecorations(update.view);
				}
			}

			buildDecorations(view: EditorView): DecorationSet {
				const builder = new RangeSetBuilder<Decoration>();
				const selection = view.state.selection.main;

				for (const { from, to } of view.visibleRanges) {
					let pos = from;
					while (pos <= to) {
						const line = view.state.doc.lineAt(pos);
						const match = line.text.match(/\s\^([a-zA-Z0-9-]+)\s*$/);

						if (match && match.index !== undefined) {
							const blockId = match[1];
							const parts = blockId.split('-');
							if (parts.length > 2 && parts[0] === 'proj') {
								const markerStart = line.from + match.index;
								const markerEnd = markerStart + match[0].length;

								if (
									!(
										selection.from < markerEnd &&
										selection.to > markerStart
									)
								) {
									const projectId = parts.slice(1, -1).join('-');
									builder.add(
										markerStart,
										markerEnd,
										Decoration.replace({
											widget: new ProjectCapsuleWidget(
												plugin.app,
												projectId,
												plugin.settings.capsuleIcon,
											),
										}),
									);
								}
							}
						}
						pos = line.to + 1;
					}
				}
				return builder.finish();
			}
		},
		{
			decorations: (v) => v.decorations,
		},
	);
}
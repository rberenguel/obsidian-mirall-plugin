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
import MirallPlugin from "../main";

const solarizedColors = [
	"var(--mrll-cyan)",
	"var(--mrll-red)",
	"var(--mrll-orange)",
	"var(--mrll-yellow)",
	"var(--mrll-blue)",
	"var(--mrll-green)",
	"var(--mrll-magenta)",
	"var(--mrll-violet)",
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

class MirallCapsuleWidget extends WidgetType {
	constructor(
		private readonly app: App,
		private readonly pageId: string,
		private readonly icon: string,
	) {
		super();
	}

	toDOM(view: EditorView): HTMLElement {
		const capsule = document.createElement("span");
		capsule.className = "mrll-capsule";
		capsule.style.cursor = "pointer";

		const iconEl = capsule.createSpan({ cls: "mrll-capsule-icon" });
		setIcon(iconEl, this.icon);

		const textEl = capsule.createSpan({ cls: "mrll-capsule-text" });
		textEl.setText(this.pageId);

		const colorIndex = simpleHash(this.pageId) % solarizedColors.length;
		textEl.style.color = solarizedColors[colorIndex];


		capsule.setAttribute("aria-label", `Page: ${this.pageId}`);

		capsule.addEventListener("mousedown", (event) => {
			event.preventDefault();
			const pageFile = this.app.vault.getMarkdownFiles().find(file => {
				const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
				return frontmatter && frontmatter["mirall-id"] === this.pageId;
			});

			if (pageFile) {
				this.app.workspace.openLinkText(pageFile.path, "", false);
			}
		});

		return capsule;
	}

	ignoreEvent(event: Event): boolean {
		return event instanceof MouseEvent && event.type === 'mousedown';
	}
}

export function buildMirallViewPlugin(plugin: MirallPlugin) {
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
							if (parts.length > 2 && parts[0] === 'mrll') {
								const markerStart = line.from + match.index;
								const markerEnd = markerStart + match[0].length;

								if (
									!(
										selection.from < markerEnd &&
										selection.to > markerStart
									)
								) {
									const pageId = parts.slice(1, -1).join('-');
									builder.add(
										markerStart,
										markerEnd,
										Decoration.replace({
											widget: new MirallCapsuleWidget(
												plugin.app,
												pageId,
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
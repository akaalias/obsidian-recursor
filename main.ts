import {MarkdownView, Plugin} from 'obsidian';

interface RecursorPluginSettings { positions: any; }
const DEFAULT_SETTINGS: RecursorPluginSettings = { positions: new Map() }

export default class RecursorPlugin extends Plugin {
	private settings: RecursorPluginSettings;
	private lastKey: string;

	async loadSettings() { this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()); }
	async saveSettings() { await this.saveData(this.settings); }

	async onload() {
		await this.loadSettings();

		this.registerCodeMirror((cm: CodeMirror.Editor) => {
			// track cursor
			cm.on("keydown", this.handleKeyDownChange);
			cm.on("click", this.handleClickChange);

			// set cursor
			cm.on("refresh", this.setRefreshCursor);
			cm.on("focus", this.setFocusCursor);
		});
	}

	private setRefreshCursor = ( cm: CodeMirror.Editor): void => {
		const skipEvents = ["Enter", "#"]
		if(skipEvents.contains(this.lastKey)) {
			console.log("Skipping refresh for " + this.lastKey);
			return;
		}
		this.setCursor(cm);
	}

	private setFocusCursor = ( cm: CodeMirror.Editor ): void => {
		// console.log("Focus event");
		this.setCursor(cm);
	}

	private setCursor = ( cm: CodeMirror.Editor ): void => {
		let mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if(!mdView) { return }
		if(mdView.sourceMode == undefined) return;

		if(!this.app.workspace.getActiveFile()) return;
		let basename = this.app.workspace.getActiveFile().basename;

		if(this.settings.positions[basename] != null) {
			let cursor = this.settings.positions[basename];
			cm.setCursor(cursor);
			cm.scrollIntoView(null);
		}
	}

	private readonly handleClickChange = ( cm: CodeMirror.Editor): void => {
		this.handleChange(cm);
	}

	private readonly handleKeyDownChange = ( cm: CodeMirror.Editor, event: KeyboardEvent ): void => {
		this.lastKey = event.key;
		this.handleChange(cm);
	}

	private readonly handleChange = ( cm: CodeMirror.Editor): void => {
		let basename = this.app.workspace.getActiveFile().basename;
		const cursor = cm.getCursor();

		this.settings.positions[basename] = cursor;
		this.saveSettings();
	}
}

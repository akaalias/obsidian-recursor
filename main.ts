import {MarkdownView, Plugin} from 'obsidian';

interface RecursorPluginSettings { positions: any; }
const DEFAULT_SETTINGS: RecursorPluginSettings = { positions: new Map() }

export default class RecursorPlugin extends Plugin {
	settings: RecursorPluginSettings;

	async loadSettings() { this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()); }
	async saveSettings() { await this.saveData(this.settings); }
	
	async onload() {
		await this.loadSettings();

		this.registerCodeMirror((cm: CodeMirror.Editor) => {
			// track cursor
			cm.on("keydown", this.handleChange);

			// set cursor
			cm.on("refresh", this.setCursor);
			cm.on("focus", this.setCursor);
		});
	}

	private setCursor = ( cm: CodeMirror.Editor ): void => {
		let mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if(!mdView) { return }
		if(mdView.sourceMode == undefined) return;

		if(!this.app.workspace.getActiveFile()) return;
		let basename = this.app.workspace.getActiveFile().basename;

		// console.log("Positions:");
		// console.log(this.settings.positions);

		if(this.settings.positions[basename] != null) {
			let cursor = this.settings.positions[basename];
			// console.log(basename + " - Moving cursor to: ");
			// console.log(cursor);
			cm.setCursor(cursor);
			cm.scrollIntoView(null);
		} else {
			// console.log(basename + " - We have no previous position")
		}
	}

	private readonly handleChange = ( cm: CodeMirror.Editor ): void => {
		let basename = this.app.workspace.getActiveFile().basename;
		const cursor = cm.getCursor();

		this.settings.positions[basename] = cursor;
		this.saveSettings();
	}
}

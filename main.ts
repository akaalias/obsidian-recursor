import {Plugin} from 'obsidian';

interface MyPluginSettings {
	positions: any;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	positions: new Map()
}

export default class RecursorPlugin extends Plugin {
	settings: MyPluginSettings;

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async onload() {
		await this.loadSettings();

		this.registerCodeMirror((cm: CodeMirror.Editor) => {
			cm.on("keydown", this.handleKeyDown);
			cm.on("mousedown", this.handleKeyDown);
			cm.on("focus", this.handleOpen);
		});
	}

	private readonly handleOpen = (
		cm: CodeMirror.Editor
	): void => {
		if(!this.app.workspace.getActiveFile()) return;
		let basename = this.app.workspace.getActiveFile().basename;

		if(this.settings.positions[basename] != null) {
			let cursor = this.settings.positions[basename];
			cm.setCursor(cursor);
			cm.scrollTo(cursor.line);
		}
	}

	private readonly handleKeyDown = (
		cm: CodeMirror.Editor
	): void => {
		let basename = this.app.workspace.getActiveFile().basename;
		const cursor = cm.getCursor();

		this.settings.positions[basename] = cursor;

		await this.saveSettings();
	}
}

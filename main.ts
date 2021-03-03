import {Plugin} from 'obsidian';

export default class RememberCursorPlugin extends Plugin {
	positions: Map<string, CodeMirror.Position>;

	async onload() {
		this.positions = new Map<string, CodeMirror.Position>();
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
		if(this.positions.has(basename)) {
			let cursor = this.positions.get(basename)
			cm.setCursor(cursor);
			cm.scrollTo(cursor.line);
		}
	}

	private readonly handleKeyDown = (
		cm: CodeMirror.Editor
	): void => {
		let basename = this.app.workspace.getActiveFile().basename;
		const cursor = cm.getCursor();
		this.positions.set(basename, cursor);
	}
}

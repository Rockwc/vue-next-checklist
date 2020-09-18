// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const scanner = require('vue-next-checklist/src/scanner')
const path = require('path')

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let proj_path=vscode.workspace.workspaceFolders[0].uri.fsPath;
let output;
let prev_output="";
let scan_file;
let scan_line;

let diag_coll;
let diags_table;
console.log = (...args) => {
	if(!output)output=vscode.window.createOutputChannel("VNCL");
	output.show();

	let str = args.join("");
	
	if(str.indexOf('Scan:')>=0){
		scan_file = str.split(": ")[1];
		output.appendLine("");
		output.appendLine("---"+str+"---");
	}if(str.indexOf("  +	error")>=0){
		let line_arr = prev_output.split(":");
		let line_at=parseInt(line_arr[0])-1;
		line_arr.shift();
		scan_line = {at:line_at,text:line_arr.join(":")};

		const error_info = str.split("  +	error")[1];

		const range = new vscode.Range(scan_line.at, 0, scan_line.at, scan_line.text.length);
		const diagnostic = new vscode.Diagnostic(range, error_info,vscode.DiagnosticSeverity.Error);

		if(!diags_table[scan_file])diags_table[scan_file]=[];
		diags_table[scan_file].push(diagnostic);

		// diag_coll = vscode.languages.createDiagnosticCollection('scan_file');

		let file_uri = vscode.Uri.file(path.posix.join(proj_path,scan_file));
		diag_coll.set(file_uri,diags_table[scan_file]);
	}
	output.appendLine(str);

	prev_output = str;
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vuenextchecklist" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vuenextchecklist.checkProject', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user

		console.log("=============================");
		console.log("Vue Next Checklist");
		console.log("Migration Checking Start");
		console.log(proj_path);
		
		if(diag_coll)diag_coll.clear();
		diag_coll = vscode.languages.createDiagnosticCollection('VNCL');

		diags_table={};

		scanner.run(proj_path);
		console.log("");
		console.log("Migration Checking finished");
		console.log("=============================");
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

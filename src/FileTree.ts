import * as vscode from 'vscode';

export class FileTree implements vscode.TreeDataProvider<FileItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<FileItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private files: vscode.Uri[] = [];

  addFile(uri: vscode.Uri) {
    this.files.push(uri);
    this._onDidChangeTreeData.fire(undefined);
  }

  removeFile(uri: vscode.Uri) {
    this.files = this.files.filter(file => file.fsPath !== uri.fsPath);
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: FileItem): vscode.TreeItem {
    return element;
  }

  getChildren(): Thenable<FileItem[]> {
    return Promise.resolve(this.files.map(file => new FileItem(file)));
  }
}

export class FileItem extends vscode.TreeItem {
  constructor(public readonly uri: vscode.Uri) {
    super(uri.fsPath.split('/').pop() || uri.fsPath);
    this.tooltip = uri.fsPath;
    this.command = {
      command: 'extension.openFile',
      title: 'Open File',
      arguments: [uri]
    };
  }
}
import * as vscode from 'vscode';
import { FileItem, FileTree } from './FileTree';

export function activate(context: vscode.ExtensionContext) {
  const fileTree = new FileTree();
  
  vscode.window.registerTreeDataProvider('aiContextFiles', fileTree);

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.addFile', async () => {
      const uris = await vscode.window.showOpenDialog({
        canSelectMany: true,
        openLabel: 'Add to AI Context'
      });
      if (uris) {
        uris.forEach(uri => fileTree.addFile(uri));
      }
    }),

    vscode.commands.registerCommand('extension.removeFile', (item: FileItem) => {
      fileTree.removeFile(item.uri);
    }),

    vscode.commands.registerCommand('extension.buildContext', async () => {
      const items = await fileTree.getChildren();
      const files = await Promise.all(
        items.map(async item => ({
          path: item.uri.fsPath,
          filename: item.uri.fsPath.split(/[\\/]/).pop() || '',
          content: (await vscode.workspace.fs.readFile(item.uri)).toString()
        }))
      );

      const context = files
        .map(file => `\`\`\`${getFileExtension(file.filename)} ${file.filename}\n${file.content}\n\`\`\``)
        .join('\n\n');

      vscode.env.clipboard.writeText(context);
      vscode.window.showInformationMessage('AI context copied to clipboard!');
    })
  );
  vscode.commands.registerCommand('extension.addCurrentFile', async () => {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      fileTree.addFile(activeEditor.document.uri);
      vscode.window.showInformationMessage('Current file added to AI context');
    } else {
      vscode.window.showWarningMessage('No file is currently open');
    }
  });
}

function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  // Map common extensions to their language identifiers
  const extensionMap: { [key: string]: string } = {
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'py': 'python',
    'rb': 'ruby',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'php': 'php',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'md': 'markdown',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'sql': 'sql',
    'sh': 'shell',
    'bash': 'bash',
    'txt': 'text'
  };

  return extensionMap[ext] || ext;
}
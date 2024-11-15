import React, { useState, useEffect, useRef } from 'react';
import { Loader2, FileCode, FolderOpen, ChevronRight, ChevronDown, Plus, Terminal as TerminalIcon } from 'lucide-react';
import Editor from "@monaco-editor/react";
import { Terminal, TerminalRef } from './Terminal';

interface CodePreviewProps {
  repoUrl: string;
  className?: string;
  onFileChange?: (path: string, content: string) => Promise<void>;
}

interface TreeNode {
  name: string;
  path: string;
  type: 'tree' | 'blob';
  children?: TreeNode[];
  content?: string;
}

interface FileOperation {
  path: string;
  status: 'loading' | 'saving' | 'done' | 'error';
  progress: number;
}

export function CodePreview({ repoUrl, className = '', onFileChange }: CodePreviewProps) {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [fileOperations, setFileOperations] = useState<Record<string, FileOperation>>({});
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [showTerminal, setShowTerminal] = useState(true);
  const terminalRef = useRef<TerminalRef>(null);
  const [currentDirectory, setCurrentDirectory] = useState('/');

  useEffect(() => {
    const fetchRepoContent = async () => {
      try {
        setLoading(true);
        const [owner, repo] = repoUrl.split('/').slice(-2);
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`);
        const data = await response.json();
        
        const root: TreeNode[] = [];
        data.tree.forEach((item: any) => {
          const parts = item.path.split('/');
          let current = root;
          
          parts.forEach((part: string, index: number) => {
            const path = parts.slice(0, index + 1).join('/');
            const existing = current.find(node => node.name === part);
            
            if (!existing) {
              const node: TreeNode = {
                name: part,
                path,
                type: index === parts.length - 1 ? item.type : 'tree',
              };
              if (node.type === 'tree') {
                node.children = [];
              }
              current.push(node);
              current = node.children || [];
            } else {
              current = existing.children || [];
            }
          });
        });
        
        setTree(root);
        terminalRef.current?.writeOutput(`Repository cloned successfully: ${repoUrl}`);
        terminalRef.current?.writeOutput('Type "help" for available commands');
      } catch (error) {
        console.error('Error fetching repo content:', error);
        terminalRef.current?.writeOutput(`Error cloning repository: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRepoContent();
  }, [repoUrl]);

  const fetchFileContent = async (path: string) => {
    try {
      const [owner, repo] = repoUrl.split('/').slice(-2);
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
      const data = await response.json();
      const content = atob(data.content);
      setFileContent(content);
      setSelectedFile(path);
    } catch (error) {
      console.error('Error fetching file content:', error);
      terminalRef.current?.writeOutput(`Error fetching file content: ${error.message}`);
    }
  };

  const handleEditorChange = async (value: string | undefined) => {
    if (!selectedFile || !value || !onFileChange) return;
    
    try {
      setFileOperations(prev => ({
        ...prev,
        [selectedFile]: { path: selectedFile, status: 'saving', progress: 0 }
      }));
      
      await onFileChange(selectedFile, value);
      
      setFileOperations(prev => ({
        ...prev,
        [selectedFile]: { path: selectedFile, status: 'done', progress: 100 }
      }));
    } catch (error) {
      console.error('Error saving file:', error);
      setFileOperations(prev => ({
        ...prev,
        [selectedFile]: { path: selectedFile, status: 'error', progress: 0 }
      }));
    }
  };

  const handleCreateFile = async () => {
    if (!newFileName) return;
    
    try {
      const path = currentDirectory === '/' ? newFileName : `${currentDirectory}/${newFileName}`;
      await handleFileSystemOperation({
        type: 'create',
        path,
        timestamp: new Date(),
        user: 'current-user'
      }, terminalRef);
      
      setTree(prevTree => {
        const newTree = [...prevTree];
        const parts = path.split('/');
        let current = newTree;
        
        parts.forEach((part, index) => {
          if (index === parts.length - 1) {
            current.push({
              name: part,
              path,
              type: 'blob'
            });
          } else {
            let node = current.find(n => n.name === part);
            if (!node) {
              node = {
                name: part,
                path: parts.slice(0, index + 1).join('/'),
                type: 'tree',
                children: []
              };
              current.push(node);
            }
            current = node.children || [];
          }
        });
        
        return newTree;
      });
      
      setNewFileName('');
      setIsCreatingFile(false);
    } catch (error) {
      console.error('Error creating file:', error);
      terminalRef.current?.writeOutput(`Error creating file: ${error.message}`);
    }
  };
  // ... continuing from part 1 ...
  const getFileLanguage = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const languageMap: { [key: string]: string } = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      yaml: 'yaml',
      yml: 'yaml',
      xml: 'xml',
      sql: 'sql',
      sh: 'shell',
      bash: 'shell',
      php: 'php',
      go: 'go',
      rust: 'rust',
      rb: 'ruby',
      swift: 'swift',
      kt: 'kotlin',
      scala: 'scala',
      dart: 'dart',
      lua: 'lua',
      r: 'r',
      pl: 'perl',
      elm: 'elm',
      fs: 'fsharp',
      cmake: 'cmake',
      dockerfile: 'dockerfile',
    };
  
    return languageMap[extension] || 'plaintext';
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderTree = (nodes: TreeNode[], level: number = 0) => {
    return (
      <div className={level > 0 ? 'ml-4' : ''}>
        {nodes.map((node) => (
          <div key={node.path}>
            <div
              className={`flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer ${
                selectedFile === node.path ? 'bg-gray-100 dark:bg-gray-800' : ''
              }`}
              onClick={() => {
                if (node.type === 'tree') {
                  toggleFolder(node.path);
                } else {
                  fetchFileContent(node.path);
                }
              }}
            >
              {node.type === 'tree' ? (
                <>
                  {expandedFolders.has(node.path) ? (
                    <ChevronDown className="w-4 h-4 mr-1 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 mr-1 text-gray-500" />
                  )}
                  <FolderOpen className="w-4 h-4 mr-2 text-yellow-500" />
                </>
              ) : (
                <>
                  <FileCode className="w-4 h-4 mr-2 text-blue-500" />
                </>
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300">{node.name}</span>
              {fileOperations[node.path] && (
                <div className="ml-2">
                  {fileOperations[node.path].status === 'saving' && (
                    <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
                  )}
                </div>
              )}
            </div>
            {node.type === 'tree' && expandedFolders.has(node.path) && node.children && (
              renderTree(node.children, level + 1)
            )}
          </div>
        ))}
      </div>
    );
  };

  const executeCommand = async (command: string) => {
    try {
      const args = command.split(' ');
      const cmd = args[0];
  
      switch (cmd) {
        case 'help':
          terminalRef.current?.writeOutput(
            'Available commands:\n' +
            '  cd <path> - Change directory\n' +
            '  ls [path] - List files in directory\n' +
            '  pwd - Print working directory\n' +
            '  cat <file> - Display file contents\n' +
            '  clear - Clear the terminal\n' +
            '  npm install - Install dependencies\n' +
            '  npm start - Start the application\n' +
            '  npm run dev - Start development server\n' +
            '  git status - Show repository status\n' +
            '  help - Show this help message'
          );
          break;
  
        case 'cd':
          const newPath = args[1] || '/';
          if (!newPath) {
            setCurrentDirectory('/');
            terminalRef.current?.writeOutput('Changed directory to: /');
          } else if (newPath === '..') {
            const parts = currentDirectory.split('/').filter(Boolean);
            parts.pop();
            const parentDir = '/' + parts.join('/');
            setCurrentDirectory(parentDir);
            terminalRef.current?.writeOutput(`Changed directory to: ${parentDir}`);
          } else if (newPath === '/') {
            setCurrentDirectory('/');
            terminalRef.current?.writeOutput('Changed directory to: /');
          } else {
            // Handle both absolute and relative paths
            const targetPath = newPath.startsWith('/') 
              ? newPath 
              : `${currentDirectory === '/' ? '' : currentDirectory}/${newPath}`;
            
            // Check if directory exists
            const targetNode = findNodeByPath(tree, targetPath);
            if (targetNode && targetNode.type === 'tree') {
              setCurrentDirectory(targetPath);
              terminalRef.current?.writeOutput(`Changed directory to: ${targetPath}`);
            } else {
              terminalRef.current?.writeOutput(`Directory not found: ${targetPath}`);
            }
          }
          break;
  
        case 'ls':
          const lsPath = args[1] || currentDirectory;
          const targetNode = findNodeByPath(tree, lsPath);
          if (targetNode && targetNode.type === 'tree' && targetNode.children) {
            const files = targetNode.children
              .map(node => ({
                name: node.name,
                type: node.type === 'tree' ? 'd' : '-',
                path: node.path
              }))
              .sort((a, b) => {
                // Directories first, then files
                if (a.type !== b.type) return a.type === 'd' ? -1 : 1;
                return a.name.localeCompare(b.name);
              })
              .map(({ type, name }) => `${type} ${name}`);
            
            terminalRef.current?.writeOutput(`Contents of ${lsPath}:\n${files.join('\n')}`);
          } else {
            terminalRef.current?.writeOutput(`Cannot access '${lsPath}': No such directory`);
          }
          break;
  
        case 'pwd':
          terminalRef.current?.writeOutput(currentDirectory);
          break;
  
        case 'cat':
          const filePath = args[1];
          if (!filePath) {
            terminalRef.current?.writeOutput('Usage: cat <file>');
            break;
          }
  
          // Handle both absolute and relative paths
          const absolutePath = filePath.startsWith('/') 
            ? filePath 
            : `${currentDirectory === '/' ? '' : currentDirectory}/${filePath}`;
          
          const fileNode = findNodeByPath(tree, absolutePath);
          if (fileNode && fileNode.type === 'blob') {
            try {
              await fetchFileContent(absolutePath);
              terminalRef.current?.writeOutput(`Content of ${absolutePath}:\n${fileContent || ''}`);
            } catch (error) {
              terminalRef.current?.writeOutput(`Error reading file: ${error.message}`);
            }
          } else {
            terminalRef.current?.writeOutput(`File not found: ${absolutePath}`);
          }
          break;
  
        case 'clear':
          terminalRef.current?.clear();
          break;
  
        case 'npm':
          const npmCmd = args[1];
          switch (npmCmd) {
            case 'install':
              terminalRef.current?.writeOutput('Installing dependencies...');
              await simulateNpmCommand(3000);
              terminalRef.current?.writeOutput('✓ Dependencies installed successfully');
              break;
            
            case 'start':
            case 'run':
              if (args[2] === 'dev') {
                terminalRef.current?.writeOutput('Starting development server...');
                await simulateNpmCommand(2000);
                terminalRef.current?.writeOutput('✓ Development server running at http://localhost:3000');
              } else {
                terminalRef.current?.writeOutput('Starting application...');
                await simulateNpmCommand(2000);
                terminalRef.current?.writeOutput('✓ Application started successfully');
              }
              break;
  
            default:
              terminalRef.current?.writeOutput(`Unknown npm command: ${npmCmd}`);
          }
          break;
  
        case 'git':
          const gitCmd = args[1];
          switch (gitCmd) {
            case 'status':
              terminalRef.current?.writeOutput(
                'On branch main\n' +
                'Your branch is up to date with \'origin/main\'\n\n' +
                'nothing to commit, working tree clean'
              );
              break;
            default:
              terminalRef.current?.writeOutput(`Unknown git command: ${gitCmd}`);
          }
          break;
  
        default:
          terminalRef.current?.writeOutput(`Command not found: ${cmd}`);
      }
    } catch (error) {
      terminalRef.current?.writeOutput(`Error: ${error.message}`);
    }
  };
  
  const simulateNpmCommand = (duration: number) => {
    return new Promise(resolve => setTimeout(resolve, duration));
  };

  const findNodeByPath = (nodes: TreeNode[], path: string): TreeNode | null => {
  if (!path || path === '/') return { name: '/', path: '/', type: 'tree', children: nodes };
  
  const parts = path.split('/').filter(Boolean);
  let current: TreeNode[] = nodes;
  let result: TreeNode | null = null;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const found = current.find(node => node.name === part);
    
    if (!found) return null;
    
    if (i === parts.length - 1) {
      result = found;
    } else if (found.type === 'tree' && found.children) {
      current = found.children;
    } else {
      return null;
    }
  }

  return result;
};
  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Repository Files</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTerminal(!showTerminal)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <TerminalIcon className="w-4 h-4" />
                {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
              </button>
              <button
                onClick={() => setIsCreatingFile(true)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New File
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 flex min-h-0">
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
            {isCreatingFile && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="Enter file name..."
                  className="w-full p-2 border rounded-lg mb-2"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsCreatingFile(false)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateFile}
                    className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 text-primary-600 dark:text-primary-400 animate-spin" />
              </div>
            ) : (
              renderTree(tree)
            )}
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            {selectedFile ? (
              <div className="flex-1 min-h-0">
                <Editor
                  height="100%"
                  defaultLanguage={getFileLanguage(selectedFile)}
                  theme="vs-dark"
                  value={fileContent || ''}
                  onChange={handleEditorChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    readOnly: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                Select a file to view its contents
              </div>
            )}
          </div>
        </div>
      </div>
      {showTerminal && (
        <div className="h-64 border-t border-gray-200 dark:border-gray-700">
          <Terminal
            ref={terminalRef}
            onCommand={executeCommand}
            className="h-full"
          />
        </div>
      )}
    </div>
  );
}
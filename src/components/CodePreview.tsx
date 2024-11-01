import React, { useState, useEffect } from 'react';
import { Loader2, FileCode, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';

interface CodePreviewProps {
  repoUrl: string;
  className?: string;
}

interface TreeNode {
  name: string;
  path: string;
  type: 'tree' | 'blob';
  children?: TreeNode[];
}

export function CodePreview({ repoUrl, className = '' }: CodePreviewProps) {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchRepoContent = async () => {
      try {
        setLoading(true);
        const [owner, repo] = repoUrl.split('/').slice(-2);
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`
        );
        const data = await response.json();

        // Build tree structure
        const root: TreeNode[] = [];
        data.tree.forEach((item: any) => {
          const parts = item.path.split('/');
          let current = root;

          parts.forEach((part: string, index: number) => {
            const path = parts.slice(0, index + 1).join('/');
            const existing = current.find((node) => node.name === part);

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
      } catch (error) {
        console.error('Error fetching repo content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepoContent();
  }, [repoUrl]);

  const fetchFileContent = async (path: string) => {
    try {
      const [owner, repo] = repoUrl.split('/').slice(-2);
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
      );
      const data = await response.json();
      const content = atob(data.content);
      setFileContent(content);
    } catch (error) {
      console.error('Error fetching file content:', error);
      setFileContent('Error loading file content');
    }
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderTree = (nodes: TreeNode[], level = 0) => {
    return nodes
      .sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'tree' ? -1 : 1;
      })
      .map((node) => (
        <div key={node.path} style={{ paddingLeft: `${level * 16}px` }}>
          {node.type === 'tree' ? (
            <button
              onClick={() => toggleFolder(node.path)}
              className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-left"
            >
              {expandedFolders.has(node.path) ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <FolderOpen className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{node.name}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedFile(node.path);
                fetchFileContent(node.path);
              }}
              className={`flex items-center gap-2 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg ${
                selectedFile === node.path ? 'bg-primary-50 dark:bg-primary-900/20' : ''
              }`}
            >
              <FileCode className="w-4 h-4 text-primary-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{node.name}</span>
            </button>
          )}
          {node.children && expandedFolders.has(node.path) && renderTree(node.children, level + 1)}
        </div>
      ));
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Repository Files</h3>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 text-primary-600 dark:text-primary-400 animate-spin" />
            </div>
          ) : (
            renderTree(tree)
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {selectedFile ? (
            <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200 overflow-auto">
              {fileContent}
            </pre>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              Select a file to view its contents
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
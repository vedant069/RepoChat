import os
import logging
from typing import List, Dict, Generator
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class FileInfo:
    path: str
    content: str
    size: int
    metadata: str = ""

class FileProcessor:
    def __init__(self):
        self.ignored_directories = {
            '.git', '__pycache__', 'node_modules', 'venv', 'env',
            'dist', 'build', 'target', 'bin', 'obj', 'out'
        }
        self.code_extensions = {
            '.py', '.java', '.cpp', '.c', '.cs', '.go', '.rb', '.php',
            '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
            '.html', '.css', '.scss', '.sass', '.txt', '.sh', '.bash',
            '.json', '.yaml', '.yml', '.toml', '.ini',
            '.tf', '.hcl', 'Dockerfile', '.dockerignore', '.md'
        }

    def is_valid_file(self, file_path: str, max_size_mb: int = 1) -> bool:
        """Check if file is valid for processing."""
        if os.path.getsize(file_path) > max_size_mb * 1024 * 1024:
            return False

        _, ext = os.path.splitext(file_path)
        file_name = os.path.basename(file_path)
        
        if ext.lower() not in self.code_extensions and file_name not in {'Dockerfile'}:
            return False

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                f.read(1024)
            return True
        except (UnicodeDecodeError, IOError):
            return False

    def read_file_content(self, file_path: str) -> str:
        """Read and return file content."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error reading file {file_path}: {str(e)}")
            return ""

    def iterate_repository_files(self, repo_path: str) -> Generator[FileInfo, None, None]:
        """Iterate through repository files one at a time."""
        for root, dirs, files in os.walk(repo_path):
            dirs[:] = [d for d in dirs if d not in self.ignored_directories]
            
            for file in files:
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, repo_path)
                
                if not self.is_valid_file(file_path):
                    continue
                    
                content = self.read_file_content(file_path)
                if not content.strip():
                    continue
                    
                yield FileInfo(
                    path=relative_path,
                    content=content,
                    size=os.path.getsize(file_path)
                )
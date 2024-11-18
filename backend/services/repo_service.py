import git
import os
import tempfile
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)

class RepoService:
    def __init__(self):
        self.repo_data = {}
        self.temp_dir = tempfile.mkdtemp()

    def clone_repository(self, repo_url: str) -> str:
        """Clone repository and return the path."""
        try:
            parsed_url = urlparse(repo_url)
            if not parsed_url.scheme or not parsed_url.netloc:
                raise ValueError("Invalid repository URL")

            repo_name = os.path.splitext(parsed_url.path.split('/')[-1])[0]
            repo_path = os.path.join(self.temp_dir, repo_name)

            git.Repo.clone_from(repo_url, repo_path)
            logger.info(f"Repository cloned successfully: {repo_name}")
            return repo_path

        except Exception as e:
            logger.error(f"Error cloning repository: {str(e)}")
            raise

    def store_repo_data(self, chat_id: str, data: dict):
        """Store repository data for a chat session."""
        self.repo_data[chat_id] = data

    def get_repo_data(self, chat_id: str) -> dict:
        """Get repository data for a chat session."""
        return self.repo_data.get(chat_id)

    def get_repository_files(self, chat_id: str) -> list:
        """Get list of files in the repository."""
        repo_data = self.repo_data.get(chat_id)
        if not repo_data:
            return []
        return [metadata['path'] for metadata in repo_data['files_metadata']]
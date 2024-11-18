import ollama
import logging
from typing import List, Dict
from services.file_processor import FileInfo
import os
from dotenv import load_dotenv


logger = logging.getLogger(__name__)
load_dotenv("../.env")
class LLMService:
    def _init_(self):
        self.OLLAMA_URL = os.getenv("OLLAMA_URL")
        self.ollama_client = ollama.Client(host=self.OLLAMA_URL)
        self.metadata_cache = {}

    def _get_language_specific_prompt(self, file_path: str) -> str:
        """Get language-specific prompt for metadata generation."""
        ext = file_path.split('.')[-1].lower() if '.' in file_path else ''
        
        prompts = {
            'py': """Analyze this Python file and provide metadata in this format:
name: {file_path}
imports: [list all imports]
classes: [list all classes with their purpose]
functions: [list all functions with parameters and return values]
dependencies: [list external package dependencies]
brief: [3-line summary of the file's purpose]""",
            
            'js': """Analyze this JavaScript file and provide metadata in this format:
name: {file_path}
imports: [list all imports/requires]
exports: [list exported items]
components: [list React components if any]
functions: [list all functions with parameters and return values]
dependencies: [list package dependencies]
brief: [3-line summary of the file's purpose]""",
            
            'ts': """Analyze this TypeScript file and provide metadata in this format:
name: {file_path}
imports: [list all imports]
interfaces: [list all interfaces with descriptions]
types: [list all type definitions]
components: [list React components if any]
functions: [list all functions with type signatures]
dependencies: [list package dependencies]
brief: [3-line summary of the file's purpose]""",
            
            'java': """Analyze this Java file and provide metadata in this format:
name: {file_path}
package: [package name]
imports: [list all imports]
classes: [list all classes with their purpose]
interfaces: [list all interfaces]
methods: [list all methods with signatures]
dependencies: [list external dependencies]
brief: [3-line summary of the file's purpose]""",
        }
        
        default_prompt = f"""Analyze this code file and provide metadata in this format:
name: {file_path}
imports: [list any imports or dependencies]
functions: [list main functions/methods with signatures]
dependencies: [list external dependencies]
brief: [3-line summary of the file's purpose]"""
        
        return prompts.get(ext, default_prompt)

    def process_file_iteratively(self, file_info: FileInfo) -> FileInfo:
        """Process a single file and generate its metadata."""
        try:
            metadata = self.generate_file_metadata(file_info)
            file_info.metadata = metadata
            logger.info(f"Successfully processed file: {file_info.path}")
            return file_info
        except Exception as e:
            logger.error(f"Error processing file {file_info.path}: {str(e)}")
            file_info.metadata = f"name: {file_info.path}\nbrief: Error processing file"
            return file_info

    def generate_file_metadata(self, file_info: FileInfo) -> str:
        """Generate structured metadata for a single file using llama2 3B."""
        try:
            if file_info.path in self.metadata_cache:
                return self.metadata_cache[file_info.path]

            prompt = self._get_language_specific_prompt(file_info.path)
            
            response = self.ollama_client.chat(
                model='llama3.2:3b',
                messages=[{
                    "role": "system",
                    "content": """You are an expert code analyzer specializing in generating structured metadata.
                    Focus on identifying key components, dependencies, and relationships between different parts of the code.
                    Provide detailed but concise descriptions that will help in understanding the file's role in the project."""
                }, {
                    "role": "user",
                    "content": f"{prompt}\n\nCode:\n{file_info.content}"
                }]
            )
            
            metadata = response['message']['content']
            self.metadata_cache[file_info.path] = metadata
            return metadata
        except Exception as e:
            logger.error(f"Error generating file metadata: {str(e)}")
            return f"name: {file_info.path}\nbrief: Error generating metadata"

    def get_relevant_files(self, initial_prompt: str, query: str, files: List[FileInfo]) -> List[FileInfo]:
        """Determine relevant files for the query using code2 model."""
        try:
            system_prompt = """You are a senior software engineer with expertise in code analysis and architecture.
            Your task is to identify ALL files that are:
            1. Directly relevant to implementing or modifying the requested changes
            2. Dependencies that might be affected by the changes
            3. Configuration files that might need updating
            4. Test files that should be modified or created
            5. Related utility files that might be helpful

            Analyze the repository structure and file metadata carefully.
            Output ONLY the file paths, one per line, without any additional text or explanations.
            Include files that might need modification, even if not directly mentioned in the query."""
            
            response = self.ollama_client.chat(
                model='code2',
                messages=[{
                    "role": "system",
                    "content": system_prompt
                }, {
                    "role": "user",
                    "content": f"Repository structure and metadata:\n{initial_prompt}\n\nDevelopment Task: {query}\n\nList all potentially relevant file paths:"
                }]
            )
            
            relevant_paths = [
                path.strip()
                for path in response['message']['content'].split('\n')
                if path.strip() and not path.startswith(('Here', 'The', '-', '*', '1.', '2.'))
            ]
            
            return [
                file_info
                for file_info in files
                if file_info.path in relevant_paths
            ]
        except Exception as e:
            logger.error(f"Error getting relevant files: {str(e)}")
            return []

    def generate_response(self, relevant_files: List[FileInfo], query: str, conversation_history: str) -> str:
        """Generate final response using code2 model with focused context."""
        try:
            files_context = "\n\n".join([
                f"=== {file_info.path} ===\n{file_info.content}"
                for file_info in relevant_files
            ])
            
            system_prompt = """You are a senior software engineer with extensive experience in software development and architecture.
            Your task is to:
            1. Analyze the provided code files thoroughly
            2. Understand the current implementation and architecture
            3. Provide detailed, production-ready solutions
            4. Consider edge cases and potential issues
            5. Follow best practices and design patterns
            6. Maintain consistency with the existing codebase
            7. Consider performance implications
            8. Suggest necessary tests or validation steps

            When providing solutions:
            - Write complete, production-ready code
            - Include clear explanations of your changes
            - Highlight any potential risks or considerations
            - Suggest related improvements if relevant
            - Maintain existing code style and conventions
            - Consider backward compatibility
            - Focus on maintainability and scalability"""
            
            messages = [{
                "role": "system",
                "content": f"{system_prompt}\n\nAvailable files:\n{files_context}"
            }]

            if conversation_history:
                for line in conversation_history.split('\n'):
                    if line.startswith('User: '):
                        messages.append({"role": "user", "content": line[6:]})
                    elif line.startswith('Assistant: '):
                        messages.append({"role": "assistant", "content": line[11:]})

            messages.append({
                "role": "user", 
                "content": f"Development Task: {query}\n\nProvide a detailed solution with production-ready code changes."
            })

            response = self.ollama_client.chat(model='code2', messages=messages)
            return response['message']['content']
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return "Sorry, I encountered an error while generating the response."
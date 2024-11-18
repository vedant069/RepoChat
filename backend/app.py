from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from services.repo_service import RepoService
from services.llm_service import LLMService
from services.file_processor import FileProcessor, FileInfo

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize services
repo_service = RepoService()
llm_service = LLMService()
file_processor = FileProcessor()


@app.route("/load-repo", methods=["POST"])
def load_repo():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        repo_url = data.get("repo_url")
        chat_id = data.get("chat_id")

        if not repo_url or not chat_id:
            return jsonify({"error": "repo_url and chat_id are required"}), 400

        # Clone repository
        repo_path = repo_service.clone_repository(repo_url)

        # Process files iteratively
        processed_files = []
        initial_prompt = ["Repository Structure and Contents:\n"]

        for file_info in file_processor.iterate_repository_files(repo_path):
            processed_file = llm_service.process_file_iteratively(file_info)
            processed_files.append(processed_file)
            initial_prompt.append(
                f"\nFile: {processed_file.path}\nMetadata: {processed_file.metadata}\n"
            )

        initial_prompt_str = "\n".join(initial_prompt)
        # llm_service.save_initial_prompt(initial_prompt_str, chat_id)

        repo_service.store_repo_data(
            chat_id,
            {
                "repo_path": repo_path,
                "files": processed_files,
                "initial_prompt": initial_prompt_str,
            },
        )
        logging.info(f"Repository loaded successfully: {repo_url}")

        return jsonify({"status": "success"})

    except Exception as e:
        logger.error(f"Error in load_repo: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/chat", methods=["POST"])
def chat_endpoint():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        query = data.get("query")
        chat_id = data.get("chat_id")
        conversation_history = data.get("conversation_history", "")

        if not query or not chat_id:
            return jsonify({"error": "query and chat_id are required"}), 400

        # Get repository data
        repo_data = repo_service.get_repo_data(chat_id)
        if not repo_data:
            return jsonify({"error": "Repository not loaded"}), 400

        # Get relevant files and their paths
        relevant_files, selected_files = llm_service.get_relevant_files(
            repo_data["initial_prompt"], query, repo_data["files"]
        )

        # Generate final response
        response = llm_service.generate_response(
            relevant_files, query, conversation_history
        )

        return jsonify(
            {
                "response": response,
                "selectedFiles": selected_files,  # Add selected files to response
            }
        )

    except Exception as e:
        logger.error(f"Error in chat_endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/files", methods=["POST"])
def get_files():
    """Get list of files in the repository for a specific chat."""
    try:
        data = request.json
        if not data or "chat_id" not in data:
            return jsonify({"error": "chat_id is required"}), 400

        chat_id = data["chat_id"]

        # Get repository data using RepoService
        repo_data = repo_service.get_repo_data(chat_id)
        if not repo_data:
            return jsonify({"files": []})

        # Extract file paths from processed files
        files = [file.path for file in repo_data.get("files", [])]

        return jsonify({"files": sorted(files)})

    except Exception as e:
        logger.error(f"Error getting files: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)

# File: backend/app.py
import os
# import ssl # REMOVED - Do not disable SSL verification
import base64
import logging
from flask import Flask, request, jsonify
from openai import OpenAI, APIError # Import specific errors if needed
from dotenv import load_dotenv, find_dotenv
from flask_cors import CORS
from PIL import Image
import io

# --- Debugging: Print Current Working Directory ---
# Keep this for debugging path issues if needed
logger = logging.getLogger(__name__) # Define logger early to use it
logger.info(f"Script Current Working Directory: {os.getcwd()}")

# --- Explicitly find and load the .env file ---
# find_dotenv() searches current and parent directories
dotenv_path = find_dotenv()
if dotenv_path:
    logger.info(f"Loading .env file from: {dotenv_path}")
    load_dotenv(dotenv_path=dotenv_path)
else:
    logger.warning(".env file not found. Ensure it's in the project root or backend directory and accessible.")

# --- Configuration & Setup ---

# REMOVED: Never disable SSL verification globally
# ssl._create_default_https_context = ssl._create_unverified_context

# Initialize Flask app
app = Flask(__name__)
# TODO: Restrict origins in production!
CORS(app, resources={r"/api/*": {"origins": "*"}})
# Use a fallback for SECRET_KEY, but it's better if it's always set in .env
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
if not app.config['SECRET_KEY']:
    logger.warning("Flask SECRET_KEY not found in environment variables. Using insecure default.")
    app.config['SECRET_KEY'] = 'dev-secret-key-insecure-fallback' # Fallback ONLY for dev if .env missing

# Setup logging (moved logger definition up)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- Standard OpenAI Client Initialization ---
client = None # Initialize client to None
try:
    openai_key = os.getenv("OPENAI_API_KEY")
    openai_model = os.getenv("OPENAI_MODEL_NAME", "gpt-4o") # Default model

    # Ensure required variables are loaded
    if not openai_key:
        raise ValueError("Missing required environment variable: OPENAI_API_KEY")
    # SECRET_KEY checked above for Flask config

    # Initialize the standard OpenAI client
    client = OpenAI(api_key=openai_key)

    logger.info(f"OpenAI client initialized successfully for model '{openai_model}'.")

except ValueError as ve:
    logger.error(f"Configuration Error: {ve}")
    # Keep client as None
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {e}", exc_info=True)
    # Keep client as None

# --- Routes ---

@app.route('/')
def health_check():
    # Check if client initialized correctly here too for a more informative health check
    status = "running" if client else "degraded (AI client init failed)"
    return f"Zenspacia Prompt Generation Backend (Standard OpenAI) is {status}!"

@app.route('/api/generate-prompt', methods=['POST'])
def generate_prompt_route():
    # Check client initialization status on each request
    if client is None:
         logger.error("API call attempted, but OpenAI client is not initialized.")
         # 503 Service Unavailable is appropriate
         return jsonify({'error': 'Server configuration error: AI service unavailable.'}), 503

    # Get model name (usually configured once, but okay to get again)
    openai_model = os.getenv("OPENAI_MODEL_NAME", "gpt-4o")

    # --- Request Handling (Multipart Form Data) ---
    if 'image' not in request.files:
        logger.warning("API call missing 'image' file part.")
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']
    description = request.form.get('requirements', '') # Optional
    style = request.form.get('style', '') # Required? Assume yes for now

    if file.filename == '':
        logger.warning("API call received empty filename for image upload.")
        return jsonify({'error': 'No image selected'}), 400
    if not style: # Make style explicitly required
        logger.warning("API call missing 'style' form parameter.")
        return jsonify({'error': 'Missing required parameter: style'}), 400

    # --- Image Processing ---
    try:
        img = Image.open(file.stream)

        # Optional: Resize image if needed (consider max size for API/cost)
        # max_size = (1024, 1024)
        # img.thumbnail(max_size, Image.Resampling.LANCZOS)

        # Determine a safe format for saving and data URI
        img_format = img.format.lower() if img.format else 'jpeg' # Default to jpeg if format unknown
        if img_format not in ['jpeg', 'png', 'gif', 'webp']:
             logger.warning(f"Unsupported image format received: {img_format}. Converting to PNG.")
             save_format = 'png' # Convert unsupported formats to PNG
        elif img_format == 'gif':
             logger.info("Converting GIF to PNG for API compatibility.")
             save_format = 'png' # Convert GIF to PNG
        else:
             save_format = img_format # Use original format (jpeg, png, webp)

        # Convert image to bytes, ensuring RGB mode if saving as JPEG
        if save_format == 'jpeg' and img.mode != 'RGB':
            logger.info(f"Converting image mode '{img.mode}' to RGB for JPEG saving.")
            img = img.convert('RGB')

        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format=save_format.upper()) # PIL format names are upper
        image_bytes = img_byte_arr.getvalue()

        # Create Base64 Data URI
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        # Use standard MIME types
        mime_type = f"image/{save_format}" if save_format != 'jpeg' else 'image/jpeg'
        data_uri = f"data:{mime_type};base64,{base64_image}"

        logger.info(f"Image received and encoded (saved as {save_format}, size: {len(image_bytes)} bytes).")

    except Exception as img_e:
        logger.error(f"Error processing image file: {img_e}", exc_info=True)
        return jsonify({'error': 'Could not process the provided image file. It might be corrupted or in an unexpected format.'}), 400


    # --- Constructing the Prompt for GPT-4 Vision ---
    # (Keep your detailed prompt structure)
    gpt4v_prompt = f"""Analyze the provided image of a room in detail. Consider its layout, existing objects (furniture, decor), lighting, colors, textures, perceived dimensions, and overall current style.
Based on this analysis AND the user's request, generate a highly detailed and effective text prompt suitable for an AI image generation model (like DALL-E 3 or Stable Diffusion).
The goal of the generated prompt is to guide the AI image generator to create a photorealistic redesign of THIS SPECIFIC room.

User's Request:
- Desired Style: {style}
- Additional Requirements: {description if description else 'None specified.'}

The output prompt should:
- Describe the redesigned room vividly.
- Specify the '{style}' style elements clearly.
- Incorporate the user's additional requirements if provided.
- Mention key furniture placements, color palettes, lighting characteristics, materials, and decor elements for the redesigned space.
- Aim for photorealism and high quality.
- Be structured as a cohesive paragraph or series of descriptive sentences.

Generate ONLY the prompt text itself, ready to be used in an image generation model."""
    logger.info(f"Constructed prompt for OpenAI Vision model (Style: {style}).")


    # --- Call Standard OpenAI GPT-4 Vision ---
    try:
        response = client.chat.completions.create(
            model=openai_model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert interior designer assistant specializing in analyzing room images and generating detailed text prompts for AI image generation models to redesign those rooms."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": gpt4v_prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": data_uri,
                                "detail": "high" # Use "high" for best analysis, "low" maybe for speed/cost test
                            }
                        }
                    ]
                }
            ],
            max_tokens=800, # Increased slightly, adjust as needed
            temperature=0.6 # Slightly higher temp might give more creative results, adjust
        )
        # Ensure content exists before accessing
        if response.choices and response.choices[0].message and response.choices[0].message.content:
             generated_prompt_text = response.choices[0].message.content.strip()
             logger.info(f"Successfully received generated prompt from OpenAI model '{openai_model}'.")
             # logger.debug(f"Generated Prompt: {generated_prompt_text}") # Uncomment for debugging
             return jsonify({'generated_prompt': generated_prompt_text})
        else:
             logger.error("OpenAI response was missing expected content.")
             return jsonify({'error': 'AI service returned an empty or invalid response.'}), 500


    # Catch specific OpenAI errors if possible, fallback to generic Exception
    except APIError as api_e: # Catch OpenAI specific errors
        logger.error(f"OpenAI API Error: Status={api_e.status_code}, Message={api_e.message}", exc_info=True)
        # Provide a more user-friendly error based on status code if desired
        error_message = f"AI service error: {api_e.message}"
        status_code = api_e.status_code if api_e.status_code else 500
        return jsonify({'error': error_message}), status_code
    except Exception as e: # Catch other potential errors (network, etc.)
        logger.error(f"Error during OpenAI API call: {e}", exc_info=True)
        error_message = f"Failed to generate prompt due to an unexpected server error."
        return jsonify({'error': error_message}), 500


# --- Run the App ---
if __name__ == '__main__':
    logger.info("Starting Zenspacia Flask server (Standard OpenAI)...")
    # Get host and port from environment variables or use defaults
    host = os.getenv('FLASK_RUN_HOST', 'localhost') # Default to localhost
    port = int(os.getenv('FLASK_RUN_PORT', '5001')) # Default to 5001
    # Get debug mode from environment variable, default to False for safety
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() in ['true', '1', 't']

    logger.info(f"Running on http://{host}:{port} with debug mode: {debug_mode}")
    app.run(host=host, port=port, debug=debug_mode)
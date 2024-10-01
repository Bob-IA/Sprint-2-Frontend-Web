import vertexai
import os
from google.cloud import aiplatform
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from vertexai.generative_models import GenerativeModel, SafetySetting

# Ruta al archivo de credenciales
credenciales_path = 'cuenta-servicio-gcp.json'

# Verificar que el archivo de credenciales existe
if not os.path.exists(credenciales_path):
    raise FileNotFoundError(f"El archivo {credenciales_path} no se encontró.")

# Configurar la variable de entorno para las credenciales de Google
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credenciales_path

# Verificar que la variable de entorno esté establecida
print("GOOGLE_APPLICATION_CREDENTIALS:", os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))

# Inicializar el cliente de Vertex AI
aiplatform.init()

app = Flask(__name__)
CORS(app)  # Habilitar CORS para todas las rutas

# Función para cargar el archivo CSV
def cargar_datos(archivo_path):
    return pd.read_csv(archivo_path)

# Función para generar respuesta con Vertex AI
def generate(texto_usuario, archivo):
    try:
        vertexai.init(project="tss-1s2024", location="us-central1")
        
        # Leer los datos del archivo CSV
        df = pd.read_csv(archivo)
        print("Datos del CSV cargados correctamente")
        print("Columnas del CSV:", df.columns)

        # Verificar si las columnas 'Nombre del Producto', 'SKU' y 'Marca' existen
        if 'Nombre del Producto' not in df.columns:
            raise ValueError("La columna 'Nombre del Producto' no se encontró en el archivo CSV")
        if 'SKU' not in df.columns:
            raise ValueError("La columna 'SKU' no se encontró en el archivo CSV")
        if 'Marca' not in df.columns:
            raise ValueError("La columna 'Marca' no se encontró en el archivo CSV")

        # Filtrar productos que coinciden con el nombre ingresado
        productos_encontrados = df[df['Nombre del Producto'].str.contains(texto_usuario, case=False, na=False)]
        productos_encontrados_sku = productos_encontrados['SKU'].tolist()

        if not productos_encontrados.empty:
            print("Productos encontrados:", productos_encontrados)
        else:
            print("El producto no se encontró.")
        
        # Crear el prompt para buscar productos similares
        prompt = f"""
        Dado un archivo CSV con productos que contiene las columnas 'Nombre del Producto', 'Marca' y 'SKU',
        el usuario está buscando el producto: '{texto_usuario}'. 
        Responde con productos similares que cumplan la misma función,sea de diferente marca, tamaño o color(estas caracteristicas estan en el nombre de los productos, fijate en eso) que el producto buscado en el archivo .csv, 
        excluyendo los productos ya encontrados, tienes que responder los productos similares asi: nombre:,marca: y SKU: .Si no se encuentran productos similares, simplemente indica que no hay productos similares.

        Estoy buscando productos que cumplan la misma función que otro producto. 
        El producto base es el nombre de producto que uno busca en productos encontrados y quiero encontrar productos similares. 
        Los productos similares deben cumplir los siguientes criterios:
        1. Deben realizar la misma función que el producto base.
        2. Pueden ser de diferentes marcas o tamaños.
        3. Si no hay productos similares exactos, devuélveme productos con características lo más cercanas posibles.
        Por ejemplo, si el producto es "Lija para metal grano 150", los productos similares serían "Lija para metal grano 180" o "Lija para metal grano 50", ya que cumplen la misma función, aunque sean de diferentes grosores o marcas.

        Archivo CSV contiene los siguientes productos:
        {df[['Nombre del Producto', 'Marca', 'SKU']].to_csv(index=False)}

        Pregunta del usuario: {texto_usuario}
        """

        # Configuración de generación
        generation_config = {
            "max_output_tokens": 8192,
            "temperature": 0.1,
            "top_p": 0.95,
        }

        safety_settings = [
            SafetySetting(
                category=SafetySetting.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            ),
            SafetySetting(
                category=SafetySetting.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            ),
            SafetySetting(
                category=SafetySetting.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            ),
            SafetySetting(
                category=SafetySetting.HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            ),
        ]
        
        model = GenerativeModel("gemini-1.5-flash-001")
        responses = model.generate_content(
            [prompt],
            generation_config=generation_config,
            safety_settings=safety_settings,
            stream=True,
        )

        # Inicializar la variable response_text
        response_text = ""
        for response in responses:
            response_text += response.text

        # Filtrar la respuesta para evitar duplicados
        productos_similares = [line for line in response_text.split('\n') if line.strip() and not any(sku in line for sku in productos_encontrados_sku)]

        return productos_encontrados.to_dict(orient='records'), productos_similares
    except Exception as e:
        print("Error en la función generate:", str(e))
        raise

# Ruta para subir el archivo CSV y consultar productos
@app.route('/procesar_csv', methods=['POST'])
def procesar_csv():
    try:
        # Obtener el archivo y el nombre del producto desde la solicitud
        if 'archivo' not in request.files:
            return jsonify({"error": "No se encontró el archivo"}), 400
        
        archivo = request.files['archivo']
        nombre_producto = request.form.get('nombre_producto')

        if not nombre_producto:
            return jsonify({"error": "El nombre del producto es requerido"}), 400

        print("Archivo y nombre del producto recibidos correctamente")

        productos_encontrados, productos_similares = generate(nombre_producto, archivo)
        return jsonify({
            "productos_encontrados": productos_encontrados,
            "productos_similares": productos_similares
        }), 200
    except Exception as e:
        print("Error en la ruta /procesar_csv:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
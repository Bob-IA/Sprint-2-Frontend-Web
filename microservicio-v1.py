import os
import json
import pandas as pd
import csv
import unicodedata
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import vertexai
from vertexai.generative_models import GenerativeModel, SafetySetting
from google.oauth2 import service_account
import io

# Cargar las variables del archivo .env
load_dotenv()

# Obtener las variables del .env
PROJECT_ID = os.getenv("VERTEXAI_PROJECT_ID")
LOCATION = os.getenv("VERTEXAI_LOCATION")
GOOGLE_CREDENTIALS_JSON = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")

# Parsear las credenciales desde el JSON almacenado en la variable de entorno
credentials_info = json.loads(GOOGLE_CREDENTIALS_JSON)
credentials = service_account.Credentials.from_service_account_info(credentials_info)

# Crear la aplicación Flask
app = Flask(__name__)
CORS(app)  # Habilitar CORS para todas las rutas

# Cargar el archivo CSV local de productos
csv_file_path = 'productos.csv'
df_local = pd.read_csv(csv_file_path)

# Función para normalizar cadenas y eliminar acentos
def normalizar_texto(texto):
    return ''.join(
        c for c in unicodedata.normalize('NFD', texto)
        if unicodedata.category(c) != 'Mn'
    ).lower()

# Función para cargar los datos desde el archivo CSV de búsqueda subido
def cargar_datos(csv_file):
    return pd.read_csv(io.StringIO(csv_file.decode("utf-8")))

# Función para buscar productos exactos en el DataFrame
def buscar_productos_exactos(productos_buscar, df):
    productos_encontrados = pd.DataFrame()
    for producto in productos_buscar:
        encontrados = df[df['nombre'].str.contains(producto, case=False, na=False)]
        productos_encontrados = pd.concat([productos_encontrados, encontrados], ignore_index=True)
    
    return productos_encontrados

# Función para cargar nombres de búsqueda desde un archivo CSV subido
def cargar_nombres_de_busqueda(csv_file):
    nombres = []
    lector_csv = csv.reader(io.StringIO(csv_file.decode("utf-8")))
    for fila in lector_csv:
        nombres.append(fila[0])  # Suponiendo que cada fila tiene un nombre de producto
    return nombres

# Función para generar productos similares usando IA
def generar_productos_similares(productos_buscar, df):
    model = GenerativeModel("gemini-1.5-flash-001")
    
    # Crear el prompt para la IA
    prompt = f"""
    Dado un archivo CSV con productos que contiene las columnas 'nombre', 'marca' y 'sku',
    el usuario está buscando los productos: '{', '.join(productos_buscar)}'. 
    Entiende que los productos pueden tener nombres diferentes en varios países de Latinoamérica. 
    Por ejemplo, 'atornillador' es lo mismo que 'destornillador', 'punta phillips' también puede ser 'punta cruz', 
    'clavo' también puede ser 'puntilla', 'taladro' también puede ser 'perforadora', 'llave inglesa' puede ser 'llave ajustable', 
    'carretilla' también puede ser 'carrucha', y así sucesivamente. 
    Responde con productos similares que cumplan la misma función (que sean de la misma categoría del producto buscado), 
    pero sean de diferente marca, tamaño o color, evitando responder con duplicados de los productos exactos encontrados. 
    Responde así: Sku: , Nombre: y Marca:
    El archivo CSV contiene los siguientes productos:
    {df[['nombre', 'marca', 'sku']].to_csv(index=False)}
    Pregunta del usuario: {', '.join(productos_buscar)}
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
            category=SafetySetting.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        ),
        SafetySetting(
            category=SafetySetting.HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        ),
    ]
    
    responses = model.generate_content(
        [prompt],
        generation_config=generation_config,
        safety_settings=safety_settings,
        stream=True,
    )

    response_text = ""
    for response in responses:
        response_text += response.text

    return response_text

# Función principal para generar respuesta usando el archivo local o subido
def generate(texto_usuario, df):
    vertexai.init(project=PROJECT_ID, location=LOCATION, credentials=credentials)
    
    # Separar los productos ingresados
    productos_buscar = [p.strip() for p in texto_usuario.split(',')]
    
    # Buscar productos exactos en el CSV local o subido
    productos_encontrados = buscar_productos_exactos(productos_buscar, df)

    # Generar productos similares con la IA
    productos_similares_text = generar_productos_similares(productos_buscar, df)
    
    # Extraer productos similares de la respuesta generada por la IA
    productos_similares = pd.DataFrame(columns=['sku', 'nombre', 'marca'])
    for line in productos_similares_text.splitlines():
        if line.strip():  # Evitar líneas vacías
            parts = line.split(',')
            if len(parts) == 3:
                sku = parts[0].split(':')[1].strip()
                nombre = parts[1].split(':')[1].strip()
                marca = parts[2].split(':')[1].strip()
                productos_similares = pd.concat([productos_similares, pd.DataFrame({'sku': [sku], 'nombre': [nombre], 'marca': [marca]})], ignore_index=True)

    return productos_encontrados, productos_similares

# Ruta para realizar la búsqueda desde la barra de búsqueda o por archivo
@app.route('/procesar_busqueda', methods=['POST'])
def procesar_busqueda():
    try:
        # Obtener el nombre del producto o verificar si hay archivo CSV de búsqueda masiva
        nombre_producto = request.form.get('nombre_producto', None)
        archivo_busqueda = request.files.get('archivo', None)

        if not nombre_producto and not archivo_busqueda:
            return jsonify({"error": "Debe proporcionar un nombre de producto o un archivo de búsqueda"}), 400

        # Cargar productos desde el archivo local
        df = df_local

        if archivo_busqueda:
            # Si se sube un archivo de búsqueda, cargar los nombres de búsqueda desde el archivo CSV
            nombres_busqueda = cargar_nombres_de_busqueda(archivo_busqueda.read())
            nombre_producto = ','.join(nombres_busqueda)  # Unir todos los nombres para la búsqueda

        # Generar la respuesta usando el archivo CSV local
        productos_encontrados, productos_similares = generate(nombre_producto, df)

        # Enviar las respuestas como JSON
        return jsonify({
            "productos_encontrados": productos_encontrados.to_dict(orient='records'),
            "productos_similares": productos_similares.to_dict(orient='records')
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

import csv
import unicodedata
import vertexai
from vertexai.generative_models import GenerativeModel
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from google.auth import default
from google.auth.transport.requests import Request
from google.oauth2 import service_account

app = Flask(__name__)

CORS(app)  # Habilitar CORS para todas las rutas

# Cargar variables de entorno desde el archivo .env
from dotenv import load_dotenv
load_dotenv()

# Función para normalizar cadenas y eliminar acentos
def normalizar_texto(texto):
    return ''.join(
        c for c in unicodedata.normalize('NFD', texto)
        if unicodedata.category(c) != 'Mn'
    ).lower()

# Función para cargar productos desde un archivo CSV
def cargar_productos_desde_csv(ruta_archivo):
    productos = []
    try:
        with open(ruta_archivo, mode='r', encoding='utf-8') as archivo_csv:
            lector_csv = csv.DictReader(archivo_csv)
            for fila in lector_csv:
                productos.append({
                    "nombre_producto": fila["Nombre del Producto"],
                    "marca": fila["Marca"],
                    "sku": fila["SKU"],
                    "categoria": fila["categoria"],
                })
    except Exception as e:
        print(f"Error al cargar el archivo CSV de productos: {e}")
    return productos

# Función para cargar nombres de búsqueda desde un archivo CSV
def cargar_nombres_de_busqueda(ruta_archivo):
    nombres = []
    try:
        with open(ruta_archivo, mode='r', encoding='utf-8') as archivo_csv:
            lector_csv = csv.reader(archivo_csv)
            for fila in lector_csv:
                nombres.append(fila[0])  # Suponiendo que cada fila tiene un nombre de producto
    except Exception as e:
        print(f"Error al cargar el archivo CSV de búsqueda: {e}")
    return nombres

# Función para buscar productos que comiencen con el texto del usuario
def buscar_productos(productos, texto_usuario):
    texto_normalizado = normalizar_texto(texto_usuario)
    productos_encontrados = [
        producto for producto in productos
        if normalizar_texto(producto["nombre_producto"]).startswith(texto_normalizado)
    ]
    return productos_encontrados

# Función para buscar productos similares
def buscar_productos_similares(productos, categoria_producto, sku_excluido):
    productos_similares = [
        producto for producto in productos
        if producto["categoria"] == categoria_producto and producto["sku"] != sku_excluido
    ]
    return productos_similares

# Función para generar respuestas usando Vertex AI
def generar_respuesta(producto_encontrado, productos_similares):
    prompt = f"""
    Dado que estamos buscando el producto: '{producto_encontrado["nombre_producto"]}', 
    busca productos que realicen la misma función o que tengan otro nombre (sinónimo) en Latinoamérica, pero que sean de diferente marca, tamaño o color.
    Aquí está la lista de productos que tenemos disponibles en la categoría '{producto_encontrado["categoria"]}':
    {', '.join([f"SKU: {p['sku']}, Nombre: {p['nombre_producto']}, Marca: {p['marca']}" for p in productos_similares])}
    Evita que sean repetidos de los productos exactos.
    Responde solo con los productos que se encuentran en la lista proporcionada. 
    Estructura la respuesta así: SKU: , Nombre: , Marca:.
    """

    # Inicializar Vertex AI usando la cuenta de servicio y variables de entorno
    project_id = os.getenv('GOOGLE_CLOUD_PROJECT')
    location = os.getenv('GOOGLE_CLOUD_LOCATION')
    modelo_ia = os.getenv('GOOGLE_CLOUD_MODEL')

    # Autenticación con la cuenta de servicio
    credentials = service_account.Credentials.from_service_account_file(
        'C:\Users\Jose\Desktop\Front-Bob-IA\Sprint-2-Frontend-Web\tss-1s2024-28565b1a614d (1).json'  # Coloca aquí tu ruta
    )

    # Inicializar Vertex AI con el proyecto y la ubicación desde .env
    vertexai.init(project=project_id, location=location, credentials=credentials)

    # Generar respuesta de Gemini
    model = GenerativeModel(modelo_ia)
    generation_config = {
        "max_output_tokens": 2048,
        "temperature": 0.1,
        "top_p": 0.95,
    }

    responses = model.generate_content([prompt], generation_config=generation_config, stream=True)
    
    response_text = ""
    for response in responses:
        response_text += response.text.strip()
    
    return response_text

# Ruta para subir los archivos y realizar la búsqueda
@app.route('/upload', methods=['POST'])
def upload_files():
    if 'productos' not in request.files:
        return jsonify({"error": "Se requiere el archivo de productos."}), 400

    archivo_productos = request.files['productos']
    ruta_productos = "productos_temp.csv"
    archivo_productos.save(ruta_productos)

    # Cargar productos
    productos = cargar_productos_desde_csv(ruta_productos)

    resultados = []
    
    # Verificar si se proporcionó un nombre de producto en la solicitud
    nombres_productos = request.form.get('nombres_productos', None)
    
    if nombres_productos:
        # Si se proporcionan nombres de productos, dividir y realizar la búsqueda para cada uno
        lista_nombres = [nombre.strip() for nombre in nombres_productos.split(',')]
        
        for nombre_producto in lista_nombres:
            productos_encontrados = buscar_productos(productos, nombre_producto)

            if productos_encontrados:
                producto_encontrado = productos_encontrados[0]  # Tomar solo el primer encontrado
                categoria_producto = producto_encontrado["categoria"]
                sku_excluido = producto_encontrado["sku"]

                # Buscar productos similares
                productos_similares = buscar_productos_similares(productos, categoria_producto, sku_excluido)

                # Generar respuesta con IA
                respuesta_ia = generar_respuesta(producto_encontrado, productos_similares)

                resultados.append({
                    "producto_buscado": nombre_producto,
                    "producto_encontrado": {
                        "SKU": producto_encontrado['sku'],
                        "Nombre": producto_encontrado['nombre_producto'],
                        "Marca": producto_encontrado['marca'],
                    },
                    "productos_similares": respuesta_ia
                })
            else:
                resultados.append({
                    "producto_buscado": nombre_producto,
                    "error": "No se encontró ningún producto que coincida."
                })

    # Manejar la búsqueda masiva desde un archivo de búsqueda si se proporciona
    if 'busqueda' in request.files:
        archivo_busqueda = request.files['busqueda']
        ruta_busqueda = "busqueda_temp.csv"
        archivo_busqueda.save(ruta_busqueda)

        # Cargar nombres de búsqueda
        nombres_busqueda = cargar_nombres_de_busqueda(ruta_busqueda)

        for nombre_producto in nombres_busqueda:
            productos_encontrados = buscar_productos(productos, nombre_producto)

            if productos_encontrados:
                producto_encontrado = productos_encontrados[0]  # Tomar solo el primer encontrado
                categoria_producto = producto_encontrado["categoria"]
                sku_excluido = producto_encontrado["sku"]

                # Buscar productos similares
                productos_similares = buscar_productos_similares(productos, categoria_producto, sku_excluido)

                # Generar respuesta con IA
                respuesta_ia = generar_respuesta(producto_encontrado, productos_similares)

                resultados.append({
                    "producto_buscado": nombre_producto,
                    "producto_encontrado": {
                        "SKU": producto_encontrado['sku'],
                        "Nombre": producto_encontrado['nombre_producto'],
                        "Marca": producto_encontrado['marca'],
                    },
                    "productos_similares": respuesta_ia
                })
            else:
                resultados.append({
                    "producto_buscado": nombre_producto,
                    "error": "No se encontró ningún producto que coincida."
                })

    return jsonify(resultados)

if __name__ == "__main__":
    app.run(debug=True)

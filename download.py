from flask import Flask, request, jsonify, send_file
import csv
import io
from flask_cors import CORS  # Importar CORS para habilitar solicitudes desde otros orígenes

app = Flask(__name__)

# Habilitar CORS para todas las rutas
CORS(app, resources={r"/*": {"origins": "*"}})

# Ruta para descargar productos seleccionados como CSV
@app.route('/descargar-productos', methods=['POST'])
def descargar_productos():
    productos_seleccionados = request.json.get('productos', [])
    descargar_todo = request.json.get('descargar_todo', False)

    if not productos_seleccionados and not descargar_todo:
        return jsonify({"error": "No se han proporcionado productos para descargar."}), 400

    # Crear un archivo CSV en memoria
    output = io.StringIO()
    escritor_csv = csv.writer(output)

    # Escribir la cabecera del CSV
    escritor_csv.writerow(['SKU', 'Nombre', 'Marca', 'Categoría'])

    # Escribir los productos seleccionados
    for producto in productos_seleccionados:
        escritor_csv.writerow([
            producto.get('sku', ''),
            producto.get('nombre', ''),
            producto.get('marca', ''),
            producto.get('categoria', '')
        ])
    
    output.seek(0)

    # Devolver el archivo CSV como respuesta
    return send_file(io.BytesIO(output.getvalue().encode('utf-8')), 
                     mimetype='text/csv', 
                     as_attachment=True, 
                     attachment_filename='productos_seleccionados.csv')

if __name__ == '__main__':
    app.run(debug=True, port=5000)

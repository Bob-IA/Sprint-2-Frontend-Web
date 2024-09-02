import React from 'react';

function ConstructionMaterials({ materials }) {
    return (
      <div className="w-1/4 bg-gray-100 border-l border-gray-300 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Materiales</h2>
        <div>
          {materials.map((material, index) => (
            <div key={index} className="mb-4 flex items-center">
              <img src={material.photo} alt={material.name} className="w-24 h-24 object-contain mr-4" />
              <div>
                <h3 className="text-md font-medium">{material.name}</h3>
                <p>Cantidad: {material.quantity}</p>
                <p>SKU: {material.sku}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
export default ConstructionMaterials;
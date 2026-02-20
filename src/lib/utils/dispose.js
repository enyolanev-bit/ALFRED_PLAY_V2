/**
 * dispose.js — Pattern de libération mémoire GPU pour Three.js.
 *
 * Parcourt le graphe de scène et libère toutes les ressources :
 * geometries, materials, textures, ImageBitmap sources.
 * Essentiel pour éviter les fuites mémoire sur mobile.
 */

/**
 * Libère toutes les ressources GPU d'une scène Three.js.
 * Parcourt récursivement tous les enfants et dispose chaque ressource.
 *
 * @param {import('three').Object3D} object — L'objet racine à nettoyer
 */
export function disposeObject(object) {
  if (!object) return;

  object.traverse((child) => {
    // Dispose de la géométrie
    if (child.geometry) {
      child.geometry.dispose();
    }

    // Dispose des matériaux et de leurs textures
    if (child.material) {
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      for (const material of materials) {
        disposeMaterial(material);
      }
    }
  });

  // Vider tous les enfants de l'objet
  object.clear();
}

/**
 * Libère un matériau et toutes ses textures.
 *
 * @param {import('three').Material} material
 */
function disposeMaterial(material) {
  if (!material) return;

  // Parcourir toutes les propriétés du matériau
  for (const value of Object.values(material)) {
    if (value && value.isTexture) {
      disposeTexture(value);
    }
  }

  material.dispose();
}

/**
 * Libère une texture et sa source ImageBitmap si présente.
 *
 * @param {import('three').Texture} texture
 */
function disposeTexture(texture) {
  if (!texture) return;

  texture.dispose();

  // Libérer l'ImageBitmap sous-jacente (utilisée par createImageBitmap)
  if (texture.source?.data?.close) {
    texture.source.data.close();
  }
}

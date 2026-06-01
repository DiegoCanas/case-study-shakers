# Ejercicio E - CI/CD

## Decisiones

### CI App

- Las imágenes se construyen únicamente desde la rama main para garantizar que todo artefacto proviene de código mergeado y validado.
- Los test se lanzan cuando hay un evento de PR para validarlo de forma temprana.
- Se utiliza el SHA del commit como tag de la imagen para garantizar inmutabilidad

#### No utilizar el versionado semantico
Esta decision se ha tomado por las siguientes razones:
- Utilizar el SHA del commit para asegurar inmutabilidad
- No conocemos el tipo de modelo "Git" se utiliza, GitFlow, Trunk Based...
- En caso de añadir el versionado semantico se puede hacer al construir la imagen: `docker build -t $CI_REGISTRY_IMAGE:CI_COMMIT_TAG-$CI_COMMIT_SHA .`

---

### CI/CD Terraform

- Separación clara entre `plan` (PR) y `apply` (main).
- `terraform fmt`, `validate` y `plan` se ejecutan cuando hay un evento de MR para tener un feedback temprano.
- `apply` requiere aprobación manual en main para evitar cambios accidentales en producción.
- Secretos gestionados mediante variables seguras.

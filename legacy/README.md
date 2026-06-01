# legacy/ — para la Parte B (Fix-it PR)

Esta carpeta contiene configuración de infraestructura que un compañero dejó "lista para producción" antes de irse. Funcionaba en su día, pero tiene varios problemas de seguridad, fiabilidad y buenas prácticas.

**No la mezcles con tu trabajo de la Parte A.** Tu solución limpia de la Parte A va en `app/` y en tu propia carpeta de manifiestos (`k8s/`, por ejemplo). Esta carpeta `legacy/` es material a revisar y arreglar mediante un Pull Request.

Contenido:
- `k8s/deployment.yaml` — Deployment + Service.
- `Dockerfile` — imagen de la app tal y como la dejó.
- `terraform/main.tf` — infraestructura AWS (RDS, security group, S3).

Lee el enunciado de la Parte B para saber qué se espera del PR.

# legacy/ — para la Parte B (Fix-it PR)

## ¿Qué decido no arreglar?

### Dockerfile

1. Uso de npm ci en vez de npm install: Es recomendable porque nmp ci porque permite build reproducibles pero en este caso, no conocemos el repo real, no sabemos si existe un `package-lock.json` y es una mejora de calidad, no es crítico.
2. Se podría hacer un `COPY` más granular pero no conocemos la estructura del repositorio y podríamos romper la aplicación. Haciendo un `COPY` más granula mejoramos el rendimiento del build y seguridad de la imagen
3. Adición de un `.dockerignore`


### Deployment
1. Aunque eliminamos los secretos hardcodeados del manifiesto, es importante mejorarlo usando AWS Secrets Manager o un Vault en vez de los secrets de kubernetes para mayor seguridad.
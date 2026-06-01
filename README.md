# Readme - Guia de Arranque y toma de decisiones

## Parte A

### Arranque

#### Pasos previos 

1. En el makefile, sustituir el nombre del cluster por el correcto
2. Configuración (Dependiendo del tipo de cluster local)

    2.2. Si usas  k3d, sustituir el `make load-kind` por `k3d image import projects-api:v1`

    2.3. Si usas  minikube, sustituir el `make load-kind` por `minikube image load projects-api:v1`

    2.4. Si usas kind, continua con la documentación base, se ha testeado en base a kind


Ejecutar desde la raíz del repositorio.

```bash
kubectl create namespace production-shakers
make build
make load-kind
make deploy
kubectl get pods -n production-shakers
kubectl get svc -n production-shakers
kubectl get hpa -n production-shakers
make port-forward
curl http://localhost:3000/healthz
curl http://localhost:3000/ready
```

Eliminar los recursos

```bash
kubectl delete namespace production-shakers --ignore-not-found
make delete
```

### Toma de decisiones

1. Imagen base:
    Uso de slim en vez de alpine por menor cantidad de vulnerabilidades reportadas por docker scout.
    Además, las vulnerabilidades que quedan provienen de paquetes del sistema operativo base, en este caso Debian. No se pueden evitar sin cambiar la imagen base.

2. Multi-stage: 
    Se decide no aplicar un multi-stage puesto que la aplicacion no tiene dependencias externas, no requiere de compilación y por ende no va a aportar reducción de tamaño.

3. Configuración deployment:
    Creamos el liveness probe y el readiness probe en base a los endpoints proporcionados (/ready y /healthz)
    Mejoramos seguridad evitando usuario root

4. HPA:
    Configuramos un threshold para CPU, esto nos permite ajustarnos a los momentos pico y valle. Se ha simulado en local altas cargas para testear el corriento autoescalado. De base pobnemos dos réplicas para asegurar una alta disponibilidad mínima.
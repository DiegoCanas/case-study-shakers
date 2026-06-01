# Ejercicio C

## Punto 1 - Métrica de negocio:

Se introduce una métrica de negocio basada en la cantidad de requests por endpoint.

Esta métrica nos permite observar qué funcionalidades del sistema son más utilizadas, esto nos ayuda a entender el comportamiento del usuario dentro de la API.

Aunque en nuestro caso solo tengamos los endpoints healthz, ready y projects en un caso real se podría aplicar de forma más interesante.

## Punto 2- Stack:

Decision final - Prometheus + Grafana (Docker Compose)

Se decide usar este stack puesto que se simplifica el entorno local y puedo iterar rápido sobre métricas y dashboards sin depender del cluster. Se priorica desarrollo y claridad del setup.

## Punto 3 - Dashboards:



## Punto 4 - Runbooks:

#### High Error Rate
1. Revisar logs del deployment
2. Identificar endpoint afectado
3. Verificar si hay caída de dependencias (DB / servicios externos)
4. Si es degradación parcial → rollback a última versión estable

#### High Latency
1. Verificar carga del sistema (CPU / HPA scaling)
2. Revisar endpoints más lentos en Grafana
3. Comprobar si hay saturación de recursos
4. Escalar replicas si es necesario

### High CPU Usage
1. Verificar si HPA está escalando correctamente
2. Revisar si hay picos de tráfico
3. Aumentar replicas si es necesario


## Punto Extra - SLIs y SLOs
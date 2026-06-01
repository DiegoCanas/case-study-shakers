# ADR - Estrategia de despliegues

## Contexto

El equipo de 20 ingenieros despliega a producción manualmente ~2 veces por semana. Quieres que puedan desplegar de forma autónoma, frecuente y segura sobre EKS


## Opciones consideradas

### 1. Rolling Deployments (Kubernetes nativo)

**Descripción:**
Uso del Deployment estándar de Kubernetes con estrategia rolling update.

**Ventajas:**
- Simple de implementar y entender.
- Sin necesidad de herramientas adicionales.

**Desventajas:**
- No permite validación avanzada antes de exponer tráfico completo.
- Rollbacks no son instantáneos en caso de fallo silencioso.
- Limitado control sobre el tráfico progresivo.

**Conclusión:**
No es suficiente para entornos con alta exigencia de seguridad en despliegues.

---

### 2. Blue-Green Deployments

**Descripción:**
Dos entornos paralelos (blue/green), con switch de tráfico tras validación.

**Ventajas:**
- Rollback inmediato (switch de tráfico).
- Entornos aislados.
- Muy seguro para releases críticos.

**Desventajas:**
- Coste elevado (doble infraestructura).
- No optimiza bien la frecuencia de despliegues.
- Gestión compleja en servicios con múltiples microservicios.
- No escala bien a múltiples servicios

**Conclusión:**
Muy seguro, pero poco eficiente para un equipo de 20 ingenieros con despliegues frecuentes.

---

### 3. Canary Deployments

**Descripción:**
Despliegue progresivo del tráfico hacia nuevas versiones.

**Ventajas:**
- Reduce riesgo al exponer gradualmente la nueva versión.
- Permite validación con tráfico real.
- Rollback basado en umbrales de métricas (error rate / latency).
- Buen equilibrio entre velocidad y seguridad.

**Desventajas:**
- Mayor complejidad operativa.
- Requiere observabilidad desarrollada (métricas, alertas).
- Necesita tooling adicional.

**Conclusión:**
Es la mejor opción para entornos con despliegues frecuentes y necesidad de control progresivo del riesgo.

---

## GitOps

### Herramienta propuesta:
- ArgoCD como herramienta de GitOps.

### Razones:
- Estado declarativo versionado en Git.
- Información completa de cambios.
- Eliminación de despliegues manuales.
- Facilita autoservicio para equipos de desarrollo.
- Integración natural con Kubernetes.

---

## Decisión

Se propone la siguiente estrategia:

### Estrategia de despliegue:
- GitOps con Argo CD como base.
- Canary deployments gestionados mediante Argo Rollouts.

### Tooling:
- ArgoCD para GitOps y sincronización con EKS.
- Argo Rollouts como motor de progressive delivery (canary deployments).
- Integración con Prometheus/Grafana para análisis de métricas y decisiones de promoción o rollback.

---

## Consecuencias

### Positivas

- Despliegues más frecuentes y seguros.
- Eliminación de procesos manuales propensos a error.
- Mejora en trazabilidad y auditoría.
- Reducción del tiempo de entrega a producción.
- Capacidad de rollback más controlada.

---

### Negativas / trade-offs

- Mayor complejidad inicial del sistema.
- Necesidad de madurez en observabilidad (métricas y alertas fiables).
- Curva de aprendizaje para el equipo (GitOps + ArgoCD + Argo rollouts).
- Requiere disciplina en definición de manifests declarativos.

---

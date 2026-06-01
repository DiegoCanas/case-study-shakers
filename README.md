# Shakers — Case Study DevOps Engineer (repo base)

Bienvenido/a. Este es el repo base para el case study técnico. Aquí tienes el punto de partida; el enunciado completo (con las 4 partes, pesos y criterios) lo tienes en el documento que te hemos enviado.

## Qué hay aquí

```
.
├── app/                    # La aplicación projects-api (Node.js, sin dependencias externas)
│   ├── src/server.js       # Servidor HTTP con endpoints de negocio y de salud
│   └── package.json
├── legacy/                 # Material para la Parte B (Fix-it PR) — léelo cuando llegues ahí
│   ├── k8s/deployment.yaml
│   ├── Dockerfile
│   ├── terraform/main.tf
│   └── README.md
├── scripts/
│   └── load.sh             # Generador de carga simple para poblar tus dashboards (Parte C)
└── README.md               # Este archivo
```

## La aplicación: projects-api

Es un microservicio HTTP minimalista, sin base de datos externa (usa un store en memoria), para que puedas centrarte en infraestructura y observabilidad sin pelearte con dependencias.

### Cómo correrla en local (sin Docker)

```bash
cd app
node src/server.js
# Escucha en http://localhost:3000
```

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/healthz` | Liveness. Siempre responde 200 si el proceso vive. |
| GET | `/ready` | Readiness. Responde 503 durante el warm-up (~6s) y 200 después. |
| GET | `/projects` | Lista los proyectos. |
| POST | `/projects` | Crea un proyecto. Body: `{ "name": "..." }`. Latencia variable; ~3% de fallos simulados. |
| GET | `/projects/:id` | Devuelve un proyecto por id. |

> Nota: el endpoint de creación introduce latencia variable y un pequeño porcentaje de errores a propósito. Es para que tus dashboards y alertas de la Parte C tengan datos realistas que mostrar.

### Variables de entorno

| Variable | Default | Uso |
|----------|---------|-----|
| `PORT` | `3000` | Puerto de escucha. |
| `APP_VERSION` | `1.0.0` | Versión que reporta la app. |
| `WARMUP_MS` | `6000` | Tiempo de warm-up antes de estar ready. |

## Tu trabajo

Resumen rápido (el detalle está en el enunciado):

- **Parte A** — Dockeriza `app/` y despliégala en un clúster local (kind/k3d/minikube), production-grade y reproducible.
- **Parte B** — Arregla `legacy/` mediante un Pull Request.
- **Parte C** — Instrumenta la app, levanta Prometheus+Grafana (o equivalente), construye dashboards y alertas reales.
- **Parte D** — Escribe un `ADR.md` con tu decisión de estrategia de deployment.

Cuando termines, este README (o uno que lo sustituya) debe ser el índice de tu entrega: cómo arrancar todo y dónde está cada parte.

¿Dudas sobre el enunciado? Escríbenos. Preguntar bien es parte del trabajo.

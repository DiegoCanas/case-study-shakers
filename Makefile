APP_NAME=projects-api
IMAGE=projects-api:1.0.0
CLUSTER-NAME=shakers-project

build:
	docker build -t $(IMAGE) app/

load-kind:
	kind load docker-image $(IMAGE) --name $(CLUSTER-NAME)

deploy:
	kubectl apply -f app/k8s/

delete:
	kubectl delete -f app/k8s/

restart:
	kubectl rollout restart deployment $(APP_NAME)

logs:
	kubectl logs -l app=$(APP_NAME) -f

port-forward:
	kubectl port-forward -n production-shakers svc/$(APP_NAME) 3000:80
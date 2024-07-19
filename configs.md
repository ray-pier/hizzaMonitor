

## rodar o prometheus

## rodar o pushgateway

docker pull prom/pushgateway
docker run -d -p 9091:9091 prom/pushgateway

## rodar o loki
docker run -d --name=loki -p 3100:3100 grafana/loki:latest
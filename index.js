
const client = require('prom-client');
const winston = require('winston');
const LokiTransport = require('winston-loki');


const { queryOracle, queryTempoFila, queryTamanhoFila } = require('./database');

const logger = winston.createLogger({
    transports: [
      new LokiTransport({
        host: 'http://localhost:3100',  // URL do seu Loki
        labels: { job: 'hizza_query', appName: "node_v1" },
        json: true,
      })
    ]
  });

//   const registry = new client.Registry();

const countHizza = new client.Histogram({
    appName: 'ray',
    name: "hizza_fila_count",
    help:"Quantidade fila do hizza",
    labelNames: ['count_23', 'method', 'status_code'],
    buckets: [0.1, 0.5, 1, 2.5, 5, 10]
    // registers: [registry],
 })

 const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const express = require('express');
const app = express();

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Configurações do Prometheus Pushgateway
// const gateway = new client.Pushgateway('http://localhost:9091');
// const gauge = new client.Gauge({
//   name: 'oracle_query_result',
//   help: 'Resultado da consulta Oracle',
//   //labelNames: ['ID_HIZA', 'TIPO', 'CODIGO', 'DH_CRIADO', 'BO_PROCESSADO', 'DH_ATUALIZADO', 'MENSAGEM_FALHA', 'ORIGEM', 'DH_INICIO', 'DH_FIM']  // Ajuste os nomes das colunas conforme necessário
//   labelNames: ['FILA']  // Ajuste os nomes das colunas conforme necessário
// });

async function sendMetrics() {
    try {
      const rows = await queryOracle();
        // const rows = []
        
    // const rows = [
    //     [
    //         1990375,
    //         'CLIENTE',
    //         '3202',
    //         '2024-07-19T15:03:41.000Z',
    //         'N',
    //         null,
    //         null,
    //         'DB1',
    //         null,
    //         null
    //       ],
    //       [
    //         1990376,
    //         'SETOR_COMERCIAL',
    //         '3202',
    //         '2024-07-19T15:03:41.000Z',
    //         'N',
    //         null,
    //         null,
    //         'DB1',
    //         null,
    //         null
    //       ]
    // ]
      const tempo_fila = await queryTempoFila();
      const tamanhoFila = await queryTamanhoFila(rows.length)

      console.log('>>>', tempo_fila)




    // countHizza.labels({
    //     'count_23': rows.length
    // }).observe(new Date()*10000)


    // logger.info('QRR:', { 
    //     count:  rows.length,
    //     'rows': rows,
    //     'STATUS_TEMPO_FILA': tempo_fila ?? 'NORMAL', 
    //     'STATUS_TAMANHO_FILA': tamanhoFila });

    // logger.data({ 
    //     count:  rows.length,
    //     'rows': rows,
    //     'STATUS_TEMPO_FILA': tempo_fila ?? 'NORMAL', 
    //     'STATUS_TAMANHO_FILA': tamanhoFila
    // })

      console.log('Dados enviados para o Prometheus Pushgateway com sucesso.');
      return null
    } catch (err) {
      console.error('Erro ao enviar métricas:', err);
    }
  }


  app.get('/', (req, res) => {
    // const end = countHizza.startTimer({ method: req.method, status_code: res.statusCode });
    countHizza.startTimer({
        'count_23': 123,
        method: req.method, status_code: res.statusCode 
    })
    sendMetrics();
    res.send('Hello World!');
});

app.listen(3002, () => {
    console.log('Server is running on http://localhost:3000');
  });
const oracledb = require('oracledb');

oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient' });

// Configurações de conexão com o Oracle
const dbConfig = {
    user: 'testekdb1',
    password: 'testekdb1',
    connectString: '10.0.1.40/ORCL'  // Exemplo: 'localhost/orclpdb1'
  };

// Função para executar a consulta Oracle e enviar métricas para o Prometheus Pushgateway

async function queryOracle() {
    let connection;
  
    try {
      connection = await oracledb.getConnection(dbConfig);
      const result = await connection.execute(`
        select *
        from cli_hiza ch
        where ch.bo_processado = 'N'
        order by ch.dh_criado DESC
        `);
      return result.rows;
    } catch (err) {
      console.error('Erro ao executar a consulta:', err);
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('Erro ao fechar a conexão:', err);
        }
      }
    }
  }

  async function queryTempoFila() {
    let connection;
  
    try {
      connection = await oracledb.getConnection(dbConfig);
      const result = await connection.execute(`
        SELECT CASE
                WHEN MIN(DH_CRIADO) < (SYSDATE - interval '30' minute) THEN 'CRITICO'
                ELSE 'NORMAL'
            END STATUS_TEMPO_FILA
        FROM CLI_HIZA
        WHERE BO_PROCESSADO <> 'S'
        AND MENSAGEM_FALHA IS NULL
        `);
      return result.rows[0][0];
    } catch (err) {
      console.error('Erro ao executar a consulta:', err);
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('Erro ao fechar a conexão:', err);
        }
      }
    }
  }

  async function queryTamanhoFila(filaLength){
    return filaLength > 300 ? 'CRITICO' : 'NORMAL'
  }

  module.exports = {
      queryOracle,
      queryTempoFila,
      queryTamanhoFila,
  };
  \connect bank api_user
  BEGIN;
    CREATE TABLE IF NOT EXISTS tb_conta (
    idConta int generated always as identity,
    idPessoa int not null,
    saldo money default 0,
    limiteSaqueDiario money default 100,
    flagAtivo boolean default true,
    tipoConta int default 1,
    dataCriacao date default now()
    );
    
    CREATE TABLE IF NOT EXISTS tb_transac (
    idTransacao int generated always as identity,
    idConta int not null,
    valor money not null,
    dataTransacao date default now()
    );

    CREATE TABLE IF NOT EXISTS tb_pessoa (
    idPessoa int generated always as identity,
    nome varchar(50) not null,
    cpf varchar(14) not null,
    dataNascimento date
    );
  COMMIT;
# Banking REST API - Dock.tech developer test
Banking REST API para o teste de desenvolvedor FullStack da Dock.

Essa aplicação pode ser rodada simplesmente clonando o repositório em uma máquina local, tendo os seguintes requisitos:
- Docker
- Recomendado: 1GB RAM

Esta API foi elaborada com as tecnologias:
- NodeJS
- PSQL
- Docker
- Docker-compose
- Express
- Body Parser
- MomentJS
- Validador de CPF

# E como rodar a aplicação?
Para rodar a aplicação existem duas formas: 

A primeira é seguir:

1. Clone o repositório em sua máquina local com o seguinte comando:
''' git clone https://github.com/dc143c/desafio-dev-api-rest.git '''
2. Verifique se você está na branch correta rodando: '''git status''' 
Este comando deve retornar: "On branch main".
3. Uma vez que atenda os requisitos de aplicação, rode o comando:
'''docker-compose up --build'''
4. E agora só esperar finalizar a instalação, entrar em seu http://localhost/users/ e começar a utilizar.

E a segunda é da forma manual, sem utilizar dos scripts:

1. Cria a database com imagem do docker:
docker run --name ´[NOME_DB] -e POSTGRES_PASSWORD=[SENHA_DB] -p 5432:5432 -d postgres 
2. Criar um .env seguindo o example
3. Subir as tabelas criadas para cada um dos nossos objetos:
    Utilizado do script para criar a tb_pessoa:
    create table tb_pessoa (
    idPessoa int generated always as identity,
    nome varchar(50) not null,
    cpf varchar(14) not null,
    dataNascimento date default now()
    )

    Utilizado do script para criar a tb_transac:
    create table tb_transac (
    idTransacao int generated always as identity,
    idConta int not null,
    valor money not null,
    dataTransacao date default now()
    )

    Utilizado do script para criar a tb_contas:
    create table tb_conta (
        idConta int generated always as identity,
        idPessoa int not null,
        saldo money default 0,
        limiteSaqueDiario money default 100,
        flagAtivo boolean default true,
        tipoConta int default 1,
        dataCriacao date default now()
    );
4. Rodar o comando ´´´npm i´´´ e depois o ´´´npm run start´´´ ou ´´´nodemon index.js´´´.
5. E agora só esperar finalizar a inicialização, entrar em seu http://localhost/users/ e começar a utilizar.

# Nossa documentação

A documentação dessa API se encontra totalmente disponível <a href="https://github.com/dc143c/desafio-dev-api-rest/blob/main/DOC.pdf" target="_blank">clicando aqui</a>.

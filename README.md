# DesafioInovia

## Como executar
Por fins de praticidade, o banco de dados está incluso no repositório e as credenciais de acesso são `Caique` com senha `123`. Em uma página de produção, com certeza o banco não seria disponibilizado :P

Para instalar as dependências do node, vá na pasta `frontend` e rode `npm i`.

Para instalar as dependências do backend em Python, vá na pasta `backend`, edite o prefix em `inovia.yml` para corresponder à sua instalação do conda e rode `conda create -f inovia.yml`.

Para rodar o projeto, em um terminal ative o env conda, vá em backend e rode `python app.py`. Em outro terminal, vá na pasta de frontend e rode `npx parcel index.html`.

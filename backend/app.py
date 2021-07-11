"""Feito por Caique Ponjjar, desafio Inovia 2021"""
from types import MethodType
from flask import jsonify, sessions  # como é uma API, vamos usar json pra tudo
import flask # Flask utilizado para retornar valores da API.
import hashlib  # pra fazer o hash da senha pra ficar + seguro
import sqlite3 # SQLite3 para realizar consultas no banco de dados
import random # randomização para gerar uma palheta de cor aleatória
import pandas as pd # pandas para tratar e ler dados
import uuid
from flask import session, request
import datetime
from flask_session import Session
from flask_cors import CORS, cross_origin

"""INICIANDO A APLICAÇÃO EM FLASK """

app = flask.Flask(__name__)
app.config['SESSION_TYPE'] = 'filesystem'
app.config.from_object(__name__)

app.secret_key = str(uuid.uuid4())
Session(app)
# configurando pacote de Cross Origin (CORS).
CORS(app, headers=['application/json'], expose_headers=['Access-Control-Allow-Credentials', 'true'], supports_credentials=True)


# converte de xlsx para csv.
data_xls = pd.read_excel('dados_visualizacoes.xlsx')
data_xls.to_csv('dados_visualizacoes.csv', encoding='utf-8')

"""Rota de Login"""
@app.route('/login', methods=['POST', 'GET'])
def _login():
    if request.method == 'POST':
        # Se ja estiver logado, só ignora
        if (session.get('auth') == True) and 'user' in session:
            return jsonify({
                'autenticado': session.get('auth'),
                'usuario': session.get('user'),
                'apikey': session.get('api'),
                'erro': None
            })
        else:
            nome = flask.request.form.get('username')
            # define variavéis para o login
            apikey = hashlib.sha256(nome.encode()).hexdigest()
            senha = flask.request.form.get('password')
            # converte senha num hash
            senha = hashlib.sha256(senha.encode()).hexdigest()
            conx = sqlite3.connect('banco.db')  # conecta no sqlite
            cur = conx.cursor()  # cursor do banco de dados
            cur.execute('SELECT * FROM users WHERE nome = ? AND senha = ?',
                    (nome, senha))
            res = cur.fetchone()
            if res is None:  # se não tem nenhum usuario com esse nome e esse hash de senha
                if nome != "":
                    flask.session['auth'] = False
                    return jsonify({
                    'autenticado': False,
                    'erro': 'Usuário inexistente'
                })
                else:
                    flask.session['auth'] = False
                    return jsonify({
                    'autenticado': False,
                    'erro': None
                    })

                
            else: # retorna o login e a autenticação do usuário
                session['auth'] = True
                session['user'] = nome
                session['api'] = apikey
                return jsonify({
                    'autenticado': True,
                    'usuario': session.get('user'),
                    'apikey': session.get('api'),
                    'erro': None
                })
    else:
        #Caso o metodo seja get, elimina a sessão
       
        session.pop('auth', False)
        session.pop('user', None)
        session['api']  = ''

        session['auth'] = False
        return jsonify({
                'autenticado': session['auth'],
                'erro': None
            })
# Define rota para registrar um novo usuário
@app.route('/registro', methods=['POST'])
def _registro():
    nome = flask.request.form.get('username')
    senha = flask.request.form.get('password')
    # converte senha num hash
    senha = hashlib.sha256(senha.encode()).hexdigest() # transforma a senha em uma hash
    apikey = hashlib.sha256(nome.encode()).hexdigest() # cria uma chave de api com um hash do nome
    conx = sqlite3.connect('banco.db')  # conecta no sqlite
    cur = conx.cursor()  # cursor do banco de dados
    # checa se há algum usuário duplicado:
    cur.execute('SELECT id FROM users WHERE nome = ?', (nome,))
    if len(cur.fetchall()) == 0:
        cur.execute(
            'INSERT INTO users(nome, senha, apikey) VALUES(?, ?, ?)', (nome, senha, apikey))
        conx.commit()  # escreve o novo usuario ao Banco
        # como acabou de registrar já vamos falar que o usuario está logado
        flask.session['auth'] = True
        flask.session['user'] = nome
        return jsonify({
            'autenticado': True,
            'usuario': nome,
            'erro': None
        })
    else:
      # caso tente registrar usuário ja existente
        flask.session['auth'] = True
        return jsonify({
            'autenticado': False,
            'erro': 'Usuário já cadastrado'
        })
  # define rota para Retornar o csv ao cliente. 
  # Estilo de rota: /dados/<especificação>/<token_de_acesso>
@app.route('/dados/<string:especifico>/<string:api>', methods=['GET', 'POST'])
def _dados(especifico, api):
    conx = sqlite3.connect('banco.db')  # conecta no sqlite
    cur = conx.cursor()  # cursor do banco de dados
    cur.execute('SELECT id FROM users WHERE apikey = ?', (api,))
    if len(cur.fetchall()) != 0:
        if especifico == "Municipio":
            # ordena os municípios que mais aparecem no csv (até 10)
            dadoscsv = pd.read_csv('dados_visualizacoes.csv')["Município"].value_counts(
                ascending=False).head(10).rename_axis('municipio').reset_index(name='quantidade')
            dadosjson = dadoscsv.to_json()
            return dadosjson #  retorna dados JSON
        """Caso string de Tipo """
        if especifico == "Tipo":
            # ordena os tipos que mais aparecem no csv (OUT, DDO, IND, DVI)
            dadoscsv = pd.read_csv('dados_visualizacoes.csv')["Tipo"].value_counts(
                ascending=False).rename_axis('tipos').reset_index(name='quantidade')
            dadosjson = dadoscsv.to_json()
            return dadosjson # retorna dados JSON
        """Caso string de Serviçis """
        if especifico == "Servicos":
            # ordena os serviços que mais aparentes nos dias pelo csv
            dadoscsv = (pd.read_csv('dados_visualizacoes.csv'))
            # remove numeros dos servicos por exemplo: Captação 01 = Captação
            dadoscsv["Tipo_serviço"] = dadoscsv['Tipo_serviço'].str.replace(' \d+', '')
            dadoscsv["Tipo_serviço"] = dadoscsv['Tipo_serviço'].str.replace('-', 'Indefinidos') 
            
            dadoscsv["Tipo_serviço"] = dadoscsv['Tipo_serviço'].str.split().str[0]
            # formata a data da tabela para Ano - Mes - Dia (padrão do plotly)
            dadoscsv["Data"] = pd.to_datetime(
                dadoscsv['Data']).dt.strftime('%Y-%m-%d')
            # conta os dados repetidos no "tipo de serviço" e na "data".
            tratamento = dadoscsv[["Tipo_serviço", "Data"]].value_counts(
                ascending=True).reset_index(name='quantidade')
            # soma todos os valores agrupados
            tratamento = tratamento.sort_values(
                by=['Tipo_serviço']).reset_index()
            palheta = [] # define uma nova palheta de cores (array inicialmente vazio)
            cores = [] # define uma variavel para receber as cores da palheta.
            LimparServico = tratamento["Tipo_serviço"].value_counts(
                ascending=True).rename_axis('tipos').reset_index(name='quantidade')
           
            for index in range(len(tratamento["Tipo_serviço"])):
                # adiciona uma nova cor a cada tipo de serviço
                palheta = '#' + \
                    '%02x%02x%02x' % (random.randint(
                        int(index/10+20),230), random.randint(
                        int(index/10+50), 230), random.randint(
                        int(index/10+60),230))
                cores.append(palheta)
            coresMap = []
            # trata os dados, adicionando uma cor a cada um dos serviços especificos.
            for i in range(len(tratamento["Tipo_serviço"])):
                for j in range(len(LimparServico["tipos"])):
                    if tratamento["Tipo_serviço"][i] == LimparServico["tipos"][j]:
                        coresMap.append(cores[j])
            # adiciona cores a uma nova coluna 
            tratamento["Cores"] = coresMap
            # retorna tudo em formato JSON
            tratamento = tratamento.sort_values(by="Tipo_serviço", ascending=False).reset_index()
            dadosjson = tratamento.to_json()
            return dadosjson
        """Caso string de Mapa """
        if especifico == "Mapa":
            # recebe posição dos locais de serviços pro mapa
            dadoscsv = pd.read_csv('dados_visualizacoes.csv')[["Latitude", "Longitude", "Município", "Tipo_serviço", "Local"]].value_counts(
                ascending=False).reset_index(name='quantidade')
            # converte dados pra 
            dadoscsv["Infobox"] = dadoscsv["Local"] + \
                " - " + dadoscsv["Tipo_serviço"]
            i = 0
            latlong = "Latitude"
            # converte dados para o formato de localização no plotly maps
            while i < 2:
                if i == 1:
                    latlong = "Longitude"
                dadosmapa = dadoscsv[latlong].str.replace('’', '')
                dadosmapa = dadosmapa.str.replace('\'', '')
                dadosmapa = dadosmapa.str.replace(',', '')
                dadosmapa = dadosmapa.str.replace('.', '')
                dadosmapa = dadosmapa.str.replace('”', '')
                dadosmapa = dadosmapa.str.replace("\"", '')
                dadosmapa = dadosmapa.str.replace('°', '.')
                dadosmapa = '-' + dadosmapa
                dadoscsv[latlong] = dadosmapa
                i = i+1
            y = 1
            i = 0
            cores = []
            tratamento = dadoscsv
            tratamento = tratamento.sort_values(by=["Município"]).reset_index()
            # conta dados dos Locais para utilizar como tamanho dos marcadores.
            Municipio = dadoscsv["Local"].value_counts(
                ascending=False).rename_axis('tipos').reset_index(name='quantidade')
            for index in range(len(Municipio["tipos"])):
                # cria uma palheta de cores aleatória
                palheta = '#'+'%02x%02x%02x' % (random.randint(int(index/10+50), int(index/10+100)), random.randint(
                    int(index/10+100), int(index/10+200)), random.randint(int(index/10+100), int(index/10+170)))
                cores.append(palheta)
            coresMap = []
            # adicionando Tamanho e Cor aos locais no mapa.
            for i in range(len(tratamento["Local"])):
                for j in range(len(Municipio["tipos"])):
                    if tratamento["Local"][i] == Municipio["tipos"][j]:
                        coresMap.append(cores[j])
                        tratamento["quantidade"][i] = float(
                            Municipio["quantidade"][j])/3

            tratamento["Cores"] = coresMap
            dadosjson = tratamento
            # retorna dados em JSON
            return dadosjson.to_json()
        else:
            # caso não tenha nenhuma especificação, retorna
            dadoscsv = pd.read_csv('dados_visualizacoes.csv')
            dadosjson = dadoscsv.to_json()
            return dadosjson
    else:
        return "Chave não cadastrada."

    

@app.route('/visitantes', methods=['POST', 'GET'])
def _visitantes():
    if 'visitas' in session:            
        # agregando valor de uma nova visita.          
        aux = ''
        #Novo dia
        session['tema'] = str(session.get('tema')) + ',' + str(flask.request.form.get('tema'))
        session["visitas"] = session.get('visitas') + 0.5
                            
    else:                                                                       
        # primeira visita gera a chave 1. com a data e o tema favorito (escuro ou claro)
        session['data'] = datetime.datetime.today().strftime ('%d/%m/%Y')  
        session['tema'] = flask.request.form.get('tema')          
        session["visitas"] = 1                               
    return jsonify({"Data": str(session.get('data')), "Visitas" : format(int(session.get('visitas'))), "Tema":format(session.get('tema'))})  
app.run(debug=True, port=9999)

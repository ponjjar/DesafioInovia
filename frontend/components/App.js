/**Feito por Caique Ponjjar, desafio Inovia 2021**/
import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { toggleDarkmode, DarkmodeSwitch } from "reacthalfmoon";
import createPlotlyComponent from "react-plotlyjs";
import Plotly from "plotly.js-dist-min";
import { PLOTLY_KEY } from ".env.local.js";

export default function App(props) {
    const [nome, setNome] = useState(
        localStorage.getItem("nome") == null ? "" : localStorage.getItem("nome")
    );
    const [password, setPassword] = useState(
        localStorage.getItem("senha") == null
            ? ""
            : localStorage.getItem("senha")
    );
    // declarando constantes de login e mensagem
    const [login, setLogin] = useState([""]);
    const [auth, setAuth] = useState(false);
    const [msgErro, setErro] = useState("");
    const [botao, setBotao] = useState("");

    // constantes de loading e cookies.
    const [Carregando, setCarregando] = useState(0);
    const [cookies, setCookies] = useState(0);
    // declarando constante para gráficos em barra
    const PlotlyComponent = createPlotlyComponent(Plotly);
    const [dadosPrivacidade, setPrivacidade] = useState([""]);
    const [DadosGraficos, setDGraficos] = useState([]);
    const [DadosBarras, SetBarras] = useState([]);
    //Api para consultar os dados do perfil.
    const [apiPerfil, setApiPerfil] = useState([]);
    // caso haja login em cookies, autentica usuário.
    if (localStorage.getItem("auth") == "true" && cookies == 0) {
        Logar();
    }
    // função chamada para consultar login do perfil
    function Logar() {
        let dados = new FormData();
        dados.append("username", nome);
        dados.append("password", password);
        setCookies(1);
        /*Envia dados do login*/
        fetch("https://desafioinovia.gq:9999/login", {
            method: "POST",
            body: dados,
            credentials: "include",
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": "true",
            },
        })
        .then((r) => r.json())
        .then((j) => {
            setLogin(j);
            if (j.autenticado == true) {
                localStorage.setItem("auth", "true");
                setAuth(true);
            } else if (j.autenticado == false) {
                if (j.erro != null) {

                    setErro(
                        <>
                            <div
                                className="alert alert-secondary"
                                role="alert"
                            >
                                Ops, {j.erro.toLowerCase()}, tente
                                novamente.
                            </div>
                            <br />
                        </>
                    );
                } else {
                }
            }
        })
        .catch(function () {
            setErro(
                <>
                    <div className="alert alert-secondary" role="alert">
                        Conexão com servidor indisponivel, tente novamente
                        mais tarde.
                    </div>
                    <br />
                </>
            );
        });
    }
    /*Verifica o tema que está usando armazenado no cache*/
    if (localStorage.getItem("temaEscuro") == "true" && cookies == 0) {
        toggleDarkmode();
        setCookies(1);
    }
    /*Valida o formulário > 0 para enviar*/
    function validateForm() {
        return nome.length > 0 && password.length > 0;
    }
    /*Sai do perfil do usuário e limpa os caches.*/
    function logout() {
        localStorage.setItem("auth", "false ");
        localStorage.removeItem("nome");
        fetch("https://desafioinovia.gq:9999/login", {
            method: "GET",
            credentials: "include",
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": "true",
            },
        })
        .then((r) => r.json())
        .then((j) => {
            setLogin(j);
            setCarregando(0);
        });

    }

    /*Faz o login e registra novo usuário*/
    function BotaoLogin(event) {
        let dados = new FormData();
        event.preventDefault();
        dados.append("username", nome);
        dados.append("password", password);
        let tipoBotao = botao;
        /*Caso o botão seja de login:*/
        if (tipoBotao == "login") {
            Logar();
        }
        //Senão, botão de Registro
        else {
            /*Registra novo usuário pela API*/
            fetch("https://desafioinovia.gq:9999/registro", {
                method: "POST",
                body: dados,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": "true",
                },
            })
            .then((r) => r.json())
            .then((j) => {
                setLogin(j);

                if (j.erro == null) {
                    setErro(
                        <>
                            <div
                                className="alert alert-success"
                                role="alert"
                            >
                                Usuário cadastrado com sucesso!
                            </div>
                            <br />
                        </>
                    );
                } else {
                    setErro(
                        <>
                            <div
                                className="alert alert-danger"
                                role="alert"
                            >
                                Ops, {j.erro.toLowerCase()}, tente
                                novamente.
                            </div>
                            <br />
                        </>
                    );
                }
            });
        }
    }

    /*Caso login seja aprovado*/
    if (auth == false && Carregando == 0) {
        return (
            <div className="container">
                <div className="card">
                    <h2>Login</h2>
                    {/*Armazena informações cache dos temas*/}
                    <div className="custom-switch right-200">
                        <input
                            type="checkbox"
                            id="temaescuro"
                            onClick={() => {
                                toggleDarkmode();
                                localStorage.getItem("temaEscuro") == "false"
                                    ? localStorage.setItem("temaEscuro", "true")
                                    : localStorage.setItem(
                                          "temaEscuro",
                                          "false"
                                      );
                            }}
                        />
                        {/*Quando estiver no tema escuro: */}
                        <label htmlFor="temaescuro" className="hidden-lm">
                            Tema escuro <i className="fas fa-moon"></i>
                        </label>
                        <label htmlFor="temaescuro" className="hidden-dm">
                            Tema claro{" "}
                        </label>
                    </div>
                    <hr />
                    <br />
                    {msgErro}
                    {/*Caixas de preenchimento de dados de usuário*/}
                    <div className="form-group">
                        <Form onSubmit={BotaoLogin}>
                            <Form.Group size="lg" controlId="nome">
                                <Form.Label>Usuário</Form.Label>
                                <Form.Control
                                    autoFocus
                                    type="text"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group size="lg" controlId="password">
                                <Form.Label>Senha</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                            </Form.Group>
                            {/*Botões de enviar login ou registrar novo usuário*/}
                            <Button
                                block
                                size="lg"
                                type="submit"
                                tipobotao="login"
                                disabled={!validateForm()}
                                onClick={() => setBotao("login")}
                            >
                                Login
                            </Button>
                            <Button
                                block
                                size="lg"
                                variant="light"
                                tipobotao="registro"
                                type="submit"
                                disabled={!validateForm()}
                                onClick={() => setBotao("registrar")}
                            >
                                Cadastrar
                            </Button>
                        </Form>
                    </div>
                </div>
            </div>
        );
    }
    //Caso esteja logado:
    else if (auth == true) {
        //Consultando dados para gráficos:
        let dados = new FormData();
        let MarcadoresX = [];
        if (Carregando < 5) {
            //Carregando informações JSON da api.
            if (Carregando == 0) {
                fetch(
                    `https://desafioinovia.gq:9999/dados/Municipio/${login.apikey}`,
                    {
                        method: "GET",
                    }
                )
                .then((r) => r.json())
                .then((data) => {
                    DadosGraficos.push(data);
                    setCarregando(1);
                });
            } else if (Carregando == 1) {
                fetch(
                    `https://desafioinovia.gq:9999/dados/Tipo/${login.apikey}`,
                    {
                        method: "GET",
                    }
                )
                .then((r) => r.json())
                .then((data) => {
                    DadosGraficos.push(data);
                    setCarregando(2);
                });
            } else if (Carregando == 2) {
                fetch(
                    `https://desafioinovia.gq:9999/dados/Servicos/${login.apikey}`,
                    {
                        method: "GET",
                    }
                )
                .then((r) => r.json())
                .then((data) => {
                    DadosGraficos.push(data);
                    setCarregando(3);
                });
            } else if (Carregando == 3) {
                fetch(
                    `https://desafioinovia.gq:9999/dados/Mapa/${login.apikey}`,
                    {
                        method: "GET",
                    }
                )
                .then((r) => r.json())
                .then((data) => {
                    DadosGraficos.push(data);
                    setCarregando(4);
                });
            } else if (Carregando == 4) {
                //Informações de tipo de serviço, filtrando e tratando dados (4)
                let i = 0;
                let z = 0;
                let x = 0;
                let y = 0;
                let nomes = [];
                let locais = [];
                let resultado = [];

                if (
                    i <=
                    Object.values(
                        DadosGraficos.map((e) => e)[2]["Tipo_serviço"]
                    ).length
                ) {
                    //Contando quantos nomes se repetem
                    for (
                        i = 0;
                        i <=
                        Object.values(
                            DadosGraficos.map((e) => e)[2]["Tipo_serviço"]
                        ).length;
                        i++
                    ) {
                        if (
                            nomes.includes(
                                Object.values(
                                    DadosGraficos.map((e) => e)[2][
                                        "Tipo_serviço"
                                    ]
                                )[i]
                            ) == false
                        ) {
                            nomes[i] = Object.values(
                                DadosGraficos.map((e) => e)[2]["Tipo_serviço"]
                            )[i];
                        }
                    }
                    //Contando posições de cada nome
                    let subarray = ["", "", ""];
                    dadosPrivacidade["Nomes"] = [];
                    dadosPrivacidade["Quantidade"] = [];
                    x = 0;
                    for (
                        i = 0;
                        i <
                        Object.values(
                            DadosGraficos.map((e) => e)[2]["Tipo_serviço"]
                        ).length;
                        i++
                    ) {
                        if (nomes[i] == null) {
                            subarray[0] +=
                                DadosGraficos.map((e) => e)[2]["Data"][i] +
                                ", ";
                            subarray[1] +=
                                DadosGraficos.map((e) => e)[2]["quantidade"][
                                    i
                                ] + ",";
                            if (
                                i + 1 >
                                Object.values(
                                    DadosGraficos.map((e) => e)[2][
                                        "Tipo_serviço"
                                    ]
                                ).length
                            ) {
                                resultado[x] = subarray;
                            }
                        } else {
                            resultado[x] = subarray;
                            x = x + 1;
                            subarray = [];
                            subarray[0] =
                                DadosGraficos.map((e) => e)[2]["Data"][i] +
                                "," +
                                DadosGraficos.map((e) => e)[2]["Data"][i] +
                                ", ";
                            subarray[1] =
                                0 +
                                "," +
                                DadosGraficos.map((e) => e)[2]["quantidade"][
                                    i
                                ] +
                                ",";
                            subarray[2] = DadosGraficos.map((e) => e)[2][
                                "Tipo_serviço"
                            ][i];
                            subarray[3] = DadosGraficos.map((e) => e)[2][
                                "Cores"
                            ][i];
                        }
                    }
                    //Montando lista de dados para inserir
                    for (x = 1; x < resultado.length; x++) {
                        DadosBarras.push({
                            x: resultado[x][0].split(","), // #bar-y
                            group: resultado[x][3],
                            y: resultado[x][1].split(","), // #bar-x
                            type: "bar", // all "bar" chart attributes: #bar
                            name: resultado[x][2],
                            textposition: "left",
                            opacity: 0.8,
                            marker: {
                                color: resultado[x][3],
                            },
                        });
                    }
                }

                SetBarras(DadosBarras);
                setCarregando(5);
            }
        } else if (Carregando == 5) {
            // Contador de visitas criado durante testes. Carregador (5)
            let visitas = new FormData();
            visitas.append(
                "tema",
                localStorage.getItem("temaEscuro") == "false"
                    ? "Claro"
                    : "Escuro"
            );
            fetch("https://desafioinovia.gq:9999/visitantes", {
                method: "POST",
                credentials: "include",

                body: visitas,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": "true",
                },
            })
            .then((r) => r.json())
            .then((j) => {
                setPrivacidade(j);

                setCarregando(6);
            });
        } else if (Carregando == 6) {
            //Informações de dados pessoais para carregar (6)
            let x = 0;
            let aux = ["Claro", "Escuro"];
            let y = 1;
            let i = 0;
            dadosPrivacidade["Nomes"] = [];
            dadosPrivacidade["Quantidade"] = [];
            for (i = 0; i < dadosPrivacidade["Tema"].split(",").length; i++) {
                
                if (
                    dadosPrivacidade["Tema"].split(",")[i+1] == aux[0]
                ) {
                    dadosPrivacidade["Nomes"][i] =dadosPrivacidade["Tema"].split(",")[i];
                    dadosPrivacidade["Quantidade"][i] = y;
                } else {

                    dadosPrivacidade["Nomes"][i] =dadosPrivacidade["Tema"].split(",")[i];
                    dadosPrivacidade["Quantidade"][i] = y;
                }
            }

            setCarregando(7);
        } else if (Carregando == 7) {
            setCarregando(8);
        }

        //Desenhando tela pós carregamento (gráfico, informáções e outros)...
        if (Carregando == 8) {
            //Informações das datas (Nome, Legenda...)
            let Infos = [
                Object.values(DadosGraficos.map((e) => e)[0]["municipio"]),
                Object.values(DadosGraficos.map((e) => e)[1]["tipos"]),
                Object.values(DadosGraficos.map((e) => e)[2]["Tipo_serviço"]),
                Object.values(DadosGraficos.map((e) => e)[3]["Infobox"]),
                Object.values(DadosGraficos.map((e) => e)[3]["quantidade"]),
                Object.values(DadosGraficos.map((e) => e)[3]["Cores"]),
            ];
            //Marcadores X das datas ([0,1,2,3,4])
            MarcadoresX = [
                Object.values(DadosGraficos.map((e) => e)[0]["quantidade"]),
                Object.values(DadosGraficos.map((e) => e)[1]["quantidade"]),
                Object.values(DadosGraficos.map((e) => e)[2]["quantidade"]),
                Object.values(DadosGraficos.map((e) => e)[3]["Latitude"]),
            ];
            //Marcadores Y das datas ([0,1,2,3,4,5])
            let MarcadoresY = [
                Object.values(DadosGraficos.map((e) => e)[2]["Data"]),
                Object.values(DadosGraficos.map((e) => e)[2]["Data"]),
                Object.values(DadosGraficos.map((e) => e)[2]["Cores"]),
                Object.values(DadosGraficos.map((e) => e)[3]["Longitude"]),
            ];

            let data = [
                //Data dos tipos de municípios mais presentes
                [
                    {
                        type: "pie", // all "bar" chart attributes: #bar
                        values: MarcadoresX[0], // #bar-y
                        labels: Infos[0],
                        name: "Municípios", // #bar-name
                        pull: [0.1],
                        textinfo: "percent",
                        insidetextorientation: "radial",
                    },
                ],
                //Data dos tipos mais presentes (IND, DVI, OUT)
                [
                    {
                        type: "pie", // all "bar" chart attributes: #bar
                        values: MarcadoresX[1], // #bar-y
                        labels: Infos[1],
                        name: "Tipos", // #bar-name
                        pull: [0.1],
                        textinfo: "percent",
                        insidetextorientation: "radial",
                    },
                ],
                //Data dos marcadores  dos serviços em relação aos ultimos dias
                [
                    {
                        values: dadosPrivacidade["Quantidade"],
                        labels: dadosPrivacidade["Nomes"],
                        text: dadosPrivacidade["Visitas"],
                        name: "temas",
                        textposition: "inside",
                        hoverinfo: "label+percent+name",
                        hole: 0.4,
                        type: "pie",
                    },
                ],
                //Data dos marcadores de mapa
                [
                    {
                        type: "scattermapbox",
                        lat: MarcadoresX[3],
                        lon: MarcadoresY[3],
                        mode: "markers+text",
                        marker: {
                            size: Infos[4],
                            opacity: 0.5,
                            color: Infos[5],
                        },
                        text: Infos[3],
                    },
                ],
            ];

            window.onresize = function () {
                setCarregando(7);
            };
            let config = [
                {
                    responsive: true,
                },
            ];
            let layout = [
                //layout dos Municípios mais frequentes (São paulo, Campinas...)
                {
                    title: "Municípios mais frequentes",
                    xaxis: {
                        title: "Escala",
                    },
                    plot_bgcolor:
                        localStorage.getItem("temaEscuro") == "true"
                            ? "black"
                            : "white",
                    paper_bgcolor:
                        localStorage.getItem("temaEscuro") == "true"
                            ? "black"
                            : "white",
                    font: {
                        color:
                            localStorage.getItem("temaEscuro") == "true"
                                ? "white"
                                : "black",
                    },

                    margin: {
                        r: 20,
                        t: 40,
                        b: 20,
                        l: 20,
                        pad: 0,
                    },
                    legend: {
                        orientation: "h",
                        type: "sort",
                        font: {
                            family: "sans-serif",
                            size: 14,
                            color:
                                localStorage.getItem("temaEscuro") == "true"
                                    ? "white"
                                    : "black",
                        },
                    },
                    autosize: true,
                },

                //Layout dos tipos mais frequentes (DVI, OUT, IND...)
                {
                    title: "Tipos mais frequentes",
                    xaxis: {
                        title: "Escala",
                    },
                    plot_bgcolor:
                        localStorage.getItem("temaEscuro") == "true"
                            ? "black"
                            : "white",
                    paper_bgcolor:
                        localStorage.getItem("temaEscuro") == "true"
                            ? "black"
                            : "white",
                    font: {
                        color:
                            localStorage.getItem("temaEscuro") == "true"
                                ? "white"
                                : "black",
                    },
                    margin: {
                        r: 20,
                        t: 40,
                        b: 20,
                        l: 20,
                        pad: 0,
                    },
                },
                //Layout dos serviços em relação aos ultimos dias
                {
                    legend: {
                        text: "Legendas",
                        orientation: "h",
                        xanchor: "center",
                        yanchor: "top",
                        y: -1,
                        x: 0.5,
                        borderwidth: 1,
                        font: {
                            family: "sans-serif",
                            size: 14,
                            color:
                                localStorage.getItem("temaEscuro") == "true"
                                    ? "white"
                                    : "black",
                        },
                    },
                    //Verifica tema atual e aplica ao plotly
                    title: "Serviços em relação aos ultimos dias",
                    plot_bgcolor:
                        localStorage.getItem("temaEscuro") == "true"
                            ? "black"
                            : "white",
                    paper_bgcolor:
                        localStorage.getItem("temaEscuro") == "true"
                            ? "black"
                            : "white",
                    font: {
                        color:
                            localStorage.getItem("temaEscuro") == "true"
                                ? "white"
                                : "black",
                    },
                    barmode: "relative",
                    showlegend: true,
                    size: 4,

                    yaxis: {
                        title: "Quantidade",
                        type: "linear",
                        categoryorder: "trace",
                    },
                    xaxis: { title: "Data", type: "date" },
                    margin: {
                        l: 40,
                        r: 20,
                        b: 30,
                        pad: 1,
                    },
                },
                //Layout dos Locais e serviços no mapa:
                {
                    title: {
                        text: "Relação de Locais e Serviços",
                    },

                    font: {
                        color:
                            localStorage.getItem("temaEscuro") == "true"
                                ? "white"
                                : "black",
                    },

                    //Verifica tema atual e aplica ao plotly
                    plot_bgcolor:
                        localStorage.getItem("temaEscuro") == "true"
                            ? "black"
                            : "white",
                    paper_bgcolor:
                        localStorage.getItem("temaEscuro") == "true"
                            ? "black"
                            : "white",
                    margin: {
                        l: 0,
                        r: 0,
                        b: 0,
                        t: 50,
                        pad: 1,
                    },
                    mapbox: {
                        bearing: 0,
                        center: {
                            lat: -23,
                            lon: -46,
                        },
                        pitch: 0,
                        zoom: 5.5,
                        style:
                            localStorage.getItem("temaEscuro") == "true"
                                ? "dark"
                                : "basic",
                    },
                },
                //Layout dos traços de usuário.
                {
                    legend: {
                        text: "Legendas",
                        orientation: "h",
                        xanchor: "center",
                        yanchor: "top",
                        y: -0.2,
                        x: 0.5,
                        borderwidth: 1,
                        font: {
                            family: "sans-serif",
                            size: 14,
                            color:
                                localStorage.getItem("temaEscuro") == "true"
                                    ? "white"
                                    : "black",
                        },
                    },
                    title: "Temas preferidos",
                    plot_bgcolor:
                        localStorage.getItem("temaEscuro") == "true"
                            ? "black"
                            : "white",
                    paper_bgcolor:
                        localStorage.getItem("temaEscuro") == "true"
                            ? "black"
                            : "white",

                    font: {
                        family: "sans-serif",
                        size: 14,
                        color:
                            localStorage.getItem("temaEscuro") == "true"
                                ? "white"
                                : "black",
                    },
                    annotations: [
                        {
                            showarrow: false,
                            text:
                                "Acessado  <br>" +
                                dadosPrivacidade["Visitas"] +
                                " vezes",
                            x: 0.5,
                            y: 0.5,
                        },
                    ],
                },
            ];
            //Configura a chave token do mapa no Plotly
            Plotly.setPlotConfig({
                mapboxAccessToken: `${PLOTLY_KEY}`,
            });
            return (
                /*Primeira parte de informações com nome de usuário.*/
                <container>
                    <fieldset>
                        <div className="card">
                            <center>
                                <h2 className="cardtitle">
                                    Olá, {login.usuario}
                                </h2>
                                <a href="" onClick={() =>{
                                        setCarregando(20);
                                        logout();
                                        }}>
                                    Sair da conta
                                </a>
                            </center>

                            <center>
                                <p className="font-size-20 font-italic">
                                    Aqui você pode visualizar dashboards e dados
                                    em forma de gráficos.
                                </p>
                            </center>
                        </div>
                        <br />
                        <hr />

                        {/*Tema escuro e configurações adicionais*/}
                        <center>
                            <h3 className="cardtitle">Configurações:</h3>
                            <div
                                className="btn-group"
                                role="group"
                                aria-label="Badge group example"
                            >
                                <div className="btn badge-pill">
                                    <button
                                        type="button"
                                        id="temaescuro"
                                        onClick={() => {
                                            toggleDarkmode();
                                            localStorage.getItem(
                                                "temaEscuro"
                                            ) == "false"
                                                ? localStorage.setItem(
                                                      "temaEscuro",
                                                      "true"
                                                  )
                                                : localStorage.setItem(
                                                      "temaEscuro",
                                                      "false"
                                                  );

                                            setCarregando(7);
                                        }}
                                        //setTema("{plot_bgcolor: 'black', paper_bgcolor: 'black', font:{color:'white'},}");}}
                                        className="invisible "
                                    />
                                    {/*Quando estiver no tema escuro: */}
                                    <label
                                        htmlFor="temaescuro"
                                        className="hidden-lm"
                                    >
                                        Tema escuro{" "}
                                        <i className="fas fa-moon"></i>
                                    </label>
                                    <label
                                        htmlFor="temaescuro"
                                        className="hidden-dm"
                                    >
                                        Tema claro{" "}
                                    </label>
                                </div>
                                {/*botão de gerar token de acesso*/}
                                <button
                                    type="button"
                                    className="btn btn-primary badge-pill"
                                    onClick={() =>
                                        setApiPerfil(
                                            <div>
                                                <br />
                                                <div
                                                    className="alert alert-primary"
                                                    role="alert"
                                                >
                                                    <button
                                                        className="close"
                                                        data-dismiss="alert"
                                                        type="button"
                                                        onClick={() =>
                                                            setApiPerfil("")
                                                        }
                                                        aria-label="Close"
                                                    >
                                                        <span aria-hidden="true">
                                                            &times;
                                                        </span>
                                                    </button>
                                                    <h5 className="alert-heading">
                                                        Chave de acesso da API:
                                                    </h5>
                                                    <i>
                                                        <div className="text-break w-200">
                                                            {" "}
                                                            {login.apikey}{" "}
                                                        </div>
                                                    </i>{" "}
                                                </div>
                                            </div>
                                        )
                                    }
                                >
                                    Gerar token de acesso
                                </button>{" "}
                            </div>
                            <br />
                            {apiPerfil}
                        </center>

                        <br />
                        <center>
                            <h2 className="cardtitle">Gráficos:</h2>
                        </center>
                        {/*Exibe gráficos plotly js */}
                        <div className="content">
                            <div className="Plot">
                                <div className="container-fluid">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="border rounded">
                                                <PlotlyComponent
                                                    className="plotly"
                                                    data={data[0]}
                                                    layout={layout[0]}
                                                    config={config}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="border rounded-5">
                                                <PlotlyComponent
                                                    className="plotly"
                                                    data={data[1]}
                                                    layout={layout[1]}
                                                    config={config}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <br />
                                    <div className="border rounded-5">
                                        <PlotlyComponent
                                            className="plotly"
                                            data={DadosBarras}
                                            layout={layout[2]}
                                            config={config}
                                        />
                                    </div>
                                </div>
                                <br />
                                <div className="">
                                    <PlotlyComponent
                                        className="plotly"
                                        data={data[3]}
                                        layout={layout[3]}
                                        config={config}
                                    />
                                    <div className="card">
                                        {/*Dados do usuário*/}
                                        {dadosPrivacidade["Visitas"] > 2 ? (
                                            <>
                                                <div>
                                                    <br />
                                                    <br />
                                                    <br />
                                                    <center>
                                                        <h3>
                                                            <u>
                                                                Estátistica de
                                                                uso:
                                                            </u>
                                                        </h3>
                                                        <PlotlyComponent
                                                            className="plotly"
                                                            data={data[2]}
                                                            layout={layout[4]}
                                                            config={config}
                                                        />
                                                        <br />
                                                        <p className="font-size-20">
                                                            Você está logado
                                                            desde{" "}
                                                            {
                                                                dadosPrivacidade[
                                                                    "Data"
                                                                ]
                                                            }
                                                        </p>
                                                    </center>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="card">
                                                <center>
                                                    <br />
                                                    <h3>Seja bem vindo</h3>
                                                    <p className="font-size-20 font-italic">
                                                        Acesse mais vezes para
                                                        visualizar um dashboard
                                                        feito pra você!
                                                    </p>
                                                </center>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr />
                        <center>
                            Feito por Caique Ponjjar,
                            <br />
                            desafio Inovia <i className="fas fa-copyright"></i>{" "}
                            2021.
                        </center>
                    </fieldset>
                </container>
            );
        } else {
            //Tela de carregamento e caixas falsas
            return (
                <>
                    <div className="card">
                        <center>
                            <h2 className="cardtitle">
                                Bem vindo, {login.usuario}
                            </h2>
                            <a href="" onClick={() =>{
                                        setCarregando(20);
                                        logout();
                                        }}>
                                Sair da conta
                            </a>
                        </center>

                        <br />
                        <center>
                            <div className="fake-content "></div>
                        </center>
                    </div>
                    <br />
                    <br />
                    <hr />
                    <center>
                        <h2>Carregando dados</h2>
                        <img
                            src="https://i.stack.imgur.com/27Rnd.gif"
                            alt="..."
                            width="30px"
                        />
                    </center>
                    <br />
                    <div className="row">
                        <div className="col-md">
                            <div className="card">
                                <div className="fake-content"></div>
                                <div className="fake-content h-250"></div>
                            </div>
                        </div>
                        <div className="col-md">
                            <div className="card">
                                <div className="fake-content"></div>
                                <div className="fake-content h-250"></div>
                            </div>
                        </div>
                    </div>
                    <br />
                </>
            );
        }
    }
}

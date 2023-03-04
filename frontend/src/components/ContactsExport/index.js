import React, { useState, useEffect, useRef } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";

import { Box, Chip } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
/**/
import { CSVLink } from "react-csv";


const useStyles = makeStyles(theme => ({
    screen: {
        // backgroundColor: "red",
        
    },
    container: {
        backgroundColor: "#FAFAFA",
        padding: "20px",
        borderRadius: "6px"
    },
    textField: {
        marginRight: theme.spacing(1),
        flex: 1,
    },

    extraAttr: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },

    btnWrapper: {
        position: "relative",
        backgroundColor: "#1E90FF",
        color: "white",
        border: "none",
        textDecorationLine: "none"
    },

    buttonProgress: {
        color: green[500],
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },

}));

const ContactsExport = (props) => {
    const classes = useStyles()

    const [queue, setQueues] = useState([]);
    const [queueSelected, setQueueSelected] = useState([]);
    var queueToFilter = []


    const [tags, setTags] = useState([]);
    const [selecteds, setSelecteds] = useState([]);
    const [contacts, setContacts] = useState([])
    var tagToFilter = []


    /* select tag */
    useEffect(() => {
        async function fetchData() {
            await loadTags();
            await loadUsers();
            await setFilas();
        }
        fetchData();
    }, []);

    const loadTags = async () => {
        try {
            const { data } = await api.get(`/tags/list`);
            setTags(data);
        } catch (err) {
            toastError(err);
        }
    };

    const setFilas = async (index) => {
        const tests = await api.get(`/queue`);
        const usersQueuers = tests.data
        setQueues(usersQueuers)
    }


    const ferramentas = (value, acao, target) => {
        if (acao == 'select-option') {
            target == "tag"
                ? tagToFilter = (value.map(tag => tag.name))
                : queueToFilter = (value.map(queue => queue.name))
            console.log(queueToFilter, "queue selecionadaa")
        }

        if (acao == "clear" || acao == "remove-option") {
            tagToFilter = []
            loadUsers()
        }
    }

    const onChange = async () => {
        //Pegar tickets e filtralos por tags selecionadas
        setContacts([])
        const ticketList = await api.get(`/tickets`);
        console.log(ticketList)
        if (tagToFilter.length || queueToFilter.length) {
            const ticketFiltered = ticketList.data.tickets.filter(ticket => {
                let aprovado = true

                if (queueToFilter.length) {
                    for (let queueOne of queueToFilter) {
                        if (!(ticket.queue)) aprovado = false
                        else {
                            let queuesCliente = ticket.queue.map(i => i.name)
                            if (!(queuesCliente.includes(queueOne))) {
                                aprovado = false
                            }
                        }
                    }
                }

                if (tagToFilter.length) {
                    for (let tag of tagToFilter) {
                        let tagsCliente = ticket.tags.map(i => i.name)
                        if (!(tagsCliente.includes(tag))) {
                            aprovado = false
                        }
                    }
                }

                return aprovado
            })

            //Formatação de tickets selecionados
            const newContactList = ticketFiltered.map(contact => {
                const u = contact.contact
                return [`Nome: ${u.name}, Numero: ${u.number}, E-mail: ${u.email || ""}, Tags: ${u.tags}, Setores: ${u.queues}`]
            })

            setContacts(newContactList)

        } else {
            console.log("null, Carregando usuarios...")
            loadUsers()
        }
    };




    /* Get users */
    const loadUsers = async () => {
        try {
            const { data } = await api.get(`/contacts`);
            const apiData = data.contacts
            const contactList = apiData.map((u) => ([`Nome: ${u.name}, Numero: ${u.number}, E-mail: ${u.email || ""}`]));
            setContacts(contactList)

        } catch (err) {
            toastError(err);
        }
    };



    return (
        <div className={classes.screen}>
            <div className={classes.container}>
                <div>
                    <p>Deseja selecionar algum filtro?</p>

                    <Box style={{ padding: 10 }}>
                        <Autocomplete
                            multiple
                            size="small"
                            options={tags}
                            value={selecteds}
                            getOptionLabel={(option) => option.name}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        variant="outlined"
                                        style={{
                                            backgroundColor: option.color || "#eee",
                                            textShadow: "1px 1px 1px #000",
                                            color: "white",
                                        }}
                                        label={option.name}
                                        key={index}
                                        size="small"
                                    />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    placeholder="Filtro por Tags"
                                />
                            )}
                            onChange={(e, value, acao) => {
                                setSelecteds(value);
                                ferramentas(value, acao)
                                onChange()
                            }}
                        />
                    </Box>



                    <Box style={{ padding: 10 }}>
                        <Autocomplete
                            multiple
                            size="small"
                            options={queue}
                            value={queueSelected}
                            getOptionLabel={(option) => option.name}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        variant="outlined"
                                        style={{
                                            backgroundColor: option.color || "#eee",
                                            textShadow: "1px 1px 1px #000",
                                            color: "white",
                                        }}
                                        label={option.name}
                                        key={index}
                                        size="small"
                                    />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    placeholder="Filtro por setores"
                                />
                            )}
                            onChange={(e, value, acao) => {
                                setQueueSelected(value)
                                ferramentas(value, acao, "queue")
                                onChange()
                            }}
                        />
                    </Box>


                    <hr style={{
                        color: "rgb(230, 230, 230)"
                    }} />

                </div>


                <div>
                    <DialogActions>
                        <Button
                            onClick={props.handleClose}
                            color="secondary"
                            variant="outlined"
                        >
                            {i18n.t("contactModal.buttons.cancel")}
                        </Button>

                        <CSVLink
                            separator=";"
                            filename={'pressticket-contacts.csv'}
                            data={contacts}
                            className={classes.btnWrapper}>
                            <Button
                                variant="contained"
                                color="primary"
                                className={classes.buttonEnvi}
                            >
                                EXPORTAR
                            </Button>

                        </CSVLink>
                    </DialogActions>
                </div>

            </div>
        </div>
    )
}


export default ContactsExport;
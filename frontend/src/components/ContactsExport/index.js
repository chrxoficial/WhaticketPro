import React, { useState, useEffect } from "react";

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
import { isArray, isString } from "lodash";


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

    const [queues, setQueues] = useState([]);
    const [queueSelected, setQueueSelected] = useState([]);

    const [tags, setTags] = useState([]);
    const [selecteds, setSelecteds] = useState([]);

    const [tickets, setTicket] = useState([])
    const [planilha, setPlanilha] = useState([])


    /* select tag */
    useEffect(() => {
        async function fetchData() {
            await loadContacts();
            await loadTags();
            await loadQueues();
            await loadTickets();
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (selecteds.length === 0 && queueSelected.length === 0) {
            setPlanilha(planilha)
        } else {
            let tempTickets = tickets.filter(ticket => filterTickets(ticket, selecteds, 'tags'))
            tempTickets = tempTickets.filter(ticket => filterTickets(ticket, queueSelected, 'queue'))
            tempTickets = tempTickets.map(contact => {
                const t = contact
                return [
                    `Nome: ${t.contact.name}, Numero: ${t.contact.number}${t.contact.email? (", E-mail:" + t.contact.email) : ""}, Tags: ${t.tags}${t.queue? (", Setores: " + t.queue) : ""}`
                ]
            })
            setPlanilha(tempTickets)
        }
    }, [selecteds, queueSelected])

    //Filtra tiquet por tags ou queues
    const filterTickets = (ticket, filter, typeFilter) => {
        let aprovado = true

        for (let tag of filter) {
            if ((ticket[typeFilter].filter(obgTag => obgTag.name === tag.name)).length === 0) {
                aprovado = false
            }
        }

        return aprovado
    }


    const loadTickets = async () => {
        try {
            const { data } = await api.get(`/tickets`);
            setTicket(data.tickets)
        } catch (err) {
            toastError(err);
        }
    };

    //Pega Tags
    const loadTags = async () => {
        try {
            const { data } = await api.get(`/tags/list`);
            setTags(data)
        } catch (err) {
            toastError(err);
        }
    };


    //Pega filas
    const loadQueues = async () => {
        try {
            const { data } = await api.get(`/queue`);
            setQueues(data)
        } catch (err) {
            toastError(err);
        }
    }



    const onChangeTags = async (value, reason) => {
        let optionsChanged = []
        if (reason === 'create-option') {
            if (isArray(value)) {
                for (let item of value) {
                    optionsChanged.push(item);
                }
            }
            await loadTags();
        } else {
            optionsChanged = value;
        }
        setSelecteds(optionsChanged);
    }

    const onChangeQueues = async (value, reason) => {
        let optionsChanged = []
        if (reason === 'create-option') {
            if (isArray(value)) {
                for (let item of value) {
                    optionsChanged.push(item);
                }
            }
            await loadQueues();
        } else {
            optionsChanged = value;
        }
        setQueueSelected(optionsChanged);
    }



    /* Get contacts */
    const loadContacts = async () => {
        try {
            const { data } = await api.get(`/contacts`);
            const apiData = data.contacts
            await setPlanilha(
                apiData.map((u) => ([`Nome: ${u.name}, Numero: ${u.number}, E-mail: ${u.email || ""}`]))
            )

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
                                        style={{ backgroundColor: option.color || '#eee', textShadow: '1px 1px 1px #000', color: 'white' }}
                                        label={option.name}
                                        {...getTagProps({ index })}
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
                            onChange={(e, value, acao) => onChangeTags(value, acao)}
                        />
                    </Box>



                    <Box style={{ padding: 10 }}>
                        <Autocomplete
                            multiple
                            size="small"
                            options={queues}
                            value={queueSelected}
                            getOptionLabel={(option) => option.name}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        variant="outlined"
                                        style={{ backgroundColor: option.color || '#eee', textShadow: '1px 1px 1px #000', color: 'white' }}
                                        label={option.name}
                                        {...getTagProps({ index })}
                                        size="small"
                                    />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    placeholder="Filtro por Setores"
                                />
                            )}
                            onChange={(e, value, acao) => onChangeQueues(value, acao)}
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
                            data={planilha}
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
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import {
    TextField
} from "@mui/material";
import axios from 'axios';


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function AddUserModal(props: {
    setOpen: any;
    handleClose: ((event: {}, reason: "backdropClick" | "escapeKeyDown") => void) | undefined; open: boolean;
}) {
    const [errorMessage, setErrorMessage] = React.useState('');
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [klavyio, setKlaviyo] = React.useState('');
    const [facebook, setFacebook] = React.useState('');
    const [shopify, setShopify] = React.useState('');
    const handleSubmit = async () => {
        const data = {
            name,
            email,
            password,
            klavyio,
            facebook,
            shopify
        }
        
        const addUser = await axios.post(`${process.env.REACT_APP_API}/user/add`,{
          ...data
        })
          .then(function (response) {
            props.setOpen(false);
            setErrorMessage('')
          })
          .catch(function (error) {
            setErrorMessage('Something went wrong, please try again!');
          })
    }
    return (
        <div>
            <Modal
                open={props.open}
                onClose={props.handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <h1>Add a new user</h1>
                    <TextField
                        style={{ width: "200px", margin: "5px" }}
                        type="text"
                        label="Name"
                        variant="outlined"
                        onChange={(e) => {setName(e.target.value)}}
                    />
                    <TextField
                        style={{ width: "200px", margin: "5px" }}
                        type="text"
                        label="E-mail"
                        variant="outlined"
                        onChange={(e) => {setEmail(e.target.value)}}
                    />
                    <TextField
                        style={{ width: "200px", margin: "5px" }}
                        type="password"
                        label="Password"
                        variant="outlined"
                        onChange={(e) => {setPassword(e.target.value)}}
                    />
                    <TextField
                        style={{ width: "200px", margin: "5px" }}
                        type="text"
                        label="Klaviyo API key"
                        variant="outlined"
                        onChange={(e) => {setKlaviyo(e.target.value)}}
                    />
                    <TextField
                        style={{ width: "200px", margin: "5px" }}
                        type="text"
                        label="Facebook API key"
                        variant="outlined"
                        onChange={(e) => {setFacebook(e.target.value)}}
                    />
                    <TextField
                        style={{ width: "200px", margin: "5px" }}
                        type="text"
                        label="Shopify API key"
                        variant="outlined"
                        onChange={(e) => {setShopify(e.target.value)}}
                    />
                    <p style={{color:"red"}}>{errorMessage}</p>
                    <button style={{
                        display:"block",
                        margin:"20px 10px",
                        padding:"10px 20px",
                        color:"white",
                        backgroundColor:"#623CEA",
                        outline:"none",
                        border:"none",
                        borderRadius:"5px",
                        cursor:"pointer"
                    }} onClick={handleSubmit}>Submit</button>
                </Box>
            </Modal>
        </div>
    );
}

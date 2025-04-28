import Sidebar from '../components/Sidebar';
import { Box } from '@mui/material';
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import AddUserModal from '../components/AddUserModal';
import axios from 'axios';
import { Link } from 'react-router-dom';

function createData(name: string, email: string, id: number) {
    return { name, email };
}


const Main = () => {
    const [open, setOpen] = React.useState(false);
    const [users, setUsers] = React.useState([] as unknown as [{ name: string, email: string, id: number }]);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    React.useEffect(() => {

        axios.get(`${process.env.REACT_APP_API}/user/all-users`)
            .then(function (response) {
                setUsers(response.data);
            })
            .catch(function (error) {
            })
    }, [open]);
    return <Box sx={{ display: 'flex', backgroundColor: '#f8f8f8' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <AddUserModal handleClose={handleClose} open={open} setOpen={setOpen} />
            <Grid container spacing={2}>
                <Grid item xs={8}>
                </Grid>
                <Grid item xs={4} style={{ textAlign: 'right' }}>
                    <button style={{
                        margin: "20px 50px",
                        padding: "10px 20px",
                        color: "white",
                        backgroundColor: "#623CEA",
                        outline: "none",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }} onClick={handleOpen}>Add User</button>
                </Grid>
            </Grid>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Full Name</TableCell>
                            <TableCell align="center">E-mail</TableCell>
                            <TableCell align="center">Check their Carbon Data</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.length ? users?.map((row, ind) => (
                            <TableRow
                                key={ind}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell align="center">{row.name}</TableCell>
                                <TableCell align="center">{row.email}</TableCell>
                                <TableCell align="center"><Link to={`/user-graph?userId=${row?.id}&userName=${row?.name}`}>View Data</Link></TableCell>
                            </TableRow>
                        )) : <p style={{ textAlign: 'center' }}>No users found</p>}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    </Box>
}
export default Main;
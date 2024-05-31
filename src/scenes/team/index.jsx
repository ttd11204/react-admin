// import { Box,Typography, useTheme } from "@mui/material";
// import { DataGrid } from "@mui/x-data-grid";
// import { tokens } from "../../theme";
// import { mockDataTeam } from "../../data/mockData";
// import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
// import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
// import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
// import Header from "../../components/Header";
// import "../../scenes/team/style.css";

// const Team = () => {
//     const theme = useTheme();
//     const colors = tokens(theme.palette.mode);
//     const columns = [
//         {
//             field: "id",
//             headerName: "ID"
//         },
//         {
//             field: "name",
//             headerName: "Name",
//             flex: 1,
//             cellClassName: "name-column--cell"
//         },
//         {
//             field: "age",
//             headerName: "Age",
//             type: "number",
//             headerAlign: "left",
//             align: "left"
//         },
//         {
//             field: "phone",
//             headerName: "Phone Number",
//             flex: 1
//         },
//         {
//             field: "email",
//             headerName: "Email",
//             flex: 1
//         },
//         {
//             field: "access",
//             headerName: "Access Level",
//             flex: 1,
//             renderCell: ({ row: {access }}) => {
//                 return (
//                     <Box
//                      width="60%"
//                      m="0 auto"
//                      p="5px"
//                      display="flex"
//                      justifyContent="center"
//                      backgroundColor={
//                         access === "admin"
//                         ? colors.greenAccent[600]
//                         : colors.greenAccent[700]
//                      }
//                      borderRadius="4px"
//                     >
//                         {access ==="admin" && <AdminPanelSettingsOutlinedIcon/>}
//                         {access ==="manager" && <SecurityOutlinedIcon/>}
//                         {access ==="user" && <LockOpenOutlinedIcon/>}
//                         <Typography color={colors.grey[100]} sx={{ml: "5px"}} >
//                             {access}
//                         </Typography>
//                     </Box>
//                 )
//             }
//         },
//         {
//             field: "status",
//             headerName: "status",
//             flex: 1
//         },
//         {
//             headerName: "Action",
//             flex: 1
//         },

//     ]

//     return (
//         <Box  m="20px">
//             <Header title="TEAM" subtitle="Managing the team Members"/>
//             <Box m="40px 0 0 0" height="75vh" sx={{
//                 "& .MuiDataGrid-root": {
//                     border: "none",
//                 },
//                 "& .MuiDataGrid-cell": {
//                     borderBottom: "none"
//                 },
//                 "& .name-column--cell": {
//                     color: colors.greenAccent[300]
//                 },
//                 "& .MuiDataGrid-columnHeaders": {
//                     backgroundColor: colors.primary[400],
//                     borderBottom: "none"
//                 },
//                 "& .MuiDataGrid-virtualSciller": {
//                     backgroundColor: colors.primary[400]
//                 },
//                 "&. MuiDataGrid-footerContainer": {
//                     borderTop: "none",
//                     backgroundColor: colors.blueAccent[700]
//                 }
//             }}
//             >
//                 <DataGrid
//                 rows={mockDataTeam}
//                 columns={columns}
//                 />
//             </Box>
//         </Box>
//     )
// }

// export default Team;

import React from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataTeam } from "../../data/mockData";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";
import "../../scenes/team/style.css";

const Team = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const handleAction = (id, action) => {
        // Update status based on action
        const updatedData = mockDataTeam.map((user) => {
            if (user.id === id) {
                if (action === "ban") {
                    return { ...user, status: "inactive" };
                } else if (action === "unban") {
                    return { ...user, status: "active" };
                }
            }
            return user;
        });

        // Update mockDataTeam with updatedData
        // You might want to use state management libraries like Redux for global state updates
        // For simplicity, I'm directly updating mockDataTeam here, which is not recommended in production
        mockDataTeam.splice(0, mockDataTeam.length, ...updatedData);
    };

    const columns = [
        {
            field: "id",
            headerName: "ID"
        },
        {
            field: "name",
            headerName: "Name",
            flex: 1,
        },
        {
            field: "age",
            headerName: "Age",
            type: "number",
            headerAlign: "left",
            align: "left"
        },
        {
            field: "phone",
            headerName: "Phone Number",
            flex: 1
        },
        {
            field: "email",
            headerName: "Email",
            flex: 1
        },
        {
            field: "access",
            headerName: "Access Level",
            flex: 1,
            renderCell: ({ row: { access } }) => {
                return (
                    <Box
                        width="60%"
                        m="0 auto"
                        p="5px"
                        display="flex"
                        justifyContent="center"
                        backgroundColor={
                            access === "admin"
                                ? colors.greenAccent[600]
                                : colors.greenAccent[700]
                        }
                        borderRadius="4px"
                    >
                        {access === "admin" && (
                            <AdminPanelSettingsOutlinedIcon />
                        )}
                        {access === "manager" && <SecurityOutlinedIcon />}
                        {access === "user" && <LockOpenOutlinedIcon />}
                        <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
                            {access}
                        </Typography>
                    </Box>
                );
            }
        },
        {
            field: "status",
            headerName: "Status",
            flex: 1,
            cellClassName: "action-column--cell",
            renderCell: ({ row }) => (
                <Typography>{row.status}</Typography>
            )
        },
        {
            headerName: "Action",
            flex: 1,
            renderCell: ({ row }) => (
                <Box
                    width="100%"
                    m="0 auto"
                    display="flex"
                    justifyContent="center"
                >
                    <Button
                        onClick={() => handleAction(row.id, "view")}
                        variant="h4"
                        // color={colors.primary[100]}
                    >
                        View
                    </Button>
                    <Button
                        onClick={() => handleAction(row.id, "ban")}
                        variant="outlined"
                        color="error"
                    >
                        Ban
                    </Button>
                    <Button
                        onClick={() => handleAction(row.id, "unban")}
                        variant="outlined"
                        color="success"
                    >
                        Unban
                    </Button>
                </Box>
            )
        }
    ];

    return (
        <Box m="20px">
            <Header title="TEAM" subtitle="Managing the team Members" />
            <Box
                m="40px 0 0 0"
                height="75vh"
                sx={{
                    "& .MuiDataGrid-root": {
                        border: "none"
                    },
                    "& .MuiDataGrid-cell": {
                        borderBottom: "none"
                    },
                    "& .name-column--cell": {
                        color: colors.greenAccent[300]
                    },
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: colors.primary[400],
                        borderBottom: "none"
                    },
                    "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: colors.primary[400]
                    },
                    "&.MuiDataGrid-footerContainer": {
                        borderTop: "none",
                        backgroundColor: colors.blueAccent[700]
                    }
                }}
            >
                <DataGrid rows={mockDataTeam} columns={columns} />
            </Box>
        </Box>
    );
};

export default Team;


// import React, { useEffect, useState } from "react";
// import { Box, Typography, useTheme } from "@mui/material";
// import { DataGrid } from "@mui/x-data-grid";
// import { tokens } from "../../theme";
// import { mockDataTeam } from "../../data/mockData";
// import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
// import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
// import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
// import Header from "../../components/Header";
// import usersApi from "../../api/userApi"; // Thay đổi đường dẫn tương ứng

// const Team = () => {
//     const theme = useTheme();
//     const colors = tokens(theme.palette.mode);
//     const [users, setUsers] = useState([]);

//     const fetchUsers = async () => {
//         try {
//             const loggedInUser = await usersApi.loginUser("username", "password"); // Thay username và password tương ứng
//             setUsers([loggedInUser]);
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     // Fetch users when component mounts
//     useEffect(() => {
//         fetchUsers();
//     }, []); // Empty dependency array ensures this effect runs only once after the initial render

//     const columns = [
//         {
//             field: "id",
//             headerName: "ID"
//         },
//         {
//             field: "name",
//             headerName: "Name",
//             flex: 1,
//             cellClassName: "name-column--cell"
//         },
//         {
//             field: "age",
//             headerName: "Age",
//             type: "number",
//             headerAlign: "left",
//             align: "left"
//         },
//         {
//             field: "phone",
//             headerName: "Phone Number",
//             flex: 1
//         },
//         {
//             field: "email",
//             headerName: "Email",
//             flex: 1
//         },
//         {
//             field: "access",
//             headerName: "Access Level",
//             flex: 1,
//             renderCell: ({ row: { access } }) => {
//                 return (
//                     <Box
//                         width="60%"
//                         m="0 auto"
//                         p="5px"
//                         display="flex"
//                         justifyContent="center"
//                         backgroundColor={
//                             access === "admin"
//                                 ? colors.greenAccent[600]
//                                 : colors.greenAccent[700]
//                         }
//                         borderRadius="4px"
//                     >
//                         {access === "admin" && <AdminPanelSettingsOutlinedIcon />}
//                         {access === "manager" && <SecurityOutlinedIcon />}
//                         {access === "user" && <LockOpenOutlinedIcon />}
//                         <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
//                             {access}
//                         </Typography>
//                     </Box>
//                 );
//             }
//         }
//     ];

//     return (
//         <Box m="20px">
//             <Header title="TEAM" subtitle="Managing the team Members" />
//             <Box
//                 m="40px 0 0 0"
//                 height="75vh"
//                 sx={{
//                     "& .MuiDataGrid-root": {
//                         border: "none"
//                     },
//                     "& .MuiDataGrid-cell": {
//                         borderBottom: "none"
//                     },
//                     "& .name-column--cell": {
//                         color: colors.greenAccent[300]
//                     },
//                     "& .MuiDataGrid-columnHeaders": {
//                         backgroundColor: colors.primary[400],
//                         borderBottom: "none"
//                     },
//                     "& .MuiDataGrid-virtualSciller": {
//                         backgroundColor: colors.primary[400]
//                     },
//                     "&. MuiDataGrid-footerContainer": {
//                         borderTop: "none",
//                         backgroundColor: colors.blueAccent[700]
//                     }
//                 }}
//             >
//                 <DataGrid rows={users} columns={columns} />
//             </Box>
//         </Box>
//     );
// };

// export default Team;

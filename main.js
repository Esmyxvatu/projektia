//                              IMPORTS
// ==================================================================================================
const { Server } = require("socket.io");
const express = require("express");
const fs = require("fs");
const dt = require("date-and-time");

//                              VARIABLES
// ==================================================================================================
const app = express();
const server = require("http").createServer(app);
const io = new Server(server);
const output = `log/launch${fs.readdirSync("log").length + 1}.log`;
let connected_ip = [];
let connected = {
    // username : [ip1, ip2, ip3, ...]
};

const objective = JSON.parse(fs.readFileSync("project.json"));
const accounts = JSON.parse(fs.readFileSync("account.json"));
const mdps = JSON.parse(fs.readFileSync("mdps.json"));

app.use(express.static(__dirname + "/website/"));
app.get('/', (req, res) => res.sendFile(__dirname + '/website/main/index.html'));

//                              EVENTS
// ==================================================================================================
io.on("connection", (socket) => {
    let id = "";
    if (!connected_ip.includes(socket.handshake.address)) {
        connected_ip.push(socket.handshake.address);
    }
    Log(`New user connected : ${socket.handshake.address}`, "i");

    socket.on("connect_from_id", (data) => {
        if (data.id == undefined) {
            Log("User " + socket.handshake.address + " is not connected", "e");
        } else {
            id = data.id;
            socket.emit("get_objective", objective[data.id]);
        }
    });

    socket.on("add", (data) => {
        let { type, name } = data;
        if (type == "project") {
            objective[id][name] = {};
        } else if (type == "step") {
            let { where } = data;
            let { project } = where;
            objective[id][project][name] = [];
        } else if (type == "obj") {
            let { where } = data;
            let { project, step } = where;
            objective[id][project][step].push(name);
        }
        Save();
        Log(`${socket.handshake.address} added ${type} : ${name} for ${id}`, "i");
    });

    socket.on("delete", (data) => {
        let { type, name } = data;
        if (type == "project") {
            delete objective[id][name];
        } else if (type == "step") {
            let { project } = data.where;
            delete objective[id][project][name];
        } else if (type == "obj") {
            let { project, step } = data.where;
            if (objective[id][project][step] != undefined) {
                objective[id][project][step].splice(objective[id][project][step].indexOf(name), 1);
            }
        }
        Save();
        Log(`${socket.handshake.address} deleted ${type} : ${name} for ${id}`, "i");
    });

    socket.on("complete", (data) => {
        let { type, name } = data;
        if (type == "obj"){
            let { project, step, idx } = data.where;
            objective[id][project][step][idx] = "¤µ$" + name;
        } else if (type == "project") {
            objective[id]["¤µ$" + name] = objective[id][name];
            delete objective[id][name];
        }
        Save();
        Log(`${socket.handshake.address} completed ${type} : ${name} for ${id}`, "i");
    })

    socket.on("uncomplete", (data) => {
        let { type, name } = data;
        if (type == "obj"){
            let { project, step, idx } = data.where;
            objective[id][project][step][idx] = name;
        } else if (type == "project") {
            objective[id][name] = objective[id]["¤µ$" + name];
            delete objective[id]["¤µ$" + name];
        }
        Save();
        Log(`${socket.handshake.address} uncompleted ${type} : ${name} for ${id}`, "i");
    })

    socket.on("disconnect", () => {
        connected_ip = connected_ip.filter((value) => value != id);
        Log(`User disconnected : ${socket.handshake.address}`, "i");
        Object.keys(connected).forEach(element => {
            if (connected[element].includes(socket.handshake.address)) {
                connected[element] = connected[element].filter((value) => value != socket.handshake.address);
            }
        });
    });

    socket.on("login", (data) => {
        let { username, password } = data;
        let connected = false;
        Object.keys(accounts).forEach(element => {
            if (accounts[element]["username"] == username) {
                if (accounts[element]["password"] == password) {
                    Log(`${socket.handshake.address} is now connected as ${username}`, "w");
                    socket.emit("login_success", element);
                    connected = true;
                } else {
                    Log(`${socket.handshake.address} tried to login as ${username}`, "w");
                    socket.emit("login_error", "Wrong password");
                    connected = true;
                }
            }
        });
        if (!connected) {
            Log(`${socket.handshake.address} tried to login as ${username}`, "w");
            socket.emit("login_error", "Wrong username");
        }
    });

    socket.on("register", (data) => {
        let { username, password, question, answer } = data;
        let id = "usr" + Math.floor(Math.random() * 1000000000).toString(36);

        accounts[id] = { username: username, password: password, question: question, answer: answer };
        objective[id] = {};

        fs.writeFileSync("account.json", JSON.stringify(accounts));
        Save();

        Log(`User ${username} registered by ${socket.handshake.address}`, "i");

        socket.emit("register_success", id);
    });

    socket.on("forgot", (data) => {
        let { username } = data;
        let found = false;
        Object.keys(accounts).forEach(element => {
            if (accounts[element]["username"] == username) {
                found = true;
                Log(`${socket.handshake.address} forgot ${username}`, "i");
                let password = accounts[element]["password"];
                let question = accounts[element]["question"];
                let answer = accounts[element]["answer"];
                socket.emit("forgot_success", { password: password, question: question, answer: answer });
            }
        });
        if (!found) {
            Log(`${socket.handshake.address} forgot ${username} but it doesn't exist`, "i");
            socket.emit("forgot_error", "Unknown username");
        }
    });

    socket.on("delete_account", (data) => {
        let { id } = data;
        delete accounts[id];
        delete objective[id];

        fs.writeFileSync("account.json", JSON.stringify(accounts));
        Save();

        Log(`Account ${id} deleted by ${socket.handshake.address}`, "i");
    });

    socket.on("get_user", (data) => {
        let { id } = data;
        socket.emit("get_user_success", accounts[id]);
    });

    socket.on("update_user", (data) => {
        let { id, username, password, question, answer } = data;
        accounts[id] = { username: username, password: password, question: question, answer: answer };
        fs.writeFileSync("account.json", JSON.stringify(accounts));
        Save();
        Log(`User ${id} updated by ${socket.handshake.address}`, "i");

        socket.emit("update_user_success");
    });

    socket.on("admin_login", (data) => {
        let { username, password } = data;
        let connected = false;
        Object.keys(accounts).forEach(element => {
            if (accounts[element]["username"] == username) {
                if (accounts[element]["password"] == password) {
                    if (accounts[element]["admin"]) {
                        Log(`${socket.handshake.address} is now connected as ${username} (as an admin)`, "w");
                        socket.emit("admin_login_success", element);
                        connected = true; 
                    } else {
                        Log(`${socket.handshake.address} is now connected as ${username} (as an admin)`, "w");
                        socket.emit("admin_login_error", "You are not an admin");
                    }
                } else {
                    Log(`${socket.handshake.address} tried to login as ${username} (as an admin)`, "w");
                    socket.emit("admin_login_error", "Wrong password");
                    connected = true;
                }
            }
        });
        if (!connected) {
            Log(`${socket.handshake.address} tried to login as ${username} (as an admin)`, "w");
            socket.emit("admin_login_error", "Wrong username");
        }
    });

    socket.on("admin_verify", (data) => {
        let { id } = data;
        if (accounts[id]["admin"]) {
            socket.emit("admin_verify_success");
        } else {
            socket.emit("admin_verify_error");
        }
    });

    socket.on("admin_get_users", () => {
        socket.emit("admin_get_users_success", accounts);
    });

    socket.on("admin_update_user", (data) => {
        let { id, username, password, question, answer, admin } = data;
        accounts[id] = { username: username, password: password, question: question, answer: answer, admin: admin };
        fs.writeFileSync("account.json", JSON.stringify(accounts));
        Save();
        Log(`User ${id} updated by ${socket.handshake.address} (as an admin)`, "i");
        socket.emit("admin_update_user_success");
    });

    socket.on("admin_delete_user", (data) => {
        let id = data;
        delete accounts[id];
        delete objective[id];
        fs.writeFileSync("account.json", JSON.stringify(accounts));
        Save();
        Log(`User ${id} deleted by ${socket.handshake.address} (as an admin)`, "i");
        socket.emit("admin_delete_user_success");
    });

    socket.on("admin_get_log", () => {
        let files = fs.readdirSync("log");

        for (let i = 0; i < files.length; i++) {
            let content = fs.readFileSync(`log/launch${i + 1}.log`, 'utf8');
            socket.emit("admin_get_log_success", {"launch": i, "data": content});
        }
    });

    socket.on("admin_get_info", () => {
        let different_ip = connected_ip.length;
        let online_users = 0;
        let total_users = 0;
        let total_projects = 0;
        let total_launch = 0;
        let size_account = 0;
        let size_logs = 0;
        let size_projects = 0;

        Object.keys(accounts).forEach( () => {
            total_users++;
        })
        Object.keys(objective).forEach( ( objects ) => {
            Object.keys(objective[objects]).forEach( ( key ) => {
                total_projects++;
            });
        });
        Object.keys(connected).forEach( () => {
            online_users++;
        });

        fs.readdirSync("log").forEach( () => { total_launch++; size_logs += fs.statSync(`log/launch${total_launch}.log`).size; });

        size_account = fs.statSync("account.json").size;
        size_projects = fs.statSync("project.json").size;

        socket.emit("admin_get_info_success", {
            "different_ip": different_ip,
            "online_users": online_users,
            "total_users": total_users,
            "total_projects": total_projects,
            "total_launch": total_launch,
            "size_account": size_account,
            "size_logs": size_logs,
            "size_projects": size_projects
        });
    });

    socket.on("check_id", (data) => {
        let { id } = data;
        if (!accounts[id]) {
            socket.emit("check_id_error");
        } else {
            connected[id] = connected[id] || [];
            connected[id].push(socket.handshake.address);
        }
    });

    socket.on("pm_load_mdps", (data) => {
        let mdp = mdps[data.id];
        socket.emit("pm_load_mdps_success", mdp);
    });

    socket.on("pm_save_mdps", (data) => {
        Log(`${socket.handshake.address} saved mdp for ${data.userid} in ${data.id}`, "i");
        mdps[data.userid][data.id] = data.mdp;
        fs.writeFileSync("mdps.json", JSON.stringify(mdps));
        Save();
        socket.emit("pm_save_mdps_success");
    });

    socket.on("pm_delete_mdps", (data) => {
        Log(`${socket.handshake.address} deleted mdp for ${data.userid} in ${data.id}`, "i");
        delete mdps[data.userid][data.id];
        fs.writeFileSync("mdps.json", JSON.stringify(mdps));
        Save();
        socket.emit("pm_delete_mdps_success");
    });
});

//                              FUNCTIONS
// ==================================================================================================
function Save() {
    fs.writeFileSync("project.json", JSON.stringify(objective));
}

function Log(msg, level) {
    console.log(`${dt.format(new Date(), "DD/MM/YYYY HH:mm:ss.SSS")} [${level}] ${msg}`);
    fs.writeFileSync(output, `${dt.format(new Date(), "DD/MM/YYYY HH:mm:ss.SSS")} [${level}] ${msg}\n`, { flag: "a+" });
}

//                              SERVER
// ==================================================================================================
let ip = "192.168.1.21";
let port = 1569;

server.listen(port, ip, () => {
    Log("Server started on port " + port, "d");
    Log(`Address: http://${ip}:${port}`, "i");
})
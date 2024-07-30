import mysql from "mysql";

const conn=mysql.createConnection({
    host:"sql12.freesqldatabase.com",
    user:"sql12722654",
    password:"bANuvZzYGb",
    database:"sql12722654"
})

conn.connect((err)=>{
    if(err){
      console.log("Database Connection Error...")
    }else{
      console.log("DataBase Connect SucessFully.....")
    }
})
export default conn;
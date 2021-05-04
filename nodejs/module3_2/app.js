const request = require('request');
const express = require('express');
const app = express();
const port = 5400;

const url = "http://5c055de56b84ee00137d25a0.mockapi.io/api/v1/employees";

app.set('views','./src/views');
app.set('view engine', 'ejs');


function getData(api) {
    let options = {
        url: api
    };
    return new Promise((resolve, reject) => {
        request.get(options,(err,response,body)=>{
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
        })
    })
}


app.get('/',(req, res) => {
    let dataPromise = getData(url);
    dataPromise.then(JSON.parse).then((value)=>{
        let employees = [];
        for (let i=0;i<value.length;i++) {
            let obj = {};
            obj.name = value[i].name;
            obj.id = value[i].id;
            obj.createdAt = value[i].createdAt;
            employees.push(obj);
        }
        res.render('main',{employees,title:'***Employee Details***'});
    })
})

app.listen(port, (err)=>{
    if(err) {
        console.log("error in api call");
    } else {
        console.log('App is running on port ' + port);
    }
})

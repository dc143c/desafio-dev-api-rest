let funcionalities = {}
funcionalities.getAllRoutes = (app) => {
    var routes = [];

    app.stack.forEach(function(stack){
        if(stack.route){
            routes.push({"path": stack.route.path, "method": stack.route.methods});
        }
    });

    routes.pop();
    return routes;
}

funcionalities.getLastMonthDate = () => {
    var data = new Date(),
        dia  = data.getDate().toString(),
        diaF = (dia.length == 1) ? '0'+ String(parseInt(dia)+1) : String(parseInt(dia)+1),
        mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
        mesF = (mes.length == 1) ? '0'+mes : mes,
        anoF = data.getFullYear();
    return mesF+"/"+diaF+"/"+anoF;
}

funcionalities.getDate = () => {
    var data = new Date(),
        dia  = data.getDate().toString(),
        diaF = (dia.length == 1) ? '0'+dia : dia,
        mes  = (data.getMonth()).toString(), //+1 pois no getMonth Janeiro começa com zero.
        mesF = (mes.length == 1) ? '0'+mes : mes,
        anoF = data.getFullYear();
    return mesF+"/"+diaF+"/"+anoF;
}

module.exports = funcionalities;
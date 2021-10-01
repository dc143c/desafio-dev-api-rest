/* Implementado a possibilidade de tratar os erros com mais rapidez, desde que sejam try{}catch() ou que venham do 
middleware/seja de verificado, pois não há agregação na função. */

function setResponse(request_name, row_count, error_status, error_message, results){
    let model = {
        "request":request_name,
        "row-count": row_count,
        "error": {
            "status": error_status,
            "message": error_message
        },
        "results": results
    }
    return model;
}

module.exports = { setResponse };